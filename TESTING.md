# 🧪 API Testing Guide - Silver Oak University College Management System

This guide lists all API endpoints for the Silver Oak University College Management System, grouped by user role and operation. Only URLs and HTTP methods are shown.

---

## 🔐 Phase 1: Authentication & Setup

- **POST** `{{baseUrl}}/auth/login` (Admin login)

---

## 👥 Phase 2: User Management (Admin Operations)

- **POST** `{{baseUrl}}/admin/users` (Create Faculty User)
- **POST** `{{baseUrl}}/admin/users` (Create Student User)
- **GET** `{{baseUrl}}/admin/users?role=student&page=1&limit=10` (Get All Users)
- **GET** `{{baseUrl}}/admin/statistics` (Get Admin Statistics)

---

## 🎓 Phase 3: Faculty Operations

- **POST** `{{baseUrl}}/auth/login` (Faculty login)
- **GET** `{{baseUrl}}/faculty/profile` (Get Faculty Profile)
- **POST** `{{baseUrl}}/faculty/subjects` (Create Subject)
- **GET** `{{baseUrl}}/faculty/subjects?academicYear=2024-25` (Get Faculty Subjects)
- **POST** `{{baseUrl}}/faculty/subjects/[SUBJECT_ID]/enroll` (Enroll Student in Subject)
- **GET** `{{baseUrl}}/faculty/subjects/[SUBJECT_ID]/students` (Get Enrolled Students)
- **POST** `{{baseUrl}}/faculty/assignments` (Create Assignment)
- **GET** `{{baseUrl}}/faculty/assignments` (Get Faculty Assignments)
- **POST** `{{baseUrl}}/faculty/attendance` (Mark Attendance)
- **POST** `{{baseUrl}}/faculty/grades` (Add Student Grade)
- **POST** `{{baseUrl}}/faculty/announcements` (Post Faculty Announcement)

---

## 🎓 Phase 4: Student Operations

- **POST** `{{baseUrl}}/auth/login` (Student login)
- **GET** `{{baseUrl}}/student/profile` (Get Student Profile)
- **GET** `{{baseUrl}}/student/assignments` (Get Student Assignments)
- **POST** `{{baseUrl}}/student/assignments/submit` (Submit Assignment)
- **GET** `{{baseUrl}}/student/grades` (Get Student Grades)
- **GET** `{{baseUrl}}/student/attendance?semester=1&year=1` (Get Student Attendance)
- **POST** `{{baseUrl}}/student/complaints` (Submit Complaint)
- **GET** `{{baseUrl}}/student/complaints` (Get Student Complaints)
- **GET** `{{baseUrl}}/student/announcements` (Get Student Announcements)
- **GET** `{{baseUrl}}/student/timetable` (Get Timetable)
- **GET** `{{baseUrl}}/student/exams` (Get Exam Schedule)

---

## 🔧 Phase 5: Admin Management Operations

- **GET** `{{baseUrl}}/admin/complaints?status=submitted&page=1&limit=10` (Get All Complaints)
- **PUT** `{{baseUrl}}/admin/complaints/[COMPLAINT_ID]` (Update Complaint Status)
- **POST** `{{baseUrl}}/admin/announcements` (Post Admin Announcement)
- **GET** `{{baseUrl}}/admin/assignments?status=active&page=1&limit=10` (Get All Assignments)
- **GET** `{{baseUrl}}/admin/grades?page=1&limit=10` (Get All Grades)
- **GET** `{{baseUrl}}/admin/attendance?page=1&limit=10` (Get All Attendance)
- **GET** `{{baseUrl}}/admin/dashboard` (Get Admin Dashboard)

---

## 🔍 Phase 6: Debugging & Verification

- **GET** `{{baseUrl}}/student/debug` (Student Debug Endpoint)

---

## 📊 Performance Testing (Sample Endpoints)

- **GET** `/api/student/assignments`
- **GET** `/api/student/grades`
- **GET** `/api/student/attendance`
- **POST** `/api/faculty/attendance`
- **POST** `/api/faculty/grades`
- **GET** `/api/admin/dashboard`
- **POST** `/api/faculty/subjects`
- **POST** `/api/admin/users`
- **POST** `/api/faculty/assignments`

---

**Note:** Replace `{{baseUrl}}` with your server URL, e.g., `http://localhost:3000`.

**Happy Testing! 🚀**
