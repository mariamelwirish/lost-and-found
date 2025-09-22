from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import EmailCheckSerializer
from .models import VerificationCode
from .email_utils import send_verification_email, send_reset_password_email
from rest_framework.permissions import AllowAny
from .serializers import VerifyCodeSerializer
from django.contrib.auth import get_user_model
from .models import PendingSignup
from .serializers import SignupStartSerializer, VerifyCodeSerializer, RequestResetPasswordSerializer, ResetPasswordSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import EmailTokenObtainPairSerializer

class SendVerificationCodeView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        ser = SignupStartSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        # store pending signup (hash password inside)
        pending = ser.create_pending()

        # create & send verification code
        vc = VerificationCode.new_code_for_email(pending.email)
        send_verification_email(pending.email, vc.code)

        return Response({"detail": "Verification code sent."})




User = get_user_model()

class VerifyCodeView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        ser = VerifyCodeSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        email = ser.validated_data["email"]
        code = ser.validated_data["code"]

        # find code
        try:
            vc = VerificationCode.objects.filter(email=email, code=code).latest("created_at")
        except VerificationCode.DoesNotExist:
            return Response({"valid": False, "error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if not vc.is_valid():
            return Response({"valid": False, "error": "Code expired or already used."}, status=status.HTTP_400_BAD_REQUEST)

        # optional attempts
        vc.attempts += 1
        if vc.attempts > 3:
            return Response({"valid": False, "error": "Too many attempts."}, status=status.HTTP_400_BAD_REQUEST)
        vc.save(update_fields=["attempts"])

        # load pending signup
        try:
            pending = PendingSignup.objects.get(email=email)
        except PendingSignup.DoesNotExist:
            return Response({"valid": False, "error": "No pending signup found."}, status=status.HTTP_400_BAD_REQUEST)

        if not pending.is_valid():
            return Response({"valid": False, "error": "Pending signup expired."}, status=status.HTTP_400_BAD_REQUEST)

        # create the actual user
        user = User.objects.create(
            username=pending.username,
            email=pending.email,
            first_name=pending.first_name,
            last_name=pending.last_name,
            phone=pending.phone,
            password=pending.password_hash,  # already hashed
        )

        # mark code used + cleanup pending
        vc.mark_used()
        pending.delete()

        return Response({"valid": True, "detail": "Account created. You can log in now."})

class RequestResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RequestResetPasswordSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        email = ser.validated_data["email"]

        # Check if user exists
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Return same message for security (don't reveal if email exists)
            return Response({"detail": "If this email exists, a reset link was sent."})

        # Create verification code
        vc = VerificationCode.new_code_for_email(email)
        send_reset_password_email(email, vc.code)

        return Response({"detail": "If this email exists, a reset link was sent."})

class ResetPasswordView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        ser = ResetPasswordSerializer(data=request.data)
        if not ser.is_valid():
            return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

        email = ser.validated_data["email"]
        code = ser.validated_data["code"]
        password = ser.validated_data["password"]

        # Find verification code
        try:
            vc = VerificationCode.objects.filter(email=email, code=code).latest("created_at")
        except VerificationCode.DoesNotExist:
            return Response({"error": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)

        if not vc.is_valid():
            return Response({"error": "Code expired or already used."}, status=status.HTTP_400_BAD_REQUEST)

        # Check attempts
        vc.attempts += 1
        if vc.attempts > 3:
            return Response({"error": "Too many attempts."}, status=status.HTTP_400_BAD_REQUEST)
        vc.save(update_fields=["attempts"])

        # Find user and update password
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.set_password(password)
        user.save()

        # Mark code as used
        vc.mark_used()

        return Response({"detail": "Password updated successfully. You can now log in."})

class EmailTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = EmailTokenObtainPairSerializer