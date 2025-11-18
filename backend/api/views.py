from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import ItemPost
from .permissions import IsOwnerOrReadOnly
from .serializers import ItemPostSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import F
from django.utils import timezone

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
        # raise RuntimeError("Sentry smoke test (remove once verifiedd)")
        queryset = ItemPost.objects.all()
        
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
        
        # Sorting
        ordering = (self.request.query_params.get('ordering') or '').strip()
        allowed = {
            'date', '-date',
            'creationDate', '-creationDate',
            'title', '-title',
        }
        if ordering in allowed:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-creationDate')

        return queryset
    
    def get_serializer_context(self):
        return {'request': self.request}
    
    def perform_create(self, serializer):
        print(f"Creating post with data: {serializer.validated_data}")  # Debug log
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def mark_received(self, request, pk=None):
        post = self.get_object()
        if post.owner_id != request.user.id:
            return Response({"detail": "Only the post owner can mark as received."}, status=status.HTTP_403_FORBIDDEN)
        if not post.received_from_poster:
            post.received_from_poster = True
            post.received_at = timezone.now()
            post.received_by = request.user
            post.save(update_fields=["received_from_poster", "received_at", "received_by", "updateDate"])
        serializer = self.get_serializer(post)
        return Response(serializer.data)


def sentry_test_endpoint(_request):
    """Raises an error on demand so Sentry wiring can be verified in any env."""
    raise RuntimeError("Manual Sentry verification endpoint hit")

