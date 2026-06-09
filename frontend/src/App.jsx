import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import History from './pages/History'
import Report from './pages/Report'

function App() {
  const { user, loading } = React.useContext(AuthContext)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <div>
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/interview/:id" element={user ? <Interview /> : <Navigate to="/login" />} />
          <Route path="/report/:id" element={user ? <Report /> : <Navigate to="/login" />} />
          <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
