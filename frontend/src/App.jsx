import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Registration from './components/Registration'
import UserDashboard from './components/UserDashboard'
import AppointmentBooking from './components/AppointmentBooking'
import TestBackend from './components/TestBackend'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/consultation" element={<UserDashboard />} />
          <Route path="/appointment" element={<AppointmentBooking />} />
          <Route path="/test" element={<TestBackend />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
