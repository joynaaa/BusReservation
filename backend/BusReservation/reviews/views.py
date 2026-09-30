
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from bookings.models import Booking
from .models import Review
from .serializers import ReviewSerializer


# ==========================================
# GET ALL REVIEWS
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def review_list(request):

    reviews = Review.objects.all().order_by('-created_at')

    serializer = ReviewSerializer(
        reviews,
        many=True
    )

    return Response(serializer.data)


# ==========================================
# CREATE REVIEW
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):

    booking_id = request.data.get('booking')
    rating = request.data.get('rating')
    comment = request.data.get('comment', '')


    # ------------------------------------------
    # CHECK BOOKING ID
    # ------------------------------------------

    if not booking_id:

        return Response(
            {
                'error': 'Booking ID is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ------------------------------------------
    # CHECK RATING
    # ------------------------------------------

    if rating is None:

        return Response(
            {
                'error': 'Rating is required.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    try:

        rating = int(rating)

    except (ValueError, TypeError):

        return Response(
            {
                'error': 'Rating must be a number.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    if rating < 1 or rating > 5:

        return Response(
            {
                'error': 'Rating must be between 1 and 5.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ------------------------------------------
    # FIND BOOKING
    # ------------------------------------------

    try:

        booking = Booking.objects.select_related(
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
                'error':
                'Booking not found or you do not own this booking.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    # ------------------------------------------
    # CHECK BOOKING STATUS
    # ------------------------------------------

    if booking.status == 'CANCELLED':

        return Response(
            {
                'error':
                'Cancelled bookings cannot be reviewed.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ------------------------------------------
    # CHECK DUPLICATE REVIEW
    # ------------------------------------------

    if Review.objects.filter(
        booking=booking
    ).exists():

        return Response(
            {
                'error':
                'Review already exists for this booking.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ------------------------------------------
    # CHECK PAYMENT
    # ------------------------------------------

    payment = booking.payments.filter(
        payment_status='SUCCESS'
    ).order_by('-payment_date').first()


    if not payment:

        return Response(
            {
                'error':
                'Payment not found for this booking.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ------------------------------------------
    # CHECK BOOKING PAYMENT STATUS
    # ------------------------------------------

    if booking.payment_status != 'PAID':

        return Response(
            {
                'error':
                'Please complete payment before reviewing.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # ------------------------------------------
    # CREATE REVIEW
    # ------------------------------------------

    review = Review.objects.create(
        user=request.user,
        booking=booking,
        rating=rating,
        comment=comment.strip()
    )


    # ------------------------------------------
    # RETURN RESPONSE
    # ------------------------------------------

    serializer = ReviewSerializer(review)

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED
    )


# ==========================================
# GET REVIEWS FOR A BUS
# ==========================================

@api_view(['GET'])
@permission_classes([AllowAny])
def bus_reviews(request, bus_id):

    reviews = Review.objects.filter(
        booking__schedule__bus_id=bus_id
    ).select_related(
        'user',
        'booking__schedule__bus',
        'booking__schedule__route'
    ).order_by('-created_at')


    serializer = ReviewSerializer(
        reviews,
        many=True
    )


    return Response(serializer.data)
