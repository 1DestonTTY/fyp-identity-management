from django.urls import path
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
)

urlpatterns = [
    path("", ApiRootView.as_view(), name="api-root"),
    path("register/", RegisterView.as_view(), name="register"),
    path("profiles/", ProfileListCreateView.as_view(), name="profile-list"),
    path("profiles/<int:pk>/", ProfileDetailView.as_view(), name="profile-detail"),
    path("profiles/<int:pk>/context-preview/", ContextPreviewView.as_view(), name="context-preview"),
    path("names/", IdentityNameListCreateView.as_view(), name="name-list"),
    path("names/<int:pk>/", IdentityNameDetailView.as_view(), name="name-detail"),
    path("online-profiles/", OnlineProfileListCreateView.as_view(), name="onlineprofile-list"),
    path("online-profiles/<int:pk>/", OnlineProfileDetailView.as_view(), name="onlineprofile-detail"),        
    path("my-profile/", MyProfileView.as_view(), name="my-profile"),
    path("export-data/", DataExportView.as_view(), name="data-export"),
]