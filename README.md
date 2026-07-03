# PrepAI: AI-Powered Interview Preparation Platform

PrepAI is a full-stack, enterprise-grade web application designed to help software engineers, developers, and candidates prepare for technical and behavioral interviews. Driven by generative AI (Google Gemini), PrepAI dynamically produces tailored assessment rounds, acts as a virtual conversational mock examiner, evaluates user-submitted code in an interactive terminal, parses resumes to customize targets, and visualizes progress over time.

---

## Technical Stack Overview

### Frontend
- **React 19** & **TypeScript**
- **Vite** (Optimized bundler)
- **Tailwind CSS v4** (Utility-first styles with elegant display layouts)
- **React Router DOM** (Single Page Application layout routing)
- **Recharts** (Visual performance matrices & diagnostics charts)
- **Context API** (Stateful global authentication & theme management)

### Backend Deliverables
- **Java 21** & **Spring Boot 3**
- **Spring Security** with **JWT Stateless Authentication**
- **Spring Data JPA** & **Hibernate** (Database mappings & queries)
- **Maven** (Modular project assembly build tool)
- **Google GenAI SDK** / Compatible AI provider integrations

### Databases & Servers
- **MySQL 8.x** (Structured user logging, historical analytics, and question items)
- **Express + Node.js** (Pre-integrated full-stack server running live in the developer sandbox)

---

## Local Sandbox Preview (Quick Start)

The developer sandbox is pre-configured with a dual-execution full-stack mode: a server-side **Express proxy backend** (`server.ts`) handles user signups, caches evaluations, and streams actual Gemini AI evaluations on port `3000`.

### Setup Environment Secrets
1. Go to the **Settings > Secrets** panel in the AI Studio UI.
2. Ensure `GEMINI_API_KEY` is set to your actual Google Gemini API key.
3. The platform will automatically inject the key securely on the server side at runtime (never exposing it to the browser!).

### Run Dev Server
The dev server starts automatically in the preview iframe. If you need to reboot or sync dependencies:
```bash
npm install
npm run dev
```

---

## Production Java + MySQL Architecture Deployment

We follow clean architecture design models (`Controller` -> `Service` -> `Repository` -> `DTO` -> `Entity`).

### Prerequisites
- Java JDK 21
- Maven 3.9+
- MySQL 8.x
- Node.js 20+

### Database Setup
1. Log in to your MySQL terminal or client (e.g. Workbench).
2. Execute the schema statements in `/mysql-schema.sql` to configure the `ai_interview_db` database, tables, and constraints.
```sql
SOURCE mysql-schema.sql;
```

### Configure Java Backend
1. Open the `/java-backend/src/main/resources/application.properties` configuration file.
2. Supply your MySQL URL, credentials, and Gemini credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ai_interview_db?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=interview_user
spring.datasource.password=interview_pass_123

# JWT Key
security.jwt.secret-key=ai_interview_assistant_secure_salt_777
security.jwt.expiration-time=86400000

# Gemini API Integration
gemini.api.key=YOUR_GEMINI_API_KEY
```

3. Build and execute the Maven Spring Boot package:
```bash
cd java-backend
mvn clean package
java -jar target/assistant-0.0.1-SNAPSHOT.jar
```
The backend server starts listening on port `8080`.

---

## Docker Containerization Setup

We have integrated a complete multi-container architecture inside `/docker-compose.yml`.

To compile and launch the database cluster, Java backend server, and React static Nginx service simultaneously:
```bash
docker-compose up --build
```

Services exposed:
- **MySQL DB cluster**: Port `3306`
- **Spring Boot API service**: Port `8080`
- **React Nginx SPA client**: Port `3000`

---

## REST API Specification

### Authentication
- `POST /api/auth/register` - Formulate new user account
- `POST /api/auth/login` - Authenticate credentials and sign JWT
- `GET /api/profile` - Retrieve active user registration payload

### Interview Controllers
- `POST /api/interview/start` - Generate dynamic question items based on specs
- `POST /api/interview/answer` - Assess response accuracy and evaluate details
- `GET /api/interview/history` - Obtain history of past completed rounds
- `GET /api/interview/report/{sessionId}` - Inspect deep visual report of itemized feedback

### Resume Analyzer
- `POST /api/resume/upload` - Analyze PDF elements and compile tailored questions

### Metrics Dashboard
- `GET /api/dashboard` - Retrieve aggregated strengths, accuracy ratings, and topic curves
