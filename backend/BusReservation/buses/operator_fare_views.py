from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import (
    Schedule,
    StopFare,
)

from .serializers import StopFareSerializer

from users.permissions import IsOperator


# =====================================================
# OPERATOR SCHEDULE FARES
# =====================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_schedule_fares(
    request,
    schedule_id
):

    # =================================================
    # GET SCHEDULE
    # =================================================

    try:

        schedule = (
            Schedule.objects
            .select_related(
                'bus',
                'route'
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
    # BUS APPROVAL CHECK
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
    # GET FARES
    # =================================================

    if request.method == 'GET':

        fares = (
            StopFare.objects
            .filter(
                schedule=schedule
            )
            .select_related(
                'from_stop',
                'to_stop'
            )
        )

        serializer = StopFareSerializer(
            fares,
            many=True
        )

        return Response(
            serializer.data
        )


    # =================================================
    # ADD FARE
    # =================================================

    serializer = StopFareSerializer(
        data=request.data
    )


    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    from_stop = serializer.validated_data[
        'from_stop'
    ]

    to_stop = serializer.validated_data[
        'to_stop'
    ]

    fare = serializer.validated_data[
        'fare'
    ]


    # =================================================
    # CHECK FROM STOP
    # =================================================

    if from_stop.route_id != schedule.route_id:

        return Response(
            {
                'error':
                'From stop does not belong to this route.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # CHECK TO STOP
    # =================================================

    if to_stop.route_id != schedule.route_id:

        return Response(
            {
                'error':
                'To stop does not belong to this route.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # STOP ORDER
    # =================================================

    if from_stop.stop_order >= to_stop.stop_order:

        return Response(
            {
                'error':
                'From stop must come before to stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # FARE VALIDATION
    # =================================================

    if fare <= 0:

        return Response(
            {
                'error':
                'Fare must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # DUPLICATE FARE
    # =================================================

    if StopFare.objects.filter(
        schedule=schedule,
        from_stop=from_stop,
        to_stop=to_stop
    ).exists():

        return Response(
            {
                'error':
                'Fare already exists for these stops.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # CREATE FARE
    # =================================================

    stop_fare = serializer.save(
        schedule=schedule
    )


    return Response(
        StopFareSerializer(
            stop_fare
        ).data,
        status=status.HTTP_201_CREATED
    )



# =====================================================
# ADD SCHEDULE FARE
# =====================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_add_schedule_fare(request, schedule_id):

    # =================================================
    # GET SCHEDULE
    # =================================================

    try:

        schedule = (
            Schedule.objects
            .select_related(
                'bus',
                'route'
            )
            .get(
                id=schedule_id,
                bus__operator=request.user
            )
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # =================================================
    # BUS APPROVAL CHECK
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
                    'status':
                        'REJECTED',
                    'rejection_reason':
                        schedule.bus.rejection_reason or ''
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
    # BUS ACTIVE CHECK
    # =================================================

    if not schedule.bus.is_active:

        return Response(
            {
                'error':
                    'This bus is currently inactive.'
            },
            status=status.HTTP_403_FORBIDDEN
        )


    # =================================================
    # VALIDATE FARE DATA
    # =================================================

    serializer = StopFareSerializer(
        data=request.data
    )

    if not serializer.is_valid():

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    from_stop = serializer.validated_data['from_stop']

    to_stop = serializer.validated_data['to_stop']

    fare = serializer.validated_data['fare']


    # =================================================
    # CHECK FROM STOP
    # =================================================

    if from_stop.route_id != schedule.route_id:

        return Response(
            {
                'error':
                    'From stop does not belong to this route.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # CHECK TO STOP
    # =================================================

    if to_stop.route_id != schedule.route_id:

        return Response(
            {
                'error':
                    'To stop does not belong to this route.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # CHECK STOP ORDER
    # =================================================

    if from_stop.stop_order >= to_stop.stop_order:

        return Response(
            {
                'error':
                    'From stop must come before to stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # CHECK FARE
    # =================================================

    if fare <= 0:

        return Response(
            {
                'error':
                    'Fare must be greater than zero.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # DUPLICATE CHECK
    # =================================================

    if StopFare.objects.filter(
        schedule=schedule,
        from_stop=from_stop,
        to_stop=to_stop
    ).exists():

        return Response(
            {
                'error':
                    'Fare already exists for these stops.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # =================================================
    # CREATE FARE
    # =================================================

    stop_fare = serializer.save(
        schedule=schedule
    )


    return Response(
        StopFareSerializer(
            stop_fare
        ).data,
        status=status.HTTP_201_CREATED
    )


# =====================================================
# DELETE SCHEDULE FARE
# =====================================================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_delete_schedule_fare(
    request,
    schedule_id,
    fare_id
):

    # =================================================
    # GET SCHEDULE
    # =================================================

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
                    'status':
                        'REJECTED',
                    'rejection_reason':
                        schedule.bus.rejection_reason or ''
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
    # GET FARE
    # =================================================

    try:

        fare = StopFare.objects.get(
            id=fare_id,
            schedule=schedule
        )

    except StopFare.DoesNotExist:

        return Response(
            {
                'error':
                    'Fare not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # =================================================
    # DELETE
    # =================================================

    fare.delete()


    return Response(
        {
            'message':
                'Fare deleted successfully.'
        },
        status=status.HTTP_200_OK
    )