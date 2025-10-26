from django.contrib import admin
from django .contrib.auth.admin import UserAdmin
from .models import CustomerUser

class CustomUserAdmin(UserAdmin):

    model = CustomerUser
    list_display = ['email', 'username', 'phone', 'is_driver']
    fieldsets = (
            (None, {'fields': ('first_name', 'last_name', 'username', 'email', 'phone', 'is_driver', 'is_active', 'password')}), # Removed usable_password
            # ... other fieldsets
        )
    add_fieldsets = (
            (None, {
                'classes': ('wide',),
                'fields': ('first_name', 'last_name', 'username', 'email', 'password1', 'password2', 'phone', 'is_driver') # Use 'password' and 'password2' for confirmation
            }),
            # ...
        )


admin.site.register(CustomerUser, CustomUserAdmin)