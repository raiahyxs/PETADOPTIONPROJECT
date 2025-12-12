from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Pets(models.Model):
    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    is_availale = models.BooleanField(default=True)
    age = models.IntegerField()
    weight = models.FloatField()
    distance = models.FloatField()
    sex = models.CharField(
        max_length=10,
        choices=[("Male", "Male"), ("Female", "Female"), ("Unknown", "Unknown")],
        default="Unknown"
    )

    def __str__ (self):
        return self.name
    
class Facility(models.Model):
    total_animals = models.IntegerField()
    pending_requests = models.IntegerField()
    adoptions = models.IntegerField()
    capacity = models.IntegerField()
    date = models.DateTimeField(auto_now_add=True)

class Inventory(models.Model):
    total_dogs = models.IntegerField()
    total_cats = models.IntegerField()
    total_pets = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=[("AVAILABLE", "Available"), ("PENDING", "Pending"), ("ADOPTED", "Adopted")],
        default="AVAILABLE"
    )
    date = models.DateTimeField(auto_now_add=True)

class Request(models.Model):
    applicant_name = models.CharField(max_length=100)
    applicant_email = models.EmailField()
    pet_details = models.CharField(max_length=100)
    request_date = models.DateTimeField(auto_now_add=True)
    req_status = models.CharField(
        max_length=20,
        choices=[("AVAILABLE", "Available"), ("PENDING", "Pending"), ("ADOPTED", "Adopted")],
        default="AVAILABLE"
    )
    
    def __str__(self):
        return f"Request by {self.applicant_name} for {self.pet_details} - Status: {self.get_req_status_display()}"
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='api_profile')
    # Add extra fields below as needed, e.g. phone, address, etc.
    phone = models.CharField(max_length=20, blank=True)
    # ...add more fields if needed...

    def __str__(self):
        return f"Profile for {self.user.username}"