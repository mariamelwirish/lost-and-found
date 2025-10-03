from tkinter import CASCADE
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

# Create your models here.
class ItemPost(models.Model):
    STATUS = [
        ('lost', 'Lost'),
        ('found', 'Found'),
    ]
    title = models.TextField()
    description = models.TextField()
    status = models.CharField(choices=STATUS)
    location = models.TextField(blank = True)
    owner = models.ForeignKey(User, on_delete=CASCADE, related_name="item_posts")
    creationDate = models.DateTimeField(auto_now_add=True)
    updateDate = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

