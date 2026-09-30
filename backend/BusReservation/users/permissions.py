from rest_framework.permissions import BasePermission


class IsOperator(BasePermission):

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        try:
            return request.user.profile.role == 'OPERATOR'
        except:
            return False



class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        try:
            return (
                request.user.is_superuser
                or request.user.profile.role == 'ADMIN'
            )
        except:
            return False