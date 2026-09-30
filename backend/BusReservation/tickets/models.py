from django.db import models
from django.contrib.auth.models import User
from bookings.models import Booking


class Ticket(models.Model):

    ticket_id = models.CharField(
        max_length=50,
        unique=True
    )

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name='ticket'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    passenger_name = models.CharField(
        max_length=100
    )

    seat_numbers = models.CharField(
        max_length=200
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    qr_code = models.ImageField(
        upload_to='qr_codes/',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.ticket_id