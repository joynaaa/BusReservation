
from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    NOTIFICATION_TYPES = [
        ('BOOKING', 'Booking'),
        ('PAYMENT', 'Payment'),
        ('TICKET', 'Ticket'),
        ('CANCELLATION', 'Cancellation'),
        ('REMINDER', 'Reminder'),
        ('GENERAL', 'General'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(
        max_length=200
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default='GENERAL'
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.username} - {self.title}"