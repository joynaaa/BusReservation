from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile
from .permissions import IsAdmin
from buses.models import Bus,Route,Schedule
from bookings.models import Booking
from payments.models import Payment
from django.contrib.auth.models import User
from django.db.models import Sum
from reviews.models import Review



# ==========================================================
# ADMIN DASHBOARD
# ==========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):

    # ======================================================
    # TOTAL USERS
    # ======================================================
    #
    # Count normal application users.
    # Admin/staff accounts are excluded.
    # Operators are counted separately below.
    #

    total_users = User.objects.filter(
        is_staff=False,
        is_superuser=False,
        profile__role='USER'
    ).count()


    # ======================================================
    # TOTAL OPERATORS
    # ======================================================

    total_operators = UserProfile.objects.filter(
        role='OPERATOR'
    ).count()


    # ======================================================
    # TOTAL BUSES
    # ======================================================

    total_buses = Bus.objects.count()


    # ======================================================
    # TOTAL ROUTES
    # ======================================================

    total_routes = Route.objects.count()


    # ======================================================
    # ACTIVE SCHEDULES
    # ======================================================

    total_schedules = Schedule.objects.filter(
        is_active=True
    ).count()


    # ======================================================
    # TOTAL BOOKINGS
    # ======================================================

    total_bookings = Booking.objects.count()


    # ======================================================
    # TOTAL REVENUE
    # ======================================================
    #
    # Revenue is calculated from successful payments.
    #

    revenue_data = Payment.objects.filter(
        payment_status='SUCCESS'
    ).aggregate(
        total=Sum('amount')
    )

    total_revenue = revenue_data['total'] or 0


    # ======================================================
    # TOTAL REVIEWS
    # ======================================================

    total_reviews = Review.objects.count()


    # ======================================================
    # PENDING OPERATORS
    # ======================================================

    pending_operators = UserProfile.objects.filter(
        role='OPERATOR',
        status='PENDING'
    ).count()


    # ======================================================
    # RECENT BOOKINGS
    # ======================================================

    recent_booking_queryset = (
        Booking.objects
        .select_related('user')
        .order_by('-booking_date')[:5]
    )


    recent_bookings = []


    for booking in recent_booking_queryset:

        recent_bookings.append({

            'id':
                booking.id,

            'username':
                booking.user.username
                if booking.user
                else 'Unknown',

            'amount':
                float(booking.total_amount)
                if booking.total_amount is not None
                else 0

        })


    # ======================================================
    # RESPONSE
    # ======================================================

    return Response(

        {
            'totalUsers':
                total_users,

            'totalOperators':
                total_operators,

            'totalBuses':
                total_buses,

            'totalRoutes':
                total_routes,

            'totalSchedules':
                total_schedules,

            'totalBookings':
                total_bookings,

            'totalRevenue':
                float(total_revenue),

            'totalReviews':
                total_reviews,

            'pendingOperators':
                pending_operators,

            'recentBookings':
                recent_bookings
        },

        status=status.HTTP_200_OK
    )
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_operators(request):

    operators = UserProfile.objects.filter(
        role='OPERATOR'
    ).select_related('user')

    data = []

    for profile in operators:

        data.append({

            # ==========================================
            # ACCOUNT DETAILS
            # ==========================================

            'id': profile.id,

            'user_id': profile.user.id,

            'username': profile.user.username,

            'email': profile.user.email,


            # ==========================================
            # OPERATOR DETAILS
            # ==========================================

            'full_name': profile.full_name,

            'phone': profile.phone,

            'company_name': profile.company_name,

            'operator_type': profile.operator_type,


            # ==========================================
            # BUSINESS DETAILS
            # ==========================================

            'business_phone': profile.business_phone,

            'business_email': profile.business_email,

            'number_of_buses': profile.number_of_buses,

            'years_of_experience': profile.years_of_experience,


            # ==========================================
            # BUSINESS ADDRESS
            # ==========================================

            'address': profile.address,

            'city': profile.city,

            'state': profile.state,

            'pin_code': profile.pin_code,


            # ==========================================
            # APPROVAL STATUS
            # ==========================================

            'status': profile.status,


            # ==========================================
            # OPERATOR DOCUMENTS
            # ==========================================

            'government_id': (
                request.build_absolute_uri(
                    profile.government_id.url
                )
                if profile.government_id
                else None
            ),

            'business_registration': (
                request.build_absolute_uri(
                    profile.business_registration.url
                )
                if profile.business_registration
                else None
            ),

            'transport_permit': (
                request.build_absolute_uri(
                    profile.transport_permit.url
                )
                if profile.transport_permit
                else None
            ),

        })

    return Response(data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_operator(request, operator_id):

    try:
        profile = UserProfile.objects.get(
            id=operator_id,
            role='OPERATOR'
        )

    except UserProfile.DoesNotExist:

        return Response(
            {'error': 'Operator not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    profile.status = 'APPROVED'
    profile.save()

    return Response({
        'message': 'Operator approved successfully.',
        'status': profile.status
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_operator(request, operator_id):

    try:
        profile = UserProfile.objects.get(
            id=operator_id,
            role='OPERATOR'
        )

    except UserProfile.DoesNotExist:

        return Response(
            {'error': 'Operator not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    profile.status = 'REJECTED'
    profile.save()

    return Response({
        'message': 'Operator rejected successfully.',
        'status': profile.status
    })



@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_operator(request, operator_id):

    print("DELETE OPERATOR ID:", operator_id)

    try:
        profile = UserProfile.objects.select_related('user').get(
            id=operator_id,
            role='OPERATOR'
        )

    except UserProfile.DoesNotExist:

        return Response(
            {'error': 'Operator not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    username = profile.user.username

    # Delete the Django User.
    # UserProfile will be deleted automatically because
    # UserProfile.user uses on_delete=models.CASCADE.
    profile.user.delete()

    print("DELETED OPERATOR:", username)

    return Response({
        'message': 'Operator deleted successfully.',
        'username': username
    })


# =========================================================
# ADMIN - MANAGE NORMAL USERS
# =========================================================
# =========================================================
# ADMIN - MANAGE NORMAL USERS
# =========================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_users(request):

    users = UserProfile.objects.filter(
        role='USER'
    ).select_related('user')

    data = []

    for profile in users:

        data.append({
            'id': profile.id,
            'user_id': profile.user.id,
            'username': profile.user.username,
            'email': profile.user.email,
            'full_name': profile.full_name,
            'phone': profile.phone,
            'address': profile.address,
            'role': profile.role,
        })

    return Response(data)


# =========================================================
# ADMIN - UPDATE NORMAL USER
# =========================================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def update_admin_user(request, user_id):

    try:

        profile = UserProfile.objects.select_related(
            'user'
        ).get(
            id=user_id,
            role='USER'
        )

    except UserProfile.DoesNotExist:

        return Response(
            {
                'error': 'User not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    user = profile.user


    # ==========================================
    # UPDATE USER ACCOUNT
    # ==========================================

    if 'username' in request.data:

        username = request.data.get(
            'username'
        ).strip()

        if not username:

            return Response(
                {
                    'error': 'Username cannot be empty.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check duplicate username
        if User.objects.filter(
            username=username
        ).exclude(
            id=user.id
        ).exists():

            return Response(
                {
                    'error': 'Username already exists.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.username = username


    if 'email' in request.data:

        user.email = request.data.get(
            'email',
            ''
        ).strip()


    user.save()


    # ==========================================
    # UPDATE PROFILE
    # ==========================================

    if 'full_name' in request.data:

        profile.full_name = request.data.get(
            'full_name',
            ''
        ).strip()


    if 'phone' in request.data:

        profile.phone = request.data.get(
            'phone',
            ''
        ).strip()


    if 'address' in request.data:

        profile.address = request.data.get(
            'address',
            ''
        ).strip()


    profile.save()


    return Response({

        'message': 'User updated successfully.',

        'user': {
            'id': profile.id,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': profile.full_name,
            'phone': profile.phone,
            'address': profile.address,
            'role': profile.role,
        }

    })




# =========================================================
# ADMIN - DELETE NORMAL USER
# =========================================================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def delete_admin_user(request, user_id):

    try:

        profile = UserProfile.objects.select_related(
            'user'
        ).get(
            id=user_id,
            role='USER'
        )

    except UserProfile.DoesNotExist:

        return Response(
            {
                'error': 'User not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )


    username = profile.user.username


    # Delete Django User.
    # UserProfile is deleted automatically
    # because of OneToOneField CASCADE.

    profile.user.delete()


    return Response({

        'message': 'User deleted successfully.',

        'username': username

    })