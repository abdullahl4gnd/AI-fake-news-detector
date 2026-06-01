# AI Fake News Detector

A full-stack mobile application that uses machine learning to detect fake news from text, URLs, and images. Built with Django REST Framework for the backend and React Native (Expo) for the mobile frontend.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [AI Models](#ai-models)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Docker](#docker)
- [Screenshots](#screenshots)

---

## Overview

The AI Fake News Detector is a mobile application that helps users verify the credibility of news articles. Users can submit news content in three ways: plain text, a URL to a news article, or an image of a news headline. The application uses a trained machine learning model to analyze the content and return a credibility score along with an explanation of the result.

The project was built as a final year computer science project to address the growing problem of misinformation in digital media.

---

## Features

- User registration and login with JWT authentication
- Fake news detection from text input
- Fake news detection from URLs (automatically scrapes article content)
- Fake news detection from images using OCR (EasyOCR)
- Credibility score with detailed explanation
- Suspicious words highlighting
- Sentiment analysis using TextBlob
- Source reputation scoring (trusted vs unreliable sources)
- News feed with live articles from NewsAPI
- Category filters for news (Technology, Business, Sports, Health, Science, Entertainment)
- User profile management (edit name, email, phone, bio)
- Password change
- Account deletion
- Dashboard with submission history and statistics
- MySQL database for persistent storage
- Docker containerization for easy deployment

---

## Tech Stack

### Backend
- Python 3.12
- Django 6.0.4
- Django REST Framework 3.17.1
- MySQL (mysqlclient 2.2.8)
- JWT Authentication (djangorestframework-simplejwt)
- EasyOCR for image text extraction
- BeautifulSoup4 for URL scraping
- TextBlob for sentiment analysis
- scikit-learn for ML model

### Mobile
- React Native (Expo)
- TypeScript
- Axios for API calls
- AsyncStorage for token management
- Expo Image Picker for image selection

### DevOps
- Docker
- Docker Compose
- MySQL 8.0 (containerized)

---

## AI Models

Three models were trained and evaluated on the ISOT Fake News Dataset (Fake.csv + True.csv, approximately 44,000 articles):

| Model | Test Accuracy | Real-World Accuracy | Selected |
|---|---|---|---|
| Logistic Regression (L2) | 98.09% | High | Yes |
| Lasso (L1) | 98.58% | 65% (overfit) | No |
| DistilBERT (PyTorch) | Tested | Not evaluated | No |

The Logistic Regression model with L2 regularization was selected as the production model because it achieved the best balance between test accuracy and real-world generalization. The Lasso model achieved higher test accuracy but showed clear signs of overfitting when tested on unseen real-world articles.

### Credibility Score Calculation

The final credibility score is computed using three factors:

- Text model confidence (60% weight without URL, 50% with URL)
- Sentiment analysis score (40% weight without URL, 30% with URL)
- Source reputation score (20% weight, only when URL is provided)

Scores above 70 are classified as Real, scores between 40 and 70 as Uncertain, and scores below 40 as Fake.

---

## Project Structure

```
AI fake news detection/
├── backend/
│   ├── settings.py
│   └── urls.py
├── accounts/
│   ├── models.py          (Custom user model)
│   ├── views.py           (Auth endpoints)
│   ├── serializers.py
│   └── urls.py
├── news/
│   ├── models.py          (NewsSubmission model)
│   ├── views.py           (Detection endpoints)
│   ├── serializers.py
│   ├── urls.py
│   └── AI/
│       └── Text Models/
│           └── Text Model/
│               ├── best_fake_news_model.pkl
│               └── tfidf_vectorizer.pkl
├── mobile/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── onboarding.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── (tabs)/
│   │       ├── index.tsx      (Home)
│   │       ├── detect.tsx     (Detection)
│   │       ├── news.tsx       (News Feed)
│   │       └── profile.tsx    (Profile)
│   ├── screens/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── services/
│       └── api.ts
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── manage.py
```

---

## Getting Started

### Prerequisites

- Python 3.12
- Node.js 18+
- MySQL 8.0
- Expo CLI
- Android Studio (for emulator) or physical Android device

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/abdulaith4gnd/AI-fake-news-detector.git
cd AI-fake-news-detector
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1   # Windows
source .venv/bin/activate     # Linux/Mac
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the project root:
```
SECRET_KEY=your-secret-key-here
DB_NAME=fake_news_db
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_HOST=127.0.0.1
DB_PORT=3306
```

5. Create the MySQL database:
```sql
CREATE DATABASE fake_news_db;
```

6. Run migrations:
```bash
python manage.py migrate
```

7. Start the Django server:
```bash
python manage.py runserver 0.0.0.0:8000
```

### Mobile Setup

1. Navigate to the mobile directory:
```bash
cd mobile
npm install
```

2. Update the API URL in `mobile/services/api.ts`:
```typescript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:8000/api';
```

3. Start Expo:
```bash
npx expo start
```

4. Press `a` to open on Android emulator or scan the QR code with Expo Go on a physical device.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/accounts/register/ | Register a new user |
| POST | /api/accounts/login/ | Login and receive JWT tokens |
| GET | /api/accounts/profile/ | Get current user profile |
| POST | /api/accounts/update-profile/ | Update user profile |
| POST | /api/accounts/change-password/ | Change user password |
| POST | /api/accounts/delete-account/ | Delete user account |

### News Detection

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/news/create/ | Submit content for analysis |
| GET | /api/news/list/ | Get all user submissions |
| GET | /api/news/dashboard-summary/ | Get dashboard statistics |
| GET | /api/news/{id}/ | Get a specific submission |
| DELETE | /api/news/{id}/delete/ | Delete a submission |

### Detection Request Format

```json
{
  "article_text": "News article text here",
  "url": "https://example.com/article",
  "image": "<multipart file>"
}
```

### Detection Response Format

```json
{
  "id": 1,
  "article_text": "News article text...",
  "final_label": "Fake",
  "credibility_score": 23,
  "suspicious_words": "breaking, exposed, deep state",
  "explanation": "Text model: Fake (91% confidence). Source: No URL. Sentiment score: 75/100 fake indicators.",
  "created_at": "2026-05-30T02:53:13Z"
}
```

---

## Docker

To run the entire application using Docker:

1. Make sure Docker Desktop is installed and running.

2. Create a `.env` file with your database credentials (see Backend Setup above).

3. Build and start the containers:
```bash
docker-compose up --build
```

This will start two containers:
- `fake_news_db` — MySQL database on port 3307
- `fake_news_web` — Django application on port 8000

4. To stop the containers:
```bash
docker-compose down
```

---

## Dataset

The model was trained on the ISOT Fake News Dataset, which contains approximately 44,000 labeled news articles split between fake and real news. The dataset can be downloaded from Kaggle:

```
https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset
```

---

## Security

- Passwords are hashed using Django's built-in PBKDF2 + SHA256 algorithm
- Authentication uses JWT tokens with expiry
- Sensitive credentials are stored in a `.env` file excluded from version control
- CORS is configured to allow only necessary origins

---

## Author

Abdullah firas fawzi al obaidi — Computer engineer Final Year Project, 2026
