# IntelliCore — Smart File Analytics

IntelliCore is developed as a full-stack document analytics and validation platform built using React, Spring Boot, Python, and OpenCV.
The system automates the processing of PDF and image files, extracts metadata, analyzes document quality, generates confidence scores, and provides insights through an interactive dashboard. 

## Features
- Secure JWT-based Authentication
- PDF and Image Upload Support
- Metadata Extraction using Apache Tika and PDFBox
- Image Quality Analysis using OpenCV
- Automated Document Scoring and Validation
- Batch Processing of Multiple Documents
- Analytics Dashboard with Charts and Statistics
- Document Search, Filter, View, and Delete
- Activity Logs and System Monitoring
- RESTful API Architecture

## Tech Stack
### Frontend
- React
- React Router
- Recharts
- Lucide React

### Backend
- Spring Boot
- Spring Security
- JWT Authentication
- Maven

### Document Processing
- Apache PDFBox
- Apache Tika

### AI & Image Processing
- Python
- OpenCV

### Storage
- JSON File Storage

## Project Structure

```text
intellicore/
├── frontend/          # React Application
├── backend/           # Spring Boot APIs
├── uploads/           # Uploaded Files
├── data/              # JSON Storage
└── scripts/           # Python Processing Scripts
```

## Workflow

```text
User Uploads File
        ↓
Metadata Extraction
        ↓
Image/PDF Analysis
        ↓
Confidence Score Generation
        ↓
Document Classification
        ↓
Dashboard & Reports
```

## Installation

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Key Modules
### Authentication
Handles user login, JWT token generation, and protected routes.

### Document Management
Supports uploading, viewing, searching, filtering, and deleting documents.

### Metadata Extraction
Extracts file information such as type, size, author, creator, and page count.

### Image Analysis
Uses OpenCV-based blur detection to assess image quality.

### Batch Processing
Processes multiple uploaded documents in a single operation.

### Dashboard
Displays document statistics, approval rates, confidence scores, and upload activity.


## Screenshots
### Login Page
<img width="1920" height="1080" alt="Screenshot (744)" src="https://github.com/user-attachments/assets/df9652b0-955f-46d4-9f1e-e2fa69719890" />

### Dashboard
<img width="1920" height="1080" alt="Screenshot (745)" src="https://github.com/user-attachments/assets/6300f9a1-9346-45d0-9815-103363ad7d76" />

### Upload Documents
<img width="1920" height="1080" alt="Screenshot (748)" src="https://github.com/user-attachments/assets/c9dd756d-fef0-4057-a337-403c182ce82c" />

### Document Management
<img width="1920" height="1080" alt="Screenshot (749)" src="https://github.com/user-attachments/assets/73163795-ccd9-48db-aad5-e1e31a6a7f8d" />

### Batch Processing
<img width="1920" height="1080" alt="Screenshot (750)" src="https://github.com/user-attachments/assets/e11bb03d-5f16-456c-9b5d-1bf80cad268f" />

### Activity Logs
<img width="1920" height="1080" alt="Screenshot (751)" src="https://github.com/user-attachments/assets/dcbd2856-1f50-4c3a-b95d-4c4bd0822338" />


## Future Enhancements
- Database Integration (MySQL/PostgreSQL)
- OCR Support
- Cloud Storage Integration
- Advanced AI-Based Classification
- Role-Based Access Control


## Author
Shruti Samal(Shrutayyy07)
