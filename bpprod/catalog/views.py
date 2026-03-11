from rest_framework import viewsets
from .models import Studio, Equipment, Specialist
from .serializers import StudioSerializer, EquipmentSerializer, SpecialistSerializer


class StudioViewSet(viewsets.ModelViewSet):
    queryset = Studio.objects.all()
    serializer_class = StudioSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SpecialistViewSet(viewsets.ModelViewSet):
    queryset = Specialist.objects.all()
    serializer_class = SpecialistSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
