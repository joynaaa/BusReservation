from django.urls import path

from .operator_dashboard_views import operator_dashboard


urlpatterns = [
    path('', operator_dashboard, name='operator-dashboard'),
]