import re

from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

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

def validate(password, user=None):
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not re.search(r"[a-z]", password):
        raise ValidationError(_("Add a lowercase letter."), code="password_no_lower")
    if not re.search(r"[A-Z]", password):
        raise ValidationError(_("Add an uppercase letter."), code="password_no_upper")
    if not re.search(r"\d", password):
        raise ValidationError(_("Add a digit."), code="password_no_digit")
    if not re.search(r"[^\w\s]", password):
        raise ValidationError(_("Add a special character."), code="password_no_special")


def get_help_text():
    return _(
        "Your password must contain at least 8 characters, including "
        "a lowercase letter, an uppercase letter, a digit, and a special character."
    )

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[a-z]", password):
            raise ValidationError(_("Add a lowercase letter."), code="password_no_lower")
        if not re.search(r"[A-Z]", password):
            raise ValidationError(_("Add an uppercase letter."), code="password_no_upper")
        if not re.search(r"\d", password):
            raise ValidationError(_("Add a digit."), code="password_no_digit")
        if not re.search(r"[^\w\s]", password):
            raise ValidationError(_("Add a special character."), code="password_no_special")

    def get_help_text(self):
        return _(
            "Your password must contain at least 8 characters, including "
            "a lowercase letter, an uppercase letter, a digit, and a special character."
        )
