from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Schedule, Seat
from bookings.models import BookedSeat
from users.permissions import IsOperator


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_seats(request):

    schedule_id = request.GET.get('schedule_id')

    if not schedule_id:
        return Response(
            {'error': 'schedule_id is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        schedule = Schedule.objects.select_related('bus').get(
            id=schedule_id,
            bus__operator=request.user
        )
    except Schedule.DoesNotExist:
        return Response(
            {'error': 'Schedule not found or does not belong to you.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all seats belonging to this bus
    seats = Seat.objects.filter(
        bus=schedule.bus
    ).order_by('id')

    # Get seats booked for THIS schedule
    booked_seat_ids = set(
        BookedSeat.objects.filter(
            schedule=schedule,
            booking__status='CONFIRMED'
        ).values_list('seat_id', flat=True)
    )

    seat_data = []

    for seat in seats:

        if seat.id in booked_seat_ids:
            seat_status = 'BOOKED'
        else:
            seat_status = 'AVAILABLE'

        seat_data.append({
            'id': seat.id,
            'seat_number': seat.seat_number,
            'seat_type': seat.seat_type,
            'status': seat_status
        })

    return Response(seat_data, status=status.HTTP_200_OK)