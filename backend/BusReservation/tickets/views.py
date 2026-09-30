import uuid
import qrcode

from django.core.files.base import ContentFile
from io import BytesIO

from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from bookings.models import Booking
from .models import Ticket

from notifications.utils import create_notification


# ==========================================================
# GENERATE TICKET
# ==========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_ticket(request):

    booking_id = request.data.get('booking')

    # ======================================================
    # 1. VALIDATE BOOKING ID
    # ======================================================

    if not booking_id:

        return Response(
            {
                'error':
                    'Booking ID is required'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 2. GET BOOKING
    # ======================================================

    try:

        booking = Booking.objects.select_related(
            'schedule__bus',
            'schedule__route',
            'user'
        ).get(
            id=booking_id,
            user=request.user
        )

    except Booking.DoesNotExist:

        return Response(
            {
                'error':
                    'Booking not found'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 3. CHECK BOOKING STATUS
    # ======================================================

    if booking.status == 'CANCELLED':

        return Response(
            {
                'error':
                    'Ticket cannot be generated '
                    'for a cancelled booking'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 4. CHECK SUCCESSFUL PAYMENT
    # ======================================================

    payment = booking.payments.filter(
        payment_status='SUCCESS'
    ).order_by(
        '-payment_date'
    ).first()

    if not payment:

        return Response(
            {
                'error':
                    'Ticket can be generated only '
                    'after successful payment'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 5. GET SCHEDULE / BUS / ROUTE
    # ======================================================

    schedule = booking.schedule

    bus = schedule.bus

    route = schedule.route

    # ======================================================
    # 6. GET BOOKED SEATS
    # ======================================================

    booked_seats = (
        booking.booked_seats
        .select_related(
            'seat',
            'from_stop',
            'to_stop'
        )
        .all()
    )

    if not booked_seats.exists():

        return Response(
            {
                'error':
                    'No booked seats found'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 7. GET SELECTED FROM / TO STOPS
    # ======================================================

    first_booked_seat = booked_seats.first()

    # ------------------------------------------------------
    # FROM STOP
    # ------------------------------------------------------

    if (
        first_booked_seat
        and first_booked_seat.from_stop
    ):

        selected_source = (
            first_booked_seat
            .from_stop
            .stop_name
        )

    else:

        # Fallback for older bookings
        selected_source = route.source

    # ------------------------------------------------------
    # TO STOP
    # ------------------------------------------------------

    if (
        first_booked_seat
        and first_booked_seat.to_stop
    ):

        selected_destination = (
            first_booked_seat
            .to_stop
            .stop_name
        )

    else:

        # Fallback for older bookings
        selected_destination = route.destination

    # ======================================================
    # 8. TRAVEL DATE
    # ======================================================

    travel_date = booking.travel_date

    # ======================================================
    # 9. PASSENGER NAMES + SEAT NUMBERS
    # ======================================================

    passenger_names = []

    seat_numbers = []

    for booked_seat in booked_seats:

        passenger_names.append(
            booked_seat.passenger_name
        )

        seat_numbers.append(
            booked_seat.seat.seat_number
        )

    passenger_name_text = ', '.join(
        passenger_names
    )

    seat_numbers_text = ', '.join(
        seat_numbers
    )

    # ======================================================
    # 10. GENERATE TICKET ID
    # ======================================================

    ticket_id = (
        'TKT-' +
        uuid.uuid4().hex[:10].upper()
    )

    # ======================================================
    # 11. QR CODE DATA
    # ======================================================

    qr_data = (
        f"BUS RESERVATION TICKET\n\n"

        f"Ticket ID: {ticket_id}\n"

        f"Booking ID: RB{booking.id:06d}\n"

        f"Passenger: {passenger_name_text}\n"

        f"Bus: {bus.bus_name}\n"

        f"Bus Number: {bus.bus_number}\n"

        # Selected FROM stop
        f"From: {selected_source}\n"

        # Selected TO stop
        f"To: {selected_destination}\n"

        # Travel date
        f"Travel Date: {travel_date}\n"

        f"Seats: {seat_numbers_text}\n"

        f"Payment Status: "
        f"{payment.payment_status}\n"

        f"Booking Status: "
        f"{booking.status}\n"

        f"Ticket Fare: "
        f"{booking.total_amount}\n"

        f"Amount Paid: "
        f"{payment.amount}\n"

        f"Booking Date: "
        f"{booking.booking_date}"
    )

    # ======================================================
    # 12. GENERATE QR CODE
    # ======================================================

    try:

        qr = qrcode.make(
            qr_data
        )

        qr_buffer = BytesIO()

        qr.save(
            qr_buffer,
            format='PNG'
        )

    except Exception as e:

        print(
            'QR CODE GENERATION ERROR:',
            str(e)
        )

        return Response(
            {
                'error':
                    'Unable to generate QR code.',

                'details':
                    str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # ======================================================
    # 13. CHECK EXISTING TICKET
    # ======================================================

    existing_ticket = Ticket.objects.filter(
        booking=booking
    ).first()

    if existing_ticket:

        return Response(
            {
                'message':
                    'Ticket already exists',

                'id':
                    existing_ticket.id,

                'ticket_id':
                    existing_ticket.ticket_id,

                'booking':
                    booking.id,

                'booking_reference':
                    f'RB{booking.id:06d}',

                # Travel date
                'travel_date':
                    travel_date,

                'passenger_name':
                    existing_ticket.passenger_name,

                'seat_numbers':
                    existing_ticket.seat_numbers,

                # Selected journey
                'source':
                    selected_source,

                'destination':
                    selected_destination,

                # Fare
                'ticket_price':
                    str(booking.total_amount),

                'payment_amount':
                    str(existing_ticket.amount),

                # Payment
                'payment_method':
                    payment.payment_method,

                'payment_status':
                    payment.payment_status,

                # Booking
                'booking_status':
                    booking.status,

                # Bus
                'bus_name':
                    bus.bus_name,

                'bus_number':
                    bus.bus_number,

                'qr_code': (
                    existing_ticket.qr_code.url
                    if existing_ticket.qr_code
                    else None
                )
            },
            status=status.HTTP_200_OK
        )

    # ======================================================
    # 14. CREATE TICKET
    # ======================================================

    try:

        ticket = Ticket.objects.create(

            ticket_id=ticket_id,

            booking=booking,

            user=request.user,

            passenger_name=
                passenger_name_text,

            seat_numbers=
                seat_numbers_text,

            # Complete amount paid
            amount=
                payment.amount
        )

    except Exception as e:

        print(
            'TICKET CREATION ERROR:',
            str(e)
        )

        return Response(
            {
                'error':
                    'Unable to create ticket.',

                'details':
                    str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # ======================================================
    # 15. SAVE QR CODE
    # ======================================================

    try:

        ticket.qr_code.save(

            f'{ticket_id}.png',

            ContentFile(
                qr_buffer.getvalue()
            ),

            save=True
        )

    except Exception as e:

        print(
            'QR CODE SAVE ERROR:',
            str(e)
        )

        ticket.delete()

        return Response(
            {
                'error':
                    'Unable to save QR code.',

                'details':
                    str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # ======================================================
    # 16. CREATE NOTIFICATION
    # ======================================================

    try:

        create_notification(

            user=booking.user,

            title='Ticket Generated',

            message=(
                f'Your ticket '
                f'{ticket.ticket_id} '
                f'for booking #{booking.id} '
                f'is ready.'
            ),

            notification_type='TICKET'
        )

    except Exception as e:

        # Notification failure should not
        # make ticket generation fail.

        print(
            'NOTIFICATION ERROR:',
            str(e)
        )

    # ======================================================
    # 17. RESPONSE
    # ======================================================

    return Response(
        {

            'message':
                'Ticket generated successfully',

            # ==================================================
            # TICKET
            # ==================================================

            'id':
                ticket.id,

            'ticket_id':
                ticket.ticket_id,

            # ==================================================
            # BOOKING
            # ==================================================

            'booking':
                booking.id,

            'booking_reference':
                f'RB{booking.id:06d}',

            # ==================================================
            # TRAVEL DATE
            # ==================================================

            'travel_date':
                travel_date,

            # ==================================================
            # PASSENGER
            # ==================================================

            'passenger_name':
                passenger_name_text,

            # ==================================================
            # BUS
            # ==================================================

            'bus_name':
                bus.bus_name,

            'bus_number':
                bus.bus_number,

            'bus_type':
                bus.bus_type,

            # ==================================================
            # SELECTED JOURNEY
            # ==================================================

            'source':
                selected_source,

            'destination':
                selected_destination,

            # ==================================================
            # SEATS
            # ==================================================

            'seat_numbers':
                seat_numbers_text,

            # ==================================================
            # FARE
            # ==================================================

            'ticket_price':
                str(booking.total_amount),

            'amount':
                str(ticket.amount),

            'payment_amount':
                str(payment.amount),

            # ==================================================
            # PAYMENT
            # ==================================================

            'payment_method':
                payment.payment_method,

            'payment_status':
                payment.payment_status,

            # ==================================================
            # BOOKING STATUS
            # ==================================================

            'booking_status':
                booking.status,

            # ==================================================
            # QR CODE
            # ==================================================

            'qr_code': (
                ticket.qr_code.url
                if ticket.qr_code
                else None
            )
        },

        status=status.HTTP_201_CREATED
    )


# ==========================================================
# GET TICKET
# ==========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ticket(request, booking_id):

    try:

        # ==================================================
        # 1. GET TICKET
        # ==================================================

        ticket = Ticket.objects.get(
            booking_id=booking_id,
            user=request.user
        )

        # ==================================================
        # 2. GET BOOKING
        # ==================================================

        booking = ticket.booking

        # ==================================================
        # 3. GET SCHEDULE / BUS / ROUTE
        # ==================================================

        schedule = booking.schedule

        bus = schedule.bus

        route = schedule.route

        # ==================================================
        # 4. GET BOOKED SEATS
        # ==================================================

        booked_seats = (
            booking.booked_seats
            .select_related(
                'seat',
                'from_stop',
                'to_stop'
            )
            .all()
        )

        # ==================================================
        # 5. GET SELECTED FROM / TO STOPS
        # ==================================================

        first_booked_seat = booked_seats.first()

        # --------------------------------------------------
        # FROM STOP
        # --------------------------------------------------

        if (
            first_booked_seat
            and first_booked_seat.from_stop
        ):

            selected_source = (
                first_booked_seat
                .from_stop
                .stop_name
            )

        else:

            # Fallback for old bookings
            selected_source = route.source

        # --------------------------------------------------
        # TO STOP
        # --------------------------------------------------

        if (
            first_booked_seat
            and first_booked_seat.to_stop
        ):

            selected_destination = (
                first_booked_seat
                .to_stop
                .stop_name
            )

        else:

            # Fallback for old bookings
            selected_destination = route.destination

        # ==================================================
        # 6. TRAVEL DATE
        # ==================================================

        travel_date = booking.travel_date

        # ==================================================
        # 7. GET SUCCESSFUL PAYMENT
        # ==================================================

        payment = (
            booking.payments
            .filter(
                payment_status='SUCCESS'
            )
            .order_by(
                '-payment_date'
            )
            .first()
        )

        # ==================================================
        # 8. FULL PAYMENT AMOUNT
        # ==================================================

        payment_amount = (
            payment.amount
            if payment
            else ticket.amount
        )

        # ==================================================
        # 9. PAYMENT METHOD
        # ==================================================

        payment_method = (
            payment.payment_method
            if payment
            else None
        )

        # ==================================================
        # 10. RETURN TICKET
        # ==================================================

        return Response(
            {

                # ==================================================
                # TICKET
                # ==================================================

                'id':
                    ticket.id,

                'ticket_id':
                    ticket.ticket_id,

                # ==================================================
                # BOOKING
                # ==================================================

                'booking':
                    booking.id,

                'booking_reference':
                    f'RB{booking.id:06d}',

                # ==================================================
                # TRAVEL DATE
                # ==================================================

                'travel_date':
                    travel_date,

                # ==================================================
                # USER
                # ==================================================

                'user':
                    ticket.user.id,

                # ==================================================
                # PASSENGER
                # ==================================================

                'passenger_name':
                    ticket.passenger_name,

                # ==================================================
                # SEATS
                # ==================================================

                'seat_numbers':
                    ticket.seat_numbers,

                # ==================================================
                # FARE
                # ==================================================

                'ticket_price':
                    float(
                        booking.total_amount
                    ),

                'amount':
                    float(ticket.amount),

                'payment_amount':
                    float(payment_amount),

                # ==================================================
                # PAYMENT
                # ==================================================

                'payment_method':
                    payment_method,

                'payment_status':
                    booking.payment_status,

                # ==================================================
                # QR CODE
                # ==================================================

                'qr_code': (
                    ticket.qr_code.url
                    if ticket.qr_code
                    else None
                ),

                # ==================================================
                # BUS
                # ==================================================

                'bus_name':
                    bus.bus_name,

                'bus_number':
                    bus.bus_number,

                'bus_type':
                    bus.bus_type,

                # ==================================================
                # SELECTED JOURNEY
                # ==================================================

                'source':
                    selected_source,

                'destination':
                    selected_destination,

                # ==================================================
                # BOOKING STATUS
                # ==================================================

                'booking_date':
                    ticket.created_at,

                'status':
                    booking.status,

                'booking_status':
                    booking.status,

                'created_at':
                    ticket.created_at
            }
        )

    except Ticket.DoesNotExist:

        return Response(
            {
                'error':
                    'Ticket not found for this booking.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:

        print(
            "GET TICKET ERROR:",
            str(e)
        )

        return Response(
            {
                'error':
                    'Unable to retrieve ticket.',

                'details':
                    str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )