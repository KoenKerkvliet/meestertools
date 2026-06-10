import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

// redirectTo komt uit de request body en mag alleen naar onze eigen site
// wijzen — anders kan iemand voor elk adres een echte Meestertools-mail
// laten sturen waarvan de herstellink naar een vreemde site leidt.
// Bij een afwijkende waarde vallen we stilletjes terug op de default,
// zodat de flow nooit breekt.
const ALLOWED_ORIGINS = ['https://meestertools.nl', 'https://www.meestertools.nl']
const DEFAULT_REDIRECT = 'https://meestertools.nl/wachtwoord-resetten'

// Throttle: max 1 mail per minuut en 5 per uur per adres (mailbombing/quota).
const COOLDOWN_SECONDS = 60
const MAX_PER_HOUR = 5

function safeRedirect(raw: unknown): string {
  try {
    const url = new URL(String(raw || ''))
    if (ALLOWED_ORIGINS.includes(url.origin)) return url.href
  } catch (_) { /* geen geldige URL: gebruik default */ }
  return DEFAULT_REDIRECT
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email: rawEmail, redirectTo } = await req.json()

    if (!rawEmail || typeof rawEmail !== 'string') {
      return json({ success: false, error: 'Geldig e-mailadres ontbreekt.' }, 400)
    }
    const email = rawEmail.trim().toLowerCase()

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Throttle-check. Bij overschrijding doen we alsof het gelukt is:
    // de gebruiker ziet dezelfde melding en we lekken niets.
    const { data: recent } = await admin
      .from('password_reset_log')
      .select('sent_at')
      .eq('email', email)
      .gte('sent_at', new Date(Date.now() - 3600_000).toISOString())
      .order('sent_at', { ascending: false })

    if (recent && recent.length > 0) {
      const lastSent = new Date(recent[0].sent_at).getTime()
      if (recent.length >= MAX_PER_HOUR || Date.now() - lastSent < COOLDOWN_SECONDS * 1000) {
        return json({ success: true })
      }
    }

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: safeRedirect(redirectTo) },
    })

    // Belangrijk: ook bij "user niet gevonden" geven we success terug.
    // Zo lekken we geen info over welke e-mailadressen bestaan.
    if (error) {
      console.error('generateLink error:', error.message)
      if (error.message?.toLowerCase().includes('not found') || error.status === 404) {
        return json({ success: true })
      }
      return json({ success: false, error: 'Kon reset-link niet genereren.' }, 500)
    }

    const actionLink = data.properties.action_link

    // Registreer de verzending voor de throttle en ruim oude rijen op.
    await admin.from('password_reset_log').insert({ email })
    await admin.from('password_reset_log')
      .delete()
      .lt('sent_at', new Date(Date.now() - 24 * 3600_000).toISOString())

    await sendEmail({
      to: email,
      subject: 'Wachtwoord opnieuw instellen',
      html: passwordResetEmailHtml(actionLink),
      text: passwordResetEmailText(actionLink),
    })

    return json({ success: true })
  } catch (err) {
    console.error('send-password-reset-email error:', err)
    return json({ success: false, error: (err as Error).message || 'Onbekende fout.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Deliverability-vriendelijke HTML — getuned voor Outlook / M365:
 * - GEEN linear-gradient (Outlook strips deze)
 * - GEEN box-shadow (Outlook strips)
 * - GEEN emoji in header (kan filters triggeren)
 * - Eén CTA-link in plaats van button + dubbele "kopieer link"
 * - Solid background colors
 * - Tables-only layout met expliciete width
 * - Preheader text (preview in inbox)
 * - color-scheme + x-apple-disable meta tags
 */
function passwordResetEmailHtml(link: string): string {
  const PRIMARY = '#6C63FF'
  const TEXT_DARK = '#2D3436'
  const TEXT_MUTED = '#636E72'
  const BG = '#F5F5F7'
  const FOOTER_BG = '#FAFAFA'
  const BORDER = '#E8E8F0'
  const BRAND_NAME = 'Meestertools'
  const YEAR = new Date().getFullYear()
  const PREHEADER = 'Klik op de knop in deze e-mail om een nieuw wachtwoord in te stellen. Deze link is 1 uur geldig.'

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Wachtwoord opnieuw instellen</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG};opacity:0;">${PREHEADER}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};">
        <tr>
          <td align="center" bgcolor="${PRIMARY}" style="background:${PRIMARY};padding:28px 24px;">
            <div style="font-size:20px;font-weight:700;letter-spacing:-0.2px;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${BRAND_NAME}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px 32px;color:${TEXT_DARK};font-size:16px;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:700;color:${TEXT_DARK};">Wachtwoord opnieuw instellen</h1>
            <p style="margin:0 0 16px 0;">Hoi,</p>
            <p style="margin:0 0 24px 0;">Je hebt aangegeven dat je je wachtwoord opnieuw wilt instellen. Klik op de knop hieronder om verder te gaan:</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 24px auto;">
              <tr>
                <td align="center" bgcolor="${PRIMARY}" style="background:${PRIMARY};">
                  <a href="${link}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;font-family:Arial,Helvetica,sans-serif;">Nieuw wachtwoord instellen</a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 16px 0;font-size:14px;color:${TEXT_MUTED};">Deze link is 1 uur geldig. Heb je deze e-mail niet aangevraagd? Dan kun je 'm gerust negeren &mdash; je wachtwoord blijft ongewijzigd.</p>
            <p style="margin:24px 0 0 0;color:${TEXT_DARK};">Met vriendelijke groet,<br>${BRAND_NAME}</p>
          </td>
        </tr>
        <tr>
          <td bgcolor="${FOOTER_BG}" style="background:${FOOTER_BG};padding:16px 32px;color:${TEXT_MUTED};font-size:12px;text-align:center;font-family:Arial,Helvetica,sans-serif;border-top:1px solid ${BORDER};">
            &copy; ${YEAR} ${BRAND_NAME} &middot; meestertools.nl
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}

/**
 * Plain-text versie — handmatig geschreven (NIET HTML-stripped).
 * Spam-filters vergelijken HTML en text versies; mismatch = hogere spam-score.
 */
function passwordResetEmailText(link: string): string {
  const YEAR = new Date().getFullYear()
  return `Hoi,

Je hebt aangegeven dat je je wachtwoord opnieuw wilt instellen. Klik op deze link om een nieuw wachtwoord in te stellen:

${link}

Deze link is 1 uur geldig. Heb je deze e-mail niet aangevraagd? Dan kun je deze gerust negeren - je wachtwoord blijft ongewijzigd.

Met vriendelijke groet,
Meestertools

--
(c) ${YEAR} Meestertools | meestertools.nl
`
}
