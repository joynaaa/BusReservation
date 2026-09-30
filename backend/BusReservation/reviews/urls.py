from django.urls import path
from .views import bus_reviews, create_review, review_list


urlpatterns = [

    
    path(
        '',
        review_list,
        name='review-list'
    ),

    path(
        'create/',
        create_review,
        name='create-review'
    ),

       path(
        'bus/<int:bus_id>/',
        bus_reviews,
        name='bus-reviews'
    ),

]