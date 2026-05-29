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
<img width="1920" height="1080" alt="Screenshot (743)" src="https://github.com/user-attachments/assets/fa5f07a3-6eb8-4ed8-9132-56be919d398f" />

### Dashboard
<img width="1920" height="1080" alt="Screenshot (735)" src="https://github.com/user-attachments/assets/75b80722-0ab8-4018-a91f-b0e447e8714c" />

### Upload Documents
<img width="1920" height="1080" alt="Screenshot (737)" src="https://github.com/user-attachments/assets/5b9d492e-b862-48fd-afe7-a1c029ae4ab2" />

### Document Management
<img width="1920" height="1080" alt="Screenshot (738)" src="https://github.com/user-attachments/assets/8750ae0b-2ed5-4f9c-8645-2897b7e85d84" />

### Batch Processing
<img width="1920" height="1080" alt="Screenshot (739)" src="https://github.com/user-attachments/assets/0819b0fa-ab55-4397-9bc2-7dafa3ee19d6" />

### Activity Logs
<img width="1920" height="1080" alt="Screenshot (740)" src="https://github.com/user-attachments/assets/4f7de676-a80e-42a0-9ab8-87f8199b29a6" />


## Future Enhancements
- Database Integration (MySQL/PostgreSQL)
- OCR Support
- Cloud Storage Integration
- Advanced AI-Based Classification
- Role-Based Access Control


## Author
Shruti Samal(Shrutayyy07)
