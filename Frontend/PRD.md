# CRYPTOVA Product Requirements Document

## 1. Product Overview

CRYPTOVA is an enterprise security platform for protecting, verifying, storing, and auditing sensitive files.

The product principle is:

> Simple on the surface, strong security underneath.

Users should be able to protect or verify files without understanding cryptography.

## 2. Problem Statement

Users need a simple way to:

- Encrypt sensitive files
- Verify protected packages
- Prevent decryption of tampered files
- Store protected files securely
- Review security activity
- Manage security preferences

The existing prototype provides the main interface and navigation. The product must provide complete workflows, reliable authentication, clear feedback, and backend-ready service boundaries.

## 3. Goals

- Provide low-click file protection workflows
- Make dashboard actions immediately understandable
- Keep verification and decryption secure
- Provide clear success and failure feedback
- Preserve the professional CRYPTOVA visual identity
- Separate UI logic from business services
- Prepare the frontend for FastAPI integration
- Support desktop, tablet, and mobile layouts

## 4. Target Users

### Security Administrator
Manages protected files, reviews activity, and configures security settings.

### Business User
Encrypts files, verifies received packages, and downloads protected results.

### Compliance Reviewer
Reviews activity logs, verification results, and file protection history.

## 5. Core User Flows

### Authentication

1. User opens CRYPTOVA.
2. User selects `Get Started` or `Sign In`.
3. User enters email and password.
4. User signs in or creates an account.
5. User is redirected to the dashboard.
6. Protected routes remain inaccessible after logout.

### Encrypt File

1. User opens Dashboard.
2. User selects `Encrypt File`.
3. User uploads or drops a file.
4. File metadata is displayed.
5. User selects `Encrypt File`.
6. File is processed with AES-256-GCM.
7. User sees `File Protected`.
8. User can download or save the file to Vault.

### Verify and Decrypt

1. User selects `Verify / Decrypt`.
2. User uploads or drops a protected package.
3. Format validation runs automatically.
4. Authentication and integrity checks run.
5. If verification succeeds, `Decrypt File` becomes available.
6. If verification fails, decryption remains disabled.
7. User receives a clear explanation of the failure.

### Vault

1. User opens Vault.
2. User searches or filters files.
3. User views file security details.
4. User downloads or deletes files.
5. Delete requires confirmation.

### Activity

1. User opens Activity.
2. User searches or filters audit events.
3. User views event details.
4. User refreshes activity records.

## 6. Functional Requirements

### Landing Page

- Full-width responsive hero
- CRYPTOVA product identity
- Product, Security, and How It Works navigation
- Working Sign In and Get Started actions
- Restrained enterprise security visualization
- No cyberpunk, neon, fake security graphics, or decorative attack imagery

### Dashboard

- Dashboard acts as the command center
- Primary actions:
  - Encrypt File
  - Verify / Decrypt
- Secondary actions:
  - Open Vault
  - View Activity
- Global `New Protection` menu
- Recent protected files section
- Security posture summary
- Recent activity summary
- Useful empty state for new users

### Authentication

- Email/password registration
- Email/password login
- Centralized `AuthProvider`
- Protected routes
- Session persistence
- Logout
- Redirect unauthenticated users to `/login`
- Prevent duplicate accounts by email

For production, authentication must move from local storage to a secure backend or authentication provider.

### Encryption

- File upload and drag-and-drop
- File name, type, and size display
- AES-256-GCM default
- Encrypt button disabled without a selected file
- Service-based encryption implementation
- Download encrypted package
- Save protected file to Vault
- Activity event creation

### Verification and Decryption

- File upload and drag-and-drop
- Automatic verification after selection
- Format validation
- Authentication verification
- Integrity verification
- Decryption disabled when verification fails
- Download decrypted file after successful verification
- Activity event creation

### Vault

- List protected files
- Search files immediately while typing
- Filter by All, Protected, Needs Attention, and Recently Added
- Sort files
- View security details in a modal or drawer
- Download files
- Delete files with confirmation
- Protect New File action
- Empty state for new users

### Activity

- Display audit events
- Show action, file, status, timestamp, user, and details
- Search
- Filter
- Refresh
- View event details
- Empty state when no events exist

### Settings

- Profile settings
- Encryption settings
- Key protection settings
- Integrity verification toggle
- Session security settings
- Activity logging settings
- Save states: Saving and Saved
- Reset settings
- Logout

## 7. Non-Functional Requirements

### Security

- Never allow decryption after failed verification
- Never expose passwords in logs
- Do not hardcode secrets
- Use environment variables for backend configuration
- Use secure password hashing on the backend
- Use HTTPS in production
- Validate file type and size
- Sanitize file names
- Enforce authorization for user-specific files

### Accessibility

- Keyboard-accessible controls
- Visible focus states
- Proper form labels
- Clear error messages
- Sufficient color contrast
- Text labels for important actions
- Icons must not be the only indication of meaning

### Performance

- Fast initial page load
- Immediate search and filtering
- Loading indicators for file operations
- Prevention of duplicate submissions
- Minimal unnecessary page transitions

### Responsive Design

Support 1920x1080, 1440x900, 1366x768, 1024x768, tablet, and mobile layouts without horizontal overflow.

## 8. Technical Architecture

### Frontend

- React
- Vite
- React Router
- Context-based authentication
- Existing CSS design system
- Existing sidebar navigation

### Services

- `authService`
- `encryptionService`
- `verificationService`
- `vaultService`
- `activityService`

Business logic must remain outside page components.

### Backend Integration

The frontend should eventually connect to FastAPI endpoints for:

- User authentication
- File encryption
- File verification
- File decryption
- Vault storage
- Activity logs
- Settings persistence

## 9. Success Metrics

- User can start encryption from the dashboard in one click
- User can start verification from the dashboard in one click
- Successful encryption requires no unnecessary confirmation
- Failed integrity verification always blocks decryption
- Users can locate a Vault file through immediate search
- Users can identify file protection status immediately
- Users understand why an operation failed
- No dead buttons remain
- No protected route is accessible after logout
- No horizontal overflow occurs on supported screen sizes

## 10. Acceptance Criteria

The product is ready for release when:

- All public and protected routes work
- Authentication state is centralized
- Logout redirects to login
- Encryption workflow completes on one page
- Verification runs before decryption
- Failed verification disables decryption
- Vault search, filtering, viewing, downloading, and deleting work
- Activity search, filtering, refreshing, and details work
- Settings save and reset correctly
- Empty states provide useful next actions
- Dashboard primary actions are immediately visible
- Production build completes successfully
- Browser console has no runtime errors
- Responsive layouts work without horizontal overflow

## 11. Future Enhancements

- FastAPI backend integration
- Secure server-side authentication
- Password reset
- Multi-factor authentication
- User-specific cloud Vault storage
- Real backend encryption implementation
- File version history
- Role-based access control
- Exportable audit reports
- Configurable retention policies
- Organization and team management
