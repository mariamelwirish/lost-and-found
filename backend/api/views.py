from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets, permissions

from backend.api.models import ItemPost
from backend.api.permissions import IsOwnerOrReadOnly
from .serializers import ItemPostSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

User = get_user_model()

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return get_user_model().objects.all()

class ItemPostViewSet(viewsets.ModelViewSet):
    queryset = ItemPost.objects.all().order_by("-creationDate")
    serializer_class = ItemPostSerializer

    def get_permissions(self):
        if (self.action in ["list", "retrieve"]):
            return [permissions.AllowAny]
        return [IsAuthenticated()], IsOwnerOrReadOnly