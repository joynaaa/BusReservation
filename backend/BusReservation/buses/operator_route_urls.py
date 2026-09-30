from django.urls import path

from .operator_route_views import (
    operator_route_stops,
    operator_routes,
    operator_route_detail,
    operator_route_stop_detail
)


urlpatterns = [

    path(
        '',
        operator_routes,
        name='operator-routes'
    ),

    path(
        '<int:route_id>/',
        operator_route_detail,
        name='operator-route-detail'
    ),
    path(
    '<int:route_id>/stops/',
    operator_route_stops,
    name='operator-route-stops'
),
path(
    '<int:route_id>/stops/<int:stop_id>/',
    operator_route_stop_detail,
    name='operator-route-stop-detail'
),

]