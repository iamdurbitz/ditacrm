# DitaCRM

DitaCRM is a full-stack customer relationship management (CRM)
application designed to help small businesses organize customer
information, manage employee access, and keep track of customer
balances.

The project is being developed as a practical, evolving application,
with a focus on backend development, authentication, role-based access
control, and business-level data isolation.

> **Project status:** In active development. Features and setup
> instructions may change as the project evolves.

## Current Features

### Authentication and access control

-   Business registration with an initial `OWNER` account.
-   User login with password hashing using `bcrypt`.
-   JSON Web Token (JWT) authentication.
-   Role-based authorization for owner-only operations.
-   Employee account creation by business owners.

### Customer management

-   Create, view, update, and delete customer records.
-   Search customers by name, phone number, address, and notes.
-   Pagination and configurable page sizes.
-   Sorting by creation date and customer name.
-   Track total amount, amount paid, and remaining balance.
-   Business-level data filtering so users access records associated
    with their own business.

### API and security foundations

-   REST API built with Express.
-   PostgreSQL access through `pg`.
-   Environment-based configuration with `dotenv`.
-   Basic security headers with `helmet`.
-   CORS configuration and centralized error handling.

## Tech Stack

**Frontend** - React - React Router - Vite - JavaScript

**Backend** - Node.js - Express 5 - JavaScript (ES modules) - JSON Web
Token (`jsonwebtoken`) - `bcrypt`

**Database and tools** - PostgreSQL - `pg` - Git and GitHub - Postman

## Repository Structure

``` text
ditacrm/
├── backend/
│   ├── auth/
│   ├── customers/
│   ├── database/
│   ├── employees/
│   ├── middleware/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── ...
    └── package.json
```

## Getting Started

### Prerequisites

-   Node.js and npm
-   PostgreSQL
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/iamdurbitz/ditacrm.git
cd ditacrm
```

### 2. Configure the backend

``` bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory using `.env.example` as
a reference:

``` env
PORT=8000
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
JWT_SECRET=replace_with_a_long_random_secret
```

Set the values for your local PostgreSQL database. Keep `.env` private
and never commit secrets to the repository.

> **Database setup:** The backend expects the PostgreSQL tables used by
> the application (including `businesses`, `users`, and `customers`) to
> exist. Database initialization and migration instructions are still
> being prepared.

Start the backend in development mode:

``` bash
npm run dev
```

The API runs on `http://localhost:8000` by default.

### 3. Configure the frontend

Open a second terminal:

``` bash
cd frontend
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

## API Overview

The backend currently exposes the following routes:

  ----------------------------------------------------------------------------
  Method            Endpoint               Description       Access
  ----------------- ---------------------- ----------------- -----------------
  `GET`             `/`                    API welcome       Public
                                           response          

  `GET`             `/api/health`          Checks API and    Public
                                           database          
                                           connectivity      

  `POST`            `/api/auth/register`   Registers a       Public
                                           business and its  
                                           owner account     

  `POST`            `/api/auth/login`      Authenticates a   Public
                                           user and returns  
                                           a JWT             

  `GET`             `/api/customers`       Lists customers   Authenticated
                                           with search,      
                                           pagination, and   
                                           sorting           

  `GET`             `/api/customers/:id`   Gets a customer   Authenticated
                                           by ID             

  `POST`            `/api/customers`       Creates a         Authenticated
                                           customer          

  `PUT`             `/api/customers/:id`   Updates a         Authenticated
                                           customer          

  `DELETE`          `/api/customers/:id`   Deletes a         Authenticated
                                           customer          

  `GET`             `/api/employees`       Lists employees   Owner
                                           in the owner's    
                                           business          

  `POST`            `/api/employees`       Creates an        Owner
                                           employee account  

  `GET`             `/api/protected`       Example           Authenticated
                                           authenticated     
                                           endpoint          

  `GET`             `/api/owner`           Example           Owner
                                           owner-only        
                                           endpoint          
  ----------------------------------------------------------------------------

For protected endpoints, send the JWT in the request header:

``` http
Authorization: Bearer YOUR_JWT
```

Customer listing supports query parameters such as `page`, `limit`,
`search`, and `sortBy`.

## Development Goals

Planned areas of development include:

-   Expanding customer and employee workflows.
-   Improving dashboard functionality and user experience.
-   Extending business management and role permissions.
-   Adding further CRM modules, such as products and stock management.
-   Improving automated tests, database migrations, and deployment
    workflows.

The roadmap is subject to change as development progresses.

## Notes

DitaCRM is a personal software development project and is not presented
as a production-ready commercial service. Do not use real customer data
or production credentials when testing the application.

## Author

**Tarık Aytek**

-   GitHub: [@iamdurbitz](https://github.com/iamdurbitz)
-   LinkedIn: [Tarık Aytek](https://www.linkedin.com/in/tar%C4%B1k-aytek-408102370/)
