from operator import countOf
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.core.paginator import Paginator
from django.db.models import Q

from .models import User, Favourites, Folders, Notes, Tagged_Notes, Tags, Shared, FolderNotes

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:

            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "notes/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "notes/login.html")

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "notes/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        email_taken = User.objects.filter(email = email).exists()
        if not email_taken:
            try:
                user = User.objects.create_user(username, email, password)
                user.save()
            except IntegrityError:
                return render(request, "notes/register.html", {
                    "message": "Username already taken."
                })
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "notes/register.html", {
                    "message": "Email already in use."
                })
    else:
        return render(request, "notes/register.html")
    
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

@login_required(login_url="login")
def index(request):
    #Load the index page and Sort the posts in descending order
    notes = Notes.objects.filter(createdBy = request.user).order_by("-created_on")
    tags = Tags.objects.filter(user = request.user).order_by("tag")
    folders = list(Folders.objects.filter(user = request.user).order_by("created_on").values("id","name"))
    
    #Get the tags for each note
    NoteTags = Tagged_Notes.objects.filter(note__in = notes).values()
    
    paginator = Paginator(notes, 25)
    page_number = request.GET.get('page')
    pages = paginator.get_page(page_number)

    return render(request, "notes/index.html",{
        "Notes" : pages,
        "NoteTags" : NoteTags,
        "Tags": tags,
        "Folders" : folders
    })

@login_required(login_url="login")
@csrf_exempt
def folders(request):
    # Get all the folders of user
    if request.method == "GET":
        foldernames = Folders.objects.filter(user = request.user)
        return render(request, "notes/Folders.html",{
        "Folders" : foldernames
    })

    #User is trying to create new folder
    if request.method == "POST":
        data = json.loads(request.body)
        Newfolder = Folders(user = request.user, name= data.get("foldername"))
        Newfolder.save()
        return JsonResponse({"response":"Folder Created"},status=201)
    
    if request.method == "DELETE":
        # Folders.objects.get(pk=folderId, user=request.user).delete()
        return JsonResponse({"response":"Folder Deleted"},status=200)

@login_required(login_url="login")
def view_folder(request,FolderID):
    if request.method == "GET":
        Notes_ID = FolderNotes.objects.filter(user=request.user, folder=FolderID).values_list("note",flat=True)
        notes = Notes.objects.filter(pk__in=Notes_ID)
        tags = Tags.objects.filter(user = request.user).order_by("tag")
        NoteTags = Tagged_Notes.objects.filter(note__in = notes).values()


        paginator = Paginator(notes, 25)
        page_number = request.GET.get('page')
        pages = paginator.get_page(page_number)

        return render(request, "notes/FolderView.html",{
            "Notes":pages,
            "NoteTags" : NoteTags,
            "Tags":tags,
            "Folder":Folders.objects.get(id = FolderID)
        })

@login_required(login_url="login")
def SharedNotes(request):
    if request.method == "GET":
        shared_notes_ID = Shared.objects.filter(Q(shared_with = request.user) | Q(shared_by = request.user)).values_list("note",flat=True).order_by("-shared_on")
        shared_notes = Notes.objects.filter(pk__in=shared_notes_ID)
        paginator = Paginator(shared_notes, 25)
        page_number = request.GET.get('page')
        pages = paginator.get_page(page_number)
        return render(request, 'notes/SharedNotes.html',{
            "Notes":pages
        })
    
    elif request.method == "POST":
        Wrong_Email = False
        shared = False
        Self_share = False
        data = json.loads(request.body)
        emails = data["emails"].split(",")
        emails = [email.strip() for email in emails if emails]  # Clean up any extra spaces
        for email in emails:
            try:
                user = User.objects.get(email = email)
                if user == request.user:
                    Self_share = True
                
                else:
                    note_ID = Notes.objects.get(pk = data['note'])
                    sharednote= Shared.objects.get_or_create(note = note_ID, shared_with = user, shared_by = request.user)
                    if not sharednote[1]:
                        sharednote[0].permission = data['permission']
                        sharednote[0].save()
                    shared = True
            
            except User.DoesNotExist:
                Wrong_Email = True

        if Wrong_Email and not shared:
            if Self_share:
                return JsonResponse({"Not_Shared" : "One or more user not found",
                                     "Self_share":"Can not share with self"}, status=200)
            
            return JsonResponse({"Not_Shared" : "One or more user not found",},status=200)
        
        elif Wrong_Email and shared:
            if Self_share:
                return JsonResponse({"Shared" : "Note Shared with existing User(s)",
                                     "Not_Shared" : "One or more user not found",
                                     "Self_share":"Can not share with self"},status=200)
            
            return JsonResponse({"Not_Shared" : "One or more user not found",
                                  "Shared" : "Note Shared with existing User(s)"},status=200)
        
        elif not Wrong_Email and shared:
            if Self_share:
                return JsonResponse({"Shared" : "Note Shared with User(s)","Self_share":"Can not share with self"},status=200)
            
            return JsonResponse({"Shared" : "Note Shared with User(s)"},status=200)

        else:  
            return JsonResponse({"Self_share" : "Can not share with self"},status=200)
    else:
        return HttpResponse(status=405,reason="Method not allowed")

@login_required(login_url="login")
def FavouritesPage(request):
    if request.method == "GET":
        NotesID = Favourites.objects.filter(user=request.user).values_list("note",flat=True)
        FavNotes = Notes.objects.filter(pk__in=NotesID).order_by("-created_on")

        paginator = Paginator(FavNotes, 25)
        page_number = request.GET.get('page')
        pages = paginator.get_page(page_number)
        
        return render(request, 'notes/Favourites.html',{
            "Notes":pages
        })
    return render(request, 'notes/Favourites.html')

@login_required(login_url="login")
@csrf_exempt
def CreateNote(request):
    # Create a new note
    if request.method == "POST":
        NewNote = Notes(createdBy = request.user, content = request.POST['noteText'], title = request.POST['noteTitle'])
        NewNote.save()

        # if selected, save all the tags associated with Note 
        taglist = request.POST.getlist('Tags')
        if len(taglist) != 0:
            for tag in taglist:
                TaggedNote  = Tagged_Notes(note = NewNote, tag = Tags.objects.get(tag = tag, user = request.user))
                TaggedNote.save()

        folderID = request.POST['folder']
        if folderID != "0":
            folderNote = FolderNotes(user=request.user, note=NewNote, folder=Folders.objects.get(pk = folderID))
            folderNote.save()
        return HttpResponseRedirect(reverse("index"))
    
@login_required(login_url="login")
def note(request, NoteID):
    # Send the data of requested Note or Error
    if request.method == "GET":
        try:
            note = Notes.objects.get(pk=NoteID)
            favourited = Favourites.objects.filter(note = NoteID,user = request.user).exists()
            NoteTags = Tagged_Notes.objects.filter(note=NoteID).order_by("tag").values_list("tag",flat=True)
            tags = Tags.objects.filter(pk__in=NoteTags).values()
            if request.user != note.createdBy:
                permission = Shared.objects.get(note=note,shared_with=request.user).permission
            else:
                permission = "edit"
            return render(request, 'notes/NoteView.html',{
                'note' : note,
                'favourited' : favourited,
                'tags' : tags,
                'permission':permission,
            })
        except Exception as e:
            return JsonResponse({"error":"Note not found"},status = 404)
    
    # Edit the content of the note and tags
    if request.method == "PUT":

        data = json.loads(request.body)
        note = Notes.objects.get(pk=NoteID)
        note.title = data['title']
        note.content = data['content']
        note.editedBy = request.user
        note.save()
        EditTimeStamp = note.edit_time.astimezone().strftime("%I:%M %p, %d %b %Y")
        NoteDict = forms.model_to_dict(note)
        
        # Delete or add Tags associated with the Note
        tags = data['tags']
        if tags:
            tagids = Tags.objects.filter(user=request.user, tag__in=tags).values_list('pk',flat=True)
            tbd = Tagged_Notes.objects.filter(note=NoteID).exclude(tag__in = tagids)
            if tbd:
                for entry in tbd:
                    entry.delete()
            for tag in tagids:
                Tagged_Notes.objects.get_or_create(note = note,tag = Tags.objects.get(pk = tag))
        
        return JsonResponse({"success":"Note Updated","note":NoteDict,"EditTimeStamp":EditTimeStamp,"EditBy":request.user.username},safe=True,status = 200)
    if request.method == "DELETE":
        # Delete the note
        Notes.objects.get(pk=NoteID).delete()
        return JsonResponse({"success":"Note Deleted"},status = 200)

# APIs
@login_required(login_url="login")
def FavUnfav(request,NoteID):
    #Add or Remove notes from Favourite list
    #maybe get_or_create can be used
    if request.method == "PUT":
        try:
            favouritedNote = Favourites.objects.get(note=NoteID,user=request.user)
            favouritedNote.delete()
            return JsonResponse({"Unfovourited":"Note removed from favourites"},status=200)
        except:
            NewFavourite = Favourites(user=request.user, note = Notes.objects.get(pk=NoteID))
            NewFavourite.save()
            return JsonResponse({"Added":"Note added to favourites"},status=200)
    elif request.method == "POST":
        favouritedNote = Favourites.objects.get(note=NoteID,user=request.user)
        favouritedNote.delete()
        return HttpResponseRedirect(reverse('favourites'))
    else:
        return JsonResponse({"wrong method": "Method is not allowed"},status = 405)

def filter(request):
    if request.method == "POST":
        filters = request.POST.getlist("filters")
        if filters:
            FiltertagID = Tags.objects.filter(tag__in=filters, user=request.user).values_list('id',flat=True)
            Alltags = Tags.objects.filter(user = request.user).order_by("tag")
            if FiltertagID:
                TaggedNotesID = Tagged_Notes.objects.filter(tag__in=FiltertagID).values_list("note",flat=True)
                FilteredIDs = []
                for id in TaggedNotesID:
                    if countOf(TaggedNotesID,id) >= len(filters) and id not in FilteredIDs:
                        FilteredIDs.append(id)

                if FilteredIDs:
                    filteredNotes = Notes.objects.filter(pk__in=FilteredIDs).order_by('created_on')
                else:
                    filteredNotes = []
                NoteTags = Tagged_Notes.objects.filter(note__in = filteredNotes).values()

                paginator = Paginator(filteredNotes, 25)
                page_number = request.GET.get('page')
                pages = paginator.get_page(page_number)

                return render(request,"notes/index.html",{
                    "Notes" : pages,
                    "Tags":Alltags,
                    "NoteTags": NoteTags,
                    "filters":filters
                })
            else:
                return render(request,"notes/index.html",{
                    "Notes" : [],
                    "Tags":Alltags,
                    "filters":filters
                })
        else:
            return HttpResponseRedirect(reverse('index'))
    else:
        return HttpResponse(status=405,reason="only Post method is allowed")

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