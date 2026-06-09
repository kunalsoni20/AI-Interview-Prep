# AI Interview Prep Platform

A full-stack AI-powered interview preparation platform built with the MERN stack (MongoDB, Express, React, Node.js) and OpenAI integration.

## Features

- 🔐 User Authentication (Register/Login with JWT)
- 🤖 AI-powered question generation based on job title and difficulty
- 💬 Real-time AI feedback on your answers
- 📊 Interview history and performance tracking
- 🎨 Beautiful, modern UI
- 📱 Responsive design

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- OpenAI API integration

### Frontend
- React 18
- React Router
- Vite
- Axios

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd "c:\Users\ss509\OneDrive\Desktop\New folder"
   ```

2. **Set up environment variables:**
   - Navigate to `backend/.env` and update the values:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/ai-interview-prep
     JWT_SECRET=your_jwt_secret_key_here
     OPENAI_API_KEY=your_openai_api_key_here
     ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start MongoDB:**
   - Make sure MongoDB is running locally on port 27017
   - Or use MongoDB Atlas and update the MONGO_URI

6. **Start the backend server:**
   ```bash
   cd ../backend
   npm run dev
   ```

7. **Start the frontend (in a new terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open your browser:**
   - Navigate to `http://localhost:3000`
   - Register an account and start practicing!

## Usage

1. **Register/Login** to your account
2. **Start a new interview** by entering a job title and difficulty level
3. **Answer questions** one by one - the AI will provide instant feedback
4. **Complete the interview** to see your overall score
5. **View your history** to review past interviews and track improvement

## Project Structure

```
New folder/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Interview.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── interviews.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Interview.jsx
    │   │   └── History.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Interviews
- `POST /api/interviews/generate` - Generate new interview questions
- `POST /api/interviews/answer/:id` - Submit answer and get feedback
- `POST /api/interviews/complete/:id` - Complete interview
- `GET /api/interviews` - Get user's interview history
- `GET /api/interviews/:id` - Get specific interview

## License

MIT
