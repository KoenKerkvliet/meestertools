import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, redirectTo } = await req.json()

    if (!email || typeof email !== 'string') {
      return json({ success: false, error: 'Geldig e-mailadres ontbreekt.' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo },
    })

    // Belangrijk: ook bij "user niet gevonden" geven we success terug.
    // Zo lekken we geen info over welke e-mailadressen bestaan.
    if (error) {
      console.error('generateLink error:', error.message)
      // Specifieke "user not found" → stille success
      if (error.message?.toLowerCase().includes('not found') || error.status === 404) {
        return json({ success: true })
      }
      return json({ success: false, error: 'Kon reset-link niet genereren.' }, 500)
    }

    const actionLink = data.properties.action_link

    await sendEmail({
      to: email,
      subject: 'Wachtwoord opnieuw instellen',
      html: passwordResetEmailHtml(actionLink),
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

function passwordResetEmailHtml(link: string): string {
  const PRIMARY = '#6C63FF'
  const SECONDARY = '#FF6B6B'
  const BRAND_NAME = 'Meestertools'
  const YEAR = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wachtwoord opnieuw instellen</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F8F9FE;color:#2D3436;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FE;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(108,99,255,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${PRIMARY} 0%, ${SECONDARY} 100%);padding:36px 32px;text-align:center;color:#FFFFFF;">
              <div style="font-size:42px;line-height:1;margin-bottom:8px;">&#127891;</div>
              <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.3px;">${BRAND_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;line-height:1.6;color:#2D3436;">
              <h2 style="margin:0 0 16px 0;font-size:20px;font-weight:700;">Wachtwoord opnieuw instellen</h2>
              <p style="margin:0 0 16px 0;">Hoi,</p>
              <p style="margin:0 0 16px 0;">Je hebt aangegeven dat je je wachtwoord opnieuw wilt instellen. Klik op de knop hieronder om een nieuw wachtwoord in te stellen:</p>
              <p style="text-align:center;margin:32px 0;">
                <a href="${link}" style="background:${PRIMARY};color:#FFFFFF;padding:14px 32px;text-decoration:none;border-radius:8px;display:inline-block;font-weight:600;font-size:16px;">Nieuw wachtwoord instellen</a>
              </p>
              <p style="margin:0 0 16px 0;font-size:14px;color:#636E72;">Deze link is 1 uur geldig. Heb je deze e-mail niet aangevraagd? Dan kun je 'm gerust negeren — je wachtwoord blijft ongewijzigd.</p>
              <hr style="border:none;border-top:1px solid #E8E8F0;margin:24px 0;">
              <p style="margin:0;font-size:13px;color:#636E72;">Werkt de knop niet? Kopieer deze link in je browser:</p>
              <p style="margin:8px 0 0 0;font-size:13px;word-break:break-all;"><a href="${link}" style="color:${PRIMARY};">${link}</a></p>
              <p style="margin:24px 0 0 0;">Met vriendelijke groet,<br>${BRAND_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#F8F9FE;color:#B2BEC3;font-size:12px;text-align:center;">
              &copy; ${YEAR} ${BRAND_NAME} &middot; <a href="https://meestertools.nl" style="color:${PRIMARY};text-decoration:none;">meestertools.nl</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
