const EMAILIT_API_KEY = Deno.env.get('EMAILIT_API_KEY')!
const EMAILIT_FROM = Deno.env.get('EMAILIT_FROM') || 'Meestertools <noreply@meestertools.nl>'
const EMAILIT_REPLY_TO = Deno.env.get('EMAILIT_REPLY_TO') || ''

export interface EmailitPayload {
  to: string
  subject: string
  html: string
  text: string                        // plain text version REQUIRED (not auto-generated)
  from?: string                       // override default from
  reply_to?: string                   // override default reply_to
  headers?: Record<string, string>    // custom headers (e.g. List-Unsubscribe)
}

/**
 * Stuurt een transactionele e-mail via emailit.
 *
 * Belangrijke deliverability-keuzes:
 * - `text` is verplicht (niet auto-genereren uit HTML) — mismatched HTML/text
 *   versies triggeren spam-filters.
 * - Standaard headers: Auto-Submitted (RFC 3834) signaleert dat dit een
 *   transactionele systeem-mail is. X-Auto-Response-Suppress voorkomt dat
 *   Outlook auto-replies stuurt.
 * - Voeg een X-Entity-Ref-ID toe voor uniciteit (helpt threading).
 */
export async function sendEmail(payload: EmailitPayload): Promise<void> {
  const refId = crypto.randomUUID()

  const baseHeaders: Record<string, string> = {
    'Auto-Submitted': 'auto-generated',
    'X-Auto-Response-Suppress': 'All',
    'X-Entity-Ref-ID': refId,
  }

  const finalHeaders = { ...baseHeaders, ...(payload.headers || {}) }

  const body: Record<string, unknown> = {
    from: payload.from || EMAILIT_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    headers: finalHeaders,
  }

  const replyTo = payload.reply_to || EMAILIT_REPLY_TO
  if (replyTo) {
    body.reply_to = replyTo
  }

  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAILIT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`EmailIt API error: ${response.status} ${errorText}`)
  }
}
