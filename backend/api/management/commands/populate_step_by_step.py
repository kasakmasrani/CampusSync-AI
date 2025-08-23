from django.core.management.base import BaseCommand
from accounts.models import User
from api.models import Event, Wishlist, EventSchedule, Feedback
from faker import Faker
import random
from datetime import time

class Command(BaseCommand):
    help = "Populate database with fake data step by step"

    def handle(self, *args, **kwargs):
        fake = Faker()
        departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical']
        years = ['1', '2', '3', '4']

        # --- Step 0: Clear tables ---
        def clear_tables():
            EventSchedule.objects.all().delete()
            Wishlist.objects.all().delete()
            Feedback.objects.all().delete()
            Event.objects.all().delete()
            User.objects.exclude(is_superuser=True).delete()
            self.stdout.write(self.style.SUCCESS("✅ All tables cleared"))

        # --- Step 1: Create Organizers ---
        def create_organizers(n=10):
            organizers = []
            for i in range(n):
                u = User.objects.create_user(
                    username=f"organizer{i+1}",
                    email=fake.email(),
                    password="test1234",
                    role='organizer',
                    department=random.choice(departments),
                    year=random.choice(years)
                )
                organizers.append(u)
            self.stdout.write(self.style.SUCCESS(f"✅ {n} organizers created"))
            return organizers

        # --- Step 2: Create Students ---
        def create_students(n=50):
            students = []
            for i in range(n):
                u = User.objects.create_user(
                    username=f"student{i+1}",
                    email=fake.email(),
                    password="test1234",
                    role='student',
                    student_id=fake.unique.bothify(text='CS###'),
                    department=random.choice(departments),
                    year=random.choice(years)
                )
                students.append(u)
            self.stdout.write(self.style.SUCCESS(f"✅ {n} students created"))
            return students

        # --- Step 3: Create Events ---
        def create_events(organizers, n=20):
            categories = ['Workshop', 'Seminar', 'Sports', 'Cultural', 'Tech Talk']
            events = []
            for i in range(n):
                organizer = random.choice(organizers)
                t = time(random.randint(9,18), random.choice([0,15,30,45]))
                event = Event.objects.create(
                    organizer=organizer,
                    title=fake.sentence(nb_words=4),
                    description=fake.paragraph(nb_sentences=3),
                    date=fake.future_date(end_date='+30d'),
                    time=t,
                    location=fake.city(),
                    category=random.choice(categories),
                    target_year=random.choice(years),
                    department=random.choice(departments),
                    max_capacity=random.randint(30, 200),
                    tags=[fake.word() for _ in range(3)]
                )
                events.append(event)
            self.stdout.write(self.style.SUCCESS(f"✅ {n} events created"))
            return events

        # --- Step 4: Create Event Schedules ---
        def create_schedules(events):
            for event in events:
                for _ in range(random.randint(2, 5)):
                    t = time(random.randint(9,18), random.choice([0,15,30,45]))
                    EventSchedule.objects.create(
                        event=event,
                        time=t,
                        activity=fake.sentence(nb_words=5)
                    )
            self.stdout.write(self.style.SUCCESS("✅ Event schedules created"))

        # --- Step 5: Add Registrations and Wishlists ---
        def add_registrations_wishlists(events, students):
            for student in students:
                # Registered events
                registered_events = random.sample(events, min(len(events), random.randint(1,5)))
                for e in registered_events:
                    e.registered_users.add(student)
                # Wishlist events
                wishlist_events = random.sample(events, min(len(events), random.randint(1,3)))
                for e in wishlist_events:
                    Wishlist.objects.get_or_create(user=student, event=e)
            self.stdout.write(self.style.SUCCESS("✅ Registrations and wishlists added"))

        # --- Step 6: Add Feedbacks ---
        def add_feedbacks(events, students):
            for event in events:
                for student in random.sample(students, min(len(students), random.randint(1,10))):
                    Feedback.objects.create(
                        user=student,
                        event=event,
                        rating=random.randint(1,5),
                        comment=fake.sentence(nb_words=10),
                        sentiment=random.choice(['Positive', 'Neutral', 'Negative'])
                    )
            self.stdout.write(self.style.SUCCESS("✅ Feedbacks added"))

        # ---- Run step by step manually ----
        # Uncomment the steps you want to run, one at a time

        clear_tables()
        # organizers = create_organizers()
        # students = create_students()
        # events = create_events(organizers)
        # create_schedules(events)
        # add_registrations_wishlists(events, students)
        # add_feedbacks(events, students)

        self.stdout.write(self.style.SUCCESS("⚡ Script ready. Uncomment steps to run one by one."))
