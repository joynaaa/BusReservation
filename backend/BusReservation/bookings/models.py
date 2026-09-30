from django.db import models
from django.contrib.auth.models import User
from buses.models import Schedule, Seat, RouteStop


class Booking(models.Model):
    STATUS_CHOICES = [
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
   # IMPORTANT
    travel_date = models.DateField()

    booking_date = models.DateTimeField(auto_now_add=True)

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

   
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default='PENDING'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='CONFIRMED'
    )

    def __str__(self):
        return f"Booking {self.id}"


class BookedSeat(models.Model):

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name='booked_seats'
    )

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE
    )

    seat = models.ForeignKey(
        Seat,
        on_delete=models.CASCADE
    )

    # Journey segment
    from_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booked_from_segments'
    )

    to_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='booked_to_segments'
    )

    passenger_name = models.CharField(max_length=100)

    passenger_age = models.IntegerField()

    passenger_gender = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.seat.seat_number} - {self.passenger_name}"


class SeatHold(models.Model):

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE
    )

    seat = models.ForeignKey(
        Seat,
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    # Journey segment
    from_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hold_from_segments'
    )

    to_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='hold_to_segments'
    )
# IMPORTANT
    travel_date = models.DateField()
    held_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField()

    def __str__(self):
        return f"{self.seat.seat_number} - Hold"