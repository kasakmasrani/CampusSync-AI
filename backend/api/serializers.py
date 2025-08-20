# api/serializers.py
from rest_framework import serializers
from .models import Event, Wishlist, EventSchedule, Feedback

class EventScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSchedule
        fields = ['id', 'event', 'time', 'activity']


class EventSerializer(serializers.ModelSerializer):
    schedule = EventScheduleSerializer(many=True, read_only=True)
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )
    registered_users_count = serializers.SerializerMethodField()
    is_registered = serializers.SerializerMethodField()
    organizer_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'organizer_name', 'title', 'description', 'date', 'time',
            'location', 'category', 'target_year', 'department',
            'max_capacity', 'tags', 'poster',
            'success_rate', 'expected_attendees', 'engagement', 'sentiment',
            'created_at', 'registered_users_count', 'is_registered', 'schedule'
        ]
        read_only_fields = ['organizer', 'registered_users']
    def get_organizer_name(self, obj):
        # Try to get full name, fallback to username, then email
        user = getattr(obj, 'organizer', None)
        if user:
            full_name = getattr(user, 'get_full_name', None)
            if callable(full_name):
                name = user.get_full_name()
                if name:
                    return name
            # fallback to first_name + last_name
            first = getattr(user, 'first_name', None)
            last = getattr(user, 'last_name', None)
            if first or last:
                return f"{first or ''} {last or ''}".strip()
            # fallback to username
            username = getattr(user, 'username', None)
            if username:
                return username
            # fallback to email
            email = getattr(user, 'email', None)
            if email:
                return email
        return "Unknown Organizer"
    def create(self, validated_data):
        schedule_data = self.context['request'].data.getlist('schedule') if 'request' in self.context else None
        # Remove schedule from validated_data if present
        validated_data.pop('schedule', None)
        event = super().create(validated_data)

        # Handle schedule creation from multipart form data
        request = self.context.get('request')
        if request:
            # Parse schedule items from request.FILES or request.POST
            # The frontend sends schedule[0][time], schedule[0][activity], etc.
            schedule_items = []
            idx = 0
            while True:
                time_key = f'schedule[{idx}][time]'
                activity_key = f'schedule[{idx}][activity]'
                time_val = request.data.get(time_key)
                activity_val = request.data.get(activity_key)
                if time_val is None or activity_val is None:
                    break
                schedule_items.append({'time': time_val, 'activity': activity_val})
                idx += 1
            for item in schedule_items:
                EventSchedule.objects.create(event=event, **item)
        return event

    def get_registered_users_count(self, obj):
        return obj.registered_users.count()

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            
            return obj.registered_users.filter(id=request.user.id).exists()
        return False
    
class WishlistSerializer(serializers.ModelSerializer):
    event = EventSerializer(read_only=True)  # nested event details
    event_id = serializers.PrimaryKeyRelatedField(
        queryset=Event.objects.all(), source='event', write_only=True
    )

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'event', 'event_id', 'added_at']
        read_only_fields = ['user', 'added_at']


class EventScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSchedule
        fields = ['id', 'event', 'time', 'activity']

class EventDetailSerializer(EventSerializer):
    schedule = EventScheduleSerializer(many=True, read_only=True)

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + ['schedule']


class FeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    event = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'user', 'user_name', 'event', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at', 'event']
