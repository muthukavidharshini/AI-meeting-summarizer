# 🚀 AI Meeting Intelligence System

An advanced AI-powered web application that transforms raw meeting content into structured, actionable insights including summaries, action items, issues, and goals — with multilingual support, audio input, and a modern SaaS-style dashboard.

---

## 🌟 Overview

In today’s fast-paced environment, meetings generate large amounts of unstructured information. This system leverages AI and NLP techniques to convert that information into meaningful insights, improving productivity and decision-making.

---

## 🎯 Problem Statement

* Meetings are often unstructured and hard to track
* Important decisions and tasks get missed
* Manual note-taking is inefficient
* Language barriers create confusion

---

## 💡 Solution

This system automatically:

* Summarizes meeting content
* Extracts key decisions and tasks
* Identifies blockers and goals
* Supports multilingual inputs
* Provides downloadable reports

---

## ✨ Features

### 🧠 Smart Summarization

* Generates meaningful paragraph summaries
* Avoids raw sentence output
* Context-aware extraction

### 🌐 Language Control

* Supports:

  * English
  * Tamil
  * Hindi
* Ensures **single-language output only**
* Handles mixed-language input internally

### 🔑 Keyword Extraction

* Extracts high-frequency and meaningful keywords
* Helps quick understanding of meeting context

### 🚀 Action Items Detection

* Automatically identifies tasks
* Displays structured bullet points

### ⚠️ Issues & Blockers Detection

* Highlights risks, delays, and blockers
* Enables quick resolution

### 🎯 Goal Tracking System

* Extracts goals from discussions
* Displays progress:

  * Not Started
  * In Progress
  * Completed

### 🎤 Audio Input (Speech-to-Text)

* Real-time voice recording
* Converts speech into text instantly
* Editable transcript before processing

### 📅 Calendar Integration

* Convert action items into calendar events
* Helps track deadlines

### 📄 PDF Report Generator

* Download complete meeting report
* Structured and printable format

### 🎨 Modern Dashboard UI

* Clean SaaS-inspired design
* Responsive layout
* Interactive cards and navigation

---

## 🏗️ System Architecture

```id="arch"
User Input (Text / Audio)
        ↓
Speech-to-Text Processing (if audio)
        ↓
Language Detection & Normalization
        ↓
NLP Processing Engine
   ├── Summarization
   ├── Keyword Extraction
   ├── Action Detection
   ├── Issue Detection
   └── Goal Tracking
        ↓
Structured Output Generator
        ↓
Frontend Dashboard Display
        ↓
PDF / Calendar Export
```

---

## 🔌 API Endpoints

| Method | Endpoint      | Description              |
| ------ | ------------- | ------------------------ |
| POST   | /summarize    | Generate meeting summary |
| POST   | /login        | User authentication      |
| POST   | /register     | Create new user          |
| GET    | /history      | Fetch past summaries     |
| POST   | /generate-pdf | Download report          |

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Tailwind CSS

### Backend

* Node.js
* Express.js

### AI / NLP

* Text summarization logic
* Keyword extraction
* Language processing

---

## 📂 Project Structure

```id="projstruct"
AI-Meeting-Intelligence-System/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── App.js
│   └── styles/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   └── server.js
│
└── README.md
```

---

## ▶️ How to Run the Project

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/AI-Meeting-Intelligence-System.git
cd AI-Meeting-Intelligence-System
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
node server.js
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🧪 Sample Input

```
Manager: Frontend completed. Backend pending.
Tester: Login bugs found.
Manager: Fix all issues by Friday.
Goal: Complete backend and fix bugs.
```

---

## ✅ Sample Output

* Summary of meeting
* Keywords extracted
* Action items listed
* Issues highlighted
* Goals tracked

---

## 🎯 Key Highlights

* ✅ Clean single-language output
* ✅ Real-time audio processing
* ✅ AI-powered structured insights
* ✅ Professional dashboard UI
* ✅ End-to-end workflow automation

---

## 🔐 Security Features

* JWT-based authentication
* Protected API routes
* Secure user session handling

---

## 📈 Future Enhancements

* 🎥 Video meeting summarization
* 🤝 Team collaboration dashboard
* ☁️ Cloud deployment (AWS / Vercel)
* 📊 Analytics dashboard for meetings
* 🔔 Notifications & reminders

---

## 👩‍💻 Author

Developed by **Muthukavi Dharshini**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub and share it!
