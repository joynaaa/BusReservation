from django.urls import path
from .views import cancel_booking, create_booking, my_bookings, operator_bookings
from .hold_views import hold_seat

urlpatterns = [
    path('', create_booking, name='create-booking'),
    path('my-bookings/',my_bookings,name='my-bookings'),
     path('<int:booking_id>/cancel/',cancel_booking,name='cancel-booking'),
     path('operator/', operator_bookings, name='operator-bookings'),
     path('hold-seat/', hold_seat, name='hold-seat'),
    ]