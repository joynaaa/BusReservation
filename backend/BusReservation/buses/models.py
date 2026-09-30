from django.db import models
from django.contrib.auth.models import User


# ============================================================
# BUS
# ============================================================
# ============================================================
# BUS
# ============================================================

class Bus(models.Model):

    BUS_TYPES = [
        ('AC', 'AC'),
        ('NON_AC', 'Non AC'),
        ('SLEEPER', 'Sleeper'),
        ('SEATER', 'Seater'),
    ]

    SEAT_LAYOUT_CHOICES = [
        ('3', '3 Seats Per Row'),
        ('4', '4 Seats Per Row'),
        ('5', '5 Seats Per Row'),
    ]

    BUS_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    operator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='operator_buses',
        null=True,
        blank=True
    )

    bus_number = models.CharField(
        max_length=20,
        unique=True
    )

    bus_name = models.CharField(
        max_length=100
    )

    bus_type = models.CharField(
        max_length=20,
        choices=BUS_TYPES
    )

    total_seats = models.IntegerField()

    seats_per_row = models.CharField(
        max_length=1,
        choices=SEAT_LAYOUT_CHOICES,
        default='4'
    )

    # ========================================================
    # VEHICLE DOCUMENTS
    # ========================================================

    vehicle_rc = models.FileField(
        upload_to='bus_documents/rc/',
        null=True,
        blank=True
    )

    insurance_certificate = models.FileField(
        upload_to='bus_documents/insurance/',
        null=True,
        blank=True
    )

    fitness_certificate = models.FileField(
        upload_to='bus_documents/fitness/',
        null=True,
        blank=True
    )

    # ========================================================
    # ADMIN APPROVAL
    # ========================================================

    status = models.CharField(
        max_length=20,
        choices=BUS_STATUS_CHOICES,
        default='PENDING'
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True
    )

    # ========================================================
    # ACTIVE / INACTIVE
    # ========================================================

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.bus_name} ({self.bus_number})"
# ============================================================
# ROUTE
# ============================================================

class Route(models.Model):

    operator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='operator_routes',
        null=True,
        blank=True
    )

    source = models.CharField(
        max_length=100
    )

    destination = models.CharField(
        max_length=100
    )

    distance = models.FloatField()

    duration = models.CharField(
        max_length=50
    )

    def __str__(self):
        return f"{self.source} → {self.destination}"


# ============================================================
# ROUTE STOP
# ============================================================

class RouteStop(models.Model):

    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='stops'
    )

    stop_name = models.CharField(
        max_length=100
    )

    stop_order = models.PositiveIntegerField()

    arrival_time = models.TimeField(
        null=True,
        blank=True
    )

    departure_time = models.TimeField(
        null=True,
        blank=True
    )

    is_boarding_point = models.BooleanField(
        default=True
    )

    is_dropping_point = models.BooleanField(
        default=True
    )

    def __str__(self):
        return (
            f"{self.route} - "
            f"{self.stop_order} - "
            f"{self.stop_name}"
        )

    class Meta:
        ordering = ['stop_order']

        constraints = [
            models.UniqueConstraint(
                fields=['route', 'stop_order'],
                name='unique_route_stop_order'
            )
        ]


# ============================================================
# SCHEDULE
# ============================================================

class Schedule(models.Model):

    bus = models.ForeignKey(
        Bus,
        on_delete=models.CASCADE,
        related_name='schedules'
    )

    route = models.ForeignKey(
        Route,
        on_delete=models.CASCADE,
        related_name='schedules'
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.bus} - {self.route}"


# ============================================================
# SCHEDULE OPERATING DAY
# ============================================================

class ScheduleOperatingDay(models.Model):

    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='operating_days'
    )

    day = models.CharField(
        max_length=10,
        choices=DAY_CHOICES
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['schedule', 'day'],
                name='unique_schedule_operating_day'
            )
        ]

    def __str__(self):
        return f"Schedule {self.schedule.id} - {self.day}"


# ============================================================
# STOP FARE
# ============================================================

class StopFare(models.Model):

    schedule = models.ForeignKey(
        Schedule,
        on_delete=models.CASCADE,
        related_name='stop_fares'
    )

    from_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.CASCADE,
        related_name='departure_fares'
    )

    to_stop = models.ForeignKey(
        RouteStop,
        on_delete=models.CASCADE,
        related_name='arrival_fares'
    )

    fare = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'schedule',
                    'from_stop',
                    'to_stop'
                ],
                name='unique_schedule_stop_fare'
            )
        ]

    def __str__(self):
        return (
            f"{self.schedule} - "
            f"{self.from_stop.stop_name} → "
            f"{self.to_stop.stop_name} - "
            f"₹{self.fare}"
        )


# ============================================================
# SEAT
# ============================================================

class Seat(models.Model):

    SEAT_TYPES = [
        ('WINDOW', 'Window'),
        ('AISLE', 'Aisle'),
    ]

    bus = models.ForeignKey(
        Bus,
        on_delete=models.CASCADE,
        related_name='seats'
    )

    seat_number = models.CharField(
        max_length=10
    )

    seat_type = models.CharField(
        max_length=20,
        choices=SEAT_TYPES
    )

    def __str__(self):
        return (
            f"{self.bus.bus_name} - "
            f"Seat {self.seat_number}"
        )


# ============================================================
# CITY
# ============================================================

class City(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.name