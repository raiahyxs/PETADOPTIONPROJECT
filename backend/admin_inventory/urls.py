from django.urls import path, include
from .api import router, AdoptionTrendsAPIView, RegisterAPIView, LoginAPIView
from .views import FosterProfileView, UserProfileView


urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('login/', LoginAPIView.as_view(), name='login'),
    path('adoption-trends/', AdoptionTrendsAPIView.as_view(), name='adoption-trends'),
    path('profile/', FosterProfileView.as_view(), name='foster-profile'),
    path('user-profile/', UserProfileView.as_view(), name='user-profile'), 
    path('', include(router.urls)),
    
]

