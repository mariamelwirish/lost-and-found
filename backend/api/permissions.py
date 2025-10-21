from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Always allow safe methods
        if request.method in SAFE_METHODS:
            return True
        # Allow staff/admin users to modify any object
        if getattr(request.user, "is_staff", False):
            return True
        # Otherwise only the owner can modify
        return getattr(obj, "owner_id", None) == getattr(request.user, "id", None)