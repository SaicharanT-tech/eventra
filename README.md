# Institutional Event Resource Management System

This is a complete full-stack web application designed to manage institutional events with multi-level approvals, and conflict-free allocation of venues and resources.

## Features
- **Role-Based Access Control**: Separate dashboards for Event Coordinator, HOD, Dean, Institutional Head, and Admin/ITC.
- **Hierarchical Approvals**: Event Coordinators request events. Approvals flow from HOD -> Dean -> Institutional Head.
- **Conflict Management**: Prevents double-booking of venues and handles physical resource allocation.
- **Dynamic Status Updates**: Event statuses change automatically, releasing resources when an event is 'Completed'.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, plain CSS (clean blue/white institutional theme).
- **Backend**: Node.js, Express, JWT Authentication, Mongoose.
- **Database**: MongoDB.

## Prerequisites
- Node.js installed (v16+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or modify `server/.env` to point to your cloud URI)

## Installation & Setup Instructions

### 1. Backend Setup
Open a terminal and run the following:
```bash
cd server
npm install
node seed.js    # Populates test users, venues, and resources in the database
npm start       # or `npm run dev` to start the server with nodemon
```
*The backend runs on `http://localhost:5000`*

### 2. Frontend Setup
Open a secondary terminal and run:
```bash
cd client
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173` (or another port output by Vite).*

## Sample Test Users (Password for all is `password123`)
Demo buttons are provided on the Login page to quickly auto-fill these accounts:
- **Coordinator**: `coordinator@inst.edu`
- **HOD**: `hod@inst.edu`
- **Dean**: `dean@inst.edu`
- **Institutional Head**: `head@inst.edu`
- **Admin**: `admin@inst.edu`
