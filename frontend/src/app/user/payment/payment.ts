import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement
} from '@stripe/stripe-js';

import { PaymentService } from '../../core/services/payment';


@Component({
  selector: 'app-payment',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './payment.html',

  styleUrl: './payment.css'
})


export class PaymentComponent
  implements OnInit, AfterViewInit, OnDestroy {


  // =====================================================
  // STRIPE
  // =====================================================

  private stripe: Stripe | null = null;

  private elements: StripeElements | null = null;

  private cardElement: StripeCardElement | null = null;


  // =====================================================
  // BOOKING
  // =====================================================

  bookingId!: number;


  // =====================================================
  // TRAVEL DETAILS
  // =====================================================

  fromStop = '';

  toStop = '';

  fromStopId = 0;

  toStopId = 0;


  // =====================================================
  // FARE
  // =====================================================

  ticketPrice = 0;

  totalAmount = 0;


  // =====================================================
  // PAYMENT
  // =====================================================

  paymentMethod = 'CARD';

  processing = false;

  stripeError = '';

  errorMessage = '';

  paymentSuccess = false;


  // =====================================================
  // STRIPE PAYMENT INTENT
  // =====================================================

  clientSecret = '';

  paymentIntentId = '';


  // =====================================================
  // CONSTRUCTOR
  // =====================================================

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      // -------------------------------------------------
      // BOOKING
      // -------------------------------------------------

      this.bookingId =
        Number(params['booking']) || 0;


      // -------------------------------------------------
      // STOPS
      // -------------------------------------------------

      this.fromStop =
        params['from_stop_name'] || '';

      this.toStop =
        params['to_stop_name'] || '';


      this.fromStopId =
        Number(params['from_stop']) || 0;

      this.toStopId =
        Number(params['to_stop']) || 0;


      // -------------------------------------------------
      // FARE
      // -------------------------------------------------

      this.ticketPrice =
        Number(params['amount']) || 0;

      this.totalAmount =
        this.ticketPrice;


      // -------------------------------------------------
      // DEBUG
      // -------------------------------------------------

      console.log(
        '================ PAYMENT ================'
      );

      console.log(
        'Booking ID:',
        this.bookingId
      );

      console.log(
        'From Stop:',
        this.fromStop,
        this.fromStopId
      );

      console.log(
        'To Stop:',
        this.toStop,
        this.toStopId
      );

      console.log(
        'Ticket Price:',
        this.ticketPrice
      );

      console.log(
        'Total Amount:',
        this.totalAmount
      );

    });

  }


  // =====================================================
  // AFTER VIEW INIT
  // =====================================================

  async ngAfterViewInit(): Promise<void> {

    await this.initializeStripe();

  }


  // =====================================================
  // INITIALIZE STRIPE
  // =====================================================

  async initializeStripe(): Promise<void> {

    try {

      this.stripe = await loadStripe(

        'pk_test_51UKdbyKCoA7eDoQYdunCWSG0RtnDupN8pe3IZgO7ct1iuRHBWtWwW6h9d431TIZd8AMbVTiHWhYIgCNocAeD17FC006ztWU5ET'

      );


      if (!this.stripe) {

        this.stripeError =
          'Unable to initialize Stripe.';

        console.error(
          'Stripe initialization failed.'
        );

        return;

      }


      // =================================================
      // STRIPE ELEMENTS
      // =================================================

      this.elements =
        this.stripe.elements();


      // =================================================
      // CARD ELEMENT
      // =================================================

      this.cardElement =
        this.elements.create(
          'card',
          {
            style: {

              base: {

                fontSize: '16px',

                color: '#32325d',

                fontFamily:
                  'Segoe UI, Arial, sans-serif',

                '::placeholder': {
                  color: '#aab7c4'
                }

              },

              invalid: {

                color: '#dc3545'

              }

            }

          }
        );


      // =================================================
      // MOUNT CARD
      // =================================================

      const cardContainer =
        document.getElementById(
          'card-element'
        );


      if (!cardContainer) {

        console.log(
          'Card element container not available yet.'
        );

        return;

      }


      this.cardElement.mount(
        '#card-element'
      );


      // =================================================
      // CARD CHANGE
      // =================================================

      this.cardElement.on(
        'change',
        (event) => {

          if (event.error) {

            this.stripeError =
              event.error.message;

          } else {

            this.stripeError = '';

          }

        }
      );


      console.log(
        'Stripe initialized successfully.'
      );

    }

    catch (error) {

      console.error(
        'Stripe initialization error:',
        error
      );

      this.stripeError =
        'Unable to initialize Stripe.';

    }

  }


  // =====================================================
  // CHANGE PAYMENT METHOD
  // =====================================================

  selectPaymentMethod(
    method: string
  ): void {

    if (this.processing) {

      return;

    }


    this.paymentMethod = method;

    this.errorMessage = '';

    this.stripeError = '';


    console.log(
      'Selected payment method:',
      method
    );

  }


  // =====================================================
  // PAY NOW
  // =====================================================

  async payNow(): Promise<void> {

    // ===================================================
    // BOOKING VALIDATION
    // ===================================================

    if (!this.bookingId) {

      this.errorMessage =
        'Booking ID is missing.';

      return;

    }


    // ===================================================
    // PAYMENT METHOD
    // ===================================================

    if (
      this.paymentMethod !== 'CARD'
    ) {

      this.errorMessage =
        `${this.getPaymentMethodName()} is currently available as a payment option, but Stripe processing is currently configured for card payments. Please select Credit / Debit Card.`;

      return;

    }


    // ===================================================
    // STRIPE VALIDATION
    // ===================================================

    if (!this.stripe) {

      this.errorMessage =
        'Stripe is not initialized. Please refresh the page.';

      return;

    }


    if (!this.cardElement) {

      this.errorMessage =
        'Card payment form is not ready.';

      return;

    }


    // ===================================================
    // PREVENT MULTIPLE CLICKS
    // ===================================================

    if (this.processing) {

      return;

    }


    this.processing = true;

    this.errorMessage = '';

    this.stripeError = '';


    // ===================================================
    // CREATE PAYMENT INTENT
    // ===================================================

    this.paymentService
      .makePayment(
        this.bookingId,
        'STRIPE'
      )
      .subscribe({

        next: async (response) => {

          console.log(
            'STRIPE CREATE PAYMENT RESPONSE:',
            response
          );


          this.clientSecret =
            response.client_secret;


          this.paymentIntentId =
            response.stripe_payment_intent_id;


          if (!this.clientSecret) {

            this.processing = false;

            this.errorMessage =
              'Stripe client secret was not returned.';

            return;

          }


          // =============================================
          // CONFIRM STRIPE PAYMENT
          // =============================================

          await this.confirmStripePayment();

        },


        error: (error) => {

          console.error(
            'CREATE STRIPE PAYMENT ERROR:',
            error
          );

          this.processing = false;

          this.handlePaymentError(
            error
          );

        }

      });

  }


  // =====================================================
  // CONFIRM STRIPE PAYMENT
  // =====================================================

  async confirmStripePayment(): Promise<void> {

    if (!this.stripe) {

      this.processing = false;

      return;

    }


    if (!this.cardElement) {

      this.processing = false;

      return;

    }


    try {

      console.log(
        'Confirming Stripe payment...'
      );


      const result =
        await this.stripe.confirmCardPayment(

          this.clientSecret,

          {

            payment_method: {

              card:
                this.cardElement

            }

          }

        );


      // =================================================
      // STRIPE ERROR
      // =================================================

      if (result.error) {

        console.error(
          'STRIPE PAYMENT ERROR:',
          result.error
        );


        this.processing = false;

        // Show the actual Stripe error to the user and log
        // useful diagnostic information in the browser console.
        console.error('Stripe error type:', result.error.type);
        console.error('Stripe error code:', result.error.code);
        console.error('Stripe decline code:', result.error.decline_code);
        console.error('Stripe error message:', result.error.message);

        this.stripeError =
          result.error.message ||
          'Payment failed. Please check your test card details and try again.';

        this.processing = false;
        return;

      }


      // =================================================
      // PAYMENT INTENT
      // =================================================

      const paymentIntent =
        result.paymentIntent;


      console.log(
        'STRIPE PAYMENT INTENT:',
        paymentIntent
      );


      // =================================================
      // PAYMENT SUCCESS
      // =================================================

      if (
        paymentIntent &&
        paymentIntent.status === 'succeeded'
      ) {

        console.log(
          'Stripe payment succeeded.'
        );


        this.verifyPayment(
          paymentIntent.id
        );

        return;

      }


      // =================================================
      // OTHER STATUS
      // =================================================

      this.processing = false;

      this.errorMessage =
        `Payment was not completed. Stripe returned status: ${paymentIntent?.status || 'unknown'}.`;

    }

    catch (error) {

      console.error(
        'STRIPE CONFIRMATION ERROR:',
        error
      );


      this.processing = false;

      this.errorMessage =
        (error as any)?.message ||
        'Unable to confirm payment. Please check your Stripe test card and try again.';

    }

  }


  // =====================================================
  // VERIFY PAYMENT WITH DJANGO
  // =====================================================

  verifyPayment(
    paymentIntentId: string
  ): void {

    console.log(
      'Verifying payment with Django:',
      paymentIntentId
    );


    this.paymentService
      .verifyStripePayment(
        this.bookingId,
        paymentIntentId
      )
      .subscribe({

        // ===============================================
        // SUCCESS
        // ===============================================

        next: (response) => {

          console.log(
            'PAYMENT VERIFICATION RESPONSE:',
            response
          );


          this.processing = false;

          this.paymentSuccess = true;


          // ---------------------------------------------
          // Navigate to ticket after short delay
          // ---------------------------------------------

          setTimeout(() => {

            this.router.navigate(
              ['/ticket'],
              {
                queryParams: {

                  booking:
                    this.bookingId,

                  generate:
                    'true'

                }

              }
            );

          }, 1200);

        },


        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          console.error(
            'PAYMENT VERIFICATION ERROR:',
            error
          );


          this.processing = false;

          this.handlePaymentError(
            error
          );

        }

      });

  }


  // =====================================================
  // PAYMENT METHOD NAME
  // =====================================================

  getPaymentMethodName(): string {

    switch (this.paymentMethod) {

      case 'UPI':
        return 'UPI';

      case 'CARD':
        return 'Credit / Debit Card';

      case 'NETBANKING':
        return 'Net Banking';

      case 'WALLET':
        return 'Wallet';

      default:
        return 'Payment';

    }

  }


  // =====================================================
  // HANDLE PAYMENT ERROR
  // =====================================================

  handlePaymentError(
    error: any
  ): void {

    let message =
      error?.error?.error ||
      error?.error?.detail ||
      error?.error?.message ||
      'Payment failed. Please try again.';


    if (
      error?.status === 401
    ) {

      message =
        'Your login session has expired. Please login again.';

    }


    if (
      error?.status === 404
    ) {

      message =
        'Booking or payment service was not found.';

    }


    if (
      error?.status === 429
    ) {

      message =
        'Payment service is temporarily unavailable. Please try again later.';

    }


    this.errorMessage =
      message;

  }


  // =====================================================
  // CLEANUP
  // =====================================================

  ngOnDestroy(): void {

    if (this.cardElement) {

      this.cardElement.destroy();

    }

  }

}