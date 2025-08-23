from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Event
from datetime import time
@receiver(post_save, sender=Event)
def update_actual_results(sender, instance, **kwargs):
    now = timezone.now()
    event_time = instance.time if instance.time else time(0, 0)  
    event_datetime = timezone.make_aware(
        timezone.datetime.combine(instance.date, event_time)
    )
    
    if event_datetime < now and (
        instance.actual_attendees is None or
        instance.actual_engagement is None or
        instance.actual_sentiment is None or
        instance.actual_success_rate is None
    ):
        # Calculate actual attendees
        actual_attendees = instance.registered_users.count()
        # Calculate actual engagement (average rating)
        feedbacks = instance.feedbacks.all()
        actual_engagement = None
        actual_sentiment = None
        if feedbacks.exists():
            actual_engagement = sum(f.rating for f in feedbacks if f.rating) / feedbacks.count()
            sentiments = [f.sentiment for f in feedbacks if f.sentiment]
            if sentiments:
                actual_sentiment = max(set(sentiments), key=sentiments.count)
            else:
                actual_sentiment = "neutral" 
        else:
            actual_engagement = 0
            actual_sentiment = "neutral" 
        # Autofill actual_success_rate as attendance/capacity (if capacity > 0)
        actual_success_rate = 0
        if instance.max_capacity and instance.max_capacity > 0:
            actual_success_rate = round((actual_attendees / instance.max_capacity) * 100, 2)
        # Update only actual fields to avoid recursion
        Event.objects.filter(pk=instance.pk).update(
            actual_attendees=actual_attendees,
            actual_engagement=actual_engagement,
            actual_sentiment=actual_sentiment,
            actual_success_rate=actual_success_rate
        )