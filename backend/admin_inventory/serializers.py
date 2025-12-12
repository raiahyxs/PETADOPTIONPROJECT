from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Pet, AdoptionRequest, FosterPet, FosterProfile, UserProfile
import base64
from django.core.files.base import ContentFile
import uuid

# ---------------------
# PET SERIALIZER
# ---------------------
class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = '__all__'


# ---------------------
# ADOPTION REQUEST SERIALIZER
# ---------------------
class AdoptionRequestSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    
    class Meta:
        model = AdoptionRequest
        fields = [
            'id',
            'pet',
            'pet_name',
            'requester_name',
            'email',
            'status',
            'created_at'
        ]
        read_only_fields = ['status', 'created_at']


# ---------------------
# USER SERIALIZERS
# ---------------------
class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='account.role', read_only=True)  # Assuming related Account model

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'role']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

# Helper to handle Base64 images from React
class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            # format: "data:image/png;base64,..."
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name=f"{uuid.uuid4()}.{ext}")
        return super().to_internal_value(data)

class FosterPetSerializer(serializers.ModelSerializer):
    class Meta:
        model = FosterPet
        fields = ['id', 'name', 'type', 'breed', 'age']
        

class FosterProfileSerializer(serializers.ModelSerializer):
    # Mapping fields to match React camelCase names
    userName = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    currentFosters = FosterPetSerializer(source='current_fosters', many=True)
    profileImage = Base64ImageField(source='profile_image', required=False, allow_null=True)

    class Meta:
        model = FosterProfile
        fields = [
            'userName', 
            'email', 
            'phone', 
            'address', 
            'household', 
            'currentFosters', 
            'profileImage'
        ]

    def update(self, instance, validated_data):
        # 1. Update User model (username/email)
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()

        # 2. Update Simple Profile Fields
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.household = validated_data.get('household', instance.household)
        
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data['profile_image']
        
        instance.save()

        # 3. Update Nested Pets
        # Strategy: Clear existing pets and re-add them to match the frontend list
        if 'current_fosters' in validated_data:
            pets_data = validated_data['current_fosters']
            # Delete old pets
            instance.current_fosters.all().delete()
            # Create new pets
            for pet_data in pets_data:
                FosterPet.objects.create(profile=instance, **pet_data)

        return instance
    
class UserProfileSerializer(serializers.ModelSerializer):
    # Map frontend 'userName' to backend 'user.username'
    userName = serializers.CharField(source="user.username", required=False)
    email = serializers.EmailField(source="user.email", required=False)
    profileImage = Base64ImageField(source="profile_image", required=False, allow_null=True)

    class Meta:
        model = UserProfile
        fields = [
            "userName",
            "email",
            "phone",
            "address",
            "household",
            "favorites",
            # ⭐ ADDED: Include the new preferences field
            "preferences", 
            "profileImage"
        ]

    def update(self, instance, validated_data):
        # 1. Update User Model (username/email)
        user_data = validated_data.pop("user", {})
        user = instance.user

        if user_data:
            if "username" in user_data:
                user.username = user_data["username"]
            if "email" in user_data:
                user.email = user_data["email"]
            user.save()

        # 2. Update Profile Model
        instance.phone = validated_data.get("phone", instance.phone)
        instance.address = validated_data.get("address", instance.address)
        instance.household = validated_data.get("household", instance.household)
        
        # Handle favorites
        favorites_data = validated_data.get("favorites")
        if favorites_data is not None:
            instance.favorites = favorites_data

        # ⭐ ADDED: Handle preferences
        preferences_data = validated_data.get("preferences")
        if preferences_data is not None:
            instance.preferences = preferences_data

        if "profile_image" in validated_data:
            instance.profile_image = validated_data["profile_image"]

        instance.save()
        return instance