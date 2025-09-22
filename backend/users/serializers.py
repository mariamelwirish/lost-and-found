from rest_framework import serializers
from .validators import validate_aub_email
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import PendingSignup
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
    password2  = serializers.CharField(write_only=True, min_length=8)

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

        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        try:
            validate_password(attrs["password"], user=None)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})

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

class RequestResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return validate_aub_email(value)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    password = serializers.CharField(min_length=8)
    password2 = serializers.CharField(min_length=8)

    def validate_email(self, value):
        return validate_aub_email(value)

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        validate_password(attrs["password"], user=None)
        return attrs

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allow login with email or username. If the 'username' field looks like an email,
    resolve it to the user's actual username before validation.
    """
    def validate(self, attrs):
        login_value = attrs.get(self.username_field)
        if login_value and "@" in login_value:
            try:
                user = User.objects.get(email__iexact=login_value)
                # Replace with the actual username for authentication
                attrs[self.username_field] = getattr(user, User.USERNAME_FIELD, user.username)
            except User.DoesNotExist:
                # Let default validation handle invalid credentials
                pass
        return super().validate(attrs)