from django.urls import path

from .admin_city_views import (
    admin_city_list,
    admin_city_add,
    admin_city_update,
    admin_city_delete
)


urlpatterns = [

    path(
        '',
        admin_city_list,
        name='admin-city-list'
    ),

    path(
        'add/',
        admin_city_add,
        name='admin-city-add'
    ),

    path(
        '<int:city_id>/',
        admin_city_update,
        name='admin-city-update'
    ),

    path(
        '<int:city_id>/delete/',
        admin_city_delete,
        name='admin-city-delete'
    ),

]