# Real-Time Chat App — Setup Guide

## Prerequisites

Install these before you start:

- **Node.js v18+** → https://nodejs.org
- **MongoDB** → Install via Homebrew: `brew tap mongodb/brew && brew install mongodb-community`
- **nodemon** → `npm install -g nodemon`

---

## Step 1 — Clone / copy the project files

Your project structure should look like this:

```
chat-app/
├── server/
│   ├── models/         User.js, Message.js
│   ├── routes/         auth.js, messages.js, users.js
│   ├── middleware/     auth.js
│   ├── socket/         handlers.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── client/
    ├── src/
    │   ├── components/ Sidebar.jsx, ChatWindow.jsx
    │   ├── hooks/      useSocket.js
    │   ├── lib/        api.js, socket.js
    │   ├── pages/      LoginPage.jsx, RegisterPage.jsx, ChatPage.jsx
    │   ├── store/      authStore.js, chatStore.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Step 2 — Start MongoDB

```bash
# Start MongoDB as a background service
brew services start mongodb-community

# Verify it's running
mongosh
# You should see a > prompt. Type exit to quit.
```

---

## Step 3 — Configure the server environment

```bash
cd chat-app/server

# Copy the example env file
cp .env.example .env

# Open .env and update the JWT_SECRET to something random
# Everything else can stay as-is for local development
```

Your `.env` should look like:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173
```

---

## Step 4 — Install server dependencies

```bash
cd chat-app/server
npm install
```

---

## Step 5 — Start the server

```bash
# Still inside chat-app/server
npm run dev

# You should see:
# ✅ MongoDB connected
# 🚀 Server running on port 5000
```

Leave this terminal running.

---

## Step 6 — Install client dependencies

Open a **new terminal tab**:

```bash
cd chat-app/client
npm install
```

---

## Step 7 — Start the React client

```bash
# Still inside chat-app/client
npm run dev

# You should see:
# VITE v4.x  ready in Xms
# ➜  Local:   http://localhost:5173
```

---

## Step 8 — Open the app

Visit **http://localhost:5173** in your browser.

1. Click **Register** and create an account
2. Open a second browser (or incognito window)
3. Register a second account
4. Chat between the two accounts in **# Global**
5. Click a username in the sidebar to start a **Direct Message**

---

## What's working out of the box

| Feature | Status |
|---|---|
| Register / Login with JWT | ✅ |
| Protected routes (frontend + backend) | ✅ |
| Real-time global chat | ✅ |
| Real-time direct messages | ✅ |
| Message history (loads on room switch) | ✅ |
| Online presence indicator | ✅ |
| Typing indicators | ✅ |
| Messages persisted in MongoDB | ✅ |
| Auto-scroll to latest message | ✅ |

---

## Next features to build (in order)

1. **Read receipts** — add a `readBy` array to the Message model, emit `message:read` on socket
2. **Unread badge** — count unread DMs per user in the sidebar
3. **Image uploads** — use `multer` on the server + store paths in messages
4. **User profile / avatar** — update username/avatar via PUT `/api/users/me`
5. **Message search** — MongoDB text index on `content` field
6. **Notifications** — browser `Notification` API when a DM arrives while on another tab
7. **Emoji reactions** — add a `reactions` map to the Message model

---

## Useful commands

```bash
# Watch MongoDB data live
mongosh
use chatapp
db.users.find().pretty()
db.messages.find().pretty()

# Reset the database
db.dropDatabase()

# Check server logs
# (just watch the terminal where npm run dev is running)
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection failed` | Run `brew services start mongodb-community` |
| `Invalid token` on socket | Log out and log back in (stale JWT in localStorage) |
| Port 5000 already in use | Change `PORT` in `.env` to 5001 |
| CORS errors | Make sure `CLIENT_URL` in `.env` matches your Vite port |
| Changes not reflecting | Hard refresh with Cmd+Shift+R |
