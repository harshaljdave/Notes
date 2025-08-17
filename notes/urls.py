from django.urls import path
from . import views

urlpatterns = [
    path("api/login/", views.login_view, name="login"),
    path("api/logout/", views.logout_view, name="logout"),
    path("api/register/", views.register, name="register"),
    path('api/notes/', views.get_notes, name='get_notes'),
    path('api/check_auth/', views.check_auth, name='check_auth'),
    path('api/note/<int:note_id>/', views.get_note_detail, name='get_note_detail'),
    path('api/notes/create/', views.create_note, name='create_note'),
    path('api/folders/', views.handle_folders, name='handle_folders'),
    path('api/folders/<int:folder_id>/', views.handle_single_folder, name='handle_single_folder'),
    path('api/folders/<int:folder_id>/notes/', views.get_folder_notes, name='get_folder_notes'),
    path('api/notes/shared/', views.get_shared_notes, name='get_shared_notes'),
    path('api/notes/favorites/', views.get_favorite_notes, name='get_favorite_notes'),
    path('api/notes/<int:note_id>/favorite/', views.toggle_favorite, name='toggle_favorite'),
    path('api/tags/', views.tags, name='tags'),
    path('api/notes/<int:note_id>/share/', views.handle_sharing, name='handle_sharing'),
    path('api/favorites/ids/', views.get_favorite_ids, name='get_favorite_ids'),
    path('api/folders/<int:folder_id>/notes/<int:note_id>/', views.manage_note_in_folder, name='manage_note_in_folder'),
    path('api/notes/<int:note_id>/folders/', views.get_note_folders, name='get_note_folders'),
    path('api/profile/change-password/', views.change_password, name='change_password'),
    path('api/notes/archived/', views.get_archived_notes, name='get_archived_notes'),
    path('api/notes/<int:note_id>/archive/', views.toggle_archive, name='toggle_archive'),
]
