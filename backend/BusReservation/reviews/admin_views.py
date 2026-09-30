from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Review
from users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_reviews(request):

    reviews = Review.objects.select_related(
        'user',
        'booking',
        'booking__schedule',
        'booking__schedule__bus'
    ).all().order_by('-id')

    data = []

    for review in reviews:
        data.append({
            'id': review.id,
            'username': review.user.username,
            'bus_name': review.booking.schedule.bus.bus_name,
            'bus_number': review.booking.schedule.bus.bus_number,
            'rating': review.rating,
            'comment': review.comment,
            'created_at': review.created_at,
        })

    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_delete_review(request, review_id):

    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response(
            {'error': 'Review not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    review.delete()

    return Response({
        'message': 'Review deleted successfully.'
    })