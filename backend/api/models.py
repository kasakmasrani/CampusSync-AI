# api/models.py
from django.db import models
from accounts.models import User
from django.contrib.auth import get_user_model
User = get_user_model()
class Event(models.Model):
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date = models.DateField()
    time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100)
    target_year = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    max_capacity = models.PositiveIntegerField()
    tags = models.JSONField(default=list, blank=True)

    poster = models.ImageField(upload_to="event_posters/", null=True, blank=True)
    
    # ML Fields
    success_rate = models.FloatField(null=True, blank=True)
    expected_attendees = models.PositiveIntegerField(null=True, blank=True)
    engagement = models.FloatField(null=True, blank=True)
    sentiment = models.CharField(max_length=50, blank=True)
    # Actual results fields
    actual_success_rate = models.FloatField(null=True, blank=True)
    actual_attendees = models.PositiveIntegerField(null=True, blank=True)
    actual_engagement = models.FloatField(null=True, blank=True)
    actual_sentiment = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    registered_users = models.ManyToManyField(User, related_name='registered_events', blank=True)


    def __str__(self):
        return self.title
    def attendee_count(self):
        return self.registered_users.count()

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # no duplicate wishlist entries

    def __str__(self):
        return f"{self.user.username} → {self.event.title}"


class EventSchedule(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='schedule')
    time = models.CharField(max_length=50)
    activity = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event.title} @ {self.time}"

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedbacks')
    rating = models.PositiveIntegerField(null=True, blank=True)  # 1 to 5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sentiment = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return f"{self.user.username}'s feedback on {self.event.title}"
