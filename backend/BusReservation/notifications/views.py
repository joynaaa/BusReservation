
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


# ==========================================
# GET USER NOTIFICATIONS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):

    notifications = Notification.objects.filter(
        user=request.user
    ).order_by('-created_at')

    serializer = NotificationSerializer(
        notifications,
        many=True
    )

    return Response(serializer.data)


# ==========================================
# GET UNREAD COUNT
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):

    count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).count()

    return Response({
        'unread_count': count
    })


# ==========================================
# MARK ONE NOTIFICATION AS READ
# ==========================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notification_id):

    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )

    except Notification.DoesNotExist:

        return Response(
            {
                'error': 'Notification not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = True
    notification.save(update_fields=['is_read'])

    return Response({
        'message': 'Notification marked as read.'
    })


# ==========================================
# MARK ALL AS READ
# ==========================================

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):

    Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(
        is_read=True
    )

    return Response({
        'message': 'All notifications marked as read.'
    })


# ==========================================
# DELETE NOTIFICATION
# ==========================================

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):

    try:
        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )

    except Notification.DoesNotExist:

        return Response(
            {
                'error': 'Notification not found.'
            },
            status=status.HTTP_404_NOT_FOUND
        )

    notification.delete()

    return Response({
        'message': 'Notification deleted.'
    })
