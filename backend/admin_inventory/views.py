from rest_framework import viewsets, status

from rest_framework.parsers import MultiPartParser, FormParser

from rest_framework.response import Response

from .models import Pet, AdoptionRequest

from .serializers import PetSerializer, AdoptionRequestSerializer



# --- ViewSet for Pet Management ---



class PetViewSet(viewsets.ModelViewSet):

    """

    Provides CRUD operations for Pet objects.

    Handles file uploads (image) via MultiPartParser/FormParser.

    """

    queryset = Pet.objects.all().order_by('-id')

    serializer_class = PetSerializer

    parser_classes = [MultiPartParser, FormParser]



    def destroy(self, request, *args, **kwargs):

        """Overrides destroy to handle single Pet deletion."""

        pet = self.get_object()

        pet.delete()

        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)



# --- ViewSet for Adoption Request Management ---



class AdoptionRequestViewSet(viewsets.ModelViewSet):

    """

    Provides CRUD operations for AdoptionRequest objects.

    Includes logic for batch deletion and filtering by requester/email.

    """

    queryset = AdoptionRequest.objects.all().order_by('-created_at')

    serializer_class = AdoptionRequestSerializer



    def get_queryset(self):

        """

        Customizes the queryset to allow filtering by requester_name or email 

        via URL query parameters (e.g., ?requester_name=Alice).

        """

        qs = super().get_queryset()

        

        # Filtering logic for specific applications (used by UserApplications.js)

        requester = self.request.query_params.get('requester_name')

        email = self.request.query_params.get('email')

        

        # Assuming you will eventually filter by a specific applicant ID:

        applicant_id = self.request.query_params.get('applicant_id')

        

        if requester:

            qs = qs.filter(requester_name=requester)

        if email:

            qs = qs.filter(email=email)

        if applicant_id:

            # Note: This field name ('applicant_id') must match the ForeignKey field 

            # used to link AdoptionRequest to the User model in your models.py.

            qs = qs.filter(applicant__id=applicant_id) 

            

        return qs



    # ⭐ FIX: OVERRIDE destroy() FOR BATCH DELETE (DELETE ALL) ⭐

    def destroy(self, request, *args, **kwargs):

        """

        Handles both single deletion (DELETE /applications/ID/) and 

        batch deletion (DELETE /applications/).

        """

        # If no primary key (pk) is provided, it means DELETE ALL.

        if kwargs.get('pk') is None:

            count, _ = self.get_queryset().all().delete()

            return Response(

                {'message': f'Successfully deleted {count} records.'},

                status=status.HTTP_204_NO_CONTENT # Standard success code for deletion

            )

        

        # If pk is provided, execute standard single deletion logic

        return super().destroy(request, *args, **kwargs)



    def partial_update(self, request, *args, **kwargs):

        """Allows PATCH requests primarily for status updates."""

        return super().partial_update(request, *args, **kwargs)
    

from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import FosterProfile, UserProfile
from .serializers import FosterProfileSerializer, UserProfileSerializer

class FosterProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = FosterProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensure the profile exists, or create it if missing
        profile, created = FosterProfile.objects.get_or_create(user=self.request.user)
        return profile

    def update(self, request, *args, **kwargs):
        # Optional: Add custom logic here if needed, otherwise default is fine
        return super().update(request, *args, **kwargs)
    
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensures the profile exists for the logged-in user
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    # ⭐ FIX: Override update to allow partial updates on PUT requests.
    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)