from rest_framework import serializers
from .models import Ticket


class TicketSerializer(serializers.ModelSerializer):

    # ======================================================
    # SELECTED FROM STOP
    # ======================================================

    source = serializers.SerializerMethodField()

    # ======================================================
    # SELECTED TO STOP
    # ======================================================

    destination = serializers.SerializerMethodField()

    # ======================================================
    # GET SOURCE
    # ======================================================

    def get_source(self, obj):

        booking = obj.booking

        booked_seat = booking.booked_seats.select_related(
            'from_stop'
        ).first()

        # User selected boarding point
        if booked_seat and booked_seat.from_stop:
            return booked_seat.from_stop.stop_name

        # Fallback for old bookings
        if booking.schedule and booking.schedule.route:
            return booking.schedule.route.source

        return None

    # ======================================================
    # GET DESTINATION
    # ======================================================

    def get_destination(self, obj):

        booking = obj.booking

        booked_seat = booking.booked_seats.select_related(
            'to_stop'
        ).first()

        # User selected dropping point
        if booked_seat and booked_seat.to_stop:
            return booked_seat.to_stop.stop_name

        # Fallback for old bookings
        if booking.schedule and booking.schedule.route:
            return booking.schedule.route.destination

        return None

    # ======================================================
    # META
    # ======================================================

    class Meta:

        model = Ticket

        fields = [
            'id',
            'ticket_id',
            'booking',
            'user',

            # Selected journey points
            'source',
            'destination',

            'passenger_name',
            'seat_numbers',
            'amount',
            'qr_code',
            'created_at'
        ]

        read_only_fields = [
            'id',
            'ticket_id',
            'user',

            'source',
            'destination',

            'passenger_name',
            'seat_numbers',
            'amount',
            'qr_code',
            'created_at'
        ]