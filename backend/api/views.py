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

        # Filter by title search (q)
        q = (self.request.query_params.get('q') or '').strip()
        if q:
            queryset = queryset.filter(title__icontains=q)

        # Filter by location (partial match)
        location = (self.request.query_params.get('location') or '').strip()
        if location:
            queryset = queryset.filter(location__icontains=location)

        # Filter by single date (exact match) — supports frontend single-date picker
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(date=date)

        # Filter by date range: date_from / date_to (inclusive)
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        print(f"Creating post with data: {serializer.validated_data}")  # Debug log
        serializer.save(owner=self.request.user)
