from datetime import timedelta

from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from buses.models import Schedule, Seat, RouteStop
from .models import SeatHold, BookedSeat


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hold_seat(request):

    # ==========================================================
    # GET REQUEST DATA
    # ==========================================================

    schedule_id = request.data.get('schedule')
    seat_id = request.data.get('seat')
    from_stop_id = request.data.get('from_stop')
    to_stop_id = request.data.get('to_stop')
    travel_date = request.data.get('travel_date')

    print("\n========================================")
    print("HOLD SEAT REQUEST")
    print("========================================")
    print("Schedule:", schedule_id)
    print("Seat:", seat_id)
    print("From Stop:", from_stop_id)
    print("To Stop:", to_stop_id)
    print("Travel Date:", travel_date)
    print("User:", request.user)
    print("========================================")

    # ==========================================================
    # VALIDATION
    # ==========================================================

    if not schedule_id:
        return Response(
            {'error': 'Schedule is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not seat_id:
        return Response(
            {'error': 'Seat is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not from_stop_id:
        return Response(
            {'error': 'From stop is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not to_stop_id:
        return Response(
            {'error': 'To stop is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not travel_date:
        return Response(
            {'error': 'Travel date is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # PARSE TRAVEL DATE
    # ==========================================================

    try:
        from datetime import datetime

        travel_date_obj = datetime.strptime(
            travel_date,
            '%Y-%m-%d'
        ).date()

    except ValueError:
        return Response(
            {'error': 'Invalid travel date format. Use YYYY-MM-DD.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # GET SCHEDULE
    # ==========================================================

    try:
        schedule = Schedule.objects.select_related(
            'bus',
            'route'
        ).get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Schedule not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # ==========================================================
    # GET SEAT
    # ==========================================================

    try:
        seat = Seat.objects.get(
            id=seat_id,
            bus=schedule.bus
        )

    except Seat.DoesNotExist:
        return Response(
            {'error': 'Seat does not belong to this bus.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # GET FROM STOP
    # ==========================================================

    try:
        from_stop = RouteStop.objects.get(
            id=from_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:
        return Response(
            {'error': 'From stop not found for this route.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # GET TO STOP
    # ==========================================================

    try:
        to_stop = RouteStop.objects.get(
            id=to_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:
        return Response(
            {'error': 'To stop not found for this route.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # VALIDATE STOP ORDER
    # ==========================================================

    if from_stop.stop_order >= to_stop.stop_order:
        return Response(
            {
                'error': 'From stop must come before to stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ==========================================================
    # TRANSACTION
    # ==========================================================

    with transaction.atomic():

        now = timezone.now()

        # ------------------------------------------------------
        # REMOVE EXPIRED HOLDS
        # ------------------------------------------------------

        SeatHold.objects.filter(
            expires_at__lte=now
        ).delete()

        # ======================================================
        # CHECK CONFIRMED BOOKINGS
        # ======================================================

        booked_exists = BookedSeat.objects.filter(
            schedule=schedule,
            seat=seat,
            booking__status='CONFIRMED',
            booking__travel_date=travel_date_obj
        ).filter(

            Q(
                from_stop__isnull=True
            )

            |

            Q(
                to_stop__isnull=True
            )

            |

            Q(
                from_stop__stop_order__lt=to_stop.stop_order,
                to_stop__stop_order__gt=from_stop.stop_order
            )

        ).exists()

        if booked_exists:

            return Response(
                {
                    'error':
                    f'Seat {seat.seat_number} is already booked '
                    'for the selected journey segment.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ======================================================
        # CHECK OTHER USER'S ACTIVE HOLD
        # ======================================================

        other_hold_exists = SeatHold.objects.filter(
            schedule=schedule,
            seat=seat,
            travel_date=travel_date_obj,
            expires_at__gt=now
        ).exclude(
            user=request.user
        ).filter(

            Q(
                from_stop__isnull=True
            )

            |

            Q(
                to_stop__isnull=True
            )

            |

            Q(
                from_stop__stop_order__lt=to_stop.stop_order,
                to_stop__stop_order__gt=from_stop.stop_order
            )

        ).exists()

        if other_hold_exists:

            return Response(
                {
                    'error':
                    f'Seat {seat.seat_number} is temporarily '
                    'held by another user.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ======================================================
        # CHECK IF CURRENT USER ALREADY HOLDS SAME SEGMENT
        # ======================================================

        existing_hold = SeatHold.objects.filter(
            schedule=schedule,
            seat=seat,
            user=request.user,
            travel_date=travel_date_obj,
            expires_at__gt=now,
            from_stop=from_stop,
            to_stop=to_stop
        ).first()

        if existing_hold:

            return Response(
                {
                    'message': 'Seat is already held by you.',
                    'hold_id': existing_hold.id,
                    'schedule': schedule.id,
                    'seat': seat.id,
                    'seat_number': seat.seat_number,
                    'from_stop': from_stop.id,
                    'to_stop': to_stop.id,
                    'travel_date': str(travel_date_obj),
                    'expires_at': existing_hold.expires_at,
                    'status': 'HELD_BY_ME'
                },
                status=status.HTTP_200_OK
            )

        # ======================================================
        # CREATE NEW HOLD
        # ======================================================

        expires_at = now + timedelta(minutes=10)

        try:

            hold = SeatHold.objects.create(
                schedule=schedule,
                seat=seat,
                user=request.user,
                from_stop=from_stop,
                to_stop=to_stop,
                travel_date=travel_date_obj,
                expires_at=expires_at
            )

        except Exception as e:

            print("HOLD CREATION ERROR:", str(e))

            return Response(
                {
                    'error': 'Unable to hold seat.',
                    'details': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    # ==========================================================
    # SUCCESS
    # ==========================================================

    print("\n========================================")
    print("SEAT HOLD SUCCESS")
    print("Hold ID:", hold.id)
    print("Seat:", seat.seat_number)
    print("Travel Date:", travel_date_obj)
    print("Expires:", hold.expires_at)
    print("========================================")

    return Response(
        {
            'message': 'Seat held successfully.',
            'hold_id': hold.id,
            'schedule': schedule.id,
            'seat': seat.id,
            'seat_number': seat.seat_number,
            'from_stop': from_stop.id,
            'to_stop': to_stop.id,
            'travel_date': str(travel_date_obj),
            'expires_at': hold.expires_at,
            'status': 'HELD'
        },
        status=status.HTTP_201_CREATED
    )