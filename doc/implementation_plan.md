# Implementation Plan - Pediatric Clinic App

## Goal Description
Build a local-first, offline-capable reservation management system for a pediatric clinic. The system replaces manual paper booking with a digital drag-and-drop interface, ensuring fair distribution of slots and preventing overcrowding.

## Architecture
- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (Variables for theming)
- **State Management**: React Context API
- **Persistence**: Browser LocalStorage (No backend required for MVP)
- **Drag & Drop**: @dnd-kit

## Data Models
### Reservation
```json
{
  "id": "uuid",
  "childName": "String",
  "parentName": "String",
  "phone": "String",
  "address": "String",
  "timeSlot": "String (e.g. '3 PM - 4 PM') | null (Unassigned)",
  "createdAt": "ISOString",
  "extras": { "custom_field_id": "value" },
  "order": "Integer (for sorting)"
}
```

## Features & Logic

### Release 1.2: Polish & Config
- **Sorting**: Uses `@dnd-kit/sortable` with `SortableContext`. Allows re-ordering patients within the same slot or between slots.
- **Quick Add**: Plus button in slot header opens a modal pre-filled with the target time slot.
- **Config**: `ConfigContext` manages `clinicName` and `customFields` in LocalStorage.

## Daily Reset Logic
- On App Load, check `localStorage.getItem('clinic_date')`.
- If `clinic_date` != `today`:
  - Clear `reservations`
  - Update `clinic_date` = `today`
- This ensures a fresh slate every day for the assistant.

### Release 1.3: Super Admin & Advanced Status
- **Super Admin**:
  - Add `owner` role to `AuthContext`. Default pass: `owner123`.
  - In `AdminSettings`, strictly conditionally render "Clinic Name" & "Form Editor" sections only for `owner`.
- **Drag to Unassigned**:
  - Add `useDroppable({ id: 'unassigned-zone' })` to the Unassigned container in `Dashboard`.
  - In `handleDragEnd`, if `over.id === 'unassigned-zone'`, set `timeSlot: null`.
- **Cancelled / No-Show**:
  - New `Droppable` zone: "Cancelled / Completed" at bottom of sidebar.
  - On Drop -> Open Modal: "Mark as Cancelled", "No Show", "Rescheduled".
  - Update Reservation Model: Add `status` (default 'active'), `statusReason`.
  - Filter "Unassigned" and "Schedule" to only show `status === 'active'`.
  - "Cancelled" list shows non-active items, maybe expandable.

## Verification
- Test Drag & Drop: Move patient between slots.
- Test Re-order: Swap two patients in the same slot.
- Test Data persistence: Refresh page.
- Test Daily Reset: Manually change date in LocalStorage or system time.
