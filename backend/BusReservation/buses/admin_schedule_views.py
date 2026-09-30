from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Schedule,
    ScheduleOperatingDay
)

from .serializers import (
    ScheduleSerializer
)

from users.permissions import IsAdmin


# =========================================================
# ADMIN - LIST SCHEDULES
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_schedules(request):

    schedules = (
        Schedule.objects
        .select_related(
            'bus',
            'route'
        )
        .prefetch_related(
            'operating_days'
        )
        .all()
        .order_by('-id')
    )

    serializer = ScheduleSerializer(
        schedules,
        many=True
    )

    return Response(
        serializer.data
    )


# =========================================================
# ADMIN - ADD SCHEDULE
# =========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_add_schedule(request):

    serializer = ScheduleSerializer(
        data=request.data
    )

    if serializer.is_valid():

        schedule = serializer.save()

        return Response(
            ScheduleSerializer(
                schedule
            ).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# ADMIN - UPDATE SCHEDULE
# =========================================================

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_update_schedule(
    request,
    schedule_id
):

    try:

        schedule = Schedule.objects.get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    serializer = ScheduleSerializer(
        schedule,
        data=request.data,
        partial=True
    )


    if serializer.is_valid():

        schedule = serializer.save()

        return Response(
            ScheduleSerializer(
                schedule
            ).data
        )


    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


# =========================================================
# ADMIN - DELETE SCHEDULE
# =========================================================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_delete_schedule(
    request,
    schedule_id
):

    try:

        schedule = Schedule.objects.get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    schedule.delete()


    return Response(
        {
            'message':
                'Schedule deleted successfully.'
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# ADMIN - GET OPERATING DAYS
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_schedule_days(
    request,
    schedule_id
):

    try:

        schedule = Schedule.objects.get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    days = ScheduleOperatingDay.objects.filter(
        schedule=schedule
    ).order_by('id')


    data = [

        {
            'id': day.id,
            'schedule': schedule.id,
            'day': day.day
        }

        for day in days

    ]


    return Response(
        data
    )


# =========================================================
# ADMIN - UPDATE OPERATING DAYS
# =========================================================

@api_view(['PUT', 'POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_update_schedule_days(
    request,
    schedule_id
):

    try:

        schedule = Schedule.objects.get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    days = request.data.get(
        'days',
        []
    )


    if not isinstance(days, list):

        return Response(
            {
                'error':
                    'days must be a list.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    valid_days = {
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
    }


    invalid_days = [
        day
        for day in days
        if day not in valid_days
    ]


    if invalid_days:

        return Response(
            {
                'error':
                    f'Invalid days: {invalid_days}'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # Remove old days

    ScheduleOperatingDay.objects.filter(
        schedule=schedule
    ).delete()


    # Add new days

    created_days = []


    for day in days:

        created = ScheduleOperatingDay.objects.create(

            schedule=schedule,

            day=day

        )

        created_days.append(
            {
                'id': created.id,
                'schedule': schedule.id,
                'day': created.day
            }
        )


    return Response(
        {
            'message':
                'Operating days updated successfully.',

            'schedule':
                schedule.id,

            'days':
                created_days
        },
        status=status.HTTP_200_OK
    )