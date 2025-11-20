import re

from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.core.exceptions import ValidationError

from .models import User
from .validators import validate_phone_number, validate_aub_email

NAME_PATTERN = re.compile(r"^[A-Za-z]+(?:[ '-][A-Za-z]+)*$")


class _UserValidationMixin(forms.ModelForm):
    """Shared validation helpers for admin create/change forms."""

    email = forms.EmailField(
        required=True,
        error_messages={"invalid": "Enter a valid email address (e.g. name@example.com)."},
        help_text="Provide a valid email address; we'll use it for notifications.",
    )
    phone = forms.CharField(
        required=False,
        help_text="Digits only, optionally starting with +. Leave blank if unavailable.",
    )

    def clean_username(self):
        username = (self.cleaned_data.get("username") or "").strip()
        if not username:
            raise ValidationError("This field is required.")
        qs = User.objects.filter(username__iexact=username)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError("A user with this username already exists.")
        return username

    def clean_email(self):
        email = (self.cleaned_data.get("email") or "").strip()
        email = validate_aub_email(email)
        qs = User.objects.filter(email__iexact=email)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise ValidationError("A user with this email already exists.")
        return email

    def clean_phone(self):
        phone = self.cleaned_data.get("phone")
        return validate_phone_number(phone)

    def _clean_name(self, field: str) -> str:
        value = (self.cleaned_data.get(field) or "").strip()
        if not value:
            raise ValidationError("This field is required.")
        if not NAME_PATTERN.fullmatch(value):
            raise ValidationError(
                "Use letters only for names; spaces, apostrophes, and hyphens are allowed."
            )
        return value

    def clean_first_name(self):
        return self._clean_name("first_name")

    def clean_last_name(self):
        return self._clean_name("last_name")


class AdminUserCreationForm(_UserValidationMixin, UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "is_staff",
            "is_active",
        )


class AdminUserChangeForm(_UserValidationMixin, UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "phone",
            "is_staff",
            "is_active",
            "groups",
            "user_permissions",
        )
