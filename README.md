# RecoverAI 🚀

**RecoverAI** is an AI-powered Revenue Recovery Decision Engine for merchants, built to intelligently handle failed transactions, optimize recovery strategies, and safeguard merchant revenue.

---

## 🏗️ Architecture Overview (Phase 0)

```
React (TypeScript + Vite + Tailwind CSS + shadcn/ui)
                     │
                     │ REST API (/api/health)
                     ▼
          Java 21 + Spring Boot 3
          ├── Controllers (HealthController)
          ├── Services
          ├── Repositories
          ├── Entities (Customer, Transaction, PaymentAttempt, RecoveryAction, AuditLog)
          ├── DTOs (HealthResponse)
          ├── Exceptions (GlobalExceptionHandler)
          └── Config (CorsConfig)
                     │
                     ▼
            PostgreSQL + Flyway
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript (Strict Mode)
- **Bundler**: Vite
- **Styling**: Tailwind CSS & shadcn/ui design tokens
- **Data Fetching & State**: TanStack Query (React Query v5) & Axios
- **Routing**: React Router DOM v6
- **Icons & Charts**: Lucide React & Recharts

### Backend
- **Language**: Java 21
- **Framework**: Spring Boot 3.4.3
- **Data Access**: Spring Data JPA & Hibernate
- **Database**: PostgreSQL (with Flyway migration management)
- **Testing**: JUnit 5, Mockito, Spring Boot Test, H2 (test profile)
- **Build Tool**: Maven 3.9+

---

## 📂 Project Structure

```
RecoverAI/
├── .env.example
├── README.md
├── backend/
│   ├── .env.example
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/recoverai/
│       │   │   ├── config/             # CorsConfig, AppConfig
│       │   │   ├── controller/         # REST Controllers (HealthController)
│       │   │   ├── dto/                # Data Transfer Objects (HealthResponse)
│       │   │   ├── entity/             # JPA Entities
│       │   │   ├── exception/          # GlobalExceptionHandler, ErrorResponse
│       │   │   ├── repository/         # Spring Data Repositories
│       │   │   ├── service/            # Business Logic Services
│       │   │   └── RecoverAiApplication.java
│       │   └── resources/
│       │       ├── application.yml     # Application configuration & profiles
│       │       └── db/migration/       # Flyway SQL migrations (V1__init_schema.sql)
│       └── test/
│           ├── java/com/recoverai/     # JUnit 5 & MockMvc tests
│           └── resources/
│               └── application-test.yml# In-memory H2 test profile
└── frontend/
    ├── .env.example
    ├── components.json
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── components/
        │   └── ui/                     # Reusable UI primitives (Card, Button, Badge)
        ├── hooks/                      # Custom hooks (useHealth)
        ├── layouts/                    # Layout shells (RootLayout)
        ├── lib/                        # Utility functions (cn)
        ├── pages/                      # Page views (HealthCheckPage)
        ├── services/
        │   └── api/                    # Axios client & endpoints (healthService)
        ├── types/                      # TypeScript definitions (HealthResponse)
        ├── App.tsx
        ├── index.css
        └── main.tsx
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Java 21 JDK** or newer
- **Apache Maven 3.9+**
- **Node.js 18+** and **npm 9+**
- *(Optional for full persistence)* **PostgreSQL 14+**

---

### 1. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```

2. *(Optional)* Configure your database in `.env` or run with default settings:
   ```bash
   cp .env.example .env
   ```

3. Run the automated test suite:
   ```bash
   mvn clean test
   ```

4. Start the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

   The backend will start at: `http://localhost:8080`  
   Health endpoint: `http://localhost:8080/api/health`

---

### 2. Frontend Setup

1. Open a terminal in the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. *(Optional)* Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Run the Vite development server:
   ```bash
   npm run dev
   ```

   The frontend will start at: `http://localhost:5173`

---

## 📡 Health Check Verification

- **GET `/api/health`** returns:
  ```json
  {
    "status": "UP",
    "service": "RecoverAI Decision Engine",
    "version": "0.0.1-SNAPSHOT",
    "environment": "default",
    "timestamp": "2026-08-25T00:00:00Z",
    "details": {
      "javaVersion": "22.0.1",
      "systemUptimeMillis": 1756083000000,
      "memoryFreeBytes": 134217728,
      "memoryTotalBytes": 268435456
    }
  }
  ```

---

## 🔒 Quality Checks

- **Frontend Typecheck & Build**: `npm run build`
- **Backend Test Suite**: `mvn clean test`
- **Backend Package Build**: `mvn clean package`
