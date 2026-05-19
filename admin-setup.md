# Admin Portal — One-Time Setup

Follow these steps once to get the admin portal working.

---

## Step 1 — Create the Admin table in Neon

1. Go to [neon.tech](https://console.neon.tech) → Your project → **SQL Editor**
2. Run these two statements (run them separately or together):

```sql
-- Grant schema permission (only needed once)
GRANT CREATE ON SCHEMA public TO neondb_owner;

-- Create the Admin table
CREATE TABLE IF NOT EXISTS "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
```

---

## Step 2 — Regenerate Prisma client

Stop your dev server, then run:

```bash
npx prisma generate
npx prisma migrate resolve --applied 20260519000000_add_admin_model
```

Then restart the dev server:
```bash
npm run dev
```

---

## Step 3 — Create your first super-admin account

With the server running, make a POST request to create your admin:

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"YourPassword123","name":"Your Name"}'
```

Or use a tool like Postman / Thunder Client, or open your browser's dev console and run:

```javascript
fetch('/api/admin/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@yourdomain.com',
    password: 'YourPassword123',
    name: 'Your Name'
  })
}).then(r => r.json()).then(console.log)
```

This endpoint **self-disables** the moment any admin exists — it cannot be called again.

---

## Step 4 — Log in

Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and sign in with the credentials you just created.

---

## Routes

| URL | Description |
|-----|-------------|
| `/admin/login` | Sign in |
| `/admin/dashboard` | Stats + charts |
| `/admin/users` | Manage users |
| `/admin/users/[id]` | User detail, edit, delete |
| `/admin/admins` | Manage admin accounts (super-admin only) |
