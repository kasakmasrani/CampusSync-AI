from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail, EmailMessage
from django.conf import settings
from .models import Event, Feedback, Wishlist
from accounts.models import User
from .serializers import EventSerializer, FeedbackSerializer, WishlistSerializer, EventDetailSerializer
from accounts.permissions import IsOrganizer
from ml.predict import predict_event_success
from ml.sentiment import predict_sentiment
from ml.student_clustering import get_similar_students
from ml.train_model import train_model
import logging
import os
import sys
import subprocess

# Public event list view
class EventListView(generics.ListAPIView):
    queryset = Event.objects.all().order_by('-date', '-time')
    serializer_class = EventSerializer
    permission_classes = []  # Public access
    def get_serializer_context(self):
        return {'request': self.request}
class PredictEventView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrganizer]

    def post(self, request):
        try:
            print("Received data for prediction:", request.data)
            prediction = predict_event_success(request.data)
            print("Prediction result:", prediction)
            return Response(prediction)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class EventCreateView(generics.CreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizer]

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

class OrganizerEventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrganizer]

    def get_queryset(self):
        return Event.objects.filter(organizer=self.request.user).order_by('-date', '-time')

class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventDetailSerializer
    permission_classes = []  # Public access
    
    def delete(self, request, pk):
        event = get_object_or_404(Event, pk=pk, organizer=request.user)
        event.delete()
        return Response({"message": "Event deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class RegisterEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
            serializer = FeedbackSerializer(data=request.data)
            if serializer.is_valid():
                # 👇 Step 1: Run sentiment prediction
                comment_text = request.data.get("comment", "")
                sentiment = predict_sentiment(comment_text)
                event.registered_users.add(request.user)
                event.save()
                # 👇 Step 2: Save feedback instance
                feedback_instance = serializer.save(user=request.user, event=event)
                feedback_instance.sentiment = sentiment  # Add sentiment to the feedback instance
                feedback_instance.save()
                # 👇 Step 3: Update the event’s overall sentiment field (optional: make it smarter later)
                event.sentiment = sentiment
                event.save()

                # 👇 Step 4: Add `sentiment` to response if needed
                response_data = serializer.data
                response_data["sentiment"] = sentiment

                return Response(response_data, status=201)
            # Log serializer errors for debugging
            import logging
            logger = logging.getLogger("django")
            logger.error(f"Feedback serializer errors: {serializer.errors}")
            print("Feedback serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)
        except Event.DoesNotExist:
            #...
                {"detail": "Event not found."},
                status=status.HTTP_404_NOT_FOUND
            
        except Exception as e:
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UnregisterEventView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            event = Event.objects.get(pk=pk)
            user = request.user

            if user not in event.registered_users.all():
                return Response(
                    {"detail": "You are not registered for this event."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            event.registered_users.remove(user)
            event.save()

            return Response(
                {"detail": "Successfully unregistered from the event."},
                status=status.HTTP_200_OK
            )
        except Event.DoesNotExist:
            return Response(
                {"detail": "Event not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

class WishlistView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist = Wishlist.objects.filter(user=request.user).order_by('-added_at')
        serializer = WishlistSerializer(wishlist, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        event_id = request.data.get("event_id")
        try:
            event = Event.objects.get(pk=event_id)
            wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, event=event)
            if not created:
                return Response({"detail": "Already in wishlist."}, status=409)
            return Response({"detail": "Added to wishlist."}, status=201)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=404)

    def delete(self, request):
        event_id = request.data.get("event_id")
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, event__id=event_id)
            wishlist_item.delete()
            return Response({"detail": "Removed from wishlist."}, status=200)
        except Wishlist.DoesNotExist:
            return Response({"detail": "Event not in wishlist."}, status=404)


class FeedbackListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, event_id):
        feedbacks = Feedback.objects.filter(event_id=event_id).order_by('-created_at')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    def post(self, request, event_id):
        try:
            event = Event.objects.get(pk=event_id)
            serializer = FeedbackSerializer(data=request.data)
            if serializer.is_valid():
                # 👇 Step 1: Run sentiment prediction
                comment_text = request.data.get("comment", "")
                sentiment = predict_sentiment(comment_text)

                # 👇 Step 2: Save feedback instance
                feedback_instance = serializer.save(user=request.user, event=event)
                feedback_instance.sentiment = sentiment  # Add sentiment to the feedback instance
                feedback_instance.save()
                # 👇 Step 3: Update the event’s overall sentiment field (optional: make it smarter later)
                event.sentiment = sentiment
                event.save()

                # 👇 Step 4: Add `sentiment` to response if needed
                response_data = serializer.data
                response_data["sentiment"] = sentiment

                return Response(response_data, status=201)
            # Log serializer errors for debugging
            import logging
            logger = logging.getLogger("django")
            logger.error(f"Feedback serializer errors: {serializer.errors}")
            print("Feedback serializer errors:", serializer.errors)
            return Response(serializer.errors, status=400)
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=404)    

class StudentDashboardEventsView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Event.objects.filter(
            registered_users=user
        ).order_by('-date', '-time')
    
    def get_serializer_context(self):
        return {'request': self.request}


class OrganizerSentimentAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        organizer = request.user
        events = Event.objects.filter(organizer=organizer)
        feedbacks = Feedback.objects.filter(event__in=events)

        total = feedbacks.count()
        sentiment_count = {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        }

        for fb in feedbacks:
            sent = getattr(fb, 'sentiment', 'neutral')  # fallback if missing
            if sent in sentiment_count:
                sentiment_count[sent] += 1
            else:
                sentiment_count["neutral"] += 1

        if total == 0:
            return Response({
                "positive": 0,
                "neutral": 0,
                "negative": 0
            })

        percentages = {
            key: round((count / total) * 100)
            for key, count in sentiment_count.items()
        }

        return Response(percentages)


class TrendingInterestsView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        # Get all events created by the organizer
        organizer = request.user
        events = Event.objects.filter(organizer=organizer)

        interest_counter = {}

        for event in events:
            for tag in event.tags:
                interest_counter[tag] = interest_counter.get(tag, 0) + event.registered_users.count()

        # Sort by count descending
        sorted_interests = sorted(interest_counter.items(), key=lambda x: x[1], reverse=True)

        # Example logic to add mock growth for UI (you can calculate real growth later)
        trending_data = [
            {
                "interest": interest,
                "count": count,
                "growth": f"+{10 + i * 2}%"
            }
            for i, (interest, count) in enumerate(sorted_interests)
        ]

        return Response(trending_data)


class OrganizerStatsView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        organizer = request.user
        events = Event.objects.filter(organizer=organizer)

        total_events_created = events.count() or 0

        # Total students reached
        total_students_reached = sum(event.registered_users.count() for event in events) or 0
       # Total capacity across all events
        total_capacity = sum(event.max_capacity for event in events) or 1  # avoid division by zero
        # Attendance rate (in %)
        attendance_rate = (total_students_reached / total_capacity) * 100 if total_capacity > 0 else 0
        attendance_rate = round(attendance_rate, 2)

        # Average rating across all feedback for organizer's events
        feedbacks = Feedback.objects.filter(event__in=events)
        avg_rating = feedbacks.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 4.3
        avg_rating = round(avg_rating, 2)

        # Average success rate across events
        avg_success_rate = events.aggregate(avg=Avg('success_rate'))['avg'] or 75.0
        avg_success_rate = round(avg_success_rate, 2)

        return Response({
            "total_events_created": total_events_created ,
            "total_students_reached": total_students_reached ,
            "average_rating": avg_rating ,
            "average_success_rate": avg_success_rate ,
                        "attendance_rate": attendance_rate,
            "total_capacity": total_capacity
        })

class StudentsByInterestView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def get(self, request):
        interest = request.query_params.get("interest")
        if not interest:
            return Response({"detail": "Interest tag is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            events = Event.objects.filter(organizer=request.user, tags__icontains=interest)

            students = User.objects.filter(
                registered_events__in=events,
                role="student"  # Adjust this as per your model
            ).distinct()

            student_data = students.values("id", "username", "email")
            return Response(student_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SimilarStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger = logging.getLogger("django")
        user = request.user
        user_id = user.id
        logger.info(f"SimilarStudentsView called for user_id={user_id}")
        try:
            similar = get_similar_students(user_id, top_n=5)
            logger.info(f"Similar students result: {similar}")
            return Response(similar)
        except Exception as e:
            logger.error(f"Error in SimilarStudentsView: {e}", exc_info=True)
            return Response({"detail": str(e)}, status=500)


class ContactAPIView(APIView):
    permission_classes = []  # Public

    def post(self, request):
        sender_email = request.data.get("email")
        message = request.data.get("message")

        if not sender_email or not message:
            return Response({"detail": "Email and message are required."}, status=400)

        # Email to Admin (you)
        subject_admin = "CampusSync AI: Contact Form Submission"
        body_admin = (
            f"You have received a new message from the contact form.\n\n"
            f"Sender Email: {sender_email}\n\n"
            f"Message:\n{message}\n\n"
            f"-- CampusSync AI"
        )

        # Email to User (confirmation)
        subject_user = "CampusSync AI: We've received your message"
        body_user = (
            f"Hi there,\n\n"
            f"Thank you for reaching out to CampusSync AI!\n\n"
            f"We've received your message and will get back to you as soon as possible.\n\n"
            f"Your message:\n{message}\n\n"
            f"Best regards,\nCampusSync AI Team"
        )

        try:
            # Send email to admin
            email_to_admin = EmailMessage(
                subject=subject_admin,
                body=body_admin,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[settings.DEFAULT_FROM_EMAIL],
                reply_to=[sender_email],
            )
            email_to_admin.send(fail_silently=False)

            # Send confirmation to user
            email_to_user = EmailMessage(
                subject=subject_user,
                body=body_user,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[sender_email],
            )
            email_to_user.send(fail_silently=False)

            return Response({"detail": "Message sent successfully."})

        except Exception as e:
            return Response({"detail": f"Failed to send message: {str(e)}"}, status=500)


# ML Model Retraining API
class RetrainEventPredictionModelView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request):
        try:
            train_model()
            print("[ML] Event prediction model retrained successfully.")
            return Response({"detail": "Event prediction model retrained successfully."}, status=200)
        except Exception as e:
            print(f"[ML] Event prediction model retraining failed: {str(e)}")
            return Response({"detail": f"Retraining failed: {str(e)}"}, status=500)
        

# ML Student Clustering Retraining API
class RetrainStudentClusteringModelView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request):
        try:
            # Run the training script as a subprocess to avoid import issues
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            script_path = os.path.join(base_dir, "ml", "train_model_students.py")
            result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
            if result.returncode == 0:
                print("[ML] Student clustering model retrained successfully.")
                return Response({"detail": "Student clustering model retrained successfully.", "output": result.stdout}, status=200)
            else:
                print(f"[ML] Student clustering model retraining failed: {result.stderr}")
                return Response({"detail": f"Retraining failed: {result.stderr}"}, status=500)
        except Exception as e:
            return Response({"detail": f"Retraining failed: {str(e)}"}, status=500)


# Export student features for clustering
class ExportStudentFeaturesView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizer]

    def post(self, request):
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            export_script = os.path.join(base_dir, "ml", "export_students.py")
            feature_script = os.path.join(base_dir, "ml", "feature_engineering.py")
            # Run export_students.py as a standalone script with Django setup
            env = os.environ.copy()
            env['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
            result1 = subprocess.run([
                sys.executable, export_script
            ], capture_output=True, text=True, cwd=os.path.join(base_dir, "ml"), env=env)
            # Run feature_engineering.py
            result2 = subprocess.run([
                sys.executable, feature_script
            ], capture_output=True, text=True, cwd=os.path.join(base_dir, "ml"))
            if result1.returncode == 0 and result2.returncode == 0:
                return Response({
                    "detail": "Student features exported and engineered successfully.",
                    "output_export": result1.stdout,
                    "output_features": result2.stdout
                }, status=200)
            else:
                return Response({
                    "detail": "Export or feature engineering failed.",
                    "export_err": result1.stderr,
                    "features_err": result2.stderr
                }, status=500)
        except Exception as e:
            return Response({"detail": f"Export failed: {str(e)}"}, status=500)