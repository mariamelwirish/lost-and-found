from django.urls import path
from .views import MyProfileView

# quick debug ping
from django.http import HttpResponse
def ping(_): 
    return HttpResponse("pong")

urlpatterns = [
    path("ping/", ping),                         # http://127.0.0.1:8000/api/ping/ -> "pong"
    path("me/profile/", MyProfileView.as_view(), name="me-profile"),
]
