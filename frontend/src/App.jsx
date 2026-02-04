import { useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import Registration from './components/Registration'
import UserDashboard from './components/UserDashboard'
import Consultation from './components/Consultation'
import PreviousConsultations from './components/PreviousConsultations'
import MyAppointments from './components/MyAppointments'
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
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/my-consultations" element={<PreviousConsultations />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/appointment" element={<AppointmentBooking />} />
          <Route path="/test" element={<TestBackend />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
