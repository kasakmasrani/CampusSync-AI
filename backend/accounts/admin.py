from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class CustomUserAdmin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Custom Fields", {
            "fields": ("role", "student_id", "department", "year")
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Custom Fields", {
            "fields": ("role", "student_id", "department", "year")
        }),
    )

    list_display = ["username", "email", "role", "is_active"]
    list_filter = ["role", "is_staff"]

admin.site.register(User, CustomUserAdmin)
