import React from 'react';
import { Navigate } from 'react-router-dom';

export function CitizenRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'official') return <Navigate to="/dashboard" />;
  
  return children;
}

export function OfficialRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'citizen') return <Navigate to="/map" />;
  
  return children;
}

export function AuthRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) return <Navigate to="/login" />;
  
  return children;
}