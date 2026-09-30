from django.urls import path

from .admin_schedule_views import (
    admin_schedules,
    admin_add_schedule,
    admin_update_schedule,
    admin_delete_schedule,
    admin_schedule_days,
    admin_update_schedule_days
)


urlpatterns = [

    # =====================================================
    # SCHEDULES
    # =====================================================

    path(
        '',
        admin_schedules,
        name='admin-schedules'
    ),


    path(
        'add/',
        admin_add_schedule,
        name='admin-add-schedule'
    ),


    path(
        '<int:schedule_id>/',
        admin_update_schedule,
        name='admin-update-schedule'
    ),


    path(
        '<int:schedule_id>/delete/',
        admin_delete_schedule,
        name='admin-delete-schedule'
    ),


    # =====================================================
    # OPERATING DAYS
    # =====================================================

    path(
        '<int:schedule_id>/days/',
        admin_schedule_days,
        name='admin-schedule-days'
    ),


    path(
        '<int:schedule_id>/days/update/',
        admin_update_schedule_days,
        name='admin-update-schedule-days'
    ),

]