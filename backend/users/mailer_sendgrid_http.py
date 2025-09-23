# backend/users/mailer_sendgrid_http.py
import os
import json
from typing import Optional

import requests

API_URL = "https://api.sendgrid.com/v3/mail/send"

def send_verification_email_via_sendgrid(to_email: str, code: str, full_name: Optional[str] = None) -> None:
    """
    Sends a simple HTML verification email via SendGrid HTTP API.
    Requires:
      - SENDGRID_API_KEY in env
      - SENDER_EMAIL in env (must match your verified Single Sender)
    Raises RuntimeError if SendGrid returns an error.
    """
    api_key = os.environ.get("SENDGRID_API_KEY")
    sender_email = os.environ.get("SENDER_EMAIL")

    if not api_key:
        raise RuntimeError("SENDGRID_API_KEY not set")
    if not sender_email:
        raise RuntimeError("SENDER_EMAIL not set (must equal the verified sender)")

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
        "from": {"email": sender_email, "name": "AUB Lost & Found"},
        "content": [{"type": "text/html", "value": body_html}]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=15)
    # On success, SendGrid returns 202 Accepted
    if resp.status_code != 202:
        raise RuntimeError(f"SendGrid error {resp.status_code}: {resp.text}")

def send_reset_password_email_via_sendgrid(to_email: str, code: str, full_name: Optional[str] = None) -> None:
    api_key = os.environ.get("SENDGRID_API_KEY")
    sender_email = os.environ.get("SENDER_EMAIL")

    if not api_key:
        raise RuntimeError("SENDGRID_API_KEY not set")
    if not sender_email:
        raise RuntimeError("SENDER_EMAIL not set (must equal the verified sender)")

    subject = "Your Lost & Found password reset code"
    body_html = f"""
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5;">
          <p>Hi {full_name or "there"},</p>
          <p>Your password reset code is:</p>
          <p style="font-size:20px; font-weight:700; letter-spacing:2px;">{code}</p>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        </div>
        """

    payload = {
        "personalizations": [
            {"to": [{"email": to_email}], "subject": subject}
        ],
        "from": {"email": sender_email, "name": "AUB Lost & Found"},
        "content": [{"type": "text/html", "value": body_html}]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=15)
    # On success, SendGrid returns 202 Accepted
    if resp.status_code != 202:
        raise RuntimeError(f"SendGrid error {resp.status_code}: {resp.text}")