from django.db.models import Sum
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from buses.models import Bus, Schedule
from bookings.models import Booking
from payments.models import Payment

from users.permissions import IsOperator


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsOperator])
def operator_dashboard(request):

    operator = request.user

    # Total buses belonging to this operator
    total_buses = Bus.objects.filter(
        operator=operator
    ).count()

    # Total schedules for this operator's buses
    total_schedules = Schedule.objects.filter(
        bus__operator=operator
    ).count()

    # Today's bookings
    today = timezone.localdate()

    todays_bookings = Booking.objects.filter(
        schedule__bus__operator=operator,
        booking_date__date=today,
        status='CONFIRMED'
    ).count()

    # Revenue from successful payments
    revenue = Payment.objects.filter(
        booking__user=request.user,
        payment_status='SUCCESS'
    ).aggregate(
        total=Sum('amount')
    )

    total_revenue = revenue['total'] or 0

    return Response({
        'total_buses': total_buses,
        'total_schedules': total_schedules,
        'todays_bookings': todays_bookings,
        'revenue': total_revenue
    })