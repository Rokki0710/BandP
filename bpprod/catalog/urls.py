from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudioViewSet, EquipmentViewSet, SpecialistViewSet

router = DefaultRouter()
router.register(r'studios', StudioViewSet)
router.register(r'equipment', EquipmentViewSet)
router.register(r'specialists', SpecialistViewSet)

urlpatterns = [
    path('', include(router.urls)),
]