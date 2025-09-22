from django.conf import settings
from django.core.exceptions import ValidationError

def validate_aub_email(email: str) -> str:
    """
    Ensures email's domain is one of settings.AUB_EMAIL_DOMAINS.
    Returns the normalized email (lowercase) or raises ValidationError.
    """
    if not email or "@" not in email:
        raise ValidationError("Invalid email format.")

    normalized = email.strip().lower()
    try:
        local, domain = normalized.rsplit("@", 1)
    except ValueError:
        raise ValidationError("Invalid email format.")

    # exact-domain match only (no subdomains)
    allowed = getattr(settings, "AUB_EMAIL_DOMAINS", [])
    if domain not in allowed:
        raise ValidationError("Email must be an AUB address.")

    return normalized
