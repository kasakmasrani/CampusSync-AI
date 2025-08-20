# admin.py
from django.contrib import admin
from .models import Event, Wishlist, EventSchedule, Feedback

class EventScheduleInline(admin.TabularInline):
    model = EventSchedule
    extra = 1  

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'organizer', 'date', 'category', 'max_capacity')
    search_fields = ('title', 'description', 'category', 'department')
    list_filter = ('date', 'category', 'department')
    inlines = [EventScheduleInline]


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'added_at')
    search_fields = ('user__username', 'event__title')

@admin.register(EventSchedule)
class EventScheduleAdmin(admin.ModelAdmin):
    
    list_display = ('event', 'time', 'activity')
    search_fields = ('event__title', 'activity')
    readonly_fields = ('created_at',)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'rating', 'created_at')
    search_fields = ('user__username', 'event__title', 'comment')