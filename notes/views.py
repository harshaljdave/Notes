from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from .models import User, Favourites, Folders, Notes, Tagged_Notes, Tags, Shared, FolderNotes

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return JsonResponse({
                "id": user.id,
                "username": user.username,
                "email": user.email
            })
        else:
            return JsonResponse({"error": "Invalid username and/or password."}, status=401)
    else:
        return render(request, "notes/login.html")


def tags(request):
    if request.method == "GET":
        UserTags =list(Tags.objects.filter(user = request.user).values("id","tag")) 
        return JsonResponse(UserTags,safe=False,status=200)
    
    elif request.method == "POST":
        data = json.loads(request.body)
        tag = data['tag'].capitalize()
        NewTag = Tags.objects.get_or_create(user = request.user, tag = tag)
        if NewTag[1]:
            return JsonResponse({"Tag":NewTag[0].tag,"pk": NewTag[0].pk,"Created":"Tag Created"}, status=200)
        else : 
            return JsonResponse({"Exists": "Tag already exists"}, status=200)
    
    elif request.method == "DELETE":
        data = json.loads(request.body)
        
        if not data['taglist']:
            return JsonResponse({"Empty":"Nothing to delete"})
            
        for tag in data['taglist']:
            tagid = tag.replace("tag","")
            tag = Tags.objects.get(user = request.user, pk = tagid)
            Tagged_Notes.objects.filter(tag = tag).delete()
            tag.delete()
        return JsonResponse({"Deleted":"Tag(s) Deleted"})

    else:
        return HttpResponse(status=405,reason="Method not allowed")
    
def folderList(request):
    if request.method == "GET":
        note_id = request.GET.get('note_id')
        current_folder = FolderNotes.objects.get(note=note_id).folder.pk if FolderNotes.objects.filter(note=note_id).exists() else None
        folders = list(Folders.objects.filter(user = request.user).order_by("created_on").values("id","name"))

        return JsonResponse({"folders":folders, "current_folder":current_folder},safe=False,status=200)
    
    if request.method == "PUT":
        data = json.loads(request.body)
        Note_id = data.get("noteID")
        addID = data.get("addID") if data.get("addID") else None
        remove_id = data.get("removeID") if data.get("removeID") else None
        if addID:
            FolderNotes.objects.create(user=request.user,note = Notes.objects.get(pk=Note_id), folder=Folders.objects.get(pk=addID))
        if remove_id:
            FolderNotes.objects.get(user=request.user, note=Note_id, folder=Folders.objects.get(pk=remove_id)).delete()
        return JsonResponse({'removeID':data["removeID"], 'addID':addID, 'status':200 }, safe=False)

@login_required(login_url="login")   
def folderdelete(request,FolderID):
    if request.method == "DELETE":
        try:
            folder = Folders.objects.get(pk=FolderID, user=request.user)
            folder.delete()
            return JsonResponse({"success": "Folder deleted"}, status=200)
        except Folders.DoesNotExist:
            return JsonResponse({"error": "Folder not found"}, status=404)
    else:
        return HttpResponse(status=405, reason="Method not allowed")

from django.contrib.auth.decorators import login_required

@login_required(login_url="/login")
def get_notes(request):
    notes = Notes.objects.filter(createdBy=request.user).order_by("-created_on")
    data = []
    for note in notes:
        tags = Tagged_Notes.objects.filter(note=note)
        tag_data = [{"id": tag.tag.id, "name": tag.tag.tag} for tag in tags]
        data.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_on": note.created_on,
            "edited_by": note.editedBy.username if note.editedBy else None,
            "edit_time": note.edit_time,
            "tags": tag_data,
        })
    return JsonResponse(data, safe=False)

@login_required
def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({
            "isAuthenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email
            }
        })
    else:
        return JsonResponse({"isAuthenticated": False}, status=401)

@csrf_exempt
@login_required
def get_note_detail(request, note_id):
    try:
        note = Notes.objects.get(pk=note_id)
    except Notes.DoesNotExist:
        return JsonResponse({"error": "Note not found"}, status=404)

    # Check for permission for any method
    is_owner = (note.createdBy == request.user)
    is_shared_with_user_edit = Shared.objects.filter(note=note, shared_with=request.user, permission='edit').exists()

    if not (is_owner or is_shared_with_user_edit):
        # If not owner or editor, check for view-only permission for GET requests
        if request.method == 'GET' and Shared.objects.filter(note=note, shared_with=request.user, permission='view').exists():
             pass # Allow GET request
        else:
            return JsonResponse({"error": "Forbidden"}, status=403)

    if request.method == 'GET':
        tags = Tagged_Notes.objects.filter(note=note)
        tag_data = [{"id": tag.tag.id, "name": tag.tag.tag} for tag in tags]
        
        data = {
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_on": note.created_on,
            "edited_by": note.editedBy.username if note.editedBy else None,
            "edit_time": note.edit_time,
            "tags": tag_data,
            "permission": 'edit' if is_owner or is_shared_with_user_edit else 'view',
            "is_owner": is_owner
        }
        return JsonResponse(data)

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            note.title = data.get('title', note.title)
            note.content = data.get('content', note.content)
            note.editedBy = request.user
            
            # Handle tags only if the user is the owner
            if is_owner and 'tags' in data and isinstance(data['tags'], list):
                # Clear existing tags for the note
                Tagged_Notes.objects.filter(note=note).delete()
                # Add new tags
                for tag_name in data['tags']:
                    tag, created = Tags.objects.get_or_create(user=request.user, tag=tag_name)
                    Tagged_Notes.objects.create(note=note, tag=tag)

            note.save()

            response_data = {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "created_on": note.created_on,
                "edited_by": note.editedBy.username,
                "edit_time": note.edit_time,
                "tags": [{"id": tag.tag.id, "name": tag.tag.tag} for tag in Tagged_Notes.objects.filter(note=note)],
                "permission": 'edit',
                "is_owner": is_owner
            }
            return JsonResponse(response_data)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    elif request.method == 'DELETE':
        if not is_owner:
            return JsonResponse({"error": "Only the owner can delete this note"}, status=403)
        
        note.delete()
        return HttpResponse(status=204) # Return a proper 204 No Content response
    
    else:
        return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
@login_required
def create_note(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            title = data.get('title', 'Untitled')
            content = data.get('content', '')

            new_note = Notes.objects.create(
                title=title,
                content=content,
                createdBy=request.user
            )
            
            # Return the newly created note object, serialized
            response_data = {
                "id": new_note.id,
                "title": new_note.title,
                "content": new_note.content,
                "created_on": new_note.created_on,
                "edited_by": None,
                "edit_time": new_note.edit_time,
                "tags": [] # A new note has no tags
            }
            return JsonResponse(response_data, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
    else:
        return JsonResponse({"error": "Only POST method is allowed"}, status=405)

@csrf_exempt
@login_required
def handle_folders(request):
    if request.method == 'GET':
        folders = Folders.objects.filter(user=request.user).order_by('-created_on')
        data = [{"id": folder.id, "name": folder.name, "created_on": folder.created_on} for folder in folders]
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name')
            if not name:
                return JsonResponse({"error": "Folder name is required"}, status=400)

            new_folder = Folders.objects.create(user=request.user, name=name)
            response_data = {
                "id": new_folder.id,
                "name": new_folder.name,
                "created_on": new_folder.created_on
            }
            return JsonResponse(response_data, status=201)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
@login_required
def handle_single_folder(request, folder_id):
    try:
        folder = Folders.objects.get(pk=folder_id, user=request.user)
    except Folders.DoesNotExist:
        return JsonResponse({"error": "Folder not found"}, status=404)

    if request.method == 'DELETE':
        folder.delete()
        return HttpResponse(status=204)
        
    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def get_folder_notes(request, folder_id):
    try:
        folder = Folders.objects.get(pk=folder_id, user=request.user)
    except Folders.DoesNotExist:
        return JsonResponse({"error": "Folder not found"}, status=404)

    if request.method == 'GET':
        note_ids = FolderNotes.objects.filter(folder=folder).values_list('note_id', flat=True)
        notes = Notes.objects.filter(pk__in=note_ids).order_by('-created_on')
        
        data = []
        for note in notes:
            tags = Tagged_Notes.objects.filter(note=note)
            tag_data = [{"id": tag.tag.id, "name": tag.tag.tag} for tag in tags]
            data.append({
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "created_on": note.created_on,
                "edited_by": note.editedBy.username if note.editedBy else None,
                "edit_time": note.edit_time,
                "tags": tag_data,
            })
        return JsonResponse({"folder_name": folder.name, "notes": data}, safe=False)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def get_shared_notes(request):
    shared_entries = Shared.objects.filter(shared_with=request.user).order_by('-shared_on')
    notes = [entry.note for entry in shared_entries]

    data = []
    for note in notes:
        tags = Tagged_Notes.objects.filter(note=note)
        tag_data = [{"id": tag.tag.id, "name": tag.tag.tag} for tag in tags]
        data.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_on": note.created_on,
            "edited_by": note.editedBy.username if note.editedBy else None,
            "edit_time": note.edit_time,
            "tags": tag_data,
        })
    return JsonResponse(data, safe=False)

@login_required
def get_favorite_notes(request):
    favorite_entries = Favourites.objects.filter(user=request.user)
    notes = [entry.note for entry in favorite_entries]

    data = []
    for note in notes:
        tags = Tagged_Notes.objects.filter(note=note)
        tag_data = [{"id": tag.tag.id, "name": tag.tag.tag} for tag in tags]
        data.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "created_on": note.created_on,
            "edited_by": note.editedBy.username if note.editedBy else None,
            "edit_time": note.edit_time,
            "tags": tag_data,
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
@login_required
def handle_sharing(request, note_id):
    try:
        note = Notes.objects.get(pk=note_id, createdBy=request.user)
    except Notes.DoesNotExist:
        return JsonResponse({"error": "Note not found or you do not have permission to share it."}, status=404)

    if request.method == 'GET':
        shared_with_users = Shared.objects.filter(note=note)
        data = [{"email": s.shared_with.email, "permission": s.permission} for s in shared_with_users]
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            permission = data.get('permission', 'view')

            if not email:
                return JsonResponse({"error": "Email is required"}, status=400)
            if permission not in ['view', 'edit']:
                return JsonResponse({"error": "Invalid permission level"}, status=400)
            
            try:
                user_to_share_with = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": f"User with email {email} not found."}, status=404)

            if user_to_share_with == request.user:
                return JsonResponse({"error": "You cannot share a note with yourself."}, status=400)

            shared, created = Shared.objects.update_or_create(
                note=note,
                shared_with=user_to_share_with,
                defaults={'shared_by': request.user, 'permission': permission}
            )
            return JsonResponse({"email": shared.shared_with.email, "permission": shared.permission}, status=201 if created else 200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    elif request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            if not email:
                return JsonResponse({"error": "Email is required to remove access"}, status=400)
            
            user_to_remove = User.objects.get(email=email)
            shared_entry = Shared.objects.get(note=note, shared_with=user_to_remove)
            shared_entry.delete()

            # Also remove from favorites if it exists
            Favourites.objects.filter(note=note, user=user_to_remove).delete()

            return HttpResponse(status=204)

        except (User.DoesNotExist, Shared.DoesNotExist):
            return JsonResponse({"error": "Shared entry not found for this user"}, status=404)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
@login_required
def toggle_favorite(request, note_id):
    try:
        note = Notes.objects.get(pk=note_id)
    except Notes.DoesNotExist:
        return JsonResponse({"error": "Note not found"}, status=404)

    if request.method == 'POST':
        favorite, created = Favourites.objects.get_or_create(user=request.user, note=note)
        if created:
            return JsonResponse({"status": "favorited"}, status=201)
        else:
            return JsonResponse({"status": "already favorited"}, status=200)

    elif request.method == 'DELETE':
        try:
            favorite = Favourites.objects.get(user=request.user, note=note)
            favorite.delete()
            return HttpResponse(status=204)
        except Favourites.DoesNotExist:
            return JsonResponse({"error": "Not a favorite"}, status=404)
            
    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def get_favorite_ids(request):
    favorite_ids = Favourites.objects.filter(user=request.user).values_list('note_id', flat=True)
    return JsonResponse(list(favorite_ids), safe=False)

@csrf_exempt
@login_required
def manage_note_in_folder(request, folder_id, note_id):
    try:
        folder = Folders.objects.get(pk=folder_id, user=request.user)
        note = Notes.objects.get(pk=note_id, createdBy=request.user)
    except (Folders.DoesNotExist, Notes.DoesNotExist):
        return JsonResponse({"error": "Folder or note not found"}, status=404)

    if request.method == 'POST':
        # This will add the note to the folder. If it's already there, it does nothing.
        FolderNotes.objects.get_or_create(user=request.user, folder=folder, note=note)
        return JsonResponse({"status": "Note added to folder"}, status=201)

    elif request.method == 'DELETE':
        try:
            folder_note = FolderNotes.objects.get(user=request.user, folder=folder, note=note)
            folder_note.delete()
            return HttpResponse(status=204)
        except FolderNotes.DoesNotExist:
            return JsonResponse({"error": "Note is not in this folder"}, status=404)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def get_note_folders(request, note_id):
    try:
        note = Notes.objects.get(pk=note_id, createdBy=request.user)
    except Notes.DoesNotExist:
        return JsonResponse({"error": "Note not found"}, status=404)

    if request.method == 'GET':
        folder_ids = FolderNotes.objects.filter(note=note).values_list('folder_id', flat=True)
        return JsonResponse(list(folder_ids), safe=False)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required(login_url="login")
def editNoteAccess(request, NoteID):
    if request.method == "GET":
        try:
            note = Notes.objects.get(pk=NoteID)
            shared_with = Shared.objects.filter(note=note).values_list('shared_with__email',"permission")
            return JsonResponse({"shared_with": list(shared_with)}, status=200)
        except Notes.DoesNotExist:
            return JsonResponse({"error": "Note not found"}, status=404)
        
    elif request.method == "DELETE":
        data = json.loads(request.body)
        email = data.get("email")
        try:
            user = User.objects.get(email=email)
            shared_entry = Shared.objects.get(note=NoteID, shared_with=user, shared_by=request.user)
            shared_entry.delete()

            try:
                favourite_entry = Favourites.objects.get(note=NoteID, user=user)
                favourite_entry.delete()
            except Favourites.DoesNotExist:
                pass

            return JsonResponse({"success": "Access removed"}, status=200)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        except Shared.DoesNotExist:
            return JsonResponse({"error": "Shared entry not found"}, status=404)
    else:
        return HttpResponse(status=405, reason="Method not allowed")