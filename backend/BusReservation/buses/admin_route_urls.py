from django.urls import path

from .admin_route_views import (
    admin_routes,
    admin_add_route,
    admin_update_route,
    admin_delete_route
)

urlpatterns = [

    path(
        '',
        admin_routes,
        name='admin-routes'
    ),

    path(
        'add/',
        admin_add_route,
        name='admin-add-route'
    ),

    path(
        '<int:route_id>/',
        admin_update_route,
        name='admin-update-route'
    ),

    path(
        '<int:route_id>/delete/',
        admin_delete_route,
        name='admin-delete-route'
    ),

]