from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import ItemPost

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class ItemPostSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.id")

    class Meta:
        model = ItemPost
        fields = ['id', 'title', 'description', 'status', 'location', 'owner', 'creationDate', 'updateDate']
        read_only_fields = ['id', 'owner', 'creationDate', 'updateDate']
