# Think Quick App

A simple web implementation of the Family Feud gameplay experience. Think Quick uses survey-based answers (frequency -> points), provides timers and sounds, and supports a Host and Player interface with real-time updates.

### Summary

The above implementation includes:
- Admin POST endpoints for adding questions.
- A simple admin UI for question management.
- Socket.IO integration for real-time updates.
- Tests for the game controller and seeding.
- Voice recognition for answer submission.

---

## Quick Start

Prerequisites
- Node.js v14+ (Windows PowerShell examples below)
- MongoDB(optional) if you want persistent survey data. The app can also run with in-memory seeds.

<!-- In-memory seeds are sample survey data loaded into a temporary, RAM-only MongoDB instance (mongodb-memory-server). It’s perfect for easy local dev/testing because you don’t need a running MongoDB server; the data is ephemeral (lost when the process exits). Below are small changes that let you run the server with in-memory DB + automatic seeding (set USE_IN_MEMORY=true in the server .env).-->

Clone and run locally:
1. Open PowerShell and clone the project
```
git clone https://github.com/Duke237/Think-Quick
cd Think-Quick
```

2. Server (in-memory DB — easiest, recommended for quick dev)
```
cd server
npm install
# ensure server/.env has USE_IN_MEMORY=true
npm run dev
```
- The server starts with an ephemeral in-memory MongoDB and auto-seeds sample questions if the DB is empty.
- Data is lost when the server stops.

Server (persistent MongoDB)
```
cd server
npm install
# set MONGODB_URL in server/.env and set USE_IN_MEMORY=false (or remove it)
npm run seed      # seed persistent MongoDB
npm run dev
```

3. Start the client
```
cd ..\client
npm install
npm start
```

4. Open the app in your browser:
- Client UI: http://localhost:3000  
- API / Socket (server): http://localhost:5000 (default)

That's it — open the app and use the Host/Player interfaces.

---

## What this project does (brief)
- Uses survey answers (sample size ≈ 100) where frequency (0–100) = points.
- Host reads questions; players answer under a timer (e.g., 20s).
- Correct answers reveal and award points; wrong answers play a buzzer and add strikes.
- Each team has 3 strikes per round. Rounds can use multipliers (1x, 2x, 3x). Fast Money round supported.
- Real-time updates via Socket.IO. Sounds via HTML5 Audio API.
- Admin tools to create/edit questions and seed data.

---

## Folder layout (simple)
- /client — React app (UI for Host & Players)
  - src/, public/, package.json
- /server — Node + Express API and Socket server
  - src/, package.json
- README.md (this file)

---

## Environment (minimal)
Create `.env` in `/server` (copy .env.example) and set:
- PORT=5000
- MONGO_URI=mongodb://localhost:27017/think-quick-app (optional)
- CLIENT_URL=http://localhost:3000


---

## Useful scripts
From /server
- npm run dev — start server with nodemon (dev)
- npm run seed — seed sample questions
- npm test — run backend tests

From /client
- npm start — start React dev server
- npm test — run frontend tests

---
## Admin Interface
- Navigate to the Admin section to add questions.
- Fill in the Question ID, Question Text, and Answers with Frequencies.
- Submit to save the question to the database.

## Real-Time Updates
- The game uses Socket.IO for real-time updates.
- Players will see answers revealed and strikes updated in real-time.

## Voice Recognition
- Players can use voice commands to submit answers.
- Ensure your microphone is enabled and permissions are granted.

## Testing
- Run tests using Jest:
```bash
npm test

<!-- ## Developer: Adding tech questions
- Edit seeds: server/src/seeds/data.js — add your tech questions (questionId, text, answers with frequency).
- Persistent DB:
  1. Set `USE_IN_MEMORY=false` and `MONGODB_URL` in server/.env
  2. Run: cd server && npm install && npm run seed
- In-memory (fast dev):
  - Set `USE_IN_MEMORY=true` in server/.env and run `npm run dev`. The app auto-seeds the in-memory DB when empty.
- Or use API:
  - POST /api/admin/questions (if you enable the admin endpoint) or add via `server/src/seeds/data.js` and re-run the seed.

Fast Money rule implemented:
- Two players each answer 5 questions, totals are added; if combined total > 100, a +500 bonus is applied and added to the leading team's score.

Notes
- All answers use frequency as points by default (server calculates points = frequency if omitted).
- Questions here are tech-related and intentionally not too complex. -->

## License
MIT

## Contributors
- Davida Assene @Davibytes
- Neba Eric @Duke237