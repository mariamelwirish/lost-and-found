from rest_framework import serializers
from .validators import validate_aub_email
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import PendingSignup

class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        return validate_aub_email(value)

class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate_email(self, value):
        return validate_aub_email(value)


User = get_user_model()

class SignupStartSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name  = serializers.CharField(max_length=150)
    username   = serializers.CharField(max_length=150)
    email      = serializers.EmailField()
    phone      = serializers.CharField(max_length=20, allow_blank=True, allow_null=True, required=False)
    password   = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        # AUB domain check (Step 2)
        return validate_aub_email(value)

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate(self, attrs):
        email = attrs["email"]
        phone = attrs.get("phone") or None

        # Unique email at final user creation time
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Email already registered."})

        # if phone and User.objects.filter(phone=phone).exists():
        #     raise serializers.ValidationError({"phone": "Phone already in use."})
        return attrs

    def create_pending(self):
        data = self.validated_data
        return PendingSignup.create_or_update(
            email=data["email"],
            username=data["username"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone=data.get("phone"),
            raw_password=data["password"],
            lifetime_minutes=30,
        )
