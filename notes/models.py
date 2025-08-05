from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Notes(models.Model):
    title = models.CharField(max_length=250)
    content = models.TextField()
    createdBy = models.ForeignKey(User, on_delete=models.CASCADE,related_name="creator")
    editedBy = models.ForeignKey(User, models.SET_NULL, blank=True, null=True,related_name="editor")
    edit_time = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)

class Folders(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    name = models.CharField(max_length=50)
    edit_time = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now_add=True)

class FolderNotes(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    note = models.ForeignKey(Notes,on_delete=models.CASCADE)
    folder = models.ForeignKey(Folders,on_delete=models.CASCADE)

class Favourites(models.Model):
    note = models.ForeignKey(Notes,on_delete=models.CASCADE)
    user = models.ForeignKey(User,on_delete=models.CASCADE)

class Tags(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tag = models.CharField(max_length=100)

class Tagged_Notes(models.Model):
    note = models.ForeignKey(Notes,on_delete=models.CASCADE)
    tag = models.ForeignKey(Tags,on_delete=models.CASCADE)

class Shared(models.Model):
    shared_by = models.ForeignKey(User,on_delete=models.CASCADE,related_name="sender")
    shared_with = models.ForeignKey(User,on_delete=models.CASCADE,related_name="receiver")
    note = models.ForeignKey(Notes,on_delete=models.CASCADE)
    shared_on = models.DateTimeField(auto_now_add=True)
    permission = models.CharField(max_length=10, choices=[('view', 'View'), ('edit', 'Edit')], default='view')

    class Meta:
        unique_together = ('note', 'shared_with')
