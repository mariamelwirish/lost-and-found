import os
import json
from typing import Optional
import requests

API_URL = "https://api.sendgrid.com/v3/mail/send"


def send_verification_email_via_sendgrid(
    to_email: str, code: str, full_name: Optional[str] = None
) -> None:
    """Send a verification email via SendGrid HTTP API."""

    api_key = os.environ.get("SENDGRID_API_KEY")
    sender_email = os.environ.get("SENDER_EMAIL")

    if not api_key:
        raise RuntimeError("SENDGRID_API_KEY not set")
    if not sender_email:
        raise RuntimeError("SENDER_EMAIL not set (must equal the verified sender)")

    subject = "Welcome to AUB Lost & Found – Verify Your Email"
    body_html = f"""<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="background-color: white; padding: 40px; border-radius: 10px; max-width: 750px; margin: auto;">

      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://lost-and-found-puce-rho.vercel.app/lostfound.png"
             alt="AUB Lost &amp; Found logo"
             style="width: 200px;" />
      </div>

      <p style="font-size: 16px;">Hello {full_name or "there"},</p>

      <p style="font-size: 15px; line-height: 1.6;">
        Welcome to the <strong>AUB Lost &amp; Found</strong> portal! We’re excited to help you
        safely report, search for, and reunite items with their owners.
      </p>

      <p style="font-size: 15px; line-height: 1.6;">
        To finish setting up your account, please enter the verification code below
        in the website:
      </p>

      <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; text-align: center; margin: 30px 0;">
        {code}
      </div>

      <p style="font-size: 14px; line-height: 1.6;">
        <strong>This code is valid for 1 minute.</strong><br/>
        For your security, please don’t share this code with anyone.
        If you didn’t try to sign up, you can safely ignore this message.
      </p>

      <p style="font-size: 14px; line-height: 1.6;">
        Once you’re verified, you can log in anytime at
        <a href="https://lost-and-found-puce-rho.vercel.app">lost-and-found-puce-rho.vercel.app</a>
        to create posts for lost or found items, manage your listings, and keep track of updates.
      </p>

      <p style="font-size: 14px; line-height: 1.6;">
        Warm regards,<br />
        <strong>AUB Lost &amp; Found Team</strong>
      </p>

      <p style="color: #777; font-size: 11px; margin-top: 25px; line-height: 1.5;">
        This is an automated notification from the AUB Lost &amp; Found portal.<br/>
        Please do not reply directly to this email.
      </p>

    </div>
  </body>
</html>
"""

    payload = {
        "personalizations": [
            {"to": [{"email": to_email}], "subject": subject}
        ],
        "from": {"email": sender_email, "name": "AUB Lost & Found"},
        "content": [{"type": "text/html", "value": body_html}],
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=15)
    if resp.status_code != 202:
        raise RuntimeError(f"SendGrid error {resp.status_code}: {resp.text}")


def send_reset_password_email_via_sendgrid(
    to_email: str, code: str, full_name: Optional[str] = None
) -> None:
    """Send a password-reset email via SendGrid HTTP API."""

    api_key = os.environ.get("SENDGRID_API_KEY")
    sender_email = os.environ.get("SENDER_EMAIL")

    if not api_key:
        raise RuntimeError("SENDGRID_API_KEY not set")
    if not sender_email:
        raise RuntimeError("SENDER_EMAIL not set (must equal the verified sender)")

    subject = "Reset Your AUB Lost & Found Password"
    body_html = f"""<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="background-color: white; padding: 40px; border-radius: 10px; max-width: 750px; margin: auto;">

      <div style="text-align: center; margin-bottom: 25px;">
        <img src="https://lost-and-found-puce-rho.vercel.app/lostfound.png"
             alt="AUB Lost &amp; Found logo"
             style="width: 200px;" />
      </div>

      <p style="font-size: 16px;">Hello {full_name or "there"},</p>

      <p style="font-size: 15px; line-height: 1.6;">
        We received a request to reset the password for your
        <strong>AUB Lost &amp; Found</strong> account.
        To continue, please enter the following code in the password reset page:
      </p>

      <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; text-align: center; margin: 30px 0;">
        {code}
      </div>

      <p style="font-size: 14px; line-height: 1.6;">
        <strong>This code is valid for 1 minute.</strong><br/>
        If you didn’t request a password reset, you can safely ignore this email
        and your account will stay exactly as it is.
      </p>

      <p style="font-size: 14px; line-height: 1.6;">
        After resetting your password, you can log back in at
        <a href="https://lost-and-found-puce-rho.vercel.app">lost-and-found-puce-rho.vercel.app</a>
        to continue managing your lost and found posts.
      </p>

      <p style="font-size: 14px; line-height: 1.6;">
        Take care,<br />
        <strong>AUB Lost &amp; Found Team</strong>
      </p>

      <p style="color: #777; font-size: 11px; margin-top: 25px; line-height: 1.5;">
        This is an automated notification from the AUB Lost &amp; Found portal.<br/>
        Please do not reply directly to this email.
      </p>

    </div>
  </body>
</html>
"""

    payload = {
        "personalizations": [
            {"to": [{"email": to_email}], "subject": subject}
        ],
        "from": {"email": sender_email, "name": "AUB Lost & Found"},
        "content": [{"type": "text/html", "value": body_html}],
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    resp = requests.post(API_URL, headers=headers, data=json.dumps(payload), timeout=15)
    if resp.status_code != 202:
        raise RuntimeError(f"SendGrid error {resp.status_code}: {resp.text}")
