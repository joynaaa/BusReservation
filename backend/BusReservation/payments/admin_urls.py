from django.urls import path

from .admin_views import admin_payments


urlpatterns = [
    path('', admin_payments, name='admin-payments'),
]