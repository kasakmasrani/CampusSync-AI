import csv
from django.core.management.base import BaseCommand
from api.models import Event
from datetime import time
class Command(BaseCommand):
    help = 'Export completed events with actual results to CSV for ML retraining'

    def handle(self, *args, **kwargs):
        completed_events = Event.objects.filter(actual_attendees__isnull=False)
        with open('updated_event_dataset.csv', 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow([
                'event_title', 'category', 'department', 'target_year', 'capacity',
                'location', 'date', 'time', 'event_tags', 'actual_success_rate',
                'actual_attendees', 'actual_engagement', 'actual_sentiment'
            ])
            for event in completed_events:
                writer.writerow([
                    event.title, event.category, event.department, event.target_year,
                    event.max_capacity, event.location, event.date, event.time,
                    ','.join(event.tags), event.actual_success_rate,
                    event.actual_attendees, event.actual_engagement, event.actual_sentiment
                ])
        self.stdout.write(self.style.SUCCESS('Exported completed events to updated_event_dataset.csv'))