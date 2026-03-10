from django.urls import path
from .views import test_api, register_view, login_view, profile_view
urlpatterns = [
    path('test/', test_api, name='accounts-test'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('profile/', profile_view, name='profile'),
]