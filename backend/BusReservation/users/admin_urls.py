from django.urls import path

from .admin_views import (
    admin_dashboard,   admin_users,update_admin_user,
    delete_admin_user,
    admin_operators,
    approve_operator,
    delete_operator,
    reject_operator
)

urlpatterns = [

    path(
        'dashboard/',
        admin_dashboard,
        name='admin-dashboard'
    ),

        path(
        'users/',
        admin_users,
        name='admin-users'
    ),
    path(
    'users/<int:user_id>/',
    update_admin_user,
    name='update-admin-user'
),

path(
    'users/<int:user_id>/delete/',
    delete_admin_user,
    name='delete-admin-user'
),


    path(
        'operators/',
        admin_operators,
        name='admin-operators'
    ),

    path(
        'operators/<int:operator_id>/approve/',
        approve_operator,
        name='approve-operator'
    ),

    path(
        'operators/<int:operator_id>/reject/',
        reject_operator,
        name='reject-operator'
    ),

        path(
        'operators/<int:operator_id>/',
        delete_operator,
        name='delete-operator'
    ),

]