from django.db import models
from django.contrib.auth.models import User


class NewsSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions', null=True, blank=True)
    title = models.CharField(max_length=255)
    article_text = models.TextField()
    image = models.ImageField(upload_to='news_images/', blank=True, null=True)
    suspicious_words = models.TextField(blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    text_fake_score = models.FloatField(default=0.0)
    image_fake_score = models.FloatField(default=0.0)
    final_fake_score = models.FloatField(default=0.0)
    credibility_score = models.FloatField(default=0.0)
    final_label = models.CharField(max_length=20, blank=True, null=True)
    manipulated_regions = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title