from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth

from bookings.models import Booking

from users.permissions import IsAdmin


# ==========================================
# ADMIN REPORTS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_reports(request):

    # ==========================================
    # ALL BOOKINGS
    # ==========================================

    bookings = Booking.objects.select_related(
        'user',
        'schedule',
        'schedule__bus',
        'schedule__bus__operator',
        'schedule__route'
    )


    # ==========================================
    # TOTAL BOOKINGS
    # ==========================================

    total_bookings = bookings.count()


    # ==========================================
    # TOTAL REVENUE
    # ONLY PAID BOOKINGS
    # ==========================================

    total_revenue = bookings.filter(
        payment_status='PAID'
    ).aggregate(
        total=Sum('total_amount')
    )['total'] or 0


    # ==========================================
    # DAILY BOOKINGS
    # ==========================================

    daily_data = (
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

    daily_bookings = []

    for item in daily_data:

        daily_bookings.append({
            'date': item['day'],
            'bookings': item['booking_count']
        })


    # ==========================================
    # MONTHLY BOOKINGS
    # ==========================================

    monthly_data = (
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

    monthly_bookings = []

    for item in monthly_data:

        monthly_bookings.append({
            'month': item['month'],
            'bookings': item['booking_count']
        })


    # ==========================================
    # POPULAR ROUTES
    # ==========================================

    route_data = (
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

    popular_routes = []

    for item in route_data:

        popular_routes.append({

            'route_id':
                item['schedule__route__id'],

            'source':
                item['schedule__route__source'],

            'destination':
                item['schedule__route__destination'],

            'bookings':
                item['booking_count']

        })


    # ==========================================
    # MOST BOOKED BUSES
    # ==========================================

    bus_data = (
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

    popular_buses = []

    for item in bus_data:

        popular_buses.append({

            'bus_id':
                item['schedule__bus__id'],

            'bus_name':
                item['schedule__bus__bus_name'],

            'bus_number':
                item['schedule__bus__bus_number'],

            'bookings':
                item['booking_count']

        })


    # ==========================================
    # OPERATOR PERFORMANCE
    # ==========================================

    operator_data = (
        bookings
        .values(
            'schedule__bus__operator__id',
            'schedule__bus__operator__username'
        )
        .annotate(
            booking_count=Count('id'),
            revenue=Sum('total_amount')
        )
        .order_by('-booking_count')
    )

    operator_performance = []

    for item in operator_data:

        operator_performance.append({

            'operator_id':
                item['schedule__bus__operator__id'],

            'operator':
                item['schedule__bus__operator__username'],

            'bookings':
                item['booking_count'],

            'revenue':
                item['revenue'] or 0

        })


    # ==========================================
    # FINAL RESPONSE
    # ==========================================

    return Response({

        'total_bookings':
            total_bookings,

        'total_revenue':
            total_revenue,

        'daily_bookings':
            daily_bookings,

        'monthly_bookings':
            monthly_bookings,

        'popular_routes':
            popular_routes,

        'popular_buses':
            popular_buses,

        'operator_performance':
            operator_performance

    })