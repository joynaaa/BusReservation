from django.urls import path

from .reports_views import admin_reports


urlpatterns = [

    path(
        '',
        admin_reports,
        name='admin-reports'
    ),

]