from django.urls import path

from .admin_views import (
    admin_buses,
    admin_add_bus,
    admin_update_bus,
    admin_delete_bus,
    toggle_bus_status,
    approve_bus,
    reject_bus,
)


urlpatterns = [

    # =========================================================
    # ADMIN - LIST BUSES
    # =========================================================

    path(
        '',
        admin_buses,
        name='admin-buses'
    ),


    # =========================================================
    # ADMIN - ADD BUS
    # =========================================================

    path(
        'add/',
        admin_add_bus,
        name='admin-add-bus'
    ),


    # =========================================================
    # ADMIN - APPROVE BUS
    # =========================================================

    path(
        '<int:bus_id>/approve/',
        approve_bus,
        name='admin-approve-bus'
    ),


    # =========================================================
    # ADMIN - REJECT BUS
    # =========================================================

    path(
        '<int:bus_id>/reject/',
        reject_bus,
        name='admin-reject-bus'
    ),


    # =========================================================
    # ADMIN - UPDATE BUS
    # =========================================================

    path(
        '<int:bus_id>/',
        admin_update_bus,
        name='admin-update-bus'
    ),


    # =========================================================
    # ADMIN - DELETE BUS
    # =========================================================

    path(
        '<int:bus_id>/delete/',
        admin_delete_bus,
        name='admin-delete-bus'
    ),


    # =========================================================
    # ADMIN - TOGGLE STATUS
    # =========================================================

    path(
        '<int:bus_id>/toggle-status/',
        toggle_bus_status,
        name='toggle-bus-status'
    ),

]