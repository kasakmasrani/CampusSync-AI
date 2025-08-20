import pandas as pd
import joblib
from datetime import datetime
import numpy as np

class EventSuccessPredictor:
    def _validate_input(self, form_data):
        required_fields = {
            'title': str,
            'category': str,
            'department': str,
            'targetYear': (str, int),
            'maxCapacity': (str, int),
            'location': str,
            'date': str,
            'time': str,
            'tags': list
        }
        for field, field_type in required_fields.items():
            if field not in form_data:
                raise ValueError(f"Missing required field: {field}")
            if not isinstance(form_data[field], field_type):
                raise ValueError(f"Field {field} should be type {field_type}")
    def __init__(self, model_path='event_success_model.joblib'):
        try:
            self.model = joblib.load(model_path)
            print("✅ Model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    def _validate_input(self, form_data):
        """More robust validation with error messages"""
        errors = []
        required = {
            'title': (str, 3, 100),  # min 3, max 100 chars
            'capacity': (int, 10, 500),
            'date': (str, None, None)  # will validate date format later
        }
        
        for field, (dtype, min_val, max_val) in required.items():
            if field not in form_data:
                errors.append(f"Missing required field: {field}")
                continue
                
            try:
                val = dtype(form_data[field])
                if min_val is not None and val < min_val:
                    errors.append(f"{field} must be ≥ {min_val}")
                if max_val is not None and val > max_val:
                    errors.append(f"{field} must be ≤ {max_val}")
            except (ValueError, TypeError):
                errors.append(f"{field} must be type {dtype.__name__}")
        
        if errors:
            raise ValueError(" | ".join(errors))
        
    def predict_with_confidence(self, form_data):
        """Return prediction with confidence interval"""
        input_df = self.prepare_features(form_data)
        predictions = []
        for tree in self.model.named_steps['regressor'].estimators_:
            pred = tree.predict(
                self.model.named_steps['preprocessor'].transform(input_df)
            )[0]
            predictions.append(pred)
        
        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)
        return {
            'prediction': mean_pred,
            'confidence_interval': (
                max(30, mean_pred - 1.96*std_pred),
                min(99, mean_pred + 1.96*std_pred)
            ),
            'stability': 1 - (std_pred / mean_pred)
        }
    def _get_time_of_day(self, hour):
        """Helper to categorize time of day"""
        if hour < 12: return 'morning'
        elif hour < 17: return 'afternoon'
        return 'evening'

    def prepare_features(self, form_data):
        self._validate_input(form_data)
        try:
            # Parse datetime
            event_date = datetime.strptime(form_data['date'], '%Y-%m-%d')
            event_time = datetime.strptime(form_data['time'], '%H:%M').time()
            # Build feature dictionary
            features = {
                'event_title': form_data['title'],
                'category': form_data['category'],
                'department': form_data['department'],
                'target_year': int(form_data['targetYear']),
                'capacity': int(form_data['maxCapacity']),
                'location': form_data['location'],
                'month': event_date.month,
                'day_of_week': event_date.weekday(),  # Monday=0
                'hour': event_time.hour,
                'event_tags': ', '.join(form_data['tags']),
                'title_length': len(form_data['title']),
                'title_word_count': len(form_data['title'].split()),
                'num_tags': len(form_data['tags']),
                'is_weekend': int(event_date.weekday() in [5, 6]),
                'time_of_day': self._get_time_of_day(event_time.hour)
            }
            return pd.DataFrame([features])
        except Exception as e:
            print(f"❌ Error preparing features: {e}")
            raise

    def explain_prediction(self, form_data):
        """Provide feature importance for a prediction"""
        input_df = self.prepare_features(form_data)
        # For RandomForest models
        if hasattr(self.model.named_steps['regressor'], 'feature_importances_'):
            importances = self.model.named_steps['regressor'].feature_importances_
            feature_names = self.model.named_steps['preprocessor'].get_feature_names_out()
            return sorted(zip(feature_names, importances), key=lambda x: -x[1])
        return None

    def predict(self, form_data):
        """
        Make success rate prediction from form data
        Args:
            form_data: Dict from frontend form
        Returns:
            float: Predicted success rate (0-100)
        """
        try:
            # Prepare features
            input_df = self.prepare_features(form_data)
            
            # Make prediction
            prediction = self.model.predict(input_df)[0]
            
            # Clip to realistic range
            return max(30, min(99, round(prediction, 1)))
            
        except Exception as e:
            print(f"❌ Prediction failed: {e}")
            raise

# Example usage
if __name__ == "__main__":
    # Test the predictor
    predictor = EventSuccessPredictor()
    
    test_event = {
        'title': 'Data Science Hackathon',
        'category': 'Technology',
        'department': 'Computer',
        'targetYear': '3',
        'maxCapacity': '50',
        'location': 'Computer Lab',
        'date': '2024-11-15',  # Friday
        'time': '14:00',
        'tags': ['data', 'python', 'ml']
    }
    
    try:
        prediction = predictor.predict(test_event)
        print(f"🎯 Predicted success rate: {prediction}%")
    except Exception as e:
        print(f"Prediction failed: {e}")
