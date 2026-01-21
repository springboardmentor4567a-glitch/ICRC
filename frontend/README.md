# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# ICRCA - Insurance Comparison, Recommendation and Claim Assistance

A React-based insurance policy comparison and recommendation platform with token-based authentication, admin policy management, and real-time output logging.

## Features

- **Authentication**: Register/login with JWT-like access tokens and cookie-based refresh tokens.
- **Token-based API**: PolicyAPI enforces admin-only policy mutations (add/update/delete).
- **Policy Browse & Compare**: Browse policies, compare two side-by-side, and calculate premiums.
- **Preferences & Recommendations**: Save per-user risk profiles and see personalized recommendations.
- **Admin Dashboard**: Add, edit, and delete insurance policies (admin@admin.com only).
- **Token Inspector**: View and revoke access/refresh tokens; see token expiry.
- **Debug Output**: Real-time logging panel showing all app events (register, login, policy CRUD, token refresh, errors).

## Setup

### Prerequisites
- Node.js 16+ and npm

### Install Dependencies

```bash
cd c:\Users\R HARSHITHA\Desktop\Training\frontend
npm install
```

If you encounter ERESOLVE peer-dep conflicts, use:
```bash
npm install --legacy-peer-deps
```

## Running the App

### Development Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 (or the URL shown) in your browser.

### Running Tests

```bash
npm run test
```

**Expected output:**
```
 ✓ src/__tests__/auth.test.jsx (3)
   ✓ AuthAPI token flows
     ✓ register issues access token and sets refresh cookie
     ✓ refresh rotates access token and cookie
     ✓ revoke clears refresh cookie
 ✓ src/__tests__/debugPanel.test.jsx (2)
   ✓ DebugPanel
     ✓ shows 'No logs yet' initially and displays logs after log()
     ✓ Clear button clears logs and Close calls onClose
 ✓ src/__tests__/logger.test.jsx (3)
   ✓ logger
     ✓ log adds an entry and getLogs returns it
     ✓ clearLogs removes entries
     ✓ subscribe receives updates

Test Files  3 passed (3)
     Tests  8 passed (8)
  Start at  XXX
  Duration XXXms
```

Watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

UI-based test runner (browser):
```bash
npm run test:ui
```

## User Flows

### 1. Register & Login

1. Open app at http://localhost:5173 → redirected to `/login`
2. Click "Sign up" → go to `/register`
3. Enter email (e.g., `user@example.com`) and password → **Sign Up**
4. **Expected**: Redirected to `/policies`, see policy cards, localStorage has `access_token` and `refresh_token` cookie is set.
5. Click **Output** button (bottom-right) → DebugPanel shows:
   ```
   register: user@example.com
   register success: user@example.com
   ```

### 2. Browse & Compare Policies

1. On `/policies`, select two policy checkboxes
2. Click **Compare** → side-by-side view
3. Click **Calculator** on a policy card → inline premium calculator (adjust age/sum/risk)

### 3. Save Preferences & Get Recommendations

1. Click **Preferences** → set Max Price, Risk Tolerance, Age, Smoker status, Preferred Providers
2. Click **Save & Recommend**
3. **Expected**: 
   - localStorage key `prefs_user@example.com` created
   - Recommended Policies list updates below
   - Output log shows preference save and recommend calls

### 4. Admin Flows (as admin@admin.com)

1. Register/login as `admin@admin.com`
2. **Admin** and **Tokens** buttons appear in header
3. Click **Admin** → `/admin` page
4. Fill form (Provider, Name, Coverage, Price, Features) and click **Add Policy**
5. **Expected**: New policy appears in list; Output shows `addPolicy succeeded`
6. Click **Delete** on a policy → confirm → policy removed; Output shows `deletePolicy succeeded`
7. Non-admin user attempts admin action → sees error alert (403 Unauthorized)

### 5. Token Management

1. Click **Tokens** button (admin only) → `/tokens` (TokenInspector)
2. **Standard tokens** section shows:
   - `access_token`: Full JWT string + decoded payload (`{ email, exp }`) + `Expires in: Xs`
   - `refresh_token_cookie`: The cookie value
3. Click **Revoke refresh token (cookie)** → cookie cleared, redirected to login on next action
4. Click **Clear access token & storage** → tokens removed; protected pages redirect to login

### 6. View Output Logs

1. Click floating **Output** button (bottom-right) → DebugPanel opens
2. Perform any action (register, save preferences, add policy) → logs appear in real-time
3. Example log entries:
   ```
   [12:34:56] info: register: user@example.com
   [12:34:57] info: login success: user@example.com
   [12:34:58] info: addPolicy called
   [12:34:59] info: addPolicy succeeded
   ```
4. Click **Clear** → all logs removed
5. Click **Close** → panel closes (click Output again to reopen)

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx           # Entry point (safe root element check)
│   ├── App.jsx            # App context, auth, routes, logging
│   ├── auth.js            # AuthAPI (register/login/refresh/revoke), PolicyAPI (CRUD)
│   ├── apiClient.js       # fetchWithAuth (auto-refresh on 401)
│   ├── logger.js          # Pub/sub logger (log/getLogs/clearLogs/subscribe)
│   ├── DebugPanel.jsx     # Debug output UI (logs display)
│   ├── Login.jsx          # Login page
│   ├── Register.jsx       # Register page
│   ├── Policies.jsx       # Policy browse + compare UI
│   ├── Compare.jsx        # Side-by-side policy compare
│   ├── Calculator.jsx     # Inline premium calculator
│   ├── Preferences.jsx    # Per-user risk profile + recommendations
│   ├── Admin.jsx          # Admin policy CRUD
│   ├── TokenInspector.jsx # Token view/revoke UI
│   ├── pages/
│   │   └── Policies.jsx   # (existing; imported by App routes)
│   ├── __tests__/
│   │   ├── auth.test.jsx       # AuthAPI unit tests
│   │   ├── logger.test.jsx     # Logger unit tests
│   │   ├── debugPanel.test.jsx # DebugPanel UI tests
│   │   └── flows.test.jsx      # Integration tests (register → policies, admin CRUD)
│   ├── index.css          # Global styles (login, policies, debug panel)
│   └── setupTests.js      # Vitest setup (jest-dom)
├── package.json           # Dependencies + scripts
├── .npmrc                 # npm config (legacy-peer-deps)
├── vitest.config.js       # Vitest config (jsdom + setupTests)
└── README.md              # This file
```

## Environment Variables

None required for development (demo uses localStorage). For production, add `.env` with:
```
VITE_API_BASE_URL=https://your-backend.com
```

## Troubleshooting

### npm install fails with ERESOLVE
```bash
npm install --legacy-peer-deps
```

### vitest not recognized
```bash
npx vitest
```

### App shows "Root element #root not found"
Ensure `public/index.html` contains `<div id="root"></div>`. The app creates a fallback if missing.

### Token refresh not working
- Ensure browser cookies are enabled.
- Check TokenInspector for refresh_token_cookie presence.
- Refresh token expires after 30 days (demo config).

### Admin operations fail (403)
- Only `admin@admin.com` can add/edit/delete policies.
- Logout and login as admin@admin.com to test.

## Security Notes

This is a **demo/educational project**:
- Tokens are generated client-side (not cryptographically signed).
- Refresh tokens are stored in cookies (not httpOnly in browser environment).
- Passwords are stored plain-text in localStorage (never do this in production).

For production, integrate with a real backend that:
- Signs JWTs server-side with a private key.
- Sets httpOnly, Secure, SameSite refresh token cookies.
- Hashes passwords (bcrypt or similar).
- Validates tokens on every protected endpoint.
- Uses HTTPS only.

## Next Steps

- Replace client-side AuthAPI with real backend endpoints.
- Move to a backend framework (Express, Django, FastAPI) with proper token signing and validation.
- Add persistent database (MongoDB, PostgreSQL) for users, policies, and preferences.
- Enable CORS and secure cookie settings.

---

For questions or issues, refer to the inline code comments or check the Output panel for debug logs.
