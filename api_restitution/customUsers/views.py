# views.py
from rest_framework import viewsets 
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import CustomUser
from .serializers import AddUserSerializer, UpdateUserSerializer, SimpleUserSerializer

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return AddUserSerializer
        elif self.action in ["update", "partial_update"]:
            return UpdateUserSerializer
        elif self.action == "list" or self.action == "retrieve":
            return SimpleUserSerializer
        return SimpleUserSerializer

    def get_permissions(self): 
        if self.action in ["create", "list"]:
            return [AllowAny()]
        return [IsAuthenticated()]

