from django.db import models
from bookings.models import Booking


class Payment(models.Model):

    PAYMENT_METHODS = [
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('NET_BANKING', 'Net Banking'),
        ('CASH', 'Cash'),
        ('STRIPE', 'Stripe'),
    ]

    PAYMENT_STATUS = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]

    payment_id = models.CharField(
        max_length=100,
        unique=True
    )

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='payments'
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='PENDING'
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )

    # Stripe PaymentIntent ID
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True
    )

    # Stripe payment status/details if needed
    stripe_status = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    payment_date = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.payment_id 