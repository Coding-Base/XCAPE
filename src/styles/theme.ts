import { createTheme, ThemeProvider } from '@mui/material/styles'

const colors = {
  primary: '#0F4C81',
  secondary: '#1F7A8C',
  accent: '#F4B400',
  background: '#F7F9FC',
  cardSurface: '#FFFFFF',
  text: '#1F2937',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
}

export const lightTheme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: '#1F7A8C',
    },
    secondary: {
      main: colors.secondary,
      light: '#F4B400',
    },
    background: {
      default: colors.background,
      paper: colors.cardSurface,
    },
    text: {
      primary: colors.text,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: '#1F7A8C',
      contrastText: '#fff',
    },
    secondary: {
      main: colors.secondary,
      light: '#F4B400',
      contrastText: '#fff',
    },
    background: {
      default: '#1a1a2e',
      paper: '#16213e',
    },
    text: {
      primary: '#ecf0f1',
      secondary: '#bdbdbd',
    },
    divider: '#404854',
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#ecf0f1',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#ecf0f1',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#ecf0f1',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#ecf0f1',
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#ecf0f1',
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#ecf0f1',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#ecf0f1',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#bdbdbd',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          backgroundColor: '#16213e',
          color: '#ecf0f1',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        outlined: {
          borderColor: '#404854',
          '&:hover': {
            borderColor: '#5a6b7f',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#ecf0f1',
            '& fieldset': {
              borderColor: '#404854',
            },
            '&:hover fieldset': {
              borderColor: '#5a6b7f',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0F4C81',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#7a8fa5',
            opacity: 0.7,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#bdbdbd',
          '&.Mui-focused': {
            color: '#0F4C81',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#ecf0f1',
          '& fieldset': {
            borderColor: '#404854',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#16213e',
          color: '#ecf0f1',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#16213e',
          color: '#ecf0f1',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#404854',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a2444',
          color: '#ecf0f1',
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            color: '#ecf0f1',
            borderColor: '#404854',
          },
        },
      },
    },
  },
})

export { ThemeProvider }
