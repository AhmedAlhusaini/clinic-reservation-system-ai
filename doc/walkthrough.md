# User Walkthrough - Pediatric Clinic Manager

## 👋 Welcome
This application helps the clinic assistant manage daily patient reservations efficiently.

## 🚀 Getting Started
1. **Login**: Use default credentials (`admin`/`admin123` or `assistant`/`assist123`).
2. **Dashboard**: You see the "Unassigned Patients" on the left and the "Day Schedule" on the right.

## key Features

### 1. Registering a Patient
- Click **"New Patient"** (Sidebar) or **"+"** (Quick Add in Slot).
- Fill in details (Name, Phone, etc.).
- The patient appears in the list.

### 2. Managing the Schedule
- **Drag & Drop**: Move patients from "Unassigned" to a time slot (e.g., "3 PM - 4 PM").
- **Re-order**: Drag a patient up or down within a slot to change their queue order.
- **Quick Add**: Click the **+** icon next to a time label (e.g., "5 PM") to instantly add a patient to that hour.

### 3. Patient Actions
- **Edit**: Click the Pencil icon on the patient card.
- **Delete**: Click the Trash icon.
- **Complete**: Click the **Green Checkmark** on a scheduled patient to mark them as done. They will move to the Archive.
- **Archive / History**: The box at the bottom left holds completed and cancelled patients.
    - **Cancel**: Drag a patient here to remove them.
    - **Restore**: Drag a patient *out* of Archive back to "Unassigned" to restore them.
    - **Edit/Delete**: You can manage archived records just like active ones.

### 4. Settings (Super Admin Only)
- **Login**: Use the `Owner` role.
- **General**: Change the Clinic Name.
- **Form Editor**: Add custom fields (e.g., "Temperature").
- **Note**: Regular Admins cannot see these settings.
- **Passwords**: Update login credentials.
- **Danger Zone**: Wipe all data for the day.

## ⚠️ Important Notes
- **Offline Capable**: Works without internet (data is saved on this device).
- **Daily Reset**: When you open the app on a new day, the schedule clears automatically for fresh bookings.
