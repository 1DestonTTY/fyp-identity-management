from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True

        if hasattr(obj, "user"):
            return obj.user == request.user

        if hasattr(obj, "profile"):
            return obj.profile.user == request.user

        return False