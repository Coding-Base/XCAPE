import React from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Container,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '@hooks/redux'
import { toggleTheme } from '@store/slices/themeSlice'
import { useNavigate } from 'react-router-dom'

interface NavLink {
  label: string
  path: string
}

const navLinks: NavLink[] = [
  { label: 'Home', path: '/' },
  { label: 'Concepts', path: '/concepts' },
  { label: 'User Guide', path: '/guide' },
  { label: 'XCAPE Simulator', path: '/simulator' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export const Navigation: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const themeMode = useAppSelector((state) => state.theme.mode)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setDrawerOpen(false)
  }

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 0, md: 2 } }}>
            {/* Logo */}
            <Box
              component="img"
              src="/Xcape.png"
              alt="XCAPE Logo"
              sx={{ height: 40, cursor: 'pointer' }}
              onClick={() => handleNavigation('/')}
            />

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  color="inherit"
                  onClick={() => handleNavigation(link.path)}
                  sx={{
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            {/* Right Section */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Theme Toggle */}
              <IconButton
                color="inherit"
                onClick={() => dispatch(toggleTheme())}
                title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
              >
                {themeMode === 'light' ? <DarkIcon /> : <LightIcon />}
              </IconButton>

              {/* Profile Menu */}
              <Button
                color="inherit"
                onClick={handleProfileMenuOpen}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                Profiles
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
              >
                <MenuItem onClick={() => handleNavigation('/profiles/team')}>Team</MenuItem>
                <MenuItem onClick={() => handleNavigation('/profiles/contributors')}>
                  Contributors
                </MenuItem>
              </Menu>

              {/* Mobile Menu */}
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ display: { xs: 'flex', md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '250px',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Menu
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List>
          {navLinks.map((link) => (
            <ListItem
              button
              key={link.path}
              onClick={() => handleNavigation(link.path)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(15, 76, 129, 0.1)',
                },
              }}
            >
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
          <ListItem
            button
            onClick={() => handleNavigation('/profiles/team')}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(15, 76, 129, 0.1)',
              },
            }}
          >
            <ListItemText primary="Profiles" />
          </ListItem>
        </List>
      </Drawer>
    </>
  )
}
