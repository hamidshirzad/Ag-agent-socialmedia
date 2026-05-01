# Security Specification - Fourdoor AI

## Data Invariants
1. **Identity Integrity**: Every document in `posts`, `leads`, and `campaigns` must have a `userId` field that matches the `request.auth.uid`.
2. **Relational Consistency**: `messages` are sub-collections of `leads`. Access to a message is dependent on owning the parent lead.
3. **User Isolation**: A user can only read/write their own profile in the `users` collection.
4. **Verified Access**: All write operations require a verified email (`email_verified == true`).

## The "Dirty Dozen" Payloads

### 1. Identity Spoofing (User Profile)
Attempt to create a user profile with a different UID.
```json
// Path: /users/attacker-uid
{
  "email": "victim@example.com",
  "plan": "agency"
}
```
**Expected**: PERMISSION_DENIED

### 2. Privilege Escalation (Plan Update)
Attempt to upgrade own plan without payment.
```json
// Path: /users/my-uid (update)
{
  "plan": "agency"
}
```
**Expected**: PERMISSION_DENIED (if plan is not in allowed fields for update)

### 3. Identity Hijacking (Leads)
Attempt to create a lead for another user.
```json
// Path: /leads/new-lead
{
  "userId": "victim-uid",
  "name": "Target Lead",
  "email": "lead@target.com"
}
```
**Expected**: PERMISSION_DENIED

### 4. Shadow Field Injection (Posts)
Attempt to inject an unvalidated field.
```json
// Path: /posts/new-post
{
  "userId": "my-uid",
  "caption": "Hello world",
  "status": "draft",
  "isAdmin": true
}
```
**Expected**: PERMISSION_DENIED (due to strict key checks)

### 5. ID Poisoning (Long ID)
Attempt to use a massive string as a document ID.
```json
// Path: /leads/[1.5KB STRING]
{
  "userId": "my-uid",
  "name": "Test"
}
```
**Expected**: PERMISSION_DENIED (isValidId check)

### 6. Orphaned Write (Messages)
Attempt to write a message to a lead the user doesn't own.
```json
// Path: /leads/victim-lead-id/messages/msg-1
{
  "content": "Phishing link"
}
```
**Expected**: PERMISSION_DENIED

### 7. Resource Poisoning (Massive Content)
Attempt to write a 1MB string into a caption.
```json
// Path: /posts/new-post
{
  "userId": "my-uid",
  "caption": "[1MB STRING]",
  "status": "draft"
}
```
**Expected**: PERMISSION_DENIED (size check)

### 8. State Shortcut (Post Status)
Attempt to set a post status to an invalid value.
```json
// Path: /posts/post-id (update)
{
  "status": "deleted" 
}
```
**Expected**: PERMISSION_DENIED (enum check)

### 9. Immutable Field Violation (CreatedAt)
Attempt to change the `createdAt` timestamp.
```json
// Path: /users/my-uid (update)
{
  "createdAt": "2020-01-01T00:00:00Z"
}
```
**Expected**: PERMISSION_DENIED

### 10. Unverified Write
Attempt to write while `email_verified` is false.
**Expected**: PERMISSION_DENIED

### 11. Cross-User Listing
Attempt to list all leads without a userId filter.
**Expected**: PERMISSION_DENIED (Rule must enforce resource.data.userId == request.auth.uid)

### 12. Denial of Wallet (Recursive get)
Attempt to trigger massive `get()` calls in a list query.
**Expected**: Avoided by design (Rules use resource.data where possible).
