from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):

    # =========================================================
    # ROLE
    # =========================================================

    ROLE_CHOICES = [
        ('USER', 'User'),
        ('OPERATOR', 'Bus Operator'),
        ('ADMIN', 'Admin'),
    ]


    # =========================================================
    # ACCOUNT STATUS
    # =========================================================

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]


    # =========================================================
    # OPERATOR TYPE
    # =========================================================

    OPERATOR_TYPE_CHOICES = [
        ('INDIVIDUAL', 'Individual Operator'),
        ('AGENCY', 'Travel Agency'),
        ('COMPANY', 'Bus Company'),
    ]


    # =========================================================
    # USER
    # =========================================================

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )


    # =========================================================
    # BASIC USER DETAILS
    # =========================================================

    full_name = models.CharField(
        max_length=100,
        blank=True
    )

    phone = models.CharField(
        max_length=15,
        blank=True
    )

    address = models.TextField(
        blank=True
    )


    # =========================================================
    # ROLE & STATUS
    # =========================================================

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='USER'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='APPROVED'
    )


    # =========================================================
    # OPERATOR DETAILS
    # =========================================================

    company_name = models.CharField(
        max_length=150,
        blank=True
    )

    operator_type = models.CharField(
        max_length=20,
        choices=OPERATOR_TYPE_CHOICES,
        blank=True
    )

    business_phone = models.CharField(
        max_length=15,
        blank=True
    )

    business_email = models.EmailField(
        blank=True
    )


    # =========================================================
    # BUSINESS ADDRESS
    # =========================================================

    city = models.CharField(
        max_length=100,
        blank=True
    )

    state = models.CharField(
        max_length=100,
        blank=True
    )

    pin_code = models.CharField(
        max_length=10,
        blank=True
    )


    # =========================================================
    # OPERATOR INFORMATION
    # =========================================================

    number_of_buses = models.PositiveIntegerField(
        default=1
    )

    years_of_experience = models.PositiveIntegerField(
        default=0
    )


    # =========================================================
    # OPERATOR VERIFICATION DOCUMENTS
    # =========================================================

    government_id = models.FileField(
        upload_to='operator_documents/government_id/',
        blank=True,
        null=True
    )

    business_registration = models.FileField(
        upload_to='operator_documents/business_registration/',
        blank=True,
        null=True
    )

    transport_permit = models.FileField(
        upload_to='operator_documents/transport_permit/',
        blank=True,
        null=True
    )


    # =========================================================
    # STRING REPRESENTATION
    # =========================================================

    def __str__(self):

        return self.user.username