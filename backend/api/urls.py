from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetsViewSet, FacilityViewSet, InventoryViewSet, RequestViewSet

router = DefaultRouter()
router.register(r'pets', PetsViewSet)
router.register(r'facility', FacilityViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'requests', RequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]