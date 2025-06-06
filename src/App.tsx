import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import RegisterPage from './pages/RegisterPage'
import MyBookingsPage from './pages/MyBookingsPage'
import NotFoundPage from './pages/NotFoundPage'
import { AuthProvider } from './contexts/AuthContext'; 
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();

  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mybooking" element={<MyBookingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
            <Box textAlign="center">
        <Typography color='white'>
          © {new Date().getFullYear()} {t('footer.title')}
        </Typography>
      </Box>
    </AuthProvider>
  )
}

export default App
