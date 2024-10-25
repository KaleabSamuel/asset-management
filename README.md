# **Asset Management System**

## **Overview**

This project is an **Asset Management System** built using **Node.js, Express, Mongoose, and MongoDB**. The system supports:

- **User authentication** with JWT (access and refresh tokens).
- **Role-based access** for employees and storekeepers.
- **CRUD operations** for items.
- **Assignment, re-assignment, and return** of items.
- **User notifications** for key events.
- **Logging and monitoring** of API requests and actions.

---

## **Features**

1. **Authentication & Authorization:**

   - JWT-based authentication.
   - Role-based access control (employee/storekeeper).

2. **Item Management:**

   - CRUD operations for items.
   - Assign, reassign, and return items.
   - Request items.

3. **User Management:**

   - Register, login, logout, refresh tokens.
   - Update profile and notification settings.

4. **Logging and Monitoring:**
   - Logs all HTTP requests using Winston.

---

## **Project Structure**

```
|-- config/
|   |-- database.js           # Database connection configuration
|   |-- logger.js             # Logger configuration using Winston
|
|-- controllers/
|   |-- itemController.js     # Item management logic
|   |-- userController.js     # User management and authentication logic
|
|-- logs/
|   |-- app.log               # Where all logs are
|
|-- middleware/
|   |-- authMiddleware.js     # Authentication and authorization middleware
|
|-- models/
|   |-- itemModel.js          # Mongoose schema for items
|   |-- userModel.js          # Mongoose schema for users
|
|-- routes/
|   |-- itemRoutes.js         # Routes for item management
|   |-- userRoutes.js         # Routes for user management
|
|-- utils/
|   |-- jwtUtils.js           # JWT token generation utilities
|
|-- .env                      # Environment variables configuration
|-- server.js                 # Main entry point of the application
|-- package.json              # Dependencies and scripts
```

---

## **Installation**

### Prerequisites

- **Node.js** (version 14+)
- **MongoDB** (local or cloud-based instance)
- **Postman** (for API testing)

### Steps

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd asset-management
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root with the following variables:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/asset-db
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   ```

4. **Run the Server:**

   ```bash
   npm run start
   ```

5. **Access the API:**
   Open your browser or Postman and access:
   ```
   http://localhost:5000
   ```

---

## **API Endpoints**

### **Authentication & Users**

- **POST /users/register:** Register a new user.
- **POST /users/login:** Login and receive tokens.
- **POST /users/logout:** Logout the user.
- **POST /users/refresh-token:** Refresh access token.
- **GET /users/profile:** Get the logged-in user’s profile.

### **Items**

- **GET /items:** Get all items.
- **GET /items/:id:** Get item by Id.
- **GET /items/search** Search items by Name or Category.
- **POST /items:** Create a new item (Storekeeper only).
- **PUT /items/:id:** Update an item (Storekeeper only).
- **DELETE /items/:id:** Delete an item (Storekeeper only).
- **POST /items/assign/:itemId:** Assign an item to a user (Storekeeper only).
- **PUT /items/return/:itemId:** Return an assigned item (Storekeeper only).
- **PUT /items/reassign/:itemId:** Reassign an item to another user (Storekeeper only).
- **GET /items/assigned:** View items assigned to the logged-in user.

---

## **Usage Instructions**

1. **Register a User:**

   - Use the `/users/register` endpoint to create a user (e.g., storekeeper or employee).

2. **Login and Get Tokens:**

   - Use `/users/login` to log in and receive an access token and refresh token.

3. **Access Protected Routes:**

   - Include the access token in the **Authorization** header for all protected routes:
     ```
     Authorization: Bearer <access_token>
     ```

4. **Test Item Assignment and Reassignment:**
   - Assign an item to a user using `/items/assign/:itemId`.
   - Reassign or return items using `/items/reassign/:itemId` or `/items/return/:itemId`.

---

## **Logging and Monitoring**

- **Winston Logger**: Logs all HTTP requests and errors to the console and log files.
- **Configuration**: Modify the logger settings in `config/logger.js`.

---

## **Technologies Used**

- **Node.js**: Server-side JavaScript runtime.
- **Express.js**: Web framework for Node.js.
- **Mongoose**: ODM for MongoDB.
- **JWT**: Authentication tokens.
- **Winston**: Logging.

---

## **Contributing**

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a pull request.

---

## **Contact**

For any inquiries, please contact the project maintainer:

- **Name**: Kaleab Samuel
- **Email**: kaleabsamuel55@gmail.com
