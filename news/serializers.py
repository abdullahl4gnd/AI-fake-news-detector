from rest_framework import serializers
from .models import NewsSubmission


class NewsSubmissionSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = NewsSubmission
        fields = '__all__'
        read_only_fields = ['user']