from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Event

class Command(BaseCommand):
    help = 'Trigger save on all past events to autofill actuals via signals'

    def handle(self, *args, **kwargs):
        now = timezone.now().date()
        past_events = Event.objects.filter(date__lt=now)
        count = 0
        for event in past_events:
            event.save()  # This triggers the signal
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Autofilled actuals for {count} past events'))