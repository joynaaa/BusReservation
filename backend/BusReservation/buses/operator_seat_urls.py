from django.urls import path

from .operator_seat_views import operator_seats


urlpatterns = [
    path('', operator_seats, name='operator-seats'),
]