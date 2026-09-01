/**
 * POST /api/guide-signup
 *
 * Receives a guide request from the site and hands the contact to Mautic.
 *
 * Why this goes through a Pages Function instead of posting straight to Mautic
 * from the browser:
 *   - Mautic lives on crm.thepairedwellness.com. A browser POST there is
 *     cross-origin, so it would need CORS opened on the CRM and it would put
 *     the CRM hostname in page source for anyone scanning for a Mautic install.
 *   - Mautic's native form endpoint answers with a redirect or an HTML page,
 *     which would navigate the visitor away mid-conversion. Our own route lets
 *     the page keep the visitor and render success inline.
 *   - Most of this traffic arrives from an Instagram link on a phone. Every
 *     navigation is a chance to lose them.
 *
 * This mirrors the proven route on the Mason site (src/pages/api/guide-signup.ts).
 */

/** Mautic form field aliases. These must match form "Guide Request" exactly. */
const FIELD = {
  email: 'email',
  guide: 'guide_requested',
  // Mautic reserves utm_source and friends as segment-filter keywords and
  // refuses to create contact fields with those aliases, so attribution_* is
  // what the CRM actually stores. The incoming JSON keys stay utm_* because
  // that is what the landing page URL carries.
  utmSource: 'attribution_source',
  utmMedium: 'attribution_medium',
  utmCampaign: 'attribution_campaign',
  utmContent: 'attribution_content',
};

/** Guides we accept. Anything else is rejected rather than passed through. */
const KNOWN_GUIDES = new Set(['acne', 'gut']);

/**
 * Deliberately permissive. This only needs to catch obvious typos and junk,
 * because the real proof an address works is whether the guide arrives.
 * Over-strict email patterns reject valid addresses and cost real signups.
 */
function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: 'Could not read that request.' }, 400);
  }

  const email = String(payload.email ?? '').trim().toLowerCase();
  const guide = String(payload.guide ?? '').trim().toLowerCase();
  const honeypot = String(payload.website ?? '').trim();

  // Honeypot. A real person never fills a field they cannot see, so anything
  // here is a bot. Answer 200 so it believes it succeeded and does not retry
  // with a different shape.
  if (honeypot) {
    return json({ ok: true });
  }

  if (!looksLikeEmail(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  if (!KNOWN_GUIDES.has(guide)) {
    return json({ ok: false, error: 'Unknown guide requested.' }, 400);
  }

  // Defaulted rather than required. Neither value is a secret — the CRM
  // hostname is public DNS and the form id is in any submitted payload — and
  // defaulting them means a missing Pages environment variable can't silently
  // break every signup. Override either one in Pages settings if they change.
  const mauticBase = String(env.MAUTIC_BASE_URL || 'https://crm.thepairedwellness.com').replace(/\/$/, '');
  const formId = String(env.MAUTIC_GUIDE_FORM_ID || '1');

  const body = new URLSearchParams();
  body.set('mauticform[formId]', formId);
  body.set(`mauticform[${FIELD.email}]`, email);
  body.set(`mauticform[${FIELD.guide}]`, guide);
  body.set('mauticform[return]', '');

  // UTMs ride along from the landing page URL so each Reel or link can be
  // measured separately. Missing values are simply omitted.
  const utmMap = [
    [FIELD.utmSource, 'utm_source'],
    [FIELD.utmMedium, 'utm_medium'],
    [FIELD.utmCampaign, 'utm_campaign'],
    [FIELD.utmContent, 'utm_content'],
  ];
  for (const [alias, key] of utmMap) {
    const value = String(payload[key] ?? '').trim().slice(0, 200);
    if (value) body.set(`mauticform[${alias}]`, value);
  }

  try {
    const response = await fetch(`${mauticBase}/form/submit?formId=${encodeURIComponent(formId)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        // Without this Mautic attributes every lead to the Cloudflare edge IP,
        // which collapses geography and makes dedupe behave oddly.
        'x-forwarded-for': request.headers.get('cf-connecting-ip') ?? '',
        'user-agent': request.headers.get('user-agent') ?? 'pw-guide-signup',
      },
      body,
      redirect: 'manual',
    });

    // Mautic answers a successful submit with 200 or a 3xx to the return URL.
    // Both mean the contact landed. Only 4xx or 5xx is a real failure.
    if (response.status >= 400) {
      console.error('[guide-signup] Mautic responded', response.status);
      return json({ ok: false, error: 'We could not save that just now. Please try again shortly.' }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('[guide-signup] request to Mautic failed', error);
    return json({ ok: false, error: 'We could not save that just now. Please try again shortly.' }, 502);
  }
}
