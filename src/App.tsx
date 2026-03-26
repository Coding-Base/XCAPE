import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box, Button, IconButton, Menu, MenuItem, Avatar } from '@mui/material'
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, LogoutIcon as LogoutIconMui } from '@mui/icons-material'
import { store } from '@store/store'
import { lightTheme, darkTheme } from '@styles/theme'
import { useAppDispatch, useAppSelector } from '@hooks/redux'
import { toggleTheme } from '@store/slices/themeSlice'

// Import pages
import HomePage from '@pages/HomePage'
import ConceptsPage from '@pages/ConceptsPage'
import UserGuidePage from '@pages/UserGuidePage'
import SimulatorPage from '@pages/SimulatorPage'
import AboutPage from '@pages/AboutPage'
import ProfilesPage from '@pages/ProfilesPage'
import ContactPage from '@pages/ContactPage'
import LoginPage from '@pages/LoginPage'
import RegisterPage from '@pages/RegisterPage'
import UserDashboard from '@pages/UserDashboard'

// Auth
import { AuthProvider, useAuth } from '@context/AuthContext'
import ProtectedRoute from '@components/ProtectedRoute'

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector((state) => state.theme.mode)
  const { isAuthenticated, user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Concepts', path: '/concepts' },
    { label: 'User Guide', path: '/guide' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    await logout()
    handleMenuClose()
    navigate('/')
  }

  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        p: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 2,
      }}
    >
      <Box
        onClick={() => navigate('/')}
        sx={{
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '1.3rem',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          component="img"
          src="/xcapeblackBG.png"
          alt="XCAPE"
          sx={{
            height: 30,
            filter: 'brightness(180%)',
          }}
        />
        XCAPE
      </Box>

      {/* Desktop Navigation */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
        {navLinks.map((link) => (
          <Button
            key={link.path}
            color="inherit"
            onClick={() => navigate(link.path)}
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
              },
            }}
          >
            {link.label}
          </Button>
        ))}
        {isAuthenticated && (
          <Button
            color="inherit"
            onClick={() => navigate('/simulator')}
            sx={{
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 1,
              },
            }}
          >
            Simulator
          </Button>
        )}
      </Box>

      {/* Right side - Auth & Theme */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isAuthenticated ? (
          <>
            <Button
              color="inherit"
              onClick={() => navigate('/dashboard')}
              sx={{
                fontWeight: 500,
                textTransform: 'none',
                display: { xs: 'none', md: 'block' },
              }}
            >
              Dashboard
            </Button>
            <Avatar
              onClick={handleMenuOpen}
              sx={{
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.3)',
                width: 36,
                height: 36,
                fontSize: '0.9rem',
              }}
            >
              {user?.first_name.charAt(0)}{user?.last_name.charAt(0)}
            </Avatar>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>{user?.first_name} {user?.last_name}</MenuItem>
              <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose() }}>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => { navigate('/simulator'); handleMenuClose() }}>
                Simulator
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              sx={{
                fontWeight: 500,
                textTransform: 'none',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'white',
                textTransform: 'none',
                fontWeight: 500,
                display: { xs: 'none', sm: 'block' },
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </Button>
          </>
        )}

        {/* Theme Toggle */}
        <IconButton
          color="inherit"
          onClick={() => dispatch(toggleTheme())}
          title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
        >
          {themeMode === 'light' ? <DarkIcon /> : <LightIcon />}
        </IconButton>
      </Box>
    </Box>
  )
}

const AppContent: React.FC = () => {
  const themeMode = useAppSelector((state) => state.theme.mode)
  const theme = themeMode === 'light' ? lightTheme : darkTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Navigation />
        <Box component="main" sx={{ flex: 1, py: 4 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/concepts" element={<ConceptsPage />} />
            <Route path="/guide" element={<UserGuidePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profiles/:section" element={<ProfilesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route
              path="/simulator"
              element={
                <ProtectedRoute>
                  <SimulatorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </Provider>
  )
}

export default App
