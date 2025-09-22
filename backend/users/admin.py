from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from .models import User, VerificationCode, PendingSignup

@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "phone", "is_staff")
    list_filter = ("is_staff", "is_superuser", "is_active")

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Contact", {"fields": ("phone",)}),
    )

    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        (None, {"classes": ("wide",), "fields": ("phone",)}),
    )

@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ("email", "code", "is_used", "expires_at", "created_at")
    list_filter = ("is_used", "created_at")
    search_fields = ("email", "code")

@admin.register(PendingSignup)
class PendingSignupAdmin(admin.ModelAdmin):
    list_display = ("email", "username", "phone", "expires_at", "created_at")
    search_fields = ("email", "username", "phone")