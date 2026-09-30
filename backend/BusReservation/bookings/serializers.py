from rest_framework import serializers

from .models import Booking, BookedSeat


# ==========================================================
# BOOKED SEAT SERIALIZER
# ==========================================================

class BookedSeatSerializer(serializers.ModelSerializer):

    seat_number = serializers.CharField(
        source='seat.seat_number',
        read_only=True
    )

    from_stop_name = serializers.CharField(
        source='from_stop.stop_name',
        read_only=True
    )

    to_stop_name = serializers.CharField(
        source='to_stop.stop_name',
        read_only=True
    )

    class Meta:
        model = BookedSeat

        fields = [
            'id',
            'seat',
            'seat_number',

            'from_stop',
            'from_stop_name',

            'to_stop',
            'to_stop_name',

            'passenger_name',
            'passenger_age',
            'passenger_gender'
        ]


# ==========================================================
# BOOKING SERIALIZER
# ==========================================================

class BookingSerializer(serializers.ModelSerializer):

    booked_seats = BookedSeatSerializer(
        many=True,
        read_only=True
    )

    passenger_name = serializers.SerializerMethodField()

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    # ======================================================
    # SELECTED FROM STOP
    # ======================================================

    source = serializers.SerializerMethodField()

    # ======================================================
    # SELECTED TO STOP
    # ======================================================

    destination = serializers.SerializerMethodField()

    bus_name = serializers.CharField(
        source='schedule.bus.bus_name',
        read_only=True
    )

    bus_number = serializers.CharField(
        source='schedule.bus.bus_number',
        read_only=True
    )

    seats = serializers.SerializerMethodField()

    # ======================================================
    # FINAL AMOUNT
    # ======================================================

    # Convenience fee has been removed.
    # Therefore final_amount = total_amount.

    final_amount = serializers.SerializerMethodField()

    # ======================================================
    # PASSENGER NAME
    # ======================================================

    def get_passenger_name(self, obj):

        first_seat = obj.booked_seats.first()

        if first_seat:
            return first_seat.passenger_name

        return obj.user.username

    # ======================================================
    # SELECTED FROM STOP
    # ======================================================

    def get_source(self, obj):

        first_seat = obj.booked_seats.select_related(
            'from_stop'
        ).first()

        # If the user selected a boarding point
        if first_seat and first_seat.from_stop:

            return first_seat.from_stop.stop_name

        # Fallback for older bookings
        return obj.schedule.route.source

    # ======================================================
    # SELECTED TO STOP
    # ======================================================

    def get_destination(self, obj):

        first_seat = obj.booked_seats.select_related(
            'to_stop'
        ).first()

        # If the user selected a dropping point
        if first_seat and first_seat.to_stop:

            return first_seat.to_stop.stop_name

        # Fallback for older bookings
        return obj.schedule.route.destination

    # ======================================================
    # SEATS
    # ======================================================

    def get_seats(self, obj):

        return [
            booked_seat.seat.seat_number
            for booked_seat in obj.booked_seats.all()
        ]

    # ======================================================
    # FINAL AMOUNT
    # ======================================================

    def get_final_amount(self, obj):

        # No convenience fee
        return obj.total_amount

    # ======================================================
    # META
    # ======================================================

    class Meta:

        model = Booking

        fields = [
            'id',
            'user',
            'username',
            'passenger_name',

            'schedule',

            # Selected boarding/dropping points
            'source',
            'destination',

            'bus_name',
            'bus_number',

            'seats',
            'booked_seats',

            'booking_date',
            'travel_date',

            'total_amount',
            'final_amount',

            'payment_status',
            'status'
        ]

        read_only_fields = [
            'id',
            'user',
            'booking_date',
            'total_amount',
            'final_amount',
            'status'
        ]