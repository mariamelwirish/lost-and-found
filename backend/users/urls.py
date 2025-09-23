from django.urls import path
from .views_debug import send_test_email
from .views import SendVerificationCodeView, VerifyCodeView, RequestResetPasswordView, ResetPasswordView, get_user_profile

urlpatterns = [
    path("send-code/", SendVerificationCodeView.as_view()),
    path("verify-code/", VerifyCodeView.as_view()),
    path('debug/send-test-email/', send_test_email),
    path("request-password-reset/", RequestResetPasswordView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
    path("profile/", get_user_profile),
]
