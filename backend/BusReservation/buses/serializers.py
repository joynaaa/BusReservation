from rest_framework import serializers

from .models import (
    Bus,
    Route,
    RouteStop,
    Schedule,
    ScheduleOperatingDay,
    Seat,
    StopFare
)


class BusSerializer(serializers.ModelSerializer):

    vehicle_rc = serializers.FileField(required=False, allow_null=True)
    insurance_certificate = serializers.FileField(required=False, allow_null=True)
    fitness_certificate = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Bus
        fields = [
            'id',
            'bus_number',
            'bus_name',
            'bus_type',
            'total_seats',
            'seats_per_row',
            'vehicle_rc',
            'insurance_certificate',
            'fitness_certificate',
            'status',
            'rejection_reason',
            'is_active',
        ]
        read_only_fields = [
            'id',
            'status',
            'rejection_reason',
        ]


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['id', 'source', 'destination', 'distance', 'duration']
        read_only_fields = ['id']


class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = [
            'id', 'route', 'stop_name', 'stop_order',
            'arrival_time', 'departure_time',
            'is_boarding_point', 'is_dropping_point',
        ]
        read_only_fields = ['id', 'route']


class ScheduleOperatingDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleOperatingDay
        fields = ['id', 'schedule', 'day']
        read_only_fields = ['id', 'schedule']


class ScheduleSerializer(serializers.ModelSerializer):
    bus_name = serializers.CharField(source='bus.bus_name', read_only=True)
    bus_number = serializers.CharField(source='bus.bus_number', read_only=True)
    bus_type = serializers.CharField(source='bus.bus_type', read_only=True)
    source = serializers.CharField(source='route.source', read_only=True)
    destination = serializers.CharField(source='route.destination', read_only=True)
    route_name = serializers.SerializerMethodField()
    operating_days = ScheduleOperatingDaySerializer(many=True, read_only=True)

    class Meta:
        model = Schedule
        fields = [
            'id',
            'bus', 'bus_name', 'bus_number', 'bus_type',
            'route', 'route_name', 'source', 'destination',
            'is_active',
            'operating_days',
        ]
        read_only_fields = [
            'id', 'bus_name', 'bus_number', 'bus_type',
            'source', 'destination', 'route_name',
            'operating_days',
        ]

    def get_route_name(self, obj):
        if not obj.route:
            return ''
        return f'{obj.route.source} → {obj.route.destination}'


class StopFareSerializer(serializers.ModelSerializer):
    from_stop_name = serializers.CharField(source='from_stop.stop_name', read_only=True)
    to_stop_name = serializers.CharField(source='to_stop.stop_name', read_only=True)

    class Meta:
        model = StopFare
        fields = [
            'id', 'schedule',
            'from_stop', 'from_stop_name',
            'to_stop', 'to_stop_name',
            'fare',
        ]
        read_only_fields = ['id', 'schedule', 'from_stop_name', 'to_stop_name']


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'bus', 'seat_number', 'seat_type']
        read_only_fields = ['id']
