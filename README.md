# Full-Stack Image Gallery

This is a premium, full-stack image gallery built using the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

- **Dynamic Gallery**: Masonry grid layout with lazy loading.
- **Lightbox Preview**: Full-screen image preview with zoom and download capabilities.
- **Search System**: Search images by keywords, tags, or events.
- **Authentication**: JWT-based login for clients and admins.
- **Admin Dashboard**: Manage your gallery, upload images with Sharp thumbnail generation.
- **Premium Design**: Modern, responsive UI inspired by Framer and Linear.

## Project Structure

- `/frontend`: React + Vite + Tailwind CSS frontend application.
- `/backend`: Node.js + Express backend providing RESTful APIs.

## Prerequisites

- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI.

## Installation & Setup

1. **Clone & Install Dependencies**
   Navigate to the respective folders and install dependencies:
   ```bash
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

2. **Configure Environment Variables**
   The `/backend/.env` file is pre-configured for local testing:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/image-gallery
   JWT_SECRET=supersecret12345
   NODE_ENV=development
   ```

3. **Seed the Database**
   To easily get started, seed the database with an initial admin user:
   ```bash
   cd backend
   node seeder.js
   ```
   *Admin Credentials:*
   - Email: `admin@example.com`
   - Password: `password123`

4. **Start the Application**
   You can run the backend and frontend simultaneously in separate terminals:
   
   *Terminal 1 (Backend):*
   ```bash
   cd backend
   npm start
   ```

   *Terminal 2 (Frontend):*
   ```bash
   cd frontend
   npm run dev
   ```

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS 3, Axios, React Router, Lucide React, React Dropzone, Yet Another React Lightbox
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, BcryptJS, Multer, Sharp
# ftp_project
