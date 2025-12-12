from django.contrib import admin
from .models import Pets, Facility, Inventory, Request

# Register your models here.

admin.site.register(Pets)
admin.site.register(Facility)
admin.site.register(Inventory)
admin.site.register(Request)
