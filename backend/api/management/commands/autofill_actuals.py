from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Event

class Command(BaseCommand):
    help = 'Autofill actual fields for events that have ended'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        events = Event.objects.filter(date__lt=now.date()) | Event.objects.filter(date=now.date(), time__lt=now.time())
        for event in events:
            # Only update if not already filled
            if event.actual_attendees is None:
                event.actual_attendees = event.registered_users.count() if hasattr(event, 'registered_users') else 0
            feedbacks = event.feedbacks.all() if hasattr(event, 'feedbacks') else []
            if feedbacks and event.actual_engagement is None:
                event.actual_engagement = sum(f.rating for f in feedbacks if f.rating) / len(feedbacks)
                sentiments = [f.sentiment for f in feedbacks if f.sentiment]
                if sentiments and event.actual_sentiment is None:
                    event.actual_sentiment = max(set(sentiments), key=sentiments.count)
            event.save()
        self.stdout.write(self.style.SUCCESS('Autofilled actuals for past events.'))