from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import CreateUserView, ItemPostViewSet
from users.views_debug import send_test_email
from users.views import EmailTokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'posts', ItemPostViewSet, basename='posts')
# backend/urls.py
from django.urls import path
from django.http import JsonResponse

def health(_): return JsonResponse({"status": "ok"})

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", EmailTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh_token"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/users/", include("users.urls")),
    path("api/", include(router.urls)),
    path('debug/send-test-email/', send_test_email),
    path("health/", health),

]