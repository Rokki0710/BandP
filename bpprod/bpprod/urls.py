from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import UserViewSet
from catalog.views import StudioViewSet, EquipmentViewSet, SpecialistViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"studios", StudioViewSet)
router.register(r"equipment", EquipmentViewSet)
router.register(r"specialists", SpecialistViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
