from django.urls import path
from .views import register, profile, CustomLoginView, operator_register

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('profile/', profile, name='profile'),
    path('operator-register/',operator_register,name='operator-register'),
]