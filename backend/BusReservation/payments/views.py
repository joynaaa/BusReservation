import uuid
import stripe

from django.conf import settings
from django.db import transaction

from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from bookings.models import Booking
from .models import Payment

from notifications.utils import create_notification


# ==========================================================
# STRIPE CONFIGURATION
# ==========================================================

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)

if not stripe.api_key:
    print("WARNING: STRIPE_SECRET_KEY is not configured.")


# ==========================================================
# CREATE STRIPE PAYMENT
# ==========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):

    # ======================================================
    # 1. GET BOOKING ID
    # ======================================================

    booking_id = request.data.get('booking')

    if not booking_id:

        return Response(
            {
                'error': 'Booking ID is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 2. GET USER'S BOOKING
    # ======================================================

    try:

        booking = Booking.objects.select_related(
            'user',
            'schedule',
            'schedule__bus',
            'schedule__route'
        ).get(
            id=booking_id,
            user=request.user
        )

    except Booking.DoesNotExist:

        return Response(
            {
                'error': 'Booking not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 3. CHECK BOOKING STATUS
    # ======================================================

    if booking.status == 'CANCELLED':

        return Response(
            {
                'error': 'This booking has been cancelled.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 4. PREVENT DUPLICATE PAYMENT
    # ======================================================

    if booking.payment_status == 'PAID':

        return Response(
            {
                'error': 'Payment already completed.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 5. GET AMOUNT FROM DATABASE
    # ======================================================

    total_amount = booking.total_amount

    if total_amount is None or total_amount <= 0:

        return Response(
            {
                'error': 'Invalid booking amount.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 6. CONVERT RUPEES TO PAISE
    # ======================================================

    stripe_amount = int(
        total_amount * 100
    )

    # ======================================================
    # DEBUG
    # ======================================================

    print("======================================")
    print("STRIPE PAYMENT")
    print("======================================")

    print("Booking ID:", booking.id)
    print("User:", request.user.username)
    print("Ticket Price:", total_amount)
    print("Stripe Amount:", stripe_amount)

    print("======================================")

    # ======================================================
    # 7. CHECK EXISTING PENDING STRIPE PAYMENT
    # ======================================================

    existing_payment = Payment.objects.filter(
        booking=booking,
        payment_method='STRIPE',
        payment_status='PENDING',
        stripe_payment_intent_id__isnull=False
    ).order_by('-payment_date').first()

    if existing_payment:

        try:

            existing_intent = stripe.PaymentIntent.retrieve(
                existing_payment.stripe_payment_intent_id
            )

            # Reuse an existing PaymentIntent if it is still usable.

            if existing_intent.status in [
                'requires_payment_method',
                'requires_confirmation',
                'requires_action'
            ]:

                print(
                    "Using existing Stripe PaymentIntent:",
                    existing_intent.id
                )

                existing_payment.stripe_status = (
                    existing_intent.status
                )

                existing_payment.save(
                    update_fields=[
                        'stripe_status'
                    ]
                )

                return Response(
                    {
                        'message':
                            'Existing Stripe payment found.',

                        'payment_id':
                            existing_payment.payment_id,

                        'booking_id':
                            booking.id,

                        'ticket_price':
                            str(total_amount),

                        'total_amount':
                            str(total_amount),

                        'payment_method':
                            'STRIPE',

                        'payment_status':
                            existing_payment.payment_status,

                        'stripe_payment_intent_id':
                            existing_intent.id,

                        'stripe_status':
                            existing_intent.status,

                        'client_secret':
                            existing_intent.client_secret
                    },
                    status=status.HTTP_200_OK
                )

        except stripe.error.StripeError as error:

            print(
                "Existing PaymentIntent could not be retrieved:",
                str(error)
            )

    # ======================================================
    # 8. CREATE NEW STRIPE PAYMENT INTENT
    # ======================================================

    try:

        payment_intent = stripe.PaymentIntent.create(

            amount=stripe_amount,

            currency='inr',

            automatic_payment_methods={
                'enabled': True
            },

            metadata={
                'booking_id': str(booking.id),
                'user_id': str(request.user.id),
            }
        )

    except stripe.error.StripeError as error:

        print("======================================")
        print("STRIPE ERROR")
        print("======================================")
        print("Stripe error type:", type(error).__name__)
        print("Stripe error message:", str(error))
        print("Stripe error code:", getattr(error, 'code', None))
        print("Stripe error param:", getattr(error, 'param', None))
        print("Stripe error request_id:", getattr(error, 'request_id', None))
        print("======================================")

        # Return the actual Stripe error details to Angular
        return Response(
            {
                'error': 'Unable to create Stripe payment.',
                'stripe_error': str(error),
                'stripe_error_type': type(error).__name__,
                'stripe_error_code': getattr(error, 'code', None),
                'stripe_error_param': getattr(error, 'param', None),
                'stripe_request_id': getattr(error, 'request_id', None),
            },
            status=status.HTTP_502_BAD_GATEWAY
        )

    # ======================================================
    # 9. GENERATE LOCAL PAYMENT ID
    # ======================================================

    payment_id = (
        f"PAY-{uuid.uuid4().hex[:10].upper()}"
    )

    # ======================================================
    # 10. CREATE LOCAL PAYMENT RECORD
    # ======================================================

    try:

        with transaction.atomic():

            payment = Payment.objects.create(

                payment_id=payment_id,

                booking=booking,

                amount=total_amount,

                payment_method='STRIPE',

                payment_status='PENDING',

                transaction_id=None,

                stripe_payment_intent_id=(
                    payment_intent.id
                ),

                stripe_status=(
                    payment_intent.status
                )
            )

    except Exception as error:

        print(
            "LOCAL PAYMENT CREATION ERROR:",
            str(error)
        )

        try:

            stripe.PaymentIntent.cancel(
                payment_intent.id
            )

        except Exception:

            pass

        return Response(
            {
                'error':
                    'Unable to create local payment record.'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # ======================================================
    # 11. RESPONSE TO ANGULAR
    # ======================================================

    return Response(
        {
            'message':
                'Stripe payment created.',

            'payment_id':
                payment.payment_id,

            'booking_id':
                booking.id,

            'ticket_price':
                str(total_amount),

            'total_amount':
                str(total_amount),

            'payment_method':
                'STRIPE',

            'payment_status':
                payment.payment_status,

            'stripe_payment_intent_id':
                payment_intent.id,

            'stripe_status':
                payment_intent.status,

            'client_secret':
                payment_intent.client_secret
        },
        status=status.HTTP_201_CREATED
    )


# ==========================================================
# VERIFY STRIPE PAYMENT
# ==========================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_stripe_payment(request):

    # ======================================================
    # 1. GET DATA
    # ======================================================

    booking_id = request.data.get('booking')

    payment_intent_id = request.data.get(
        'payment_intent_id'
    )

    if not booking_id:

        return Response(
            {
                'error': 'Booking ID is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if not payment_intent_id:

        return Response(
            {
                'error':
                    'Stripe PaymentIntent ID is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 2. GET USER'S BOOKING
    # ======================================================

    try:

        booking = Booking.objects.get(
            id=booking_id,
            user=request.user
        )

    except Booking.DoesNotExist:

        return Response(
            {
                'error': 'Booking not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 3. FIND LOCAL PAYMENT
    # ======================================================

    try:

        payment = Payment.objects.get(
            booking=booking,
            stripe_payment_intent_id=payment_intent_id
        )

    except Payment.DoesNotExist:

        return Response(
            {
                'error':
                    'Payment record not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # ======================================================
    # 4. GET PAYMENT INTENT FROM STRIPE
    # ======================================================

    try:

        payment_intent = stripe.PaymentIntent.retrieve(
            payment_intent_id
        )

    except stripe.error.StripeError as error:

        print("======================================")
        print("STRIPE VERIFICATION ERROR")
        print("======================================")
        print(str(error))
        print("======================================")

        return Response(
            {
                'error':
                    'Unable to verify Stripe payment.'
            },
            status=status.HTTP_502_BAD_GATEWAY
        )

    # ======================================================
    # 5. VERIFY PAYMENT BELONGS TO BOOKING
    # ======================================================

    try:

        stripe_booking_id = payment_intent.metadata[
            'booking_id'
        ]

    except (KeyError, TypeError, AttributeError):

        return Response(
            {
                'error':
                    'Stripe payment metadata is missing booking information.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if stripe_booking_id != str(booking.id):

        return Response(
            {
                'error':
                    'Payment does not belong to this booking.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 6. VERIFY PAYMENT AMOUNT
    # ======================================================

    expected_amount = int(
        booking.total_amount * 100
    )

    if payment_intent.amount != expected_amount:

        return Response(
            {
                'error':
                    'Payment amount does not match booking amount.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 7. VERIFY CURRENCY
    # ======================================================

    if payment_intent.currency.lower() != 'inr':

        return Response(
            {
                'error':
                    'Payment currency does not match booking currency.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # ======================================================
    # 8. GET STRIPE STATUS
    # ======================================================

    stripe_status = payment_intent.status

    print("======================================")
    print("STRIPE PAYMENT VERIFICATION")
    print("======================================")

    print(
        "Booking ID:",
        booking.id
    )

    print(
        "Payment ID:",
        payment.payment_id
    )

    print(
        "Payment Intent:",
        payment_intent.id
    )

    print(
        "Stripe Status:",
        stripe_status
    )

    print(
        "Stripe Amount:",
        payment_intent.amount
    )

    print(
        "Expected Amount:",
        expected_amount
    )

    print("======================================")

    # ======================================================
    # 9. PAYMENT SUCCESS
    # ======================================================

    if stripe_status == 'succeeded':

        with transaction.atomic():

            # ==============================================
            # UPDATE PAYMENT
            # ==============================================

            payment.payment_status = 'SUCCESS'

            payment.stripe_status = (
                stripe_status
            )

            payment.transaction_id = (
                payment_intent.id
            )

            payment.save(
                update_fields=[
                    'payment_status',
                    'stripe_status',
                    'transaction_id'
                ]
            )

            # ==============================================
            # UPDATE BOOKING
            # ==============================================

            booking.payment_status = 'PAID'

            booking.status = 'CONFIRMED'

            booking.save(
                update_fields=[
                    'payment_status',
                    'status'
                ]
            )

            # ==============================================
            # CREATE NOTIFICATION
            # ==============================================

            create_notification(

                user=booking.user,

                title='Payment Successful',

                message=(
                    f'Payment of ₹'
                    f'{booking.total_amount} '
                    f'for booking #'
                    f'{booking.id} '
                    f'was successful.'
                ),

                notification_type='PAYMENT'
            )

        # ==============================================
        # SUCCESS RESPONSE
        # ==============================================

        return Response(
            {
                'message':
                    'Payment verified successfully.',

                'payment_id':
                    payment.payment_id,

                'transaction_id':
                    payment.transaction_id,

                'booking_id':
                    booking.id,

                'ticket_price':
                    str(booking.total_amount),

                'total_amount':
                    str(booking.total_amount),

                'payment_method':
                    payment.payment_method,

                'payment_status':
                    payment.payment_status,

                'booking_status':
                    booking.status,

                'stripe_payment_intent_id':
                    payment.stripe_payment_intent_id,

                'stripe_status':
                    payment.stripe_status
            },
            status=status.HTTP_200_OK
        )

    # ======================================================
    # 10. PAYMENT PROCESSING
    # ======================================================

    if stripe_status in [
        'processing',
        'requires_action'
    ]:

        payment.stripe_status = (
            stripe_status
        )

        payment.save(
            update_fields=[
                'stripe_status'
            ]
        )

        return Response(
            {
                'message':
                    'Payment is still processing.',

                'payment_status':
                    'PENDING',

                'stripe_status':
                    stripe_status
            },
            status=status.HTTP_200_OK
        )

    # ======================================================
    # 11. PAYMENT FAILED
    # ======================================================

    payment.payment_status = 'FAILED'

    payment.stripe_status = (
        stripe_status
    )

    payment.save(
        update_fields=[
            'payment_status',
            'stripe_status'
        ]
    )

    return Response(
        {
            'error':
                'Stripe payment was not successful.',

            'payment_status':
                'FAILED',

            'stripe_status':
                stripe_status
        },
        status=status.HTTP_400_BAD_REQUEST
    )