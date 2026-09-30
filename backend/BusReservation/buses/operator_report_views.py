from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from bookings.models import Booking


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def operator_reports(request):

    # =====================================================
    # GET ONLY BOOKINGS FOR LOGGED-IN OPERATOR'S BUSES
    # =====================================================

    bookings = Booking.objects.filter(
        schedule__bus__operator=request.user
    )


    # =====================================================
    # TOTAL BOOKINGS
    # =====================================================

    total_bookings = bookings.count()


    # =====================================================
    # TOTAL REVENUE
    # =====================================================

    total_revenue = (
        bookings
        .filter(payment_status='PAID')
        .aggregate(
            total=Sum('total_amount')
        )['total']
        or 0
    )


    # =====================================================
    # POPULAR BUSES
    # =====================================================

    popular_buses = (
        bookings
        .values(
            'schedule__bus__id',
            'schedule__bus__bus_name',
            'schedule__bus__bus_number'
        )
        .annotate(
            booking_count=Count('id')
        )
        .order_by('-booking_count')
    )


    # =====================================================
    # POPULAR ROUTES
    # =====================================================

    popular_routes = (
        bookings
        .values(
            'schedule__route__id',
            'schedule__route__source',
            'schedule__route__destination'
        )
        .annotate(
            booking_count=Count('id')
        )
        .order_by('-booking_count')
    )


    # =====================================================
    # DAILY BOOKINGS
    # =====================================================

    daily_bookings = (
        bookings
        .annotate(
            day=TruncDate('booking_date')
        )
        .values('day')
        .annotate(
            booking_count=Count('id')
        )
        .order_by('-day')
    )


    # =====================================================
    # MONTHLY BOOKINGS
    # =====================================================

    monthly_bookings = (
        bookings
        .annotate(
            month=TruncMonth('booking_date')
        )
        .values('month')
        .annotate(
            booking_count=Count('id')
        )
        .order_by('-month')
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return Response({

        'total_bookings': total_bookings,

        'total_revenue': float(total_revenue),

        'popular_buses': list(
            popular_buses
        ),

        'popular_routes': list(
            popular_routes
        ),

        'daily_bookings': list(
            daily_bookings
        ),

        'monthly_bookings': list(
            monthly_bookings
        )

    })