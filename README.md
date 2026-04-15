# 🎓 Learning Management System (LMS)

## 📌 Overview

This project is a **full-featured Learning Management System (LMS)** built to simulate a real-world education platform.
It provides role-based access control, authentication, and complete CRUD functionality for managing users, students, and courses.

The system is designed with scalability and maintainability in mind, following modern frontend architecture practices.

---

## 🛠 Tech Stack

* Vue 3 (Composition API)
* Vite
* Pinia (State Management)
* Vue Router
* Axios (API handling)
* RESTful API (mock / backend integration)

---

## 🔐 Core Features

### 🔑 Authentication & Authorization

* Login / Logout functionality
* Token-based authentication
* Role-based access control (Admin / User)

### 👥 User & Role Management

* Manage users with different roles
* Permission-based UI rendering
* Protected routes

### 📚 Course Management

* Create / Read / Update / Delete courses
* Assign students to courses
* Dynamic data handling

### 👨‍🎓 Student Management

* Add / edit / delete students
* Search and filter functionality

### 📊 Dashboard

* Overview statistics
* Data visualization (optional if you have)

---

## ⚙️ System Architecture

* Modular folder structure
* Separation of concerns (views, services, store)
* Reusable components

---

## 📁 Project Structure

```bash
src/
 ├── assets/
 ├── components/
 ├── views/
 │    ├── Login.vue
 │    ├── Dashboard.vue
 │    ├── Students.vue
 │    ├── Courses.vue
 │
 ├── router/
 │    └── index.js
 │
 ├── store/
 │    ├── auth.js
 │    ├── user.js
 │
 ├── services/
 │    └── api.js
```

---

## ⚡ Setup & Run

```bash
npm install
npm run dev
```

---

## 🎯 Key Highlights

* Built with scalable architecture similar to real-world applications
* Implements authentication and role-based authorization
* Uses centralized state management (Pinia)
* Clean and maintainable code structure

---

## 💡 Future Improvements

* Pagination & advanced filtering
* Unit testing
* Backend integration (Node.js / MongoDB)
* Deployment optimization

---

## 👨‍💻 Author

Phuong Dang
Frontend Developer
