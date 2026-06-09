import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="logo">AI Interview Prep</div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/history">History</Link>
          <span>Hi, {user?.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
