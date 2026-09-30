from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Schedule,
    Bus,
    Route,
    ScheduleOperatingDay,
)

from .serializers import (
    ScheduleSerializer,
    ScheduleOperatingDaySerializer,
)

from users.permissions import IsOperator


# =====================================================
# OPERATOR SCHEDULES
# =====================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_schedules(request):

    # =================================================
    # GET SCHEDULES
    # =================================================

    if request.method == 'GET':

        schedules = (
            Schedule.objects
            .filter(
                bus__operator=request.user
            )
            .select_related(
                'bus',
                'route'
            )
            .prefetch_related(
                'operating_days'
            )
            .order_by('-id')
        )

        serializer = ScheduleSerializer(
            schedules,
            many=True
        )

        return Response(serializer.data)


    # =================================================
    # CREATE SCHEDULE
    # =================================================

    if request.method == 'POST':

        serializer = ScheduleSerializer(
            data=request.data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )


        bus_id = request.data.get('bus')
        route_id = request.data.get('route')


        # =================================================
        # CHECK BUS
        # =================================================

        try:

            bus = Bus.objects.get(
                id=bus_id,
                operator=request.user
            )

        except Bus.DoesNotExist:

            return Response(
                {
                    'error':
                    'Bus not found or does not belong to you.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # CHECK BUS APPROVAL
        # =================================================

        if bus.status != 'APPROVED':

            if bus.status == 'PENDING':

                return Response(
                    {
                        'error':
                        'This bus is waiting for admin approval.',
                        'status':
                        'PENDING'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            if bus.status == 'REJECTED':

                return Response(
                    {
                        'error':
                        'This bus has been rejected by admin.',
                        'rejection_reason':
                        bus.rejection_reason or '',
                        'status':
                        'REJECTED'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            return Response(
                {
                    'error':
                    'This bus is not approved.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # =================================================
        # CHECK BUS ACTIVE
        # =================================================

        if not bus.is_active:

            return Response(
                {
                    'error':
                    'This bus is currently inactive.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # =================================================
        # CHECK ROUTE
        # =================================================

        try:

            route = Route.objects.get(
                id=route_id,
                operator=request.user
            )

        except Route.DoesNotExist:

            return Response(
                {
                    'error':
                    'Route not found or does not belong to you.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # BUS + ROUTE OPERATOR CHECK
        # =================================================

        if bus.operator_id != route.operator_id:

            return Response(
                {
                    'error':
                    'Bus and route belong to different operators.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # CREATE SCHEDULE
        # =================================================

        schedule = serializer.save(
            bus=bus,
            route=route
        )

        # =================================================
        # SAVE OPERATING DAYS
        # =================================================

        operating_days = request.data.get('operating_days', [])

        # Allow a single day string as well as a list
        if isinstance(operating_days, str):
            operating_days = [operating_days]

        # Create selected operating days
        for day in operating_days:
            if day:
                ScheduleOperatingDay.objects.get_or_create(
                    schedule=schedule,
                    day=day
                )


        return Response(
            {
                'message':
                'Schedule created successfully.',

                'schedule':
                ScheduleSerializer(schedule).data
            },
            status=status.HTTP_201_CREATED
        )


# =====================================================
# SCHEDULE DETAIL
# =====================================================

@api_view(['GET','PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_schedule_detail(
    request,
    schedule_id
):

    try:

        schedule = (
            Schedule.objects
            .select_related(
                'bus',
                'route'
            )
            .prefetch_related(
                'operating_days'
            )
            .get(
                id=schedule_id,
                bus__operator=request.user
            )
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error':
                'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # =================================================
    # GET SCHEDULE
    # =================================================

    if request.method == 'GET':

        serializer = ScheduleSerializer(schedule)

        return Response(serializer.data)


    # =================================================
    # CHECK BUS APPROVAL
    # =================================================

    if schedule.bus.status != 'APPROVED':

        if schedule.bus.status == 'PENDING':

            return Response(
                {
                    'error':
                    'This bus is waiting for admin approval.',
                    'status':
                    'PENDING'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if schedule.bus.status == 'REJECTED':

            return Response(
                {
                    'error':
                    'This bus has been rejected by admin.',
                    'rejection_reason':
                    schedule.bus.rejection_reason or '',
                    'status':
                    'REJECTED'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {
                'error':
                'This bus is not approved.'
            },
            status=status.HTTP_403_FORBIDDEN
        )


    # =================================================
    # UPDATE
    # =================================================

    if request.method == 'PUT':

        bus_id = request.data.get(
            'bus',
            schedule.bus_id
        )

        route_id = request.data.get(
            'route',
            schedule.route_id
        )

        is_active = request.data.get(
            'is_active',
            schedule.is_active
        )


        # =================================================
        # CHECK BUS
        # =================================================

        try:

            bus = Bus.objects.get(
                id=bus_id,
                operator=request.user
            )

        except Bus.DoesNotExist:

            return Response(
                {
                    'error':
                    'Bus not found or does not belong to you.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # CHECK NEW BUS APPROVAL
        # =================================================

        if bus.status != 'APPROVED':

            if bus.status == 'PENDING':

                return Response(
                    {
                        'error':
                        'The selected bus is waiting for admin approval.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            return Response(
                {
                    'error':
                    'The selected bus is not approved.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # =================================================
        # CHECK BUS ACTIVE
        # =================================================

        if not bus.is_active:

            return Response(
                {
                    'error':
                    'The selected bus is inactive.'
                },
                status=status.HTTP_403_FORBIDDEN
            )


        # =================================================
        # CHECK ROUTE
        # =================================================

        try:

            route = Route.objects.get(
                id=route_id,
                operator=request.user
            )

        except Route.DoesNotExist:

            return Response(
                {
                    'error':
                    'Route not found or does not belong to you.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # OPERATOR CHECK
        # =================================================

        if bus.operator_id != route.operator_id:

            return Response(
                {
                    'error':
                    'Bus and route belong to different operators.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        # =================================================
        # UPDATE SCHEDULE
        # =================================================

        schedule.bus = bus
        schedule.route = route
        schedule.is_active = is_active

        schedule.save()

        # =================================================
        # UPDATE OPERATING DAYS
        # =================================================

        operating_days = request.data.get('operating_days', [])

        # Allow a single day string as well as a list
        if isinstance(operating_days, str):
            operating_days = [operating_days]

        # Replace existing operating days
        ScheduleOperatingDay.objects.filter(
            schedule=schedule
        ).delete()

        # Save the newly selected days
        for day in operating_days:
            if day:
                ScheduleOperatingDay.objects.create(
                    schedule=schedule,
                    day=day
                )


        return Response(
            {
                'message':
                'Schedule updated successfully.',

                'schedule':
                ScheduleSerializer(schedule).data
            }
        )


    # =================================================
    # DELETE
    # =================================================

    if request.method == 'DELETE':

        schedule.delete()

        return Response(
            {
                'message':
                'Schedule deleted successfully.'
            },
            status=status.HTTP_200_OK
        )


# =====================================================
# OPERATING DAYS
# =====================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_schedule_days(
    request,
    schedule_id
):

    try:

        schedule = (
            Schedule.objects
            .select_related('bus')
            .get(
                id=schedule_id,
                bus__operator=request.user
            )
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error':
                'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # =================================================
    # BUS APPROVAL CHECK
    # =================================================

    if schedule.bus.status != 'APPROVED':

        return Response(
            {
                'error':
                'Operating days can be managed only after the bus is approved.',
                'status':
                schedule.bus.status
            },
            status=status.HTTP_403_FORBIDDEN
        )


    # =================================================
    # GET OPERATING DAYS
    # =================================================

    if request.method == 'GET':

        days = ScheduleOperatingDay.objects.filter(
            schedule=schedule
        )

        serializer = ScheduleOperatingDaySerializer(
            days,
            many=True
        )

        return Response(serializer.data)


    # =================================================
    # ADD OPERATING DAY
    # =================================================

    serializer = ScheduleOperatingDaySerializer(
        data=request.data
    )

    if serializer.is_valid():

        day = serializer.validated_data['day']


        # Prevent duplicate day

        if ScheduleOperatingDay.objects.filter(
            schedule=schedule,
            day=day
        ).exists():

            return Response(
                {
                    'error':
                    f'{day} is already added.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        operating_day = serializer.save(
            schedule=schedule
        )


        return Response(
            ScheduleOperatingDaySerializer(
                operating_day
            ).data,
            status=status.HTTP_201_CREATED
        )


    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )