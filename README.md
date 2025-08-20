# CampusSync-AI 🎓🤖  
A full-stack AI-powered college event management hub with **Django backend**, **React frontend**, and **ML models** for event success prediction, student similarity, and sentiment analysis.  

---

## 🚀 Features  
- 🔹 **Event Management** – Organizers can create, update, and manage events.  
- 🔹 **Student Dashboard** – Personalized event recommendations based on interests & past activity.  
- 🔹 **ML Predictions** –  
  - Event success rate prediction  
  - Student similarity classification (KNN)  
  - Feedback sentiment analysis  
- 🔹 **Organizer Tools** – Model retraining option for improved prediction accuracy.  
- 🔹 **Registrations** – Students can register for events.  
- 🔹 **Trending Insights** – Displays student interests.  

---

## 🛠 Tech Stack  
- **Frontend:** React, TailwindCSS  
- **Backend:** Django REST Framework  
- **Database:** SQLite (default Django database)  
- **Machine Learning:** Python (scikit-learn)  
- **Version Control:** Git, GitHub  

---

## 📂 Project Structure  
```bash
CampusSync-AI/
│── backend/       # Django backend (APIs, models, authentication, ML integration)
│── frontend/      # React frontend (UI, dashboards, event views)
│── ml_models/     # ML scripts for prediction, classification, retraining
│── README.md
│── LICENSE
│── .gitignore


---

## ⚡ Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/kasakmasrani/CampusSync-AI.git
cd CampusSync-AI
```

### 2. Backend (Django) Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate   # uses SQLite by default
python manage.py runserver
```

### 3. Frontend (React) Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Access the app

```text
Backend: http://127.0.0.1:8000/
Frontend: http://localhost:5173/ (default Vite port)
```

---
