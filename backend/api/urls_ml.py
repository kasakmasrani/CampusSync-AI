from django.urls import path
from .views_ml import retrain_event_prediction

urlpatterns = [
    # ...existing code...
    path('ml/retrain/predict/', retrain_event_prediction),
    # ...existing code...
]