from django.contrib import admin
from .models import Pet, AdoptionRequest, Account, UserProfile

# Register your models here.
admin.site.register(Pet)
admin.site.register(AdoptionRequest)   
admin.site.register(Account)
admin.site.register(UserProfile)
