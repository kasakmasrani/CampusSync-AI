
# Export student data for ML clustering
# Can be run as: python export_students.py

import os
import sys
import django
import csv


# Setup Django
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from accounts.models import User
from api.models import Event, Feedback

with open('student_ml_data.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow([
        'user_id', 'username', 'department', 'year', 'event_ids', 'event_tags', 'feedback_ratings', 'feedback_sentiments'
    ])
    for user in User.objects.filter(role='student'):
        # Events participated
        events = user.registered_events.all()
        event_ids = [str(e.id) for e in events]
        event_tags = list(set(tag for e in events for tag in (e.tags or [])))
        # Feedback
        feedbacks = user.feedbacks.all()
        feedback_ratings = [str(f.rating) for f in feedbacks if f.rating is not None]
        feedback_sentiments = [f.sentiment for f in feedbacks if f.sentiment]
        writer.writerow([
            user.id,
            user.username,
            user.department or '',
            user.year or '',
            ';'.join(event_ids),
            ';'.join(event_tags),
            ';'.join(feedback_ratings),
            ';'.join(feedback_sentiments)
        ])
print('Exported student data to student_ml_data.csv')
