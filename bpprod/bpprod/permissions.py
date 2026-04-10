from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешение на редактирование только владельцам объекта
    """

    def has_object_permission(self, request, view, obj):
        # Разрешаем безопасные методы всем
        if request.method in permissions.SAFE_METHODS:
            return True

        # Разрешаем редактирование только владельцу
        return obj.owner == request.user