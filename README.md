# Delivery Management System

This project is a web application designed to manage deliveries, clients, articles, and related business operations. It features a .NET backend API and an Angular frontend.

## Overview

The system provides functionalities for:
*   Managing clients, articles, product families, and units of measure.
*   Creating, viewing, updating, and deleting deliveries.
*   Tracking inventory (stock levels for articles).
*   User authentication and role-based authorization for accessing different features.
*   Auditing user actions.
*   A dashboard to visualize key metrics like total deliveries, revenue, and client activity.

## Technologies Used

**Backend:**
*   .NET (net9.0)
*   ASP.NET Core Web API
*   Entity Framework Core (for data access with SQL Server)
*   JWT for authentication
*   BCrypt.Net for password hashing

**Frontend:**
*   Angular (version likely 19.x based on CLI usage in `frontend/README.md`)
*   TypeScript
*   HTML, CSS
*   Chart.js for data visualization
*   Font Awesome for icons

**Database:**
*   Microsoft SQL Server (inferred from EF Core provider and migrations)

## Project Structure

The project is organized into two main parts:

*   `Backend/`: Contains the .NET Web API solution.
    *   `Controllers/`: API endpoints.
    *   `Services/`: Business logic.
    *   `Entities/`: Database models.
    *   `Data/`: `DbContext` and migrations.
    *   `Models/`: Request/response DTOs.
*   `frontend/`: Contains the Angular application.
    *   `src/app/core/`: Core services, models, auth.
    *   `src/app/features/`: Feature modules (articles, clients, livraisons, dashboard, etc.).
    *   `src/app/shared/`: Shared components (layout, sidebar).
## Data Model

The following diagram illustrates the main entities and their relationships within the system:
![Screenshot from 2025-05-30 09-34-04](https://github.com/user-attachments/assets/020bf8a0-1995-4269-8851-458c937f166f)

## Setup and Installation

### Prerequisites

*   .NET SDK (version 9.0 or compatible)
*   Node.js and npm (check Angular version compatibility, e.g., Node.js v18 or v20)
*   Angular CLI (globally or via npx)
*   Microsoft SQL Server instance

### Backend Setup

1.  **Clone the repository (if applicable).**
2.  **Navigate to the Backend directory:**
    ```bash
    cd "Backend"
    ```
3.  **Configure Database Connection:**
    *   Open `Backend/appsettings.json` (or `appsettings.Development.json`).
    *   Update the `ConnectionStrings` section with your SQL Server details.
4.  **Restore Dependencies:**
    ```bash
    dotnet restore
    ```
5.  **Apply Entity Framework Migrations:**
    This will create the database schema based on the existing migrations (like [`20250520203747_RowVersionForConcurrency`](project/Backend/Migrations/20250520203747_RowVersionForConcurrency.cs)).
    ```bash
    dotnet ef database update
    ```
    (You might need to install `dotnet-ef` as a global or local tool if you haven't already: `dotnet tool install --global dotnet-ef`)

### Frontend Setup

1.  **Navigate to the Frontend directory:**
    ```bash
    cd "../frontend" 
    ```
    (Assuming you are in the `Backend` directory, otherwise adjust the path from the project root: `cd "frontend"`)
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API Endpoint:**
    *   The frontend services (e.g., [`FamilleService`](project/frontend/src/app/features/familles/services/famille.service.ts), [`UniteService`](project/frontend/src/app/features/unites/services/unite.service.ts)) use `http://localhost:5297/api` as the base URL. Ensure this matches your backend's running port. If your backend runs on a different port, update the `apiUrl` properties in the respective service files.

## Running the Application

### Backend

1.  **Navigate to the Backend directory:**
    ```bash
    cd "Backend"
    ```
2.  **Run the application:**
    ```bash
    dotnet run
    ```
    By default, the backend will likely be accessible at `http://localhost:5297` (as seen in [`Backend.http`](project/Backend/Backend.http) and frontend service configurations).

### Frontend

1.  **Navigate to the Frontend directory:**
    ```bash
    cd "../frontend" 
    ```
    (Or `cd "frontend"` from the project root)
2.  **Start the development server:**
    ```bash
    ng serve
    ```
3.  Open your browser and navigate to `http://localhost:4200/` (default Angular development server address).

## Key Features Implemented

*   **CRUD Operations:** For Clients, Articles, Familles, Unités, Livraisons.
*   **Authentication & Authorization:** JWT-based authentication with role checks for API endpoints.
*   **Dashboard:** Visual overview of key metrics including:
    *   Total deliveries and revenue for the current month.
    *   Total number of clients.
    *   Charts for deliveries over time and stock distribution by family.
    *   Lists of top clients and low-stock articles.
    *   Recent audit logs.
*   **Delivery Management:**
    *   Creation of deliveries with multiple detail lines.
    *   Automatic calculation of HT/TTC totals.
    *   Stock deduction upon delivery creation.
    *   Concurrency control using `RowVersion`.
*   **Article Management:** Includes stock tracking, association with families and units.
*   **Audit Logging:** Tracks user actions within the system.
*   **Responsive UI:** Some components show considerations for responsiveness (e.g., dashboard, tables).

## Further Development / Notes

*   The frontend `README.md` ([`frontend/README.md`](project/frontend/README.md)) provides more specific Angular CLI commands for building, testing, etc.
*   The project includes Entity Framework migrations for database schema management.
*   Error handling is present in both backend services and frontend components.

