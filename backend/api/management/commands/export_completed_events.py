import csv
from django.core.management.base import BaseCommand
from api.models import Event
import os
from django.db.models import Q

class Command(BaseCommand):
    help = 'Export completed events to updated_event_dataset.csv, append to event_dataset.csv, and clear updated_event_dataset.csv'

    def handle(self, *args, **kwargs):
        backend_dir = os.path.dirname(
            os.path.dirname(
                os.path.dirname(
                    os.path.dirname(os.path.abspath(__file__))
                )
            )
        )  # goes up to backend/
        updated_path = os.path.join(backend_dir, "updated_event_dataset.csv")
        event_path = os.path.join(backend_dir, "ml", "data", "event_dataset.csv")
        print(f"DEBUG: Looking for updated_event_dataset.csv at {updated_path}")

        # Step 1: Export completed events to updated_event_dataset.csv
        completed_events = Event.objects.filter(
            Q(actual_attendees__gt=0) |
            Q(actual_engagement__gt=0) |
            Q(actual_success_rate__gt=0)
        ).distinct()
        header = [
            'event_title', 'category', 'department', 'target_year', 'capacity',
            'location', 'date', 'time', 'event_tags', 'actual_success_rate',
            'actual_attendees', 'actual_engagement', 'actual_sentiment'
        ]
        with open(updated_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(header)
            for event in completed_events:
                writer.writerow([
                    event.title, event.category, event.department, event.target_year,
                    event.max_capacity, event.location, event.date, event.time,
                    ','.join(event.tags), event.actual_success_rate,
                    event.actual_attendees, event.actual_engagement, event.actual_sentiment
                ])

        # Step 2: Append updated_event_dataset.csv to event_dataset.csv and clear updated_event_dataset.csv
        with open(updated_path, 'r', newline='') as updated_file:
            reader = list(csv.reader(updated_file))
            if len(reader) <= 1:
                self.stdout.write(self.style.WARNING('No new events to append.'))
                return
            # header = reader[0]
            rows = reader[1:]

        file_exists = os.path.exists(event_path)
        with open(event_path, 'a', newline='') as event_file:
            writer = csv.writer(event_file)
            if not file_exists:
                writer.writerow(header)
            for row in rows:
                writer.writerow(row)

        # Empty updated_event_dataset.csv (keep header)
        with open(updated_path, 'w', newline='') as updated_file:
            writer = csv.writer(updated_file)
            writer.writerow(header)

        self.stdout.write(self.style.SUCCESS(f'Exported and appended {len(rows)} events to {event_path} and cleared updated_event_dataset.csv'))