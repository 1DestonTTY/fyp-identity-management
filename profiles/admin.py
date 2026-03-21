from django.contrib import admin
from .models import Profile, IdentityName, OnlineProfile

admin.site.register(Profile)
admin.site.register(IdentityName)
admin.site.register(OnlineProfile)