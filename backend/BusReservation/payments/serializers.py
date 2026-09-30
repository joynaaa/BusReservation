from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    booking_id = serializers.IntegerField(
        source='booking.id',
        read_only=True
    )

    username = serializers.CharField(
        source='booking.user.username',
        read_only=True
    )

    class Meta:

        model = Payment

        fields = [
            'id',
            'payment_id',
            'booking_id',
            'username',
            'amount',
            'payment_method',
            'transaction_id',
            'payment_status',
            'payment_date'
        ]

        read_only_fields = [
            'id',
            'payment_id',
            'booking_id',
            'username',
            'amount',
            'transaction_id',
            'payment_status',
            'payment_date'
        ]