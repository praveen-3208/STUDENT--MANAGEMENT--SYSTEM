# Student Management System

A full-stack CRUD web application built with **React** (frontend) and **Django REST Framework** (backend) using **SQLite** as the database.

---

## 📁 Project Structure

```text
.
├── backend/                             # Django + Django REST Framework project
│   ├── manage.py                        # Django management script
│   ├── requirements.txt                 # Python dependencies
│   ├── sms_backend/                     # Project configuration package
│   │   ├── __init__.py
│   │   ├── settings.py                  # Django settings (DRF, CORS, SQLite)
│   │   ├── urls.py                      # Root URL routing (/admin/, /api/)
│   │   ├── wsgi.py                      # WSGI entry point
│   │   └── asgi.py                      # ASGI entry point
│   └── students/                        # Students app
│       ├── __init__.py
│       ├── admin.py                     # Django Admin configuration
│       ├── apps.py                      # App configuration
│       ├── models.py                    # Student model (schema & constraints)
│       ├── serializers.py               # DRF serializer with email uniqueness & format validation
│       ├── views.py                     # StudentViewSet (ModelViewSet with full CRUD & error handling)
│       ├── urls.py                      # App router mapping /api/students/
│       ├── fixtures/
│       │   └── students.json            # 5 initial sample student records
│       └── migrations/
│           ├── __init__.py
│           └── 0001_initial.py          # Initial database migration
│
├── frontend/                            # React frontend (Vite + Axios)
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite dev server configuration (port 5173)
│   ├── index.html                       # HTML entry point
│   └── src/
│       ├── main.jsx                     # React root bootstrap
│       ├── App.jsx                      # Main UI layout, statistics, & state coordination
│       ├── api.js                       # Axios API client (CRUD methods for /api/students/)
│       ├── index.css                    # Clean, responsive CSS (Flexbox/Grid, mobile-friendly)
│       └── components/
│           ├── StudentForm.jsx          # Create & Edit form with client & server validation
│           └── StudentList.jsx          # Responsive table, search/filter, & delete modal
│
└── README.md                            # Documentation and setup instructions
```

---

## 🗄️ Data Model

### Entity: `Student`

| Field | Type | Options / Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | AutoField / BigAutoField | Primary Key, Auto-increment | Unique identifier |
| `name` | CharField(150) | `required=True` | Full name of the student |
| `email` | EmailField(254) | `unique=True`, `required=True` | Unique contact email |
| `phone` | CharField(30) | `required=True` | Telephone number |
| `date_of_birth` | DateField | `required=True` | Birthdate (`YYYY-MM-DD`) |
| `course` | CharField(120) | `required=True` | Enrolled academic course |
| `enrollment_date`| DateField | `auto_now_add=True` | Automatically set on creation |
| `status` | CharField(10) | Choices: `active`, `inactive` | Defaults to `active` |

---

## 🚀 Setup & Run Instructions

### 1. Backend Setup (Django + DRF)

#### Step 1.1: Open a terminal and navigate to the backend folder
```bash
cd backend
```

#### Step 1.2: Create and activate a Python virtual environment
- **macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- **Windows (Command Prompt):**
  ```cmd
  python -m venv venv
  venv\Scripts\activate
  ```
- **Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

#### Step 1.3: Install Python dependencies
```bash
pip install -r requirements.txt
```

#### Step 1.4: Run database migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Step 1.5: (Optional) Load sample student fixtures
```bash
python manage.py loaddata students/fixtures/students.json
```

#### Step 1.6: (Optional) Create an admin superuser
```bash
python manage.py createsuperuser
```

#### Step 1.7: Start the Django development server
```bash
python manage.py runserver 8000
```
The Django API will be accessible at `http://localhost:8000/api/students/` and the Django Admin at `http://localhost:8000/admin/`.

---

### 2. Frontend Setup (React + Vite)

#### Step 2.1: Open a new terminal and navigate to the frontend folder
```bash
cd frontend
```

#### Step 2.2: Install Node dependencies
```bash
npm install
```

#### Step 2.3: Start the Vite development server
```bash
npm run dev
```
The React frontend will start at `http://localhost:5173`.

---

## 🔌 REST API Endpoints

The Django REST Framework backend exposes the following endpoints under `/api/students/`:

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/students/` | List all students (supports `?search=`, `?course=`, `?status=`) | `200 OK` |
| **POST** | `/api/students/` | Create a new student record | `201 Created` / `400 Bad Request` |
| **GET** | `/api/students/<id>/` | Retrieve student details by ID | `200 OK` / `404 Not Found` |
| **PUT** | `/api/students/<id>/` | Replace/update student details | `200 OK` / `400 Bad Request` |
| **PATCH** | `/api/students/<id>/` | Partially update student details | `200 OK` / `400 Bad Request` |
| **DELETE**| `/api/students/<id>/` | Delete student record | `200 OK` / `404 Not Found` |

---

## 🛡️ Validation & Error Handling

### 1. Server-Side Validation (`StudentSerializer` & `StudentViewSet`)
- **Required Fields**: Rejects missing or whitespace-only inputs for `name`, `email`, `phone`, `date_of_birth`, and `course`.
- **Email Uniqueness**: Enforces case-insensitive duplicate email detection during both `POST` (create) and `PUT`/`PATCH` (update), returning a clear message: `"A student with this email address already exists. Please use a unique email address."`
- **Email Format**: Validates standard email RFC pattern.
- **Phone Validation**: Ensures telephone string conforms to recognized dial formats.
- **404 Not Found**: Catches non-existent student IDs and returns a readable JSON error response: `{"error": "Student Not Found", "detail": "Student with ID 'X' does not exist.", "status_code": 404}`.
- **400 Bad Request**: Formatted field-level error dictionary for rapid client feedback.

### 2. Client-Side Validation (`StudentForm.jsx`)
- Prevents submission if mandatory fields are missing.
- Verifies email format before issuing network calls.
- Validates that date of birth is a valid past date.
- Real-time error clearance when the user edits the flagged input.

### 3. Network & Connection Resilience
- Detects if the backend is down or unreachable (`ERR_CONNECTION_REFUSED`).
- Displays a prominent alert banner prompting the user to check the backend service at `http://localhost:8000`.
- Provides an instant "Retry" action button.

---

## 🎨 Frontend Features
- **Responsive Layout**: Two-column desktop layout (Form on the left, Table on the right) collapsing into a single column on tablets and mobile screens.
- **Dynamic Search & Filtering**: Instant case-insensitive search by student name, email, or course, plus a dedicated course selector.
- **Inline Editing**: Clicking **Edit** smoothly scrolls to and populates the form with existing details.
- **Delete Confirmation Modal**: Protects against accidental deletion with a confirmation dialog.
- **Auto-Refresh**: The list updates immediately upon successful creation, modification, or deletion.
