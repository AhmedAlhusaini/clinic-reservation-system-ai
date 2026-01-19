# 🏥 Doc Manager - Clinic Management System

**Doc Manager** is a modern, offline-first digital reservation system designed to replace manual paper workflows in pediatric clinics. It streamlines patient registration, appointment scheduling, and daily clinic operations through an intuitive drag-and-drop interface.

## 🚀 Concept & Business Value

This application serves as the central hub for a clinic's daily workflow:
- **Digital Registration**: Replaces paper logbooks with a fast, auto-resetting form.
- **Visual Scheduling**: Provides a clear timeline (3 PM - 10 PM) to manage patient flow.
- **Role-Based Security**: Ensures sensitive settings (like user management) are restricted to the clinic owner, while assistants can focus on patient entry.
- **Zero-Config Deployment**: Runs entirely in the browser using LocalStorage, requiring no complex server setup for single-machine use.

## ✨ Key Features

- **Drag & Drop Dashboard**: Easily move patients between "Unassigned", "Time Slots", and "Archive" zones using `@dnd-kit`.
- **Smart Patient Forms**: registration forms that auto-clear and auto-focus for rapid data entry.
- **Role-Based Access Control (RBAC)**:
    - **Owner**: Full system control, user management, branding configuration.
    - **Admin (Doctor)**: View schedule, manage clinical notes, reset staff passwords.
    - **Assistant**: Register patients, manage reservations, mark attendance.
- **Patient Cards**: High-contrast, scannable cards with "Phone Badges" for quick contact visibility.
- **Data Persistence**: Automatically saves all state to the browser's LocalStorage.

## 🛠️ Technology Stack

- **Frontend Core**: React 19, Vite 7
- **Styling**: Vanilla CSS with CSS Variables (Theming), `clsx`
- **Interactions**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **Icons**: `lucide-react`
- **Utilities**: `date-fns` for time management

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/AhmedAlhusaini/clinic-reservation-system-ai.git
    cd clinic-reservation-system-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## 👤 User Roles & Default Logins

The system initializes with the following default users (for testing):

| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner` | `owner123` | Full Access (User Mgmt, Branding, Danger Zone) |
| **Admin** | `admin` | `admin123` | Patient Mgmt, Form Editor, Staff Password Reset |
| **Assistant** | `assistant` | `assist123` | Patient Registration, Scheduling, status updates |

> **Note**: You can change these passwords or create new users in the **Settings** panel (Owner only).

## 📅 Release History

- **v1.7.4 (Current)**: Simplified Dashboard Modal, Phone Badge UI, Performance Tuning.
- **v1.5 - v1.6**: Core UI Overhaul, completed section, branding tools.
- **v1.0**: MVP Foundation (Registration & Basic Drag-and-Drop).

---
*Built for efficiency and simplicity.*
