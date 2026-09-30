
from django.urls import path

from .views import (
    notification_list,
    unread_count,
    mark_as_read,
    mark_all_as_read,
    delete_notification,
)


urlpatterns = [

    # Get all notifications
    path(
        '',
        notification_list,
        name='notification-list'
    ),

    # Get unread notification count
    path(
        'unread-count/',
        unread_count,
        name='unread-count'
    ),

    # Mark one notification as read
    path(
        '<int:notification_id>/read/',
        mark_as_read,
        name='mark-as-read'
    ),

    # Mark all notifications as read
    path(
        'mark-all-read/',
        mark_all_as_read,
        name='mark-all-as-read'
    ),

    # Delete one notification
    path(
        '<int:notification_id>/delete/',
        delete_notification,
        name='delete-notification'
    ),
]
