from django.urls import path

from .operator_schedule_views import (
    operator_schedule_days,
    operator_schedules,
    operator_schedule_detail,
)

from .operator_fare_views import (
    operator_schedule_fares,
    operator_add_schedule_fare,
    operator_delete_schedule_fare,
)


urlpatterns = [

    # ==========================================
    # OPERATOR SCHEDULES
    # ==========================================

    path(
        '',
        operator_schedules,
        name='operator-schedules'
    ),

    path(
        '<int:schedule_id>/',
        operator_schedule_detail,
        name='operator-schedule-detail'
    ),

    # ==========================================
    # SCHEDULE OPERATING DAYS
    # ==========================================

    path(
        '<int:schedule_id>/days/',
        operator_schedule_days,
        name='operator-schedule-days'
    ),

    # ==========================================
    # SCHEDULE FARES
    # ==========================================

    # Get all fares
    path(
        '<int:schedule_id>/fares/',
        operator_schedule_fares,
        name='operator-schedule-fares'
    ),

    # Add fare
    path(
        '<int:schedule_id>/fares/add/',
        operator_add_schedule_fare,
        name='operator-add-schedule-fare'
    ),

    # Delete fare
    path(
        '<int:schedule_id>/fares/<int:fare_id>/',
        operator_delete_schedule_fare,
        name='operator-delete-schedule-fare'
    ),
]