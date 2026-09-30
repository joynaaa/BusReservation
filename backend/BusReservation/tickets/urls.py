from django.urls import path
from .views import generate_ticket, get_ticket


urlpatterns = [
    path(
        '',
        generate_ticket,
        name='generate-ticket'
    ),

     path('<int:booking_id>/', get_ticket, name='get-ticket'),
]