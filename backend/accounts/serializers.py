from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]
        read_only_fields = fields

class ProfileSerializer(serializers.ModelSerializer):
    user = MeSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "user", "full_name", "phone", "bio", "location",
            "avatar", "notify_email", "notify_push",
        ]

    def validate_avatar(self, value):
        if value and value.size > 2 * 1024 * 1024:  # 2MB
            raise serializers.ValidationError("Avatar must be ≤ 2MB.")
        return value
