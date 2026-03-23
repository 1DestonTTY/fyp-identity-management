from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    ApiRootView,
    ProfileListCreateView,
    ProfileDetailView,
    IdentityNameListCreateView,
    IdentityNameDetailView,
    OnlineProfileListCreateView,
    OnlineProfileDetailView,
    MyProfileView,
    ContextPreviewView,
    RegisterView,
    DataExportView,
    CustomTokenObtainPairView
)

urlpatterns = [
    #api root
    path("", ApiRootView.as_view(), name="api-root"),

    #handle new user registration
    path("register/", RegisterView.as_view(), name="register"),

    #return access and refresh token
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"), 
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    #list all profiles or create new one
    path("profiles/", ProfileListCreateView.as_view(), name="profile-list"),
    path("profiles/<int:pk>/", ProfileDetailView.as_view(), name="profile-detail"),
    
    #admin context preview
    path("profiles/<int:pk>/context-preview/", ContextPreviewView.as_view(), name="context-preview"),
    
    #identity name such as legal, preferred
    path("names/", IdentityNameListCreateView.as_view(), name="name-list"),
    path("names/<int:pk>/", IdentityNameDetailView.as_view(), name="name-detail"),
    
    #online profiles social media/digital identifiers
    path("online-profiles/", OnlineProfileListCreateView.as_view(), name="onlineprofile-list"),
    path("online-profiles/<int:pk>/", OnlineProfileDetailView.as_view(), name="onlineprofile-detail"),        
    
    #shortcut for logged in user
    path("my-profile/", MyProfileView.as_view(), name="my-profile"),
    
    #generate a full data dump for user portability 
    path("export-data/", DataExportView.as_view(), name="data-export"),
]