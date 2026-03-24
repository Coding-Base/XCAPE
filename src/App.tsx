import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box, Button, IconButton } from '@mui/material'
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material'
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

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const themeMode = useAppSelector((state) => state.theme.mode)

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Concepts', path: '/concepts' },
    { label: 'User Guide', path: '/guide' },
    { label: 'Simulator', path: '/simulator' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ]

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
      </Box>

      {/* Theme Toggle */}
      <IconButton
        color="inherit"
        onClick={() => dispatch(toggleTheme())}
        title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
      >
        {themeMode === 'light' ? <DarkIcon /> : <LightIcon />}
      </IconButton>
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
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/profiles/:section" element={<ProfilesPage />} />
            <Route path="/contact" element={<ContactPage />} />
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
        <AppContent />
      </Router>
    </Provider>
  )
}

export default App
