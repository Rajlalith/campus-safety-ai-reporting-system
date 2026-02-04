<p align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AI-Powered-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Real--Time-Alerts-red?style=for-the-badge" />
</p>

<h1 align="center">🚨 Campus Safety AI Reporting System</h1>

<p align="center">
  <b>An AI-powered, real-time campus safety reporting & alert platform</b><br/>
  Built to help students report incidents instantly and help admins respond faster.
</p>

<p align="center">
  <a href="https://github.com/Rajlalith/campus-safety-ai-reporting-system">🔗 View Repository</a>
</p>

---

## 🌟 Overview

The **Campus Safety AI Reporting System** is a full-stack, production-ready web application designed to improve campus safety through:

- 🧠 **AI-powered incident analysis**
- 🖼️ **Computer vision–based image handling**
- 🔔 **Real-time broadcast alerts**
- 🗺️ **Live incident mapping**
- 🛡️ **Secure admin dashboard**

This project simulates a **real-world emergency response platform**, combining modern web technologies with AI-driven insights.

---

## 🎯 Key Features

### 👩‍🎓 Student Side
- 📝 Submit incident reports with **descriptions, location & images**
- 🧠 AI-generated summaries & urgency scoring
- 🗺️ View incidents on a **live campus map**
- 📌 Track report status and admin notes
- 🔔 Receive **real-time safety alerts**

### 🧑‍💼 Admin Side
- 📊 Centralized **incident management dashboard**
- ⚙️ Update status, priority & internal notes
- 🚨 Send **instant broadcast alerts** to all users
- 🧠 View AI summaries & confidence scores
- 🔐 Secure admin authentication

---

## 🧠 AI & Smart Logic

- **AI Incident Summarization**
- **Urgency Scoring (0–100)**
- **Duplicate Incident Detection**
- **Computer Vision Safety Tagging**
- **Model Confidence Tracking**

> Built to simulate how AI can assist real emergency response systems.

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React (Vite)
- 🎨 Tailwind CSS
- 🔄 React Router
- 🔌 Socket.IO Client

### Backend
- 🟢 Node.js
- 🚂 Express.js
- 🧠 AI Services Layer
- 📡 Socket.IO (Real-time alerts)

### Database
- 🍃 MongoDB (Mongoose)
- 🌍 GeoJSON for live map support

### DevOps & Infrastructure
- 🐳 Docker & Docker Compose
- 🌐 Nginx (Frontend serving)
- 🔐 JWT Authentication

---

## 🗂️ Project Structure

@startuml
package "Campus-Safety-AI-Reporting-System" {
    
    package "backend" {
        Dockerfile
        package.json
        server.js
        
        package "src" {
            package "config" {
                db.js
            }
            package "middleware" {
                auth.js
                error.js
                upload.js
            }
            package "models" {
                Admin.js
                Alert.js
                Incident.js
            }
            package "routes" {
                admin.js
                alerts.js
                incidents.js
            }
            package "services" {
                aiService.js
                duplicateService.js
                visionService.js
            }
            package "mcp" {
                orchestrator.js
                tools.js
            }
        }
    }

    package "frontend" {
        Dockerfile
        index.html
        nginx.conf
        package.json
        
        package "src" {
            package "api" {
                admin.js
                index.js
            }
            assets
            package "components" {
                AdminRoute.jsx
                AlertsBanner.jsx
                IncidentTable.jsx
                StatCard.jsx
            }
            package "layouts" {
                AdminLayout.jsx
                AppLayout.jsx
            }
            package "pages" {
                AdminAlerts.jsx
                AdminDashboard.jsx
                AdminIncidentDetail.jsx
                AdminIncidents.jsx
                AdminLogin.jsx
                Home.jsx
                LiveMap.jsx
                Report.jsx
                Track.jsx
            }
            socket.js
            App.jsx
            main.jsx
            index.css
        }
    }

    docker-compose.yml
    README.md
}
@enduml


## 🚀 Getting Started (Docker)

```bash
# Clone repository
git clone https://github.com/Rajlalith/campus-safety-ai-reporting-system.git
cd campus-safety-ai-reporting-system

# Start full stack
docker compose up --build

