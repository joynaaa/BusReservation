from django.urls import path
from .operator_report_views import operator_reports

urlpatterns = [
    path('', operator_reports, name='operator-reports'),
]