#!/usr/bin/env python3
"""Create the acne-guide transactional templates in Brevo.

Idempotent: templates are matched by name, so re-running updates rather than
duplicating. Reads the API key from ~/.brevo-key or BREVO_API_KEY.

The nurture emails are marketing, not transactional, so each one carries a
visible unsubscribe link. The Worker builds that URL (it needs an HMAC it
alone can sign) and passes it in as params.unsub_url — Brevo has no automatic
unsubscribe for transactional sends.
"""
import json, os, pathlib, sys, urllib.error, urllib.request

KEY = os.environ.get("BREVO_API_KEY") or pathlib.Path(
    os.path.expanduser("~/.brevo-key")).read_text().strip()
B = "https://api.brevo.com/v3"

GUIDE_URL = "https://thepairedwellness.com/guides/paired-wellness-acne-guide.pdf"
SITE      = "https://thepairedwellness.com"
CLINIC    = "https://thewellnesswaymason.com"
SENDER    = {"name": "Annie DeNome", "email": "annie@thepairedwellness.com"}
INK, BODY, MOSS, PETAL, LINE = "#082F2A", "#4A5A4E", "#557A45", "#F7F3ED", "#DDD7C9"


def api(path, payload=None, method="GET"):
    req = urllib.request.Request(
        B + path, method=method,
        data=json.dumps(payload).encode() if payload is not None else None,
        headers={"api-key": KEY, "Content-Type": "application/json",
                 "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode()
            return json.loads(body) if body.strip() else {}
    except urllib.error.HTTPError as e:
        return {"_err": e.code, "_body": e.read().decode()[:300]}


def h1(t):
    return (f'<tr><td style="padding:0 0 18px;font-family:Georgia,serif;font-size:30px;'
            f'line-height:1.15;color:{INK}">{t}</td></tr>')


def p(t):
    return (f'<tr><td style="padding:0 0 16px;font-family:Georgia,serif;font-size:16px;'
            f'line-height:1.6;color:{BODY}">{t}</td></tr>')


SIG = (f'<tr><td style="padding:10px 0 24px;font-family:Georgia,serif;font-size:16px;'
       f'color:{INK}">— Annie</td></tr>')


def shell(preheader, blocks, cta=None):
    button = ""
    if cta:
        label, href = cta
        button = (f'<tr><td style="padding:6px 0 22px"><a href="{href}" '
                  f'style="display:inline-block;background:{INK};color:{PETAL};'
                  f'text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:15px;'
                  f'font-weight:bold;padding:15px 30px;border-radius:999px">{label}</a></td></tr>')
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:{PETAL}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{PETAL};padding:32px 16px">
 <tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
  <tr><td style="padding:0 0 26px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:{MOSS};font-weight:bold">Paired Wellness</td></tr>
  {"".join(blocks)}
  {button}
  <tr><td style="border-top:1px solid {LINE};padding:22px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8A8F86">
    <p style="margin:0 0 10px">Educational content, not medical advice. Annie DeNome is a wellness educator and is not a licensed medical provider. Nothing here diagnoses, treats, or replaces care from your physician.</p>
    <p style="margin:0 0 10px">Annie is married to Dr. Ryan DeNome, D.C. of <a href="{CLINIC}" style="color:{MOSS}">The Wellness Way Mason</a> and may be compensated for referrals there.</p>
    <p style="margin:0"><a href="{{{{ params.unsub_url }}}}" style="color:#8A8F86">Unsubscribe</a> &nbsp;·&nbsp; <a href="{SITE}" style="color:#8A8F86">thepairedwellness.com</a></p>
  </td></tr>
 </table></td></tr></table></body></html>"""


TEMPLATES = [
    dict(name="Acne Guide · 1 · Delivery", subject="Your acne guide",
         preheader="Fifteen pages, and the one I would read first.",
         cta=("Read the guide", GUIDE_URL), blocks=[
             h1("Here it is."),
             p("Thank you for asking for this. It is fifteen pages and it will take about twenty "
               "minutes, so save it for when you can actually sit with it."),
             p("If you only read one page today, make it the one about the gut. It is the part "
               "almost nobody checks, and it is where most of the useful answers have been — for "
               "me, and for the women I talk to."),
             p("One thing I want to say plainly: this guide will not diagnose you and it does not "
               "end in a supplement protocol. Where the evidence is weak, I say so — including "
               "about a few things the wellness world repeats very confidently."),
             SIG]),
    dict(name="Acne Guide · 2 · The page most people skip",
         subject="The page most people skip",
         preheader="It is not the skincare one.",
         cta=("Reread page six", GUIDE_URL), blocks=[
             h1("The page most people skip."),
             p("When people tell me which part of the guide landed, it is almost never the "
               "skincare pages. It is the one about food reactions — the quiet version."),
             p("Most people picture hives and an epi-pen. The common version is something you eat "
               "three times a week that costs you a little each time, and that you have never once "
               "connected to your skin."),
             p("Here is the part that matters: that is testable. Validated stool testing, celiac "
               "screening and proper allergy testing all exist. What does not work is an "
               "elimination diet built on a hunch — it removes foods you never needed to lose and "
               "misses the ones actually costing you."),
             p("And a warning I put in the guide because it is genuinely common: do not cut gluten "
               "before celiac testing. Going gluten-free first can make the test come back falsely "
               "normal, and you may never get a real answer."),
             SIG]),
    dict(name="Acne Guide · 3 · What testing covers",
         subject="What testing actually covers",
         preheader="Specifically, so you can decide whether it is worth it.",
         cta=("See what testing covers", CLINIC), blocks=[
             h1("What testing actually covers."),
             p("I said in the guide that the honest next step is measurement rather than another "
               "product. That is easy to say and vague, so here is the specific version."),
             p("<strong>Hormones, properly.</strong> Free and total testosterone, DHEA-S, SHBG, "
               "17-OH progesterone and thyroid — read together rather than one line at a time. A "
               "routine panel does not include most of these."),
             p("<strong>Blood sugar and insulin.</strong> Fasting insulin and HbA1c alongside "
               "glucose, because insulin moves first and can climb for years while glucose still "
               "reads normal."),
             p("<strong>Gut and food reactivity.</strong> Validated stool testing, celiac "
               "screening, and proper allergy testing."),
             p("<strong>The ordinary things that get skipped.</strong> Ferritin, vitamin D, and "
               "inflammatory markers, read in context with everything above."),
             p("My husband, Dr. Ryan DeNome, D.C., practices at The Wellness Way Mason. They run "
               "this kind of comprehensive panel and go through the results with you in plain "
               "language, and they will tell you the cost before anything is drawn. I may be "
               "compensated if you book — you should know that and weigh it."),
             p("If now is not the time, that is completely fine. The guide is yours either way, "
               "and the at-home pages cost nothing to start."),
             SIG]),
]


def main():
    existing = api("/smtp/templates?limit=100").get("templates") or []
    by_name = {t["name"]: t["id"] for t in existing}
    ids = []
    for t in TEMPLATES:
        payload = {
            "templateName": t["name"],
            "subject": t["subject"],
            "sender": SENDER,
            "replyTo": SENDER["email"],
            "htmlContent": shell(t["preheader"], t["blocks"], t.get("cta")),
            "isActive": True,
        }
        if t["name"] in by_name:
            tid = by_name[t["name"]]
            r = api(f"/smtp/templates/{tid}", payload, "PUT")
            print(f"  template {tid}: updated  {t['name']}" if "_err" not in r
                  else f"  ERROR {r['_body']}")
        else:
            r = api("/smtp/templates", payload, "POST")
            tid = r.get("id")
            print(f"  template {tid}: created  {t['name']}" if tid
                  else f"  ERROR {r.get('_body')}")
        ids.append(tid)
    print("\nTemplate ids, in sequence order:", ids)
    print("Set these on the Worker as TEMPLATE_DELIVERY / TEMPLATE_DAY2 / TEMPLATE_DAY5.")


if __name__ == "__main__":
    main()
