from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import PendingSignup, VerificationCode

User = get_user_model()


class SignupAndAuthFlowTests(APITestCase):
    def _strong_password(self):
        return "Abcd1234!"

    @patch("users.views.send_verification_email")
    def test_send_verification_code_creates_pending_signup(self, mock_email):
        payload = {
            "email": "student@mail.aub.edu",
            "username": "student1",
            "first_name": "Stu",
            "last_name": "Dent",
            "phone": "123",
            "password": self._strong_password(),
            "password2": self._strong_password(),
        }
        response = self.client.post("/api/users/send-code/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        pending = PendingSignup.objects.get(email=payload["email"])
        self.assertEqual(pending.username, payload["username"])
        mock_email.assert_called_once()

    def test_verify_code_creates_user_and_consumes_records(self):
        email = "student@mail.aub.edu"
        PendingSignup.create_or_update(
            email=email,
            username="student1",
            first_name="Stu",
            last_name="Dent",
            phone="5551234",
            raw_password=self._strong_password(),
        )
        code = VerificationCode.objects.create(
            email=email,
            code="123456",
            expires_at=timezone.now() + timedelta(minutes=5),
        )

        response = self.client.post(
            "/api/users/verify-code/",
            {"email": email, "code": code.code},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(email=email).exists())
        self.assertFalse(PendingSignup.objects.filter(email=email).exists())
        code.refresh_from_db()
        self.assertTrue(code.is_used)

    @patch("users.views.send_reset_password_email")
    def test_request_password_reset_creates_code(self, mock_email):
        user = User.objects.create_user(
            username="student1",
            email="student@mail.aub.edu",
            password=self._strong_password(),
        )

        response = self.client.post(
            "/api/users/request-password-reset/",
            {"email": user.email},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(VerificationCode.objects.filter(email=user.email).exists())
        mock_email.assert_called_once()

    def test_reset_password_updates_credentials(self):
        user = User.objects.create_user(
            username="student1",
            email="student@mail.aub.edu",
            password="Oldpass1!",
        )
        code = VerificationCode.objects.create(
            email=user.email,
            code="654321",
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        payload = {
            "email": user.email,
            "code": code.code,
            "password": self._strong_password(),
            "password2": self._strong_password(),
        }

        response = self.client.post(
            "/api/users/reset-password/", payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password(self._strong_password()))
        code.refresh_from_db()
        self.assertTrue(code.is_used)
