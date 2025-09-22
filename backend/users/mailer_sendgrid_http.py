# apps/accounts/mailer_sendgrid_http.py
import os
import json
import requests

SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")  # must be your verified sender

API_URL = "https://api.sendgrid.com/v3/mail/send"

def send_verification_email(to_email: str, code: str, full_name: str | None = None) -> None:
    """
    Sends a simple HTML verification email via SendGrid HTTP API.
    Raises RuntimeError with details if SendGrid returns an error.
    """
    if not SENDGRID_API_KEY:
        raise RuntimeError("SENDGRID_API_KEY not set")
    if not SENDER_EMAIL:
        raise RuntimeError("SENDER_EMAIL not set")

    subject = "Your Lost & Found verification code"
    body_html = f"""
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5;">
      <p>Hi {full_name or "there"},</p>
      <p>Your verification code is:</p>
      <p style="font-size:20px; font-weight:700; letter-spacing:2px;">{code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
    """

    payload = {
        "personalizations": [
            {"to": [{"email": to_email}], "subject": subject}
        ],
        "from": {"email": SENDER_EMAIL},
        "content": [{"type": "text/html", "value": body_html}]
    }

    headers = {
        "Authorization": f"Bearer {SENDGRID_API_KEY}",
        "Content-Type": "application/json"
    }

    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=15)
    # On success, SendGrid returns 202 Accepted
    if resp.status_code != 202:
        raise RuntimeError(f"SendGrid error {resp.status_code}: {resp.text}")
