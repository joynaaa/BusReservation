from django.urls import path

from .views import (
    create_payment,
    verify_stripe_payment,
)


urlpatterns = [

    # Create Stripe PaymentIntent
    path(
        'stripe/create/',
        create_payment,
        name='create-stripe-payment'
    ),

    # Verify Stripe payment after successful payment
    path(
        'stripe/verify/',
        verify_stripe_payment,
        name='verify-stripe-payment'
    ),

]