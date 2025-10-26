from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import CustomerUser

class CustomerUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomerUser
        fields = ("username", "email", "phone", "is_driver")

    
class CustomerUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = CustomerUser
        fields = ("username", "email", "phone", "is_driver",
                  "first_name", "last_name", "is_active", "is_staff",
                  "is_superuser", "groups", "user_permissions")