from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ItemPost
from .permissions import IsOwnerOrReadOnly
from .serializers import ItemPostSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny

User = get_user_model()

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return get_user_model().objects.all()

class ItemPostViewSet(viewsets.ModelViewSet):
    serializer_class = ItemPostSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
       if self.action in ["list", "retrieve"]:
         permission_classes = [permissions.AllowAny]
       else:
         permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
       return [p() for p in permission_classes]
    
    def get_queryset(self):
        queryset = ItemPost.objects.all().order_by("-creationDate")
        
        # Filter by status (kind)
        kind = self.request.query_params.get('kind')
        if kind in ['lost', 'found']:
            queryset = queryset.filter(status=kind)
        
        # Filter by owner (mine)
        mine = self.request.query_params.get('mine')
        if mine == '1' and self.request.user.is_authenticated:
            queryset = queryset.filter(owner=self.request.user)
        
        return queryset
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        print(f"Creating post with data: {serializer.validated_data}")  # Debug log
        serializer.save(owner=self.request.user)
