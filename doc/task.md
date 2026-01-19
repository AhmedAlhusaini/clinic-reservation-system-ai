# Task Checklist - Pediatric Clinic Reservation System

## Release 1: MVP (Completed)
- [/] Project Setup (Vite + React) <!-- id: 0 -->
- [x] Basic Auth (Admin/Assistant) Mock Logic <!-- id: 1 -->
- [x] Patient Registration Form (Name, Age, Phone, Address) <!-- id: 2 -->
- [x] Reservation Context (CRUD + LocalStorage) <!-- id: 3 -->
- [x] Schedule Board UI (15m slots originally, refactored to 1h) <!-- id: 4 -->
- [x] Drag & Drop Implementation (@dnd-kit) <!-- id: 5 -->
- [x] Notification System (Toasts) <!-- id: 6 -->

## Release 1.1: Feedback Improvements (Completed)
- [x] Change Schedule to Hourly Slots (3 PM - 10 PM) <!-- id: 7 -->
- [x] Multi-patient Slot Display (Vertical Stack) <!-- id: 8 -->
- [x] Enable Edit/Delete for Registrations <!-- id: 9 -->
- [x] Implement Dynamic Form Editor (Add custom questions) <!-- id: 10 -->
- [x] Data Wipe with "Type to Confirm" <!-- id: 11 -->
- [x] Simple Password Reset Configuration <!-- id: 12 -->

## Release 1.2: Polish & Config (Completed)
- [x] Re-order/Sort patients within a time slot <!-- id: 13 -->
- [x] Quick Add Reservation button inside slot <!-- id: 14 -->
- [x] Customizable Clinic Name (Brand Settings) <!-- id: 15 -->

## Release 1.3: Advanced Workflow & Roles
- [x] **Role**: Super Admin / Owner (Exclusive access to Branding/Config) <!-- id: 16 -->
- [x] **Fix**: Quick Add auto-assigns correctly <!-- id: 17 -->
- [x] **Drag & Drop**: Drag to Unassign (Restore from Archive) <!-- id: 18 -->
- [x] **Workflow**: "Archive" Zone (formerly Cancelled) with CRUD & Complete Button <!-- id: 19 -->

## Release 1.4: Visual & UX Polish
- [x] **Visuals**: Enhanced Drag & Drop visuals (Card Overlay, Shadows) <!-- id: 20 -->
- [x] **Branding**: Doctor Avatar on Login Page <!-- id: 21 -->
- [x] **Branding**: Logo Upload in Admin Settings <!-- id: 22 -->
- [x] **UX**: Improved Drag from Archive logic <!-- id: 23 -->

## Release 2.0: Robustness & Reliability (Completed)
- [x] **Persistence**: Fix data loss on refresh (Context Lazy Init)
- [x] **Safety**: Confirmation popups for critical Admin actions
- [x] **Workflow**: Direct Drag & Drop from Emergency to Archive
- [x] **Docs**: Centralized Changelog & History

## Release 3: Smart Scheduling
- [ ] Admin: Define working days/hours
- [ ] Holiday API Integration
- [ ] "Next Available Slot" Recommendation
- [ ] Waitlist Feature

## Release 4: Communication
- [ ] WhatsApp Integration (Link Generator)
- [ ] Email Confirmation (Mock)
