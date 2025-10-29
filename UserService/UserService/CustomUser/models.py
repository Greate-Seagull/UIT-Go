from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from .manages import CustomerUserManager
class CustomerUser(AbstractUser):
    username = models.CharField(max_length=50, unique=True, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(unique=True, null=False)
    is_driver = models.BooleanField(default=False)
    birth = models.DateField(blank=True, null=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS= []
    objects = CustomerUserManager()

    class Meta:
        db_table = 'CustomUser'
        


    def __str__(self):
        return self.get_username()
    
    def updated(self):
        self.date_updated = timezone.now()

