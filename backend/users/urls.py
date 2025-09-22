from django.urls import path
from .views import SendVerificationCodeView
from .views import VerifyCodeView

urlpatterns = [
    path("send-code/", SendVerificationCodeView.as_view()),
    path("verify-code/", VerifyCodeView.as_view()),
]
