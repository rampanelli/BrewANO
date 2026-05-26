import React, { Component } from 'react';
import AppRouting from './AppRouting';
import CssBaseline from '@material-ui/core/CssBaseline';
import { SnackbarProvider } from 'notistack';
import JssProvider from 'react-jss/lib/JssProvider';
import { create } from 'jss';
import {
  MuiThemeProvider,
  createMuiTheme,
  createGenerateClassName,
  jssPreset,
} from '@material-ui/core/styles';
import { ExecuteRestCall } from './components/Utils'
import { BREW_SETTINGS_ENDPOINT } from './constants/Endpoints';
import IntText from "./components/IntText"
import { LayoutProvider } from './context/LayoutContext';

const classicTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#313131',
      light: '#616161',
      dark: '#424242',
      contrastText: '#9E9E9E',
    },
    secondary: {
      light: '#616161',
      main: '#5c6bc0',
      contrastText: '#fff',
    },
    overrides: {
      MuiSlider: {
        track: { backgroundColor: 'red' },
        thumb: { backgroundColor: 'red' },
      },
    }
  },
  typography: {
    useNextVariants: true,
  },
});

const modernTheme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#fbbf24',
      main: '#f59e0b',
      dark: '#d97706',
      contrastText: '#1a1c28',
    },
    background: {
      default: '#0f111a',
      paper: '#1a1c28',
    },
    text: {
      primary: '#e1e4ed',
      secondary: '#8b8fa3',
    },
  },
  typography: {
    useNextVariants: true,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
  overrides: {
    MuiPaper: {
      root: {
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      },
      rounded: {
        borderRadius: 10,
      },
    },
    MuiButton: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(124,58,237,0.3)',
        },
      },
      containedSecondary: {
        '&:hover': {
          boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
        },
      },
    },
    MuiCard: {
      root: {
        borderRadius: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          transform: 'translateY(-2px)',
          borderColor: 'rgba(124,58,237,0.3)',
        },
      },
    },
    MuiTextField: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      root: {
        borderRadius: 8,
      },
    },
    MuiDialog: {
      paper: {
        borderRadius: 14,
      },
    },
    MuiSlider: {
      track: { backgroundColor: '#7c3aed' },
      thumb: { backgroundColor: '#a78bfa' },
    },
    MuiSwitch: {
      switchBase: {
        '&.Mui-checked': {
          color: '#7c3aed',
        },
      },
      colorPrimary: {
        '&.Mui-checked + .MuiSwitch-track': {
          backgroundColor: '#a78bfa',
        },
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#13152a',
      },
    },
    MuiTableCell: {
      head: {
        fontWeight: 700,
        color: '#8b8fa3',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: 'rgba(255,255,255,0.06)',
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    MuiIconButton: {
      root: {
        '&:hover': {
          backgroundColor: 'rgba(124,58,237,0.12)',
        },
      },
    },
  },
});

const styles = {
  success: { backgroundColor: 'purple' },
  error: { backgroundColor: 'blue' },
  warning: { backgroundColor: 'green' },
  info: { backgroundColor: 'yellow' },
};

const jss = create(jssPreset());
const generateClassName = createGenerateClassName();

const modernStyles = {
  success: { backgroundColor: '#10b981' },
  error: { backgroundColor: '#ef4444' },
  warning: { backgroundColor: '#f59e0b' },
  info: { backgroundColor: '#6366f1' },
};

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modernLayout: true,
    };
    this.child = React.createRef();
    ExecuteRestCall(BREW_SETTINGS_ENDPOINT, 'GET', json => {
      this.child.current.SetText(json.language)
    });
  }

  componentDidMount() {
    try {
      const stored = localStorage.getItem('brewuno_modern_layout');
      if (stored !== null) {
        this.setState({ modernLayout: stored === 'true' });
      }
    } catch (e) {}
    window.addEventListener('storage', this.handleStorageChange);
  }

  componentWillUnmount() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  handleStorageChange = () => {
    try {
      const stored = localStorage.getItem('brewuno_modern_layout');
      if (stored !== null) {
        this.setState({ modernLayout: stored === 'true' });
      }
    } catch (e) {}
  };

  render() {
    const { modernLayout } = this.state;
    const theme = modernLayout ? modernTheme : classicTheme;
    const snackStyles = modernLayout ? modernStyles : styles;

    return (
      <LayoutProvider>
        <JssProvider jss={jss} generateClassName={generateClassName}>
          <MuiThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5} classes={{
              variantSuccess: snackStyles.success,
              variantError: snackStyles.error,
              variantWarning: snackStyles.warning,
              variantInfo: snackStyles.info
            }}>
              <IntText ref={this.child} />
              <CssBaseline />
              <AppRouting />
            </SnackbarProvider>
          </MuiThemeProvider>
        </JssProvider>
      </LayoutProvider>
    )
  }
}

export default App;
