/**
 * API routes for thepairedwellness.com, in front of the static site.
 *
 * Replaces the self-hosted Mautic. Brevo holds the contacts; this Worker is the
 * only thing that talks to it, so the API key stays server-side — a Brevo v3 key
 * can read the entire contact list, and anything shipped to the browser is public.
 *
 * Routes (see run_worker_first in wrangler.jsonc — everything else is a static asset):
 *   POST /api/subscribe     form post from /acne
 *   GET  /api/unsubscribe   one-click, from the footer of every nurture email
 *
 * The nurture sequence runs on the scheduled() handler rather than a Brevo
 * automation, so it does not depend on the plan tier and lives with the code.
 */

const BREVO = "https://api.brevo.com/v3";
const LIST_ACNE = 3;                    // Acne Guide Leads
const LIST_NEWSLETTER = 4;              // Weekly Newsletter
const THANK_YOU = "/acne-thank-you";
const NEWSLETTER_THANK_YOU = "/newsletter-thank-you";
const KNOWN_GUIDES = new Set(["acne", "gut"]);
const DAY = 86400000;

// Nurture steps: how many days after signup, and which template to send.
// NURTURE_STAGE records the last step delivered, so a step never repeats.
const SEQUENCE = [
  { stage: 2, afterDays: 2, template: (e) => Number(e.TEMPLATE_DAY2) },
  { stage: 3, afterDays: 5, template: (e) => Number(e.TEMPLATE_DAY5) },
];

async function brevo(env, path, { method = "GET", body } = {}) {
  const res = await fetch(BREVO + path, {
    method,
    headers: {
      "api-key": env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* Brevo sends 204s */ }
  if (!res.ok) throw new Error(`brevo ${method} ${path} -> ${res.status} ${text.slice(0, 200)}`);
  return json;
}

// --- unsubscribe links -----------------------------------------------------
// Signed so the link cannot be used to unsubscribe an address the sender never
// mailed. Not secrecy — just proof the URL came from us.
async function sign(email, secret) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(email.toLowerCase()));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

async function unsubUrl(email, env) {
  const token = await sign(email, env.UNSUB_SECRET);
  return `${env.SITE_URL}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${token}`;
}

// Constant-time compare, so a wrong token cannot be narrowed down by timing.
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sendTemplate(env, email, templateId, extraParams = {}) {
  return brevo(env, "/smtp/email", {
    method: "POST",
    body: {
      to: [{ email }],
      templateId,
      params: { unsub_url: await unsubUrl(email, env), ...extraParams },
    },
  });
}

// --- signup ---------------------------------------------------------------
// Shared by the static /acne page (form post) and the React guide component
// (JSON fetch). Same contact shape either way.
async function addGuideContact(env, { email, guide, utm }) {
  const attributes = {
    GUIDE_REQUESTED: guide,
    ATTRIBUTION_SOURCE: utm.source || "direct",
    ATTRIBUTION_MEDIUM: utm.medium || "none",
    ATTRIBUTION_CAMPAIGN: utm.campaign || `${guide}-guide`,
    ATTRIBUTION_CONTENT: utm.content || "",
    SIGNUP_DATE: new Date().toISOString().slice(0, 10),
    // Stage 0 means "collected, nothing sent". The nurture cron only picks up
    // contacts at stage 1 or higher, so nobody is mailed until the guide ships.
    NURTURE_STAGE: env.DELIVER_GUIDE === "true" ? 1 : 0,
  };

  // updateEnabled lets a repeat signup refresh attribution instead of 400ing on
  // duplicate_parameter. Someone who asks twice should still get the guide.
  await brevo(env, "/contacts", {
    method: "POST",
    body: { email, attributes, listIds: [LIST_ACNE], updateEnabled: true },
  });

  // The guide is still in final edits. Collect the address, promise nothing,
  // and send when DELIVER_GUIDE flips — the landing copy says "coming", and an
  // email saying "here it is" with a dead PDF link costs more than the wait.
  if (env.DELIVER_GUIDE === "true") {
    await sendTemplate(env, email, Number(env.TEMPLATE_DELIVERY));
  }
}

function validEmail(e) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
}

// POST /api/subscribe — plain form post from the static /acne page.
async function handleSubscribe(request, env) {
  const form = await request.formData();
  const get = (k) => (form.get(k) || "").toString().trim();

  // Bots fill every field they find; people never see this one.
  if (get("website")) return Response.redirect(env.SITE_URL + THANK_YOU, 303);

  const email = get("email").toLowerCase();
  if (!validEmail(email)) {
    return new Response("A valid email address is required.", { status: 400 });
  }

  await addGuideContact(env, {
    email,
    guide: get("guide_requested") || "acne",
    utm: {
      source: get("attribution_source"),
      medium: get("attribution_medium"),
      campaign: get("attribution_campaign"),
      content: get("attribution_content"),
    },
  });
  return Response.redirect(env.SITE_URL + THANK_YOU, 303);
}

// POST /api/guide-signup — JSON, from the React component, which renders its
// own success state rather than navigating. Kept as its own route because the
// contract (JSON in, {ok:true} out) is what the component already expects.
async function handleGuideSignup(request, env) {
  const body = await request.json().catch(() => ({}));
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), {
      status, headers: { "content-type": "application/json" },
    });

  if ((body.website || "").trim()) return json({ ok: true });

  const email = (body.email || "").trim().toLowerCase();
  if (!validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);

  const guide = (body.guide || "acne").trim();
  if (!KNOWN_GUIDES.has(guide)) return json({ error: "Unknown guide." }, 400);

  try {
    await addGuideContact(env, {
      email, guide,
      utm: {
        source: body.utm_source, medium: body.utm_medium,
        campaign: body.utm_campaign, content: body.utm_content,
      },
    });
    return json({ ok: true });
  } catch (err) {
    console.error(`guide-signup failed: ${err.message}`);
    return json({ error: "Something went wrong. Please try again." }, 502);
  }
}

// POST /api/newsletter — footer opt-in. Its own list, no guide attributes.
async function handleNewsletter(request, env) {
  const form = await request.formData();
  const get = (k) => (form.get(k) || "").toString().trim();
  if (get("website")) return Response.redirect(env.SITE_URL + NEWSLETTER_THANK_YOU, 303);

  const email = get("email").toLowerCase();
  if (!validEmail(email)) {
    return new Response("A valid email address is required.", { status: 400 });
  }
  await brevo(env, "/contacts", {
    method: "POST",
    body: {
      email,
      attributes: { SIGNUP_DATE: new Date().toISOString().slice(0, 10) },
      listIds: [LIST_NEWSLETTER],
      updateEnabled: true,
    },
  });
  return Response.redirect(env.SITE_URL + NEWSLETTER_THANK_YOU, 303);
}

// --- GET /api/unsubscribe --------------------------------------------------
async function handleUnsubscribe(url, env) {
  const email = (url.searchParams.get("e") || "").toLowerCase();
  const token = url.searchParams.get("t") || "";
  const page = (msg) =>
    new Response(
      `<!doctype html><meta charset="utf-8"><title>Unsubscribed</title>` +
      `<body style="font-family:Georgia,serif;background:#F7F3ED;color:#082F2A;` +
      `display:grid;place-items:center;height:100vh;margin:0;text-align:center;padding:24px">` +
      `<div><p style="font-size:18px;max-width:34em;line-height:1.6">${msg}</p>` +
      `<p><a href="${env.SITE_URL}" style="color:#557A45">thepairedwellness.com</a></p></div>`,
      { headers: { "content-type": "text/html;charset=utf-8" } });

  if (!email || !safeEqual(token, await sign(email, env.UNSUB_SECRET))) {
    return page("That unsubscribe link is not valid. If you are still receiving email you did not ask for, reply to any message and Annie will remove you by hand.");
  }
  // Blacklisting is stronger than removing from the list: it also stops any
  // future list this address lands on.
  await brevo(env, `/contacts/${encodeURIComponent(email)}`, {
    method: "PUT",
    body: { emailBlacklisted: true },
  });
  return page("You are unsubscribed. You will not receive any more email from Paired Wellness.");
}

// --- cron: advance the nurture sequence ------------------------------------
async function runNurture(env) {
  const now = Date.now();
  let offset = 0, sent = 0;
  for (;;) {
    const page = await brevo(env, `/contacts/lists/${LIST_ACNE}/contacts?limit=50&offset=${offset}`);
    const contacts = page?.contacts || [];
    if (!contacts.length) break;

    for (const c of contacts) {
      if (c.emailBlacklisted) continue;
      const a = c.attributes || {};
      const stage = Number(a.NURTURE_STAGE || 0);
      const signup = Date.parse(a.SIGNUP_DATE);
      if (!signup) continue;
      const age = (now - signup) / DAY;

      // Only ever advance one step per run, so a contact who signed up a week
      // ago does not receive the whole sequence at once.
      const step = SEQUENCE.find((s) => s.stage > stage && age >= s.afterDays);
      if (!step) continue;

      try {
        await sendTemplate(env, c.email, step.template(env));
        await brevo(env, `/contacts/${encodeURIComponent(c.email)}`, {
          method: "PUT",
          body: { attributes: { NURTURE_STAGE: step.stage } },
        });
        sent++;
      } catch (err) {
        // One bad address must not stop the rest of the run.
        console.error(`nurture failed for ${c.email}: ${err.message}`);
      }
    }
    if (contacts.length < 50) break;
    offset += 50;
  }
  console.log(`nurture run complete: ${sent} sent`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      try {
        return await handleSubscribe(request, env);
      } catch (err) {
        // The signup is the thing worth protecting: if Brevo is down, still send
        // the visitor to the thank-you page rather than showing a stack trace,
        // and let the log carry the failure.
        console.error(`subscribe failed: ${err.message}`);
        return Response.redirect(env.SITE_URL + THANK_YOU, 303);
      }
    }

    if (url.pathname === "/api/guide-signup" && request.method === "POST") {
      return handleGuideSignup(request, env);
    }

    if (url.pathname === "/api/newsletter" && request.method === "POST") {
      try {
        return await handleNewsletter(request, env);
      } catch (err) {
        console.error(`newsletter failed: ${err.message}`);
        return Response.redirect(env.SITE_URL + NEWSLETTER_THANK_YOU, 303);
      }
    }

    if (url.pathname === "/api/unsubscribe") {
      try {
        return await handleUnsubscribe(url, env);
      } catch (err) {
        console.error(`unsubscribe failed: ${err.message}`);
        return new Response("Something went wrong. Reply to any email and Annie will remove you by hand.", { status: 500 });
      }
    }

    // Anything else under /api that we do not serve.
    if (url.pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });

    return env.ASSETS.fetch(request);
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runNurture(env));
  },
};
