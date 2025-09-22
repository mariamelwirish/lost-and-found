from django.core.mail import send_mail
from django.conf import settings

def send_verification_email(email: str, code: str):
    subject = "Your Lost&Found verification code"
    message = f"Your verification code is: {code}"
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]
    send_mail(subject, message, from_email, recipient_list)
