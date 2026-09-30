from django.urls import path

from .admin_views import admin_bookings


urlpatterns = [

    path(
        '',
        admin_bookings,
        name='admin-bookings'
    ),

]