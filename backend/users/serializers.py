from rest_framework import serializers
from .validators import validate_aub_email, validate_phone_number
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import PendingSignup
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class EmailCheckSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return validate_aub_email(value)

class SignupStartSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    password = serializers.CharField(min_length=8)
    password2 = serializers.CharField(min_length=8)

    def validate_email(self, value):
        return validate_aub_email(value)

    def validate_username(self, value):
        # Existing real user always wins
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")

        from django.utils import timezone

        # Drop expired pending signups for this username so they don't block
        PendingSignup.objects.filter(
            username__iexact=value, expires_at__lt=timezone.now()
        ).delete()

        if PendingSignup.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A signup with this username is already in progress.")
        return value

    def validate_phone(self, value):
        return validate_phone_number(value)

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        
        from django.utils import timezone

        # Clean up expired pending signups for this email so they don't block
        PendingSignup.objects.filter(
            email__iexact=attrs["email"], expires_at__lt=timezone.now()
        ).delete()

        # Check if email is already registered
        if User.objects.filter(email__iexact=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
        if PendingSignup.objects.filter(email__iexact=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "A signup with this email is already in progress."})

        # Validate password strength
        try:
            validate_password(attrs["password"], user=None)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
        return attrs

    def create_pending(self):
        from .models import PendingSignup
        return PendingSignup.create_or_update(
            email=self.validated_data["email"],
            username=self.validated_data["username"],
            first_name=self.validated_data["first_name"],
            last_name=self.validated_data["last_name"],
            phone=self.validated_data.get("phone", ""),
            raw_password=self.validated_data["password"],
        )

class VerifyCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate_email(self, value):
        return validate_aub_email(value)

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
    def validate(self, attrs):
        login_value = attrs.get(self.username_field)
        if login_value and "@" in login_value:
            try:
                user = User.objects.get(email__iexact=login_value)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'phone',
            'is_active',
            'is_staff',
            'date_joined',
            'last_login'
        ]
        read_only_fields = ['date_joined', 'last_login']
        
    def to_representation(self, instance):
        """Remove sensitive fields for non-admin users"""
        rep = super().to_representation(instance)
        user = self.context.get('request').user if self.context.get('request') else None
        
        # If user is not an admin, remove staff-only fields
        if not user or not user.is_staff:
            rep.pop('is_staff', None)
            rep.pop('is_active', None)
            rep.pop('last_login', None)
            
        return rep
