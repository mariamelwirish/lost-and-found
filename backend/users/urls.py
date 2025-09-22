from django.urls import path
from .views import SendVerificationCodeView
from .views import VerifyCodeView
from .views_debug import send_test_email  # <-- import the view

urlpatterns = [
    path("send-code/", SendVerificationCodeView.as_view()),
    path("verify-code/", VerifyCodeView.as_view()),
    path('debug/send-test-email/', send_test_email),

]
