# Score Submission Issue - Root Cause & Fix

## Problem
User "admin" created an account, played a game, but their score didn't appear on the leaderboard.

## Root Cause Analysis

### The Bug
The authentication token was being created on the backend but **never returned to the frontend**.

**Flow that was broken:**
1. ✅ User signs up (`POST /auth/signup`)
2. ✅ Backend creates user and session token
3. ❌ **Backend does NOT return the token** in the response
4. ❌ Frontend can't store token in localStorage
5. ❌ When submitting score (`POST /leaderboard/score`), no `Authorization` header is sent
6. ❌ Backend rejects score submission: `401 Unauthorized`

### Why This Happened
The backend code in `routes_auth.py` was creating tokens:
```python
token = db.create_session(user.id)
```

But wasn't including it in the response:
```python
return AuthResult(
    success=True,
    user=UserSchema(...),
    error=None,
    # ❌ Missing: token=token,
)
```

The frontend was ready to handle tokens (frontend/src/lib/api.ts):
```typescript
if ((body as any).token) {
    localStorage.setItem(TOKEN_KEY, (body as any).token);
}
```

But the backend never provided them!

## Solution

### Changes Made

#### 1. Updated `backend/app/schemas.py`
Added optional `token` field to `AuthResult`:
```python
class AuthResult(BaseModel):
    success: bool
    user: Optional[UserSchema] = None
    error: Optional[str] = None
    token: Optional[str] = None  # ✅ New field
```

#### 2. Updated `backend/app/routes_auth.py`
Return token from both endpoints:

**Login endpoint:**
```python
return AuthResult(
    success=True,
    user=UserSchema(...),
    error=None,
    token=token,  # ✅ Now returns the token
)
```

**Signup endpoint:**
```python
return AuthResult(
    success=True,
    user=UserSchema(...),
    error=None,
    token=token,  # ✅ Now returns the token
)
```

## How It Works Now

**Correct Flow:**
1. ✅ User signs up
2. ✅ Backend creates user and session token
3. ✅ **Backend returns token in response**
4. ✅ Frontend stores token in localStorage (`sd_token` key)
5. ✅ Frontend automatically includes token in all API requests via `Authorization: Bearer <token>` header
6. ✅ Score submission succeeds with authentication
7. ✅ Score appears on leaderboard

## Testing

To test the fix:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Create a new user:**
   - Sign up with username "testuser" and password
   - Check browser DevTools > Application > Local Storage
   - Verify `sd_token` is stored (this is the auth token)

3. **Play a game and submit score:**
   - Play in either mode (passthrough/walls)
   - Finish the game
   - You should see: "Score submitted! Rank #..."
   - Check the leaderboard - your score should appear!

4. **Verify with curl (optional):**
   ```bash
   # Signup
   curl -X POST http://localhost:4000/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"username":"test","email":"test@example.com","password":"pass123"}'
   
   # Response now includes the token:
   # {
   #   "success": true,
   #   "user": {...},
   #   "token": "uuid-string-here"
   # }
   ```

## Commit
- **Commit:** `3706951`
- **Message:** `fix: return auth token in login/signup responses`
- **Files changed:**
  - `backend/app/schemas.py` - Added token field
  - `backend/app/routes_auth.py` - Return token from login/signup

## Related Issues
- Frontend was waiting for token in response (see comment on line 102 of api.ts: "If backend returns token in the future, store it")
- Now the backend does return it, so everything works!
