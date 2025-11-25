from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Count
from .models import ItemPost
from .serializers import ItemPostSerializer
from users.serializers import UserSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes


User = get_user_model()

class AdminViewSet(ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        # Get counts for dashboard
        stats = {
            'totalUsers': User.objects.count(),
            'totalPosts': ItemPost.objects.count(),
            'lostItems': ItemPost.objects.filter(status='lost').count(),
            'foundItems': ItemPost.objects.filter(status='found').count(),
        }
        return Response(stats)

    @action(detail=False, methods=['get'])
    def users(self, request):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_user(self, request):
        data = request.data.copy()
        password = data.get('password')
        if not password:
            return Response({'password': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        # Use a simple serializer for validation of basic fields
        serializer = UserSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Create the user with proper password hashing
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data.get('email', ''),
            first_name=serializer.validated_data.get('first_name', ''),
            last_name=serializer.validated_data.get('last_name', ''),
            phone=serializer.validated_data.get('phone', ''),
            password=password,
        )

        return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='toggle-active')
    def toggle_user_active(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({"error": "You cannot change your own active status."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_user_action(self, request):
        user_ids = request.data.get('userIds', [])
        action = request.data.get('action')

        if not user_ids or not action:
            return Response({'error': 'Missing userIds or action'}, status=400)

        # Never act on the requesting user
        users = User.objects.filter(id__in=user_ids).exclude(id=request.user.id)

        if action == 'delete':
            count = users.count()
            users.delete()
            return Response({'message': f'Deleted {count} users'})
        elif action == 'block':
            count = users.update(is_active=False)
            return Response({'message': f'Blocked {count} users'})
        elif action == 'unblock':
            count = users.update(is_active=True)
            return Response({'message': f'Unblocked {count} users'})

        return Response({'error': 'Invalid action'}, status=400)

    @action(detail=False, methods=['post'])
    def bulk_post_action(self, request):
        post_ids = request.data.get('postIds', [])
        action = request.data.get('action')

        if not post_ids or not action:
            return Response({'error': 'Missing postIds or action'}, status=400)

        posts = ItemPost.objects.filter(id__in=post_ids)
        
        if action == 'delete':
            posts.delete()
            return Response({'message': f'Deleted {len(post_ids)} posts'})
        
        return Response({'error': 'Invalid action'}, status=400)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.id == request.user.id:
            return Response({"error": "You cannot delete your own account."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_posts_bulk(request):
    """Compatibility endpoint for frontend: POST /api/admin/posts/bulk/"""
    post_ids = request.data.get('postIds', [])
    action = request.data.get('action')

    if not post_ids or not action:
        return Response({'error': 'Missing postIds or action'}, status=400)

    posts = ItemPost.objects.filter(id__in=post_ids)

    if action == 'delete':
        count = posts.count()
        posts.delete()
        return Response({'message': f'Deleted {count} posts'})

    return Response({'error': 'Invalid action'}, status=400)