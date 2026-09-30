from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Booking
from payments.models import Payment
from users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_reports(request):

    # --------------------------------
    # 1. DAILY BOOKINGS
    # --------------------------------

    daily_bookings = (
        Booking.objects
        .filter(status='CONFIRMED')
        .annotate(date=TruncDate('booking_date'))
        .values('date')
        .annotate(total=Count('id'))
        .order_by('-date')
    )

    daily_data = [
        {
            'date': item['date'],
            'bookings': item['total']
        }
        for item in daily_bookings
    ]


    # --------------------------------
    # 2. MONTHLY BOOKINGS
    # --------------------------------

    monthly_bookings = (
        Booking.objects
        .filter(status='CONFIRMED')
        .annotate(month=TruncMonth('booking_date'))
        .values('month')
        .annotate(total=Count('id'))
        .order_by('-month')
    )

    monthly_data = [
        {
            'month': item['month'],
            'bookings': item['total']
        }
        for item in monthly_bookings
    ]


    # --------------------------------
    # 3. REVENUE
    # --------------------------------

    revenue = (
        Payment.objects
        .filter(status='SUCCESS')
        .aggregate(total=Sum('amount'))
    )

    total_revenue = revenue['total'] or 0


    # --------------------------------
    # 4. POPULAR ROUTES
    # --------------------------------

    popular_routes = (
        Booking.objects
        .filter(status='CONFIRMED')
        .values(
            'schedule__route__source',
            'schedule__route__destination'
        )
        .annotate(total=Count('id'))
        .order_by('-total')[:10]
    )

    route_data = [
        {
            'source': item['schedule__route__source'],
            'destination': item['schedule__route__destination'],
            'bookings': item['total']
        }
        for item in popular_routes
    ]


    # --------------------------------
    # 5. MOST BOOKED BUSES
    # --------------------------------

    popular_buses = (
        Booking.objects
        .filter(status='CONFIRMED')
        .values(
            'schedule__bus__id',
            'schedule__bus__bus_name',
            'schedule__bus__bus_number'
        )
        .annotate(total=Count('id'))
        .order_by('-total')[:10]
    )

    bus_data = [
        {
            'id': item['schedule__bus__id'],
            'bus_name': item['schedule__bus__bus_name'],
            'bus_number': item['schedule__bus__bus_number'],
            'bookings': item['total']
        }
        for item in popular_buses
    ]


    # --------------------------------
    # 6. OPERATOR PERFORMANCE
    # --------------------------------

    operator_performance = (
        Booking.objects
        .filter(
            status='CONFIRMED',
            schedule__bus__operator__isnull=False
        )
        .values(
            'schedule__bus__operator__id',
            'schedule__bus__operator__username'
        )
        .annotate(
            total_bookings=Count('id'),
            total_revenue=Sum('total_amount')
        )
        .order_by('-total_bookings')
    )

    operator_data = [
        {
            'operator_id': item['schedule__bus__operator__id'],
            'operator': item['schedule__bus__operator__username'],
            'bookings': item['total_bookings'],
            'revenue': item['total_revenue'] or 0
        }
        for item in operator_performance
    ]


    # --------------------------------
    # FINAL RESPONSE
    # --------------------------------

    return Response({

        'total_bookings': Booking.objects.filter(
            status='CONFIRMED'
        ).count(),

        'total_revenue': total_revenue,

        'daily_bookings': daily_data,

        'monthly_bookings': monthly_data,

        'popular_routes': route_data,

        'popular_buses': bus_data,

        'operator_performance': operator_data

    })