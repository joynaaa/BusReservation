from django.contrib import admin
from .models import Bus, City, Route, RouteStop, Schedule, Seat

admin.site.register(Bus)
admin.site.register(Route)
admin.site.register(Schedule)
admin.site.register(Seat)
admin.site.register(City)
admin.site.register(RouteStop)
