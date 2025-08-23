from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import subprocess
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def retrain_event_prediction(request):
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # Step 1: Autofill actuals
    subprocess.run(['python', 'manage.py', 'autofill_actuals'], cwd=backend_dir)
    # Step 2: Export completed events
    subprocess.run(['python', 'manage.py', 'export_completed_events'], cwd=backend_dir)
    # Step 3: Retrain model
    subprocess.run(['python', 'ml/train_model.py'], cwd=backend_dir)
    return Response({"detail": "Event prediction retraining pipeline triggered."})