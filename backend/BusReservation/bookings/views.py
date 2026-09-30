from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Booking, BookedSeat, SeatHold
from .serializers import BookingSerializer

from buses.models import (
    Schedule,
    Seat,
    RouteStop,
    StopFare
)

from users.permissions import IsOperator
from notifications.utils import create_notification


# ==========================================================
# CREATE BOOKING
# ==========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):

    print("REQUEST DATA:", request.data)

    schedule_id = request.data.get('schedule')
    from_stop_id = request.data.get('from_stop')
    to_stop_id = request.data.get('to_stop')
    travel_date = request.data.get('travel_date')
    seats = request.data.get('seats')

    # ======================================================
    # 1. CHECK SCHEDULE
    # ======================================================

    if not schedule_id:

        return Response(
            {
                'error': 'Schedule is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 2. CHECK FROM STOP
    # ======================================================

    if not from_stop_id:

        return Response(
            {
                'error': 'From stop is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 3. CHECK TO STOP
    # ======================================================

    if not to_stop_id:

        return Response(
            {
                'error': 'To stop is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 4. CHECK SEATS
    # ======================================================

    if not seats or not isinstance(seats, list):

        return Response(
            {
                'error': 'At least one seat is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 5. CHECK TRAVEL DATE
    # ======================================================

    if not travel_date:

        return Response(
            {
                'error': 'Travel date is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        travel_date_obj = datetime.strptime(
            str(travel_date),
            '%Y-%m-%d'
        ).date()

    except (TypeError, ValueError):

        return Response(
            {
                'error':
                    'Travel date must be in YYYY-MM-DD format.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 6. GET SCHEDULE
    # ======================================================

    try:

        schedule = Schedule.objects.select_related(
            'bus',
            'route'
        ).get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 7. GET FROM STOP
    # ======================================================

    try:

        from_stop = RouteStop.objects.get(
            id=from_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:

        return Response(
            {
                'error': 'Invalid from stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 8. GET TO STOP
    # ======================================================

    try:

        to_stop = RouteStop.objects.get(
            id=to_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:

        return Response(
            {
                'error': 'Invalid to stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 9. VALIDATE STOP ORDER
    # ======================================================

    if from_stop.stop_order >= to_stop.stop_order:

        return Response(
            {
                'error':
                    'From stop must come before To stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 10. CALCULATE CUMULATIVE SEGMENT FARE
    # ======================================================

    route_stops = list(
        RouteStop.objects.filter(
            route=schedule.route
        ).order_by(
            'stop_order'
        )
    )

    journey_stops = [
        stop
        for stop in route_stops
        if from_stop.stop_order
        <= stop.stop_order
        <= to_stop.stop_order
    ]

    if len(journey_stops) < 2:

        return Response(
            {
                'error': 'Invalid journey stops.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # Example:
    #
    # Kochi -> Angamaly = 20
    # Angamaly -> Thrissur = 20
    #
    # Kochi -> Thrissur = 40

    fare_per_seat = Decimal('0.00')

    for i in range(len(journey_stops) - 1):

        current_stop = journey_stops[i]

        next_stop = journey_stops[i + 1]

        segment_fare = StopFare.objects.filter(
            schedule=schedule,
            from_stop=current_stop,
            to_stop=next_stop
        ).first()

        if not segment_fare:

            return Response(
                {
                    'error':
                        f'Fare not found for '
                        f'{current_stop.stop_name} to '
                        f'{next_stop.stop_name}.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        fare_per_seat += segment_fare.fare

    # ======================================================
    # DEBUG - FARE CALCULATION
    # ======================================================

    print('======================================')
    print('CUMULATIVE FARE CALCULATION')
    print('======================================')

    for i in range(len(journey_stops) - 1):

        print(
            journey_stops[i].stop_name,
            '->',
            journey_stops[i + 1].stop_name
        )

    print('Fare Per Seat:', fare_per_seat)

    print('======================================')

    # ======================================================
    # 11. VALIDATE ALL SEATS
    # ======================================================

    validated_seats = []

    for seat_data in seats:

        seat_id = seat_data.get('seat_id')

        if not seat_id:

            return Response(
                {
                    'error': 'Seat ID is required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            seat = Seat.objects.get(
                id=seat_id,
                bus=schedule.bus
            )

        except Seat.DoesNotExist:

            return Response(
                {
                    'error':
                        f'Seat {seat_id} does not belong '
                        f'to this bus.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        validated_seats.append(
            {
                'seat': seat,

                'passenger_name':
                    seat_data.get('passenger_name'),

                'passenger_age':
                    seat_data.get('passenger_age'),

                'passenger_gender':
                    seat_data.get('passenger_gender')
            }
        )

    # ======================================================
    # 12. CHECK DUPLICATE SEATS
    # ======================================================

    seat_ids = [
        item['seat'].id
        for item in validated_seats
    ]

    if len(seat_ids) != len(set(seat_ids)):

        return Response(
            {
                'error':
                    'The same seat cannot be selected twice.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 13. CREATE BOOKING SAFELY
    # ======================================================

    try:

        with transaction.atomic():

            # ------------------------------------------------
            # Lock the schedule while checking/creating
            # bookings.
            # ------------------------------------------------

            schedule = Schedule.objects.select_for_update().get(
                id=schedule.id
            )

            # ------------------------------------------------
            # Remove expired holds.
            # ------------------------------------------------

            now = timezone.now()

            SeatHold.objects.filter(
                expires_at__lte=now
            ).delete()

            # ------------------------------------------------
            # Check BOOKED seats for overlapping journey
            # segments.
            #
            # Existing:
            # Angamaly -> Chalakudy
            #
            # New:
            # Chalakudy -> Thrissur
            #
            # Result:
            # No overlap, seat can be reused.
            #
            # Existing:
            # Angamaly -> Thrissur
            #
            # New:
            # Chalakudy -> Thrissur
            #
            # Result:
            # Overlap, seat cannot be reused.
            # ------------------------------------------------

            overlapping_booked = BookedSeat.objects.filter(
                schedule=schedule,
                seat_id__in=seat_ids,
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
            ).select_related(
                'seat'
            )

            if overlapping_booked.exists():

                booked_numbers = sorted({
                    item.seat.seat_number
                    for item in overlapping_booked
                })

                return Response(
                    {
                        'error':
                            f"Seat(s) "
                            f"{', '.join(booked_numbers)} "
                            f"are already booked for the selected "
                            f"journey segment."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ------------------------------------------------
            # Check ACTIVE HOLDS for overlapping journey
            # segments.
            #
            # A hold belonging to the current user is allowed
            # to continue to booking.
            #
            # A hold belonging to another user blocks the seat.
            # ------------------------------------------------

            overlapping_holds = SeatHold.objects.filter(
                schedule=schedule,
                seat_id__in=seat_ids,
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
            ).select_related(
                'seat'
            )

            if overlapping_holds.exists():

                held_numbers = sorted({
                    item.seat.seat_number
                    for item in overlapping_holds
                })

                return Response(
                    {
                        'error':
                            f"Seat(s) "
                            f"{', '.join(held_numbers)} "
                            f"are temporarily held by another user."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # =================================================
            # CALCULATE TICKET AMOUNT
            # =================================================

            ticket_amount = (
                fare_per_seat *
                len(validated_seats)
            )

            # =================================================
            # TOTAL AMOUNT
            # =================================================
            #
            # There is NO convenience fee.
            #
            # Booking.total_amount contains the complete
            # ticket fare.
            #
            # Example:
            #
            # Fare per seat = 80
            # Seats = 1
            # Total amount = 80
            #
            # Fare per seat = 80
            # Seats = 2
            # Total amount = 160
            # =================================================

            total_amount = ticket_amount

            # =================================================
            # DEBUG
            # =================================================

            print("======================================")
            print("BOOKING FARE CALCULATION")
            print("======================================")

            print(
                "Schedule ID:",
                schedule.id
            )

            print(
                "From Stop:",
                from_stop.stop_name,
                from_stop.id
            )

            print(
                "To Stop:",
                to_stop.stop_name,
                to_stop.id
            )

            print(
                "Fare Per Seat:",
                fare_per_seat
            )

            print(
                "Number Of Seats:",
                len(validated_seats)
            )

            print(
                "Ticket Amount:",
                ticket_amount
            )

            print(
                "Booking Total Amount:",
                total_amount
            )

            print("======================================")

            # =================================================
            # CREATE BOOKING
            # =================================================

            booking = Booking.objects.create(
                user=request.user,
                schedule=schedule,
                travel_date=travel_date_obj,
                total_amount=total_amount,
                status='CONFIRMED',
                payment_status='PENDING'
            )

            # =================================================
            # CREATE BOOKED SEATS
            # =================================================

            for item in validated_seats:

                BookedSeat.objects.create(
                    booking=booking,
                    schedule=schedule,
                    seat=item['seat'],
                    from_stop=from_stop,
                    to_stop=to_stop,
                    passenger_name=
                        item['passenger_name'],
                    passenger_age=
                        item['passenger_age'],
                    passenger_gender=
                        item['passenger_gender']
                )

    except Exception as e:

        print(
            "BOOKING ERROR:",
            str(e)
        )

        return Response(
            {
                'error': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 14. RETURN BOOKING
    # ======================================================

    serializer = BookingSerializer(
        booking
    )

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )


# ==========================================================
# CANCEL BOOKING
# ==========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):

    # ======================================================
    # 1. FIND USER'S BOOKING
    # ======================================================

    try:

        booking = Booking.objects.get(
            id=booking_id,
            user=request.user
        )

    except Booking.DoesNotExist:

        return Response(
            {
                'error': 'Booking not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 2. CHECK STATUS
    # ======================================================

    if booking.status == 'CANCELLED':

        return Response(
            {
                'error':
                    'Booking is already cancelled.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 3. CANCEL BOOKING
    # ======================================================

    try:

        with transaction.atomic():

            booking.status = 'CANCELLED'

            booking.save(
                update_fields=['status']
            )

            # ------------------------------------------------
            # Release booked seats
            # ------------------------------------------------

            BookedSeat.objects.filter(
                booking=booking
            ).delete()

            # ------------------------------------------------
            # Notification
            # ------------------------------------------------

            create_notification(
                user=booking.user,

                title='Booking Cancelled',

                message=(
                    f'Your booking #{booking.id} '
                    f'has been cancelled successfully.'
                ),

                notification_type='CANCELLATION'
            )

    except Exception as e:

        return Response(
            {
                'error': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 4. RETURN RESPONSE
    # ======================================================

    return Response(
        {
            'message':
                'Booking cancelled successfully.',

            'booking_id':
                booking.id,

            'status':
                booking.status
        },
        status=status.HTTP_200_OK
    )


# ==========================================================
# MY BOOKINGS
# ==========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_bookings(request):

    bookings = Booking.objects.filter(
        user=request.user
    ).prefetch_related(
        'booked_seats__seat',
        'booked_seats__from_stop',
        'booked_seats__to_stop'
    ).select_related(
        'schedule__route',
        'schedule__bus'
    ).order_by(
        '-booking_date'
    )

    serializer = BookingSerializer(
        bookings,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )


# ==========================================================
# OPERATOR BOOKINGS
# ==========================================================

@api_view(['GET'])
@permission_classes([
    IsAuthenticated,
    IsOperator
])
def operator_bookings(request):

    bookings = (
        Booking.objects
        .filter(
            schedule__bus__operator=request.user
        )
        .select_related(
            'user',
            'schedule',
            'schedule__bus',
            'schedule__route'
        )
        .prefetch_related(
            'booked_seats__seat',
            'booked_seats__from_stop',
            'booked_seats__to_stop'
        )
        .order_by(
            '-booking_date'
        )
    )

    data = []

    # ======================================================
    # CREATE RESPONSE
    # ======================================================

    for booking in bookings:

        booked_seats = booking.booked_seats.all()

        for booked_seat in booked_seats:

            data.append({

                # ------------------------------------------------
                # BOOKING
                # ------------------------------------------------

                'booking_id':
                    booking.id,

                # ------------------------------------------------
                # CUSTOMER
                # ------------------------------------------------

                'customer':
                    (
                        booking.user.get_full_name()
                        or booking.user.username
                    ),

                'customer_username':
                    booking.user.username,

                # ------------------------------------------------
                # PASSENGER
                # ------------------------------------------------

                'passenger_name':
                    booked_seat.passenger_name,

                'passenger_age':
                    booked_seat.passenger_age,

                'passenger_gender':
                    booked_seat.passenger_gender,

                # ------------------------------------------------
                # BUS
                # ------------------------------------------------

                'bus':
                    booking.schedule.bus.bus_name,

                'bus_number':
                    booking.schedule.bus.bus_number,

                # ------------------------------------------------
                # ROUTE
                # ------------------------------------------------

                'source':
                    booking.schedule.route.source,

                'destination':
                    booking.schedule.route.destination,

                # ------------------------------------------------
                # SEAT
                # ------------------------------------------------

                'seat':
                    booked_seat.seat.seat_number,

                # ------------------------------------------------
                # JOURNEY SEGMENT
                # ------------------------------------------------

                'from_stop': (
                    booked_seat.from_stop.stop_name
                    if booked_seat.from_stop
                    else None
                ),

                'to_stop': (
                    booked_seat.to_stop.stop_name
                    if booked_seat.to_stop
                    else None
                ),

                # ------------------------------------------------
                # TICKET FARE
                # ------------------------------------------------

                'ticket_fare':
                    booking.total_amount,

                # ------------------------------------------------
                # TOTAL AMOUNT
                # ------------------------------------------------

                'total_amount':
                    booking.total_amount,

                # ------------------------------------------------
                # PAYMENT
                # ------------------------------------------------

                'payment_status':
                    booking.payment_status,

                # ------------------------------------------------
                # BOOKING STATUS
                # ------------------------------------------------

                'booking_status':
                    booking.status,

                # ------------------------------------------------
                # BOOKING DATE
                # ------------------------------------------------

                'booking_date':
                    booking.booking_date,
            })

    # ======================================================
    # RETURN
    # ======================================================

    return Response(
        data,
        status=status.HTTP_200_OK
    )


# ==========================================================
# HOLD SEAT FOR 10 MINUTES - SEGMENT BASED
# ==========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def hold_seat(request):

    schedule_id = request.data.get('schedule')
    seat_id = request.data.get('seat')
    from_stop_id = request.data.get('from_stop')
    to_stop_id = request.data.get('to_stop')
    travel_date = request.data.get('travel_date')

    # ======================================================
    # 1. CHECK SCHEDULE
    # ======================================================

    if not schedule_id:

        return Response(
            {
                'error': 'Schedule is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 2. CHECK SEAT
    # ======================================================

    if not seat_id:

        return Response(
            {
                'error': 'Seat is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 3. CHECK STOPS
    # ======================================================

    if not from_stop_id or not to_stop_id:

        return Response(
            {
                'error':
                    'from_stop and to_stop are required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 4. CHECK TRAVEL DATE
    # ======================================================

    if not travel_date:

        return Response(
            {
                'error': 'Travel date is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:

        travel_date_obj = datetime.strptime(
            str(travel_date),
            '%Y-%m-%d'
        ).date()

    except (TypeError, ValueError):

        return Response(
            {
                'error':
                    'Travel date must be in YYYY-MM-DD format.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 5. GET SCHEDULE
    # ======================================================

    try:

        schedule = Schedule.objects.select_related(
            'bus',
            'route'
        ).get(
            id=schedule_id
        )

    except Schedule.DoesNotExist:

        return Response(
            {
                'error': 'Schedule not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 6. GET SEAT
    # ======================================================

    try:

        seat = Seat.objects.get(
            id=seat_id,
            bus=schedule.bus
        )

    except Seat.DoesNotExist:

        return Response(
            {
                'error':
                    'Seat does not belong to this bus.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 7. GET STOPS
    # ======================================================

    try:

        from_stop = RouteStop.objects.get(
            id=from_stop_id,
            route=schedule.route
        )

        to_stop = RouteStop.objects.get(
            id=to_stop_id,
            route=schedule.route
        )

    except RouteStop.DoesNotExist:

        return Response(
            {
                'error':
                    'Invalid from_stop or to_stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 8. VALIDATE STOP ORDER
    # ======================================================

    if from_stop.stop_order >= to_stop.stop_order:

        return Response(
            {
                'error':
                    'From stop must come before To stop.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 9. CREATE HOLD SAFELY
    # ======================================================

    try:

        with transaction.atomic():

            schedule = Schedule.objects.select_for_update().get(
                id=schedule.id
            )

            now = timezone.now()

            # ------------------------------------------------
            # Remove expired holds first.
            # ------------------------------------------------

            SeatHold.objects.filter(
                expires_at__lte=now
            ).delete()

            # ------------------------------------------------
            # Already-booked overlapping segment.
            # ------------------------------------------------

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
                            f'Seat {seat.seat_number} is already '
                            f'booked for the selected journey segment.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ------------------------------------------------
            # Another user's active overlapping hold.
            # ------------------------------------------------

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
                            f'held by another user.'
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ------------------------------------------------
            # If this user already holds this exact segment,
            # return the existing hold.
            # ------------------------------------------------

            existing_hold = SeatHold.objects.filter(
                schedule=schedule,
                seat=seat,
                user=request.user,
                travel_date=travel_date_obj,
                expires_at__gt=now
            ).filter(
                from_stop=from_stop,
                to_stop=to_stop
            ).first()

            if existing_hold:

                return Response(
                    {
                        'message':
                            'Seat is already held by you.',

                        'hold_id':
                            existing_hold.id,

                        'expires_at':
                            existing_hold.expires_at,

                        'status':
                            'HELD_BY_ME'
                    },
                    status=status.HTTP_200_OK
                )

            # ------------------------------------------------
            # Create new hold
            # ------------------------------------------------

            expires_at = (
                now +
                timedelta(minutes=10)
            )

            hold = SeatHold.objects.create(
                schedule=schedule,
                seat=seat,
                user=request.user,
                travel_date=travel_date_obj,
                from_stop=from_stop,
                to_stop=to_stop,
                expires_at=expires_at
            )

            return Response(
                {
                    'message':
                        'Seat held successfully.',

                    'hold_id':
                        hold.id,

                    'seat':
                        seat.id,

                    'seat_number':
                        seat.seat_number,

                    'from_stop':
                        from_stop.id,

                    'to_stop':
                        to_stop.id,

                    'expires_at':
                        hold.expires_at,

                    'status':
                        'HELD_BY_ME'
                },
                status=status.HTTP_201_CREATED
            )

    except Exception as e:

        return Response(
            {
                'error': str(e)
            },
            status=status.HTTP_400_BAD_REQUEST
        )