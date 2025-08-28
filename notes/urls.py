from django.urls import path
from . import views

urlpatterns = [
    path("",views.index ,name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('folders',views.folders, name='folders'),
    path('view_folder/<int:FolderID>',views.view_folder, name='view_folder'),
    path('shared',views.SharedNotes, name="SharedNotes"),
    path('favouritres',views.FavouritesPage,name='favourites'),
    path("note/<int:NoteID>", views.note, name="note"),

    #API
    path('createNote',views.CreateNote,name='CreateNote'),
    path('FavUnfav/<int:NoteID>',views.FavUnfav,name="favunfav"),
    path('filter',views.filter,name="filter"),
    path('tags',views.tags,name="tags"),
    path("folderList",views.folderList,name="folderList"),
    path("folderdelete/<int:FolderID>",views.folderdelete,name="folderdelete"),
    path('note/<int:NoteID>/access', views.editNoteAccess, name='editNoteAccess'),
]