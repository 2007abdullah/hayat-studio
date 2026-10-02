import logging
from html import escape
import httpx
from app.core.config import get_settings

log = logging.getLogger("email")


def _layout(title: str, body_html: str, cta: tuple[str, str] | None = None) -> str:
    button = (f'<p style="margin:28px 0"><a href="{escape(cta[1])}" style="background:#62d0ff;color:#04121c;'
              f'padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600">{escape(cta[0])}</a></p>') if cta else ""
    return f"""<!doctype html><html><body style="margin:0;background:#0b0f14;padding:32px 12px;font-family:Inter,Segoe UI,Arial,sans-serif">
<table role="presentation" align="center" width="560" style="max-width:100%;background:#111823;border:1px solid #1f2a3a;border-radius:16px;color:#d7e0ec">
<tr><td style="padding:32px"><div style="font-size:13px;color:#62d0ff;letter-spacing:.04em">Abdullah Hayat Studio</div>
<h1 style="font-size:22px;color:#fff;margin:10px 0 18px">{escape(title)}</h1>{body_html}{button}
<p style="font-size:12px;color:#6b7a90;margin-top:32px">Full-Stack Developer &amp; DevOps Engineer</p></td></tr></table></body></html>"""


def _rows(pairs: list[tuple[str, str | None]]) -> str:
    rows = "".join(f'<tr><td style="padding:6px 16px 6px 0;color:#8a9ab0;vertical-align:top">{escape(k)}</td>'
                   f'<td style="padding:6px 0;color:#fff">{escape(v or "-")}</td></tr>' for k, v in pairs)
    return f'<table role="presentation" style="font-size:14px">{rows}</table>'


def send_email(to: str, subject: str, html: str) -> None:
    s = get_settings()
    if not to:
        return
    if not s.resend_api_key:
        log.warning("RESEND_API_KEY not set - email to %s not sent. Subject: %s", to, subject)
        return
    try:
        r = httpx.post("https://api.resend.com/emails", timeout=15,
                       headers={"Authorization": f"Bearer {s.resend_api_key}"},
                       json={"from": s.email_from, "to": [to], "subject": subject, "html": html})
        r.raise_for_status()
    except Exception:  # never break a request because email failed
        log.exception("Failed to send email to %s", to)


def admin_new_order(order) -> tuple[str, str]:
    s = get_settings()
    body = _rows([("Client", f"{order.client_name} <{order.client_email}>"), ("Service", order.service_title),
                  ("Budget", order.budget), ("Deadline", order.deadline), ("Requirements", order.requirements[:1200])])
    return (f"New Project Order — {order.order_number}",
            _layout(f"New order {order.order_number}", body, ("Open in dashboard", f"{s.frontend_url}/admin/orders/{order.id}")))


def client_confirmation(order) -> tuple[str, str]:
    s = get_settings()
    body = ("<p>Thanks for your request. I'll review the details and reply within one business day.</p>"
            + _rows([("Order number", order.order_number), ("Service", order.service_title), ("Status", order.status)])
            + "<p><b>Next steps:</b> I review your requirements, contact you to discuss scope, then send a quote.</p>")
    return ("Your Project Request Has Been Received",
            _layout("Your project request has been received", body, ("Track your project", f"{s.frontend_url}/dashboard/orders/{order.id}")))


def status_update(order) -> tuple[str, str]:
    s = get_settings()
    body = f"<p>Your project <b>{escape(order.project_title)}</b> is now:</p>" + _rows([("Status", order.status), ("Order", order.order_number)])
    subject = f"Project completed — {order.order_number}" if order.status == "Completed" else f"Status update — {order.order_number}"
    return (subject, _layout("Your project status changed", body, ("View project", f"{s.frontend_url}/dashboard/orders/{order.id}")))


def quote_notification(order) -> tuple[str, str]:
    s = get_settings()
    body = "<p>Your quote is ready.</p>" + _rows([("Order", order.order_number),
                                                 ("Quoted amount", f"${order.quoted_amount:,} USD" if order.quoted_amount else None)])
    return (f"Quote ready — {order.order_number}", _layout("Your quote is ready", body, ("Review quote", f"{s.frontend_url}/dashboard/orders/{order.id}")))


def contact_notification(c) -> tuple[str, str]:
    body = _rows([("From", f"{c.name} <{c.email}>"), ("Subject", c.subject), ("Message", c.message)])
    return (f"Contact form — {c.subject}", _layout("New contact message", body))


def new_message_notification(order, sender_name: str, to_admin: bool) -> tuple[str, str]:
    s = get_settings()
    link = f"{s.frontend_url}/admin/orders/{order.id}" if to_admin else f"{s.frontend_url}/dashboard/orders/{order.id}"
    return (f"New message on {order.order_number}",
            _layout("You have a new message", f"<p>{escape(sender_name)} sent a message about {escape(order.project_title)}.</p>", ("Open conversation", link)))


def password_reset(email: str, token: str) -> tuple[str, str]:
    s = get_settings()
    return ("Reset your password",
            _layout("Reset your password", "<p>Use the button below to choose a new password. The link expires in 30 minutes. If you didn't ask for this, ignore this email.</p>",
                    ("Choose a new password", f"{s.frontend_url}/reset-password?token={token}")))
