# urls.py
from django.urls import path
from .views import (
    ContactAPIView,
    PredictEventView,
    EventCreateView,
    EventListView,
    OrganizerEventListView,
    OrganizerStatsView,
    EventDetailView,
    TrendingInterestsView,
    RegisterEventView,
    UnregisterEventView,
    WishlistView,
    FeedbackListCreateView,
    StudentDashboardEventsView,
    OrganizerSentimentAnalyticsView,
    StudentsByInterestView,
    SimilarStudentsView,
    RetrainEventPredictionModelView,
    RetrainStudentClusteringModelView,
    ExportStudentFeaturesView,

)

urlpatterns = [
    path("contact/", ContactAPIView.as_view(), name="contact"),
    # 🎯 ML Prediction
    path("predict/", PredictEventView.as_view(), name="predict-event-success"),

    # 🛠️ Event CRUD
    path("events/", EventListView.as_view(), name="event-list"),  # Public GET
    path("events/create/", EventCreateView.as_view(), name="event-create"),  # Authenticated POST
    path("events/<int:pk>/", EventDetailView.as_view(), name="event-detail"),
    path("events/<int:event_id>/register/", RegisterEventView.as_view(), name="event-register"),

    # 📊 Organizer Dashboards
    path("organizer/events/", OrganizerEventListView.as_view(), name="organizer-event-list"),
    path("organizer/stats/", OrganizerStatsView.as_view(), name="organizer-stats"),
    path("organizer/trending-interests/", TrendingInterestsView.as_view(), name="trending-interests"),
    path("organizer/sentiment-analysis/", OrganizerSentimentAnalyticsView.as_view(), name="organizer-sentiment"),
    path('students/by-interest/', StudentsByInterestView.as_view(), name='students-by-interest'),
    path("contact/", ContactAPIView.as_view(), name="contact"),

    # 🧍 Student Dashboard
    path("dashboard/student/", StudentDashboardEventsView.as_view(), name="student-dashboard"),

    # 📌 Registration
    path("events/<int:pk>/register/", RegisterEventView.as_view(), name="event-register"),
    path("events/<int:pk>/unregister/", UnregisterEventView.as_view(), name="event-unregister"),

    # 💖 Wishlist
    path("wishlist/", WishlistView.as_view(), name="wishlist"),

    # ✍️ Feedback
    path("events/<int:event_id>/feedback/", FeedbackListCreateView.as_view(), name="event-feedback"),

    # Similar Students
    path("students/similar/", SimilarStudentsView.as_view(), name="similar-students"),

    path('ml/retrain/predict/', RetrainEventPredictionModelView.as_view(), name='retrain-event-prediction'),
    path('ml/retrain/clustering/', RetrainStudentClusteringModelView.as_view(), name='retrain-student-clustering'),
    path('ml/export/student-features/', ExportStudentFeaturesView.as_view(), name='export-student-features'),
    
]
