from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer
from users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_bookings(request):

    bookings = Booking.objects.select_related(
        'user',
        'schedule',
        'schedule__bus',
        'schedule__route'
    ).prefetch_related(
        'booked_seats__seat'
    ).all().order_by('-id')

    serializer = BookingSerializer(
        bookings,
        many=True
    )

    return Response(serializer.data)