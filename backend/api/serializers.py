from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ItemPost, ItemImage

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "password", "email", "first_name", "last_name", "phone"]

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ItemImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemImage
        fields = ["id", "image"]
    
    def get_image(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

class ItemPostSerializer(serializers.ModelSerializer):
    images = ItemImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    delete_images = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)

    class Meta:
        model = ItemPost
        fields = ["id", "title", "description", "status", "location", "date", 
                 "owner", "owner_name", "creationDate", "updateDate", "images", "uploaded_images", "delete_images",
                 "contact_email", "contact_phone"]
        read_only_fields = ["owner", "creationDate", "updateDate"]

    def create(self, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        post = ItemPost.objects.create(**validated_data)
        
        for image in uploaded_images:
            ItemImage.objects.create(post=post, image=image)
        
        return post

    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop("uploaded_images", [])
        delete_images = validated_data.pop("delete_images", [])
        
        # Update the post fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Delete specified images
        if delete_images:
            ItemImage.objects.filter(post=instance, id__in=delete_images).delete()
        
        # Add new images
        for image in uploaded_images:
            ItemImage.objects.create(post=instance, image=image)
        
        return instance
