# Capstone Project: Notes

## Overview
This is a dynamic note-taking web application built using Django that allows users to create, manage, organize and share their notes. The application provides a secure and intuitive interface for users to maintain their digital notes with rich functionality.

## Distinctiveness and Complexity
This project is distinct and complex for several reasons:

1. **Advanced Data Relationships**: The application implements complex data models with relationships between users and their notes, including features like categorization, tagging, sharing and shared editing.

2. **Full Authentication System**: Utilizes Django's authentication system to provide secure user registration, login, and personalized note management.

3. **Dynamic Frontend**: Implements JavaScript for real-time updates and interactive features, making it different from typical CRUD applications.

4. **Permission Management** : Share notes with read/write permissions and ability to modify or revoke the permissions or even access.

5. **Organizing Notes with Tags and Folders**: Users can efficiently organize and manage their notes by assigning tags and placing them into folders, enabling better categorization and quick retrieval.

6. **Robust Error Handling and User Feedback**: The application performs comprehensive error checks for user actions, ensuring that invalid or unauthorized operations are gracefully handled. Users receive clear, informative messages for both successful and unsuccessful actions, improving usability and preventing confusion.

## File Structure

### Core Files
- `manage.py`: Django's command-line utility for administrative tasks
- `requirements.txt`: List of Python dependencies
- `db.sqlite3`: SQLite database file

### Capstone Directory (Main Project)
- `capstone/settings.py`: Project settings including database configuration
- `capstone/urls.py`: Main URL configuration
- `capstone/wsgi.py`: WSGI application entry point
- `capstone/asgi.py`: ASGI application entry point

### Notes App
- `notes/models.py`: Defines database models for notes and user data
- `notes/views.py`: Contains view logic for handling requests
- `notes/urls.py`: URL patterns for the notes application
- `notes/admin.py`: Admin interface configuration
- `notes/apps.py`: Application configuration

#### Templates Directory
- `notes/templates/`: Contains HTML templates
  - `layout.html`: Base template
  - `index.html`: Home page template
  - `NoteView.html`: Individual note view
  - `Favourites.html` : View of Stared/favourited Notes
  - `Folders.html` : View for all user folders
  - `FolderView.html` : View for all notes inside specific folder
  - `SharedNotes` : Page for viewing all the notes shared with user 
  - `login.html`: Login page
  - `register.html`: Registration page

#### Static Files
- `notes/static/`: Contains static files
  - `M1`: Javascript and CSS code for muslti-select drop-down
  - `FolderFunctions.js`: JavaScript code related to folder functionalities
  - `Notesfucntions.js` : JavaScript related to notes related functionalities

#### Custom Template Tags
- `notes/templatetags/`: Custom template filters and tags

## How to Run the Application

### Prerequisites
- Python 3.10 or higher
- pip (Python package installer)

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd capstone

# Install required packages
pip install -r requirements.txt

# Make migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run the development server
python manage.py runserver
```

The application will be available at `http://localhost:8000`

### Required Packages
All required packages are listed in `requirements.txt`:
- Django
No additional packages required

## Additional Information

### Future Improvements
- Add support for file attachments
- Enhanced search functionality
- Add export options for notes
- Permission based sharing