from django.db.models import CASCADE
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class ItemPost(models.Model):
    STATUS = [
        ('lost', 'Lost'),
        ('found', 'Found'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS, default="lost", db_index=True)
    location = models.CharField(max_length=200, blank=True)
    date = models.DateField()
    owner = models.ForeignKey(User, on_delete=CASCADE, related_name="item_posts")
    creationDate = models.DateTimeField(auto_now_add=True, db_index=True)
    updateDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"
    
    class Meta:
        ordering = ["-creationDate"]

class ItemImage(models.Model):
    post = models.ForeignKey(ItemPost, on_delete=CASCADE, related_name="images")
    image = models.ImageField(upload_to="item_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]
