# React & Node.js Skill Test

## How to Run

1. **Server**

   ```bash
   cd Server
   npm install
   npm start
   ```
2. **Client**

   ```bash
   cd Client
   npm install
   npm start
   ```

Both server and client will start on their configured ports (default server: 5001, client: 3000).

---

## Environment Variables

### Server (`Server/.env`)

```env
# Atlas connection string *without* a database path
DB_URL=mongodb+srv://<username>:<password>@cluster0.dpq1j3r.mongodb.net

# The name you want for your DB
DB=Prolink

# Server port
PORT=5001

# Random JWT secret
JWT_SECRET=5m9Ch3-rO2oeW7B7U5IvwpcbyziXm1O1kWsuv2k6yMI
```

### Client (`Client/.env`)

```env
REACT_APP_BASE_URL=http://localhost:5001/
```

---

## Meeting API Endpoints

| Method | Path                      | Description                                                                                                                                              |
| ------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/meeting`            | List all meetings. `superAdmin` sees everyone’s; regular users see only their own. Returns enriched `createBy` object and arrays of populated attendees. |
| GET    | `/api/meeting/view/:id`   | Fetch a single meeting by ID with the same population logic and access checks.                                                                           |
| POST   | `/api/meeting/add`        | Create a new meeting; the logged‑in user is automatically set as `createBy`.                                                                             |
| DELETE | `/api/meeting/delete/:id` | Soft‑delete a meeting (`deleted: true`), only allowed for its owner or `superAdmin`.                                                                     |
| POST   | `/api/meeting/deleteMany` | Soft‑delete multiple meetings by ID array, scoped by ownership rules.                                                                                    |

---

## Client‑Side Logic Summary

* **Data fetching**: Redux `fetchMeetingData` thunk calls `/api/meeting` (with optional `?createBy=` for non‑admins) and stores results in application state.
* **Listing & Bulk Actions**: `CommonCheckTable` displays meetings in a table, with row selection, and a **Delete Selected** button that’s enabled only when rows are selected and the user has delete permission.
* **Forms & Detail**: `AddMeeting` provides a modal form to create/edit meetings; `MeetingAdvanceSearch` filters by agenda, creator, date, or timestamp; and the detail view fetches `/api/meeting/view/:id` to show full meeting info.

