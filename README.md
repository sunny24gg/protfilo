# 🎨 Sunny — Video Editor & Filmmaker Portfolio & Admin Control Center

A modern, street-art & graffiti style portfolio with a live Firebase-connected Admin Control Center built for **Sunny**, Video Editor & Filmmaker.

---

## ⚡ Direct Contact Details

- **Email**: [`sunny24yw@gmail.com`](mailto:sunny24yw@gmail.com)
- **Phone / WhatsApp**: [`+91 81069 04433`](https://wa.me/918106904433)
- **Call**: [`+91 81069 04433`](tel:+918106904433)

---

## 🔒 Admin Control Center (`admin.html`)

Access the private admin dashboard at [**`admin.html`**](file:///c:/Users/sunny/Documents/protfilo/admin.html) or via the **"Admin Portal 🔒"** link at the bottom of the portfolio.

### 🔑 Login Credentials:
- **Username**: `sunny` (case-insensitive)
- **Password**: `Sunny@24y`

### 🛠️ Cloud Storage in Firebase Firestore (`sunnyportfilo`):
All admin and portfolio data is directly stored and synchronized live in your Firebase Firestore:
1. **`admin_todos`**:
   - To-do tasks created in the admin panel (title, priority, category, completion status, timestamp).
   - Interactive checkbox toggle and task deletion syncs to Firebase immediately.
2. **`admin_projects`**:
   - Client projects tracking (client name, title, category, stage 1–6, deadline, footage drive link, notes).
   - Changing the stage dropdown updates the project in Firebase in real time.
3. **`work_inquiries`**:
   - Incoming briefs submitted by clients from the *"Send Me Work"* intake form.
   - Status updates (`New Lead`, `Contacted`, `In Progress`, `Closed / Paid`) and deletion sync directly to Firestore.
4. **`reviews`**:
   - Live client reviews and ratings.
   - Moderation and review deletions sync directly to Firestore.

*Note: All hardcoded past mock data ("Render 4K color pass", "Creator Studio", "Rohit Kumar", etc.) has been eliminated. All lists now reflect 100% real data from your Firebase collections.*

---

## 🔥 Recommended Firestore Security Rules:
In your [Firebase Console](https://console.firebase.google.com/project/sunnyportfilo/firestore/rules), ensure these rules are active:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reviews/{reviewId} {
      allow read, write: if true;
    }
    match /work_inquiries/{inquiryId} {
      allow read, write: if true;
    }
    match /admin_todos/{todoId} {
      allow read, write: if true;
    }
    match /admin_projects/{projectId} {
      allow read, write: if true;
    }
  }
}
```

---

## 🚀 How to Run Locally

Run the local web server:
```powershell
python -m http.server 8000
```
- **Portfolio Website**: `http://localhost:8000`
- **Admin Control Room**: `http://localhost:8000/admin.html`
