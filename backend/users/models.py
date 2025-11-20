from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import secrets

from .validators import validate_phone_number

class User(AbstractUser):
    email = models.EmailField("email address", unique=True)
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Digits only, optionally starting with + (7-15 digits).",
        validators=[validate_phone_number],
    )

    REQUIRED_FIELDS = ["email"]


class VerificationCode(models.Model):
    """
    Stores the 6-digit verification code we email to the user.
    We validate AUB email before we create/send a code (in a later step).
    """
    email = models.EmailField(db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)

    def mark_used(self):
        self.is_used = True
        self.save(update_fields=["is_used"])

    @classmethod
    def new_code_for_email(cls, email, lifetime_minutes: int = 10) -> "VerificationCode":
        """
        Helper to create a fresh code with expiration.
        We'll use this later when we implement the send-email step.
        """
        # Generate a 6-digit code (zero-padded)
        code = f"{secrets.randbelow(1_000_000):06d}"
        expires_at = timezone.now() + timedelta(minutes=lifetime_minutes)
        return cls.objects.create(email=email, code=code, expires_at=expires_at)

    def is_valid(self) -> bool:
        return (not self.is_used) and (timezone.now() <= self.expires_at)

    def __str__(self):
        status = "used" if self.is_used else "active"
        return f"{self.email} - {self.code} ({status}, expires {self.expires_at:%Y-%m-%d %H:%M})"

class PendingSignup(models.Model):
    email = models.EmailField(unique=True, db_index=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[validate_phone_number],
    )
    password_hash = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def create_or_update(cls, *, email, username, first_name, last_name, phone, raw_password, lifetime_minutes=30):
        # hash the password immediately
        pw_hash = make_password(raw_password)
        expires_at = timezone.now() + timedelta(minutes=lifetime_minutes)
        obj, _ = cls.objects.update_or_create(
            email=email,
            defaults={
                "username": username,
                "first_name": first_name,
                "last_name": last_name,
                "phone": phone,
                "password_hash": pw_hash,
                "expires_at": expires_at,
            },
        )
        return obj

    def is_valid(self) -> bool:
        return timezone.now() <= self.expires_at

    def __str__(self):
        return f"{self.email} (pending until {self.expires_at:%Y-%m-%d %H:%M})"