import os
from typing import Optional

from django.core.mail import send_mail
from django.conf import settings
from .mailer_sendgrid_http import send_verification_email_via_sendgrid, send_reset_password_email_via_sendgrid

def send_verification_email(email: str, code: str, full_name: Optional[str] = None):
    """
    Sends the verification email.
    Behavior:
      - If SENDGRID_API_KEY is set -> use SendGrid HTTP (real email).
      - Otherwise -> use Django send_mail (console/SMTP fallback for teammates).
    """
    sendgrid_key = os.environ.get("SENDGRID_API_KEY", "")
    sender_email = os.environ.get("SENDER_EMAIL") or getattr(settings, "DEFAULT_FROM_EMAIL", "webmaster@localhost")

    subject = "Your Lost & Found verification code"
    text_body = f"Your verification code is: {code}\nThis code expires in 10 minutes."
    html_body = f"""
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5;">
      <p>Hi {full_name or "there"},</p>
      <p>Your verification code is:</p>
      <p style="font-size:20px; font-weight:700; letter-spacing:2px;">{code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
    """

    # Preferred path: SendGrid via HTTP when key is present
    if sendgrid_key:
        return send_verification_email_via_sendgrid(email, code, full_name=full_name)

    # Fallback: Django's email backend (console or configured SMTP)
    return send_mail(
        subject=subject,
        message=text_body,
        from_email=sender_email,
        recipient_list=[email],
        html_message=html_body,
        fail_silently=False,
    )

def send_reset_password_email(email: str, code: str, full_name: Optional[str] = None):
    sendgrid_key = os.environ.get("SENDGRID_API_KEY", "")
    sender_email = os.environ.get("SENDER_EMAIL") or getattr(settings, "DEFAULT_FROM_EMAIL", "webmaster@localhost")

    subject = "Your Lost & Found password reset code"
    text_body = f"Your password reset code is: {code}\nThis code expires in 10 minutes."
    html_body = f"""
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height:1.5;">
          <p>Hi {full_name or "there"},</p>
          <p>Your password reset code is:</p>
          <p style="font-size:20px; font-weight:700; letter-spacing:2px;">{code}</p>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn’t request this, you can ignore this email.</p>
        </div>
        """

    # Preferred path: SendGrid via HTTP when key is present
    if sendgrid_key:
        return send_reset_password_email_via_sendgrid(email, code, full_name=full_name)

    # Fallback: Django's email backend (console or configured SMTP)
    return send_mail(
        subject=subject,
        message=text_body,
        from_email=sender_email,
        recipient_list=[email],
        html_message=html_body,
        fail_silently=False,
    )
