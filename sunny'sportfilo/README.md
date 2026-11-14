# Sunny — Video Editor Portfolio

A clean, modern, and high-converting portfolio website for **Sunny**, a professional Video Editor and Visual Storyteller.

## 🎨 Design & Palette Highlights
- **Strictly No Blue**: Styled with a cinematic dark background (`#0A0A0B`, `#131316`, `#18181C`) paired with warm amber and gold accents (`#F59E0B`, `#FBBF24`).
- **Typography**: Clean, contemporary editorial typography using *Syne* and *Plus Jakarta Sans*.
- **Responsive**: Fully responsive across smartphones, tablets, laptops, and ultra-wide displays.

## 🚀 Key Sections & Features
1. **Hero Section**:
   - Availability status indicator ("🟢 Available for Freelance Projects & Retainers").
   - Value proposition and high-impact headline.
   - Quick action buttons (View Past Work, Quick WhatsApp chat, Get In Touch).
   - Sunny's profile card with direct phone and email badges.
2. **Past Work & YouTube Showcase**:
   - High-impact button linking directly to Sunny's YouTube playlist (`PLGma-5oyS8Fs`).
   - Highlights of core editing styles (Short-Form & Reels, YouTube Long-Form, Cinematic & Music Edits).
4. **Editing Specialties**:
   - 6 detailed post-production services (Pacing, Sound Design, Color Grading, Motion Graphics, Speed Ramps, Multi-Platform formatting).
5. **Creative Toolkit**:
   - Visual software stack using your actual software assets: Adobe Premiere Pro, After Effects, CapCut Pro, and Wondershare Filmora.
6. **4-Stage Workflow**:
   - Transparent editing pipeline (Footage & Brief &rarr; The Story Cut &rarr; Polish & Sound &rarr; Review & Delivery).
7. **Client Ratings & Reviews (Live Database)**:
   - Dynamic ratings loaded directly from Cloud Firestore's `reviews` collection.
   - Live average score calculation, 5-star breakdown, and verified client badges.
   - Interactive "Rate Sunny" modal allowing clients to post 1-5 star reviews directly to Firebase.
8. **Interactive Contact & Hire Section**:
   - **Google Cloud Firestore Database Integration**: Form submissions automatically store inquiries into the `inquiries` collection in your Firebase project (`portfilo-3e0b6`).
   - Instant WhatsApp messaging link with prefilled project inquiry (`+91 8106904433`).
   - Direct phone call link (`+91 8106904433`) with a one-click **Copy Number** button.
   - Direct email link (`sunny24yw@gmail.com`) with a one-click **Copy Email** button.
   - Automatic loading spinner, success confirmations, and instant WhatsApp chat fallback.

## 🗄️ Firebase Database Setup
Your website uses **Cloud Firestore** for both inquiries and client ratings:

### 1. `inquiries` Collection (Project Briefs)
```
inquiries/
  ├── clientName: string
  ├── email: string
  ├── phone: string
  ├── projectType: string
  ├── timeline: string
  ├── details: string
  ├── submittedAt: serverTimestamp
  ├── source: "Portfolio Website"
  └── status: "new"
```

### 2. `ratings` Collection (Client Ratings - Star, Name & Feedback)
```
ratings/
  ├── name: string
  ├── rating: number (1 to 5 stars)
  ├── feedback: string
  └── createdAt: serverTimestamp
```

To view and manage data:
1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select your project **portfilo-3e0b6**.
3. In the left navigation, click **Firestore Database** &rarr; view the **`inquiries`** and **`ratings`** collections!

## 📁 File Structure
```
sunny'sportfilo/
├── index.html        # Main semantic HTML5 webpage
├── style.css         # Styling (amber & gold dark aesthetic, zero blue)
├── script.js         # Mobile menu, copy-to-clipboard, form handlers
├── README.md         # Project documentation
└── assests/          # Video edits, icons, and profile imagery
    ├── Sunny_Editor_Logo_Transparent.png
    ├── sunny-profile.jpeg
    ├── SUNNY.png
    ├── adobe-premiere-pro.png
    ├── after-effects.png
    ├── capcut.png
    └── wondershare-filmora.png
```

## 🌐 How to View & Deploy
- **Open locally**: Double-click `index.html` to open it directly in Chrome, Edge, Safari, or Firefox.
- **Deploy online**: Drag and drop the folder into **Netlify Drop**, **Vercel**, or push to **GitHub Pages** for a free live URL.

