import { createTheme } from '@mui/material/styles';

// 골프 관련 색상 테마 설정
const theme = createTheme({
  palette: {
    primary: {
      light: '#80e27e',
      main: '#4CAF50',
      dark: '#087f23',
      contrastText: '#fff',
    },
    secondary: {
      light: '#63a4ff',
      main: '#1976d2',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    // 골프 코스 관련 색상
    golf: {
      green: '#4CAF50',
      fairway: '#8BC34A',
      rough: '#33691E',
      bunker: '#F9A825',
      water: '#2196F3',
      tee: '#7B1FA2',
    },
    // 스코어 관련 색상
    score: {
      eagle: '#9C27B0',
      birdie: '#E91E63',
      par: '#000000',
      bogey: '#0D47A1',
      doubleBogey: '#1A237E',
      tripleBogeyOrWorse: '#311B92',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
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
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme; 