"""
URL configuration for BusReservation project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/buses/',include('buses.urls')),
     path('api/auth/', include('users.urls')),
    path('api/admin/',include('users.admin_urls')),
     path('api/bookings/', include('bookings.urls')),
     path('api/payments/',include('payments.urls')),
     path('api/tickets/', include('tickets.urls')),
     path('api/reviews/',include('reviews.urls')),
     path('api/ai/',include('ai_assistant.urls')),
    path('api/notifications/',include('notifications.urls')),

    path('api/admin/buses/',include('buses.admin_urls')),
     path('api/admin/routes/',include('buses.admin_route_urls')),
     path('api/admin/schedules/',include('buses.admin_schedule_urls')),
     path('api/admin/bookings/',include('bookings.admin_urls')),
     path('api/admin/payments/',include('payments.admin_urls')),
     path('api/admin/reviews/',include('reviews.admin_urls')),
     path('api/admin/reports/',include('bookings.reports_urls')),
     path('api/admin/dashboard/',include('users.admin_urls')),
    path('api/admin/cities/',include('buses.admin_city_urls')),
     path('api/operator/dashboard/',include('buses.operator_dashboard_urls')),
     path('api/operator/routes/',include('buses.operator_route_urls')),
     path('api/operator/schedules/',include('buses.operator_schedule_urls')),
     path('api/operator/seats/',include('buses.operator_seat_urls')),
    path('api/operator/reports/',include('buses.operator_report_urls')),
]

urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)