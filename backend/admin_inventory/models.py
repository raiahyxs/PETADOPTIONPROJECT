from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone 

# --- Utility Choices ---
PET_SEX_CHOICES = [
    ("MALE", "Male"), 
    ("FEMALE", "Female"), 
    ("UNKNOWN", "Unknown")
]

class Pet(models.Model):
    TYPE_CHOICES = (('Dog', 'Dog'), ('Cat', 'Cat'))
    STATUS_CHOICES = (('Available', 'Available'), ('Adopted', 'Adopted'), ('Pending', 'Pending'))

    name = models.CharField(max_length=100)
    breed = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Available')
    image = models.ImageField(upload_to='pet_images/', null=True, blank=True)
    
    sex = models.CharField(
        max_length=10,
        choices=PET_SEX_CHOICES,
        default="UNKNOWN"
    )
    
    weight = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name

class AdoptionRequest(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    pet = models.ForeignKey(Pet, related_name='requests', on_delete=models.CASCADE)
    requester_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, default='', blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.requester_name} - {self.pet.name} ({self.status})"

# --- User Extension Models ---


class Account(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'), 
        ('adopter', 'Adopter'),
        ('poster', 'Poster'),
        ('foster', 'Foster'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='account')
    # 🔴 FIX 1: Removed default='adopter'. The role must now be set by the view.
    role = models.CharField(max_length=20, choices=ROLE_CHOICES) 

    def save(self, *args, **kwargs):
        # ADMIN LOGIC: Set role to 'admin' if superuser/staff
        if self.user.is_superuser or self.user.is_staff:
            self.role = 'admin'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

# --- Signal to ensure Account is created for every new User ---
@receiver(post_save, sender=User)
def create_user_account(sender, instance, created, **kwargs):
    if created:
        # Only create account if it doesn't exist
    #    if not hasattr(instance, 'account'):
            # If superuser/staff, role='admin', otherwise default to 'adopter'
    #        role = 'admin' if instance.is_superuser or instance.is_staff else 'adopter'
    #        Account.objects.create(user=instance, role=role)
        pass

@receiver(post_save, sender=User)
def save_user_account(sender, instance, **kwargs):
    # This remains active to save existing objects and run the admin check.
    if hasattr(instance, 'account'):
        instance.account.save()
    if hasattr(instance, 'profile'):
        instance.profile.save()

class FosterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='foster_profile')
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    household = models.TextField(blank=True, help_text="Description of household")
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    
    # Stats (Optional, based on your UI)
    fostered_count = models.IntegerField(default=0)
    adoption_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    

class FosterPet(models.Model):
    ANIMAL_TYPES = [
        ('Dog', 'Dog'),
        ('Cat', 'Cat'),
        ('Bird', 'Bird'),
        ('Other', 'Other'),
    ]

    profile = models.ForeignKey(FosterProfile, related_name='current_fosters', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=ANIMAL_TYPES)
    breed = models.CharField(max_length=100)
    age = models.CharField(max_length=50) # Using CharField to allow "2 Years", "3 Months"

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    household = models.TextField(blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    # Optional — to match your UI
    favorites = models.JSONField(default=list, blank=True)
    
    # ⭐ ADDED: Field for user preferences (e.g., Cat-friendly, Small Dog)
    preferences = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

# --- AUTO CREATE USER PROFILE ---
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
