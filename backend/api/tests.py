import shutil
import tempfile
from datetime import date, datetime, timezone as dt_timezone
from types import SimpleNamespace
from unittest import mock
from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from PIL import Image

from .models import ItemImage, ItemPost
from .permissions import IsOwnerOrReadOnly

User = get_user_model()


class MediaRootMixin:

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_root = tempfile.mkdtemp()
        cls._override = override_settings(MEDIA_ROOT=cls._media_root)
        cls._override.enable()

    @classmethod
    def tearDownClass(cls):
        cls._override.disable()
        shutil.rmtree(cls._media_root, ignore_errors=True)
        super().tearDownClass()


class ItemPostViewSetTests(MediaRootMixin, APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner",
            password="pass1234",
            email="owner@mail.aub.edu",
        )
        self.other = User.objects.create_user(
            username="other",
            password="pass1234",
            email="other@mail.aub.edu",
        )

    def _create_post(self, **overrides):
        defaults = dict(
            title="Wallet",
            description="Black wallet",
            status="lost",
            location="Library",
            date=date(2024, 1, 1),
            owner=self.owner,
        )
        defaults.update(overrides)
        return ItemPost.objects.create(**defaults)

    def _generate_image_file(self, name="pic.jpg"):
        buffer = BytesIO()
        Image.new("RGB", (1, 1)).save(buffer, format="JPEG")
        buffer.seek(0)
        return SimpleUploadedFile(name, buffer.read(), content_type="image/jpeg")

    def test_filter_by_kind_and_query(self):
        self._create_post(title="Lost Wallet", status="lost")
        self._create_post(title="Found Keys", status="found")

        url = reverse("posts-list")
        response = self.client.get(url, {"kind": "lost", "q": "wallet"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["status"], "lost")
        self.assertIn("Wallet", response.data[0]["title"])

    def test_mine_filter_returns_only_authenticated_posts(self):
        self._create_post(title="Owner Item", owner=self.owner)
        self._create_post(title="Other Item", owner=self.other)

        self.client.force_authenticate(self.owner)
        response = self.client.get(reverse("posts-list"), {"mine": "1"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Owner Item")

    def test_create_post_assigns_owner_and_saves_images(self):
        self.client.force_authenticate(self.owner)
        image = self._generate_image_file()
        payload = {
            "title": "Campus ID",
            "description": "Blue ID",
            "status": "lost",
            "location": "Library",
            "date": "2024-01-02",
            "uploaded_images": [image],
        }

        response = self.client.post(reverse("posts-list"), payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        post = ItemPost.objects.get(id=response.data["id"])
        self.assertEqual(post.owner, self.owner)
        self.assertEqual(post.images.count(), 1)
        self.assertTrue(ItemImage.objects.filter(post=post).exists())

    def test_mark_received_requires_owner(self):
        post = self._create_post(received_from_poster=False)
        url = reverse("posts-mark-received", args=[post.id])

        # Another user cannot mark received
        self.client.force_authenticate(self.other)
        forbidden = self.client.post(url)
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Owner can mark received and timestamps are stored
        self.client.force_authenticate(self.owner)
        fake_now = datetime(2024, 1, 5, tzinfo=dt_timezone.utc)
        with mock.patch("api.views.timezone.now", return_value=fake_now):
            ok = self.client.post(url)

        self.assertEqual(ok.status_code, status.HTTP_200_OK)
        post.refresh_from_db()
        self.assertTrue(post.received_from_poster)
        self.assertEqual(post.received_by, self.owner)
        self.assertEqual(post.received_at, fake_now)


class IsOwnerOrReadOnlyTests(TestCase):
    def setUp(self):
        self.permission = IsOwnerOrReadOnly()
        self.owner = SimpleNamespace(id=1, is_staff=False)
        self.staff = SimpleNamespace(id=2, is_staff=True)
        self.post = SimpleNamespace(owner_id=1)

    def test_safe_methods_are_allowed(self):
        request = SimpleNamespace(method="GET", user=self.owner)
        self.assertTrue(self.permission.has_object_permission(request, None, self.post))

    def test_staff_user_can_modify(self):
        request = SimpleNamespace(method="PATCH", user=self.staff)
        self.assertTrue(self.permission.has_object_permission(request, None, self.post))

    def test_only_owner_can_modify(self):
        request = SimpleNamespace(method="PATCH", user=self.owner)
        self.assertTrue(self.permission.has_object_permission(request, None, self.post))

        stranger = SimpleNamespace(id=3, is_staff=False)
        request = SimpleNamespace(method="PATCH", user=stranger)
        self.assertFalse(
            self.permission.has_object_permission(request, None, self.post)
        )
