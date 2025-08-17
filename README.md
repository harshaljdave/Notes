# Capstone Note-Taking Application

A full-featured, modern note-taking web application built with a Django REST API backend and a React.js single-page application (SPA) frontend. The application is designed to be robust, scalable, and user-friendly, incorporating a polished UI and advanced features to prevent data loss and enhance usability.

## Features

### Core Functionality
- **User Authentication:** Secure user registration and login system.
- **Rich Text Notes:** Create, read, and update notes using a rich text editor with formatting options (bold, italics, lists).
- **Folder Organization:** Group notes into folders for better organization.
- **Tagging System:** Assign multiple tags to notes for flexible categorization.
- **Note Search & Filtering:** Instantly search notes by title or content, and filter notes by their assigned tags.
- **Favorites:** Mark important notes as favorites for quick access from a dedicated page.
- **Note Sharing:** Share notes with other users with either "view" or "edit" permissions.
- **Archiving:** Archive notes to hide them from the main view without permanently deleting them.

### Advanced Features & UI/UX
- **Fully Responsive Design:** The UI, including the navbar and note detail page, is optimized for a seamless experience on both desktop and mobile devices.
- **Dark Mode:** A theme toggle allows users to switch between light and dark modes.
- **Optimistic Locking:** Prevents data loss from concurrent edits. If one user saves a note while another is editing it, the second user is gracefully notified of the conflict.
- **Polished User Feedback:**
    - **Toast Notifications:** Non-intrusive feedback for actions like creating, updating, or deleting notes.
    - **Loading Skeletons:** Content placeholders mimic the UI layout while data is being fetched, improving perceived performance.
    - **Empty State Components:** Friendly and helpful messages for new users or when filters yield no results.
    - **Confirmation Dialogs:** Prevents users from accidentally discarding unsaved changes.

## Tech Stack

### Backend
- **Framework:** Django
- **API:** Django REST Framework
- **Database:** SQLite (default, configurable)
- **CORS Handling:** `django-cors-headers`

### Frontend
- **Framework:** React.js (v19)
- **Build Tool:** Vite
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **Rich Text Editor:** Tiptap
- **API Client:** Axios

## Setup and Installation

### Prerequisites
- Python 3.8+ and `pip`
- Node.js 16+ and `npm`

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd capstone-project
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install Python dependencies:**
    *(A `requirements.txt` file may need to be generated first: `pip freeze > requirements.txt`)*
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Run the Django development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Run the React development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be running at `http://localhost:5173`.

## Performance & Stress Testing

The application is ready for performance and stress testing. It is highly recommended to test against a production-like build, not the local development servers.

- **Frontend:** Build the app using `npm run build` and analyze the output with tools like Google Lighthouse.
- **Backend:** Deploy the Django app to a platform like Heroku or DigitalOcean using a production-grade server (e.g., Gunicorn). Test the deployed API endpoints with tools like Locust or k6.