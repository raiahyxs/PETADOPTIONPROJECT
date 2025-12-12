from rest_framework import serializers, viewsets, status, mixins, routers
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User
from django.db.models.functions import TruncMonth
from django.db.models import Count

from .models import Pet, AdoptionRequest, Account, UserProfile

class  UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = '__all__'


# ---------------------
# SERIALIZERS
# ---------------------

class PetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pet
        fields = '__all__'


class AdoptionRequestSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source='pet.name', read_only=True)

    class Meta:
        model = AdoptionRequest
        fields = ['id', 'pet', 'pet_name', 'requester_name', 'email', 'status', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='account.role', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'role']


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.CharField(write_only=True, required=False)  # optional role

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'adopter')  # default to 'adopter'
        user = User(
            username=validated_data['username'],
            first_name=validated_data.get('first_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        # Create associated Account
        Account.objects.create(user=user, role=role)
        return user


# ---------------------
# LOGIN
# ---------------------

class LoginAPIView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        if not username or not password:
            return Response({'detail': 'Username and password required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username).first()
        if user and user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            # Get role
            role = user.account.role if hasattr(user, 'account') else 'user'
            return Response({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'role': role,
                'token': token.key
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------
# PET VIEWSET
# ---------------------

class PetViewSet(viewsets.ModelViewSet):
    queryset = Pet.objects.all().order_by('-id')
    serializer_class = PetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def destroy(self, request, *args, **kwargs):
        pet = self.get_object()
        pet.delete()
        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)


# ---------------------
# ADOPTION REQUEST VIEWSET
# ---------------------

class AdoptionRequestViewSet(viewsets.ModelViewSet):
    queryset = AdoptionRequest.objects.all().order_by('-id')
    serializer_class = AdoptionRequestSerializer


# ---------------------
# ADOPTION TRENDS
# ---------------------

class AdoptionTrendsAPIView(APIView):
    def get(self, request):
        if hasattr(Pet, 'created_at'):
            qs = (
                Pet.objects.filter(status='Adopted')
                .annotate(month=TruncMonth('created_at'))
                .values('month')
                .annotate(count=Count('id'))
                .order_by('month')
            )
            trends = [entry['count'] for entry in qs]
            months = [entry['month'].strftime('%b %Y') for entry in qs]
            data = {"trends": trends, "months": months}
        else:
            data = {"trends": [Pet.objects.filter(status='Adopted').count()], "months": ["All Time"]}
        return Response(data)


# ---------------------
# USER REGISTRATION
# ---------------------

class RegisterAPIView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            role = user.account.role if hasattr(user, 'account') else 'adopter'
            return Response({
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'role': role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------
# USER VIEWSET
# ---------------------

class UserViewSet(mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  viewsets.GenericViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all().order_by('id')
    serializer_class = UserProfileSerializer




# ---------------------
# ROUTER
# ---------------------

router = routers.DefaultRouter()
router.register(r'pets', PetViewSet)
router.register(r'applications', AdoptionRequestViewSet)
router.register(r'accounts', UserViewSet)
router.register(r'user-profiles', UserProfileViewSet)


