from rest_framework.permissions import BasePermission

class IsOrganizer(BasePermission):
    """
    Allows access only to users with organizer role.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and has organizer role
        return bool(request.user and request.user.is_authenticated and request.user.role == 'organizer')