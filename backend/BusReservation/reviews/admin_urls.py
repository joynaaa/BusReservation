from django.urls import path

from .admin_views import (
    admin_reviews,
    admin_delete_review
)


urlpatterns = [

    path(
        '',
        admin_reviews,
        name='admin-reviews'
    ),

    path(
        '<int:review_id>/',
        admin_delete_review,
        name='admin-delete-review'
    ),

]