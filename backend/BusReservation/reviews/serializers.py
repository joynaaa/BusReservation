from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    bus_name = serializers.CharField(
        source='booking.schedule.bus.bus_name',
        read_only=True
    )

    bus_number = serializers.CharField(
        source='booking.schedule.bus.bus_number',
        read_only=True
    )

    source = serializers.CharField(
        source='booking.schedule.route.source',
        read_only=True
    )

    destination = serializers.CharField(
        source='booking.schedule.route.destination',
        read_only=True
    )

    class Meta:
        model = Review

        fields = [
            'id',
            'user',
            'username',
            'booking',

            'bus_name',
            'bus_number',

            'source',
            'destination',

            'rating',
            'comment',
            'created_at'
        ]

        read_only_fields = [
            'user',
            'username',
            'bus_name',
            'bus_number',
            'source',
            'destination',
            'created_at'
        ]