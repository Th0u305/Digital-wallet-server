# Digital Wallet API

A secure, modular, and role-based backend API for a digital wallet system, built with Node.js, Express.js, and Mongoose. This project provides a robust foundation for financial operations like deposits, withdrawals, and peer-to-peer transfers.

---

## 🎯 Project Overview

This API emulates the core functionality of popular digital wallet services (like Bkash or Nagad). It features a secure authentication system, role-based access control for **Admins**, **Users**, and **Agents**, and atomic transactional logic to ensure data integrity for all financial operations.

---

## ✨ Key Features

-   **JWT-Based Authentication**: Secure login system for all roles using JSON Web Tokens.
-   **Role-Based Access Control (RBAC)**: Three distinct roles (Admin, User, Agent) with specific permissions and protected routes.
-   **Secure Password Management**: Passwords are securely hashed using `bcrypt`.
-   **Automatic Wallet Creation**: Users and Agents automatically get a wallet with an initial balance upon registration.
-   **Transactional Logic**: Core financial operations (add, withdraw, send money) are handled using MongoDB transactions to ensure atomicity and data consistency.
-e   **Modular Architecture**: The codebase is organized into modules for scalability and easy maintenance.
-   **Request Validation**: Incoming request data is validated using Zod to prevent invalid data from reaching the business logic.

---

## 🛠️ Technology Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JSON Web Tokens (JWT)
-   **Password Hashing**: Bcrypt
-   **Validation**: Zod
-   **Development**: TypeScript, ESLint, Prettier

---

## 🚀 API Endpoints

### Authentication (`/api/v1/auth`)

| Method | Endpoint         | Description                    | Access |
| :----- | :--------------- | :----------------------------- | :----- |
| `POST` | `/register`      | Register a new User or Agent.  | Public |
| `POST` | `/login`         | Log in to get an access token. | Public |

### User Endpoints (`/api/v1/users`)

| Method | Endpoint            | Description                               | Access |
| :----- | :------------------ | :---------------------------------------- | :----- |
| `POST` | `/add-money`        | Deposit money into one's own wallet.      | User   |
| `POST` | `/send-money`       | Send money to another User.               | User   |
| `GET`  | `/transactions`     | Get personal transaction history.         | User   |
| `GET`  | `/me`               | Get the profile of the logged-in user.    | User   |

### Agent Endpoints (`/api/v1/agents`)

| Method | Endpoint            | Description                               | Access |
| :----- | :------------------ | :---------------------------------------- | :----- |
| `POST` | `/cash-in`          | Add money to a User's wallet.             | Agent  |
| `POST` | `/cash-out`         | Withdraw money from a User's wallet.      | Agent  |
| `GET`  | `/transactions`     | Get personal transaction history.         | Agent  |
| `GET`  | `/me`               | Get the profile of the logged-in agent.   | Agent  |

### Admin Endpoints (`/api/v1/admin`)

| Method | Endpoint                  | Description                                | Access |
| :----- | :------------------------ | :----------------------------------------- | :----- |
| `GET`  | `/users`                  | Get a list of all users.                   | Admin  |
| `GET`  | `/agents`                 | Get a list of all agents.                  | Admin  |
| `GET`  | `/transactions`           | Get a list of all transactions.            | Admin  |
| `PATCH`| `/wallets/block/:id`      | Block a specific user or agent wallet.     | Admin  |
| `PATCH`| `/wallets/unblock/:id`    | Unblock a specific user or agent wallet.   | Admin  |
| `PATCH`| `/agents/approve/:id`     | Approve a pending agent registration.      | Admin  |

---

## ⚙️ Setup and Installation

Follow these steps to get the project running on your local machine.

### **1. Prerequisites**

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [MongoDB](https://www.mongodb.com/try/download/community) (must be running as a replica set for transactions)
-   A code editor like [VS Code](https://code.visualstudio.com/)

### **2. Clone the Repository**

```bash
git clone [https://github.com/your-username/digital-wallet-api.git](https://github.com/your-username/digital-wallet-api.git)
cd digital-wallet-api

3. Install Dependencies
npm install

4. Set Up Environment Variables
Create a .env file in the root of the project and add the following variables.

5. Run the Application
Start the server in development mode. The server will automatically restart when you make changes.

npm run dev

The API server should now be running at http://localhost:5000.

🗂️ Folder Structure
The project uses a modular architecture to separate concerns and improve maintainability.

src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── agent/
│   │   ├── wallet/
│   │   ├── transaction/
│   │   └── ...
│   └── routes/
├── config/
├── errors/
├── middlewares/
├── server.ts
└── app.ts
