from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny 
from .models import Profile, IdentityName, OnlineProfile
from .serializers import ProfileSerializer, IdentityNameSerializer, OnlineProfileSerializer, ContextProfileSerializer, RegisterSerializer
from .permissions import IsOwnerOrAdmin
from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone

#view to generate full JSON dump
class DataExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

        names = profile.names.all()
        names_data = [
            {
                "full_name": n.full_name,
                "context": n.context,
                "type": n.name_type,
                "is_primary": n.is_primary
            } for n in names
        ]

        online_links = profile.online_profiles.all()
        online_data = [
            {
                "platform": o.platform,
                "handle": o.handle,
                "url": o.url,
                "visibility": o.visibility
            } for o in online_links
        ]

        export_data = {
            "user_metadata": {
                "username": request.user.username,
                "email": request.user.email,
                "exported_at": timezone.now(),
                "profile_last_updated": profile.updated_at,
            },
            "profile_summary": {
                "bio": profile.bio,
                "pronouns": profile.pronouns,
                "gender_identity": profile.gender_identity,
            },
            "identity_names": names_data,
            "digital_identifiers": online_data,
        }

        return Response(export_data)

#landing endpoint for the API
class ApiRootView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "message": "Identity Profile Management API",
            "endpoints": {
                "register": "/api/register/",
                "token": "/api/token/",
                "refresh_token": "/api/token/refresh/",
                "profiles": "/api/profiles/",
                "names": "/api/names/",
                "online_profiles": "/api/online-profiles/",
                "my_profile": "/api/my-profile/?context=professional",
            }
        })

#handle user signup
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        Profile.objects.create(user=user)

#list all profiles (admin only) or just the user own profile
class ProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)

#CRUD for specific profile
class ProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)

#view for managing identityname
class IdentityNameListCreateView(generics.ListCreateAPIView):
    serializer_class = IdentityNameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return IdentityName.objects.all()
        return IdentityName.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile = serializer.validated_data["profile"]

        if not self.request.user.is_staff and profile.user != self.request.user:
            raise PermissionDenied("You cannot create names for another user's profile.")

        serializer.save()

#detail view for a specific identityname
class IdentityNameDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = IdentityNameSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return IdentityName.objects.all()
        return IdentityName.objects.filter(profile__user=self.request.user)

#view for managing online profiles
class OnlineProfileListCreateView(generics.ListCreateAPIView):
    serializer_class = OnlineProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return OnlineProfile.objects.all()
        return OnlineProfile.objects.filter(profile__user=self.request.user)

    def perform_create(self, serializer):
        profile = serializer.validated_data["profile"]

        if not self.request.user.is_staff and profile.user != self.request.user:
            raise PermissionDenied("You cannot create online profiles for another user's profile.")

        serializer.save()

#detail view for a specific online profile
class OnlineProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OnlineProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        if self.request.user.is_staff:
            return OnlineProfile.objects.all()
        return OnlineProfile.objects.filter(profile__user=self.request.user)

#a view for the logged in user to trigger filtering
class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        context_type = request.query_params.get("context", None)

        try:
            profile, created = Profile.objects.get_or_create(user=request.user)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)

        serializer = ContextProfileSerializer(
            profile,
            context={
                "context_type": context_type,
                "request": request,
            }
        )
        return Response(serializer.data)
    
#allow admin to preview how specific profile looks in different context
class ContextPreviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        if not request.user.is_staff:
            return Response({"detail": "You do not have permission to access this preview."}, status=403)

        context_type = request.query_params.get("context", None)

        try:
            profile = Profile.objects.get(pk=pk)
        except Profile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=404)

        serializer = ContextProfileSerializer(
            profile,
            context={
                "context_type": context_type,
                "request": request,
            }
        )
        return Response(serializer.data)

#customize the jwt token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        return token

#view to handle login/token exchange
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]