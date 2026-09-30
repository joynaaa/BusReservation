from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Bus
from .serializers import BusSerializer
from users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_buses(request):
    buses = Bus.objects.select_related('operator').all().order_by('-id')
    data = []

    for bus in buses:
        operator_name = ''
        company_name = ''

        if bus.operator:
            profile = getattr(bus.operator, 'profile', None)
            operator_name = (
                profile.full_name
                if profile and profile.full_name
                else bus.operator.username
            )
            company_name = profile.company_name if profile else ''

        data.append({
            'id': bus.id,
            'bus_number': bus.bus_number,
            'bus_name': bus.bus_name,
            'bus_type': bus.bus_type,
            'total_seats': bus.total_seats,
            'seats_per_row': bus.seats_per_row,
            'is_active': bus.is_active,
            'status': bus.status,
            'rejection_reason': bus.rejection_reason or '',
            'operator_id': bus.operator.id if bus.operator else None,
            'operator_username': bus.operator.username if bus.operator else '',
            'operator_name': operator_name,
            'company_name': company_name,
            'vehicle_rc': (
                request.build_absolute_uri(bus.vehicle_rc.url)
                if bus.vehicle_rc else None
            ),
            'insurance_certificate': (
                request.build_absolute_uri(bus.insurance_certificate.url)
                if bus.insurance_certificate else None
            ),
            'fitness_certificate': (
                request.build_absolute_uri(bus.fitness_certificate.url)
                if bus.fitness_certificate else None
            ),
        })

    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
@parser_classes([MultiPartParser, FormParser])
def admin_add_bus(request):
    serializer = BusSerializer(data=request.data)

    if serializer.is_valid():
        bus = serializer.save(status='APPROVED', rejection_reason='')
        return Response(
            BusSerializer(bus, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
@parser_classes([MultiPartParser, FormParser])
def admin_update_bus(request, bus_id):
    try:
        bus = Bus.objects.get(id=bus_id)
    except Bus.DoesNotExist:
        return Response(
            {'error': 'Bus not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = BusSerializer(
        bus,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        updated_bus = serializer.save()
        return Response(
            BusSerializer(updated_bus, context={'request': request}).data
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_delete_bus(request, bus_id):
    try:
        bus = Bus.objects.get(id=bus_id)
    except Bus.DoesNotExist:
        return Response(
            {'error': 'Bus not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    bus.delete()
    return Response({'message': 'Bus deleted successfully.'})


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def approve_bus(request, bus_id):
    try:
        bus = Bus.objects.get(id=bus_id)
    except Bus.DoesNotExist:
        return Response(
            {'error': 'Bus not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    bus.status = 'APPROVED'
    bus.rejection_reason = ''
    bus.save(update_fields=['status', 'rejection_reason'])

    return Response({
        'message': 'Bus approved successfully.',
        'status': bus.status
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def reject_bus(request, bus_id):
    try:
        bus = Bus.objects.get(id=bus_id)
    except Bus.DoesNotExist:
        return Response(
            {'error': 'Bus not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    reason = str(request.data.get('rejection_reason', '')).strip()

    if not reason:
        return Response(
            {'error': 'Rejection reason is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    bus.status = 'REJECTED'
    bus.rejection_reason = reason
    bus.save(update_fields=['status', 'rejection_reason'])

    return Response({
        'message': 'Bus rejected successfully.',
        'status': bus.status,
        'rejection_reason': bus.rejection_reason
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdmin])
def toggle_bus_status(request, bus_id):
    try:
        bus = Bus.objects.get(id=bus_id)
    except Bus.DoesNotExist:
        return Response(
            {'error': 'Bus not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if bus.status != 'APPROVED':
        return Response(
            {'error': 'Only an approved bus can be activated or deactivated.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    bus.is_active = not bus.is_active
    bus.save(update_fields=['is_active'])

    return Response({
        'message': 'Bus status updated successfully.',
        'is_active': bus.is_active
    })
