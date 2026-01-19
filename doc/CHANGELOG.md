# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-01-19
**"Robustness & Reliability"**

### Added
- **Data Persistence**: Application now saves state to LocalStorage immediately on changes and reloads correctly on refresh.
    - Implemented lazy initialization in `ReservationContext` and `ConfigContext`.
- **Safety Warnings**: Added confirmation dialogs for critical Admin actions ("Save Settings", "Reset Data").
- **Archive Workflow**: Enabled direct drag-and-drop from "Emergency/Time Slots" to "Archive" zone.
- **Documentation**: Added comprehensive `CHANGELOG.md` and `HISTORY.md`.

### Fixed
- Fixed data loss issue when refreshing the page (Context state now persists).
- Fixed issue where "Emergency" patients couldn't be dragged directly to Archive.

## [1.7.4] - 2026-01-18
### Changed
- Simplified Dashboard Modal.
- Improved "Phone Badge" UI for better visibility.
- Performance tuning for drag-and-drop interactions.

## [1.6.0] - 2026-01-15
### Added
- **Branding**: Doctor Avatar on Login Page.
- **Branding**: Logo Upload in Admin Settings.
- **Visuals**: Enhanced Drag & Drop visuals (Card Overlay, Shadows).

## [1.5.0] - 2026-01-12
### Added
- **Role-Based Access Control**:
    - **Owner**: Full system control.
    - **Admin**: Day-to-day management.
    - **Assistant**: Restricted access.
- **Archive Zone**: Dedicated area for completed/cancelled appointments.

## [1.0.0] - 2026-01-01
### Added
- **MVP Release**:
    - Patient Registration Form.
    - Drag-and-Drop Schedule Board.
    - Basic LocalStorage persistence.
