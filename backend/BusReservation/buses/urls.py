from django.urls import path
from .views import bus_list, city_list,route_stops, search_buses, seat_list,operator_buses,operator_bus_detail
from .admin_report_views import admin_reports


urlpatterns = [
    path('', bus_list, name='bus-list'),
    path('search/', search_buses, name='search-buses'),
    path('operator/',operator_buses,name='operator-buses'),
    path('operator/<int:bus_id>/', operator_bus_detail, name='operator-bus-detail'),
    path('<int:bus_id>/seats/', seat_list, name='seat-list'),
    path('cities/', city_list, name='city-list'),
    path('routes/<int:route_id>/stops/',route_stops,name='route-stops'),
    # =====================================
    # ADMIN REPORTS
    # =====================================

    path('admin/reports/',admin_reports,name='admin-reports'),
]