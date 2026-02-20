from django.db import models
from django.contrib.auth.models import AbstractUser
 
class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    pic = models.ImageField(upload_to='profile_image', blank=True, null=True)
    facebook = models.URLField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.username
    