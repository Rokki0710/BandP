from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, UserRegisterSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == "register":
            return UserRegisterSerializer
        return UserSerializer

    @action(detail=False, methods=["post"])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
