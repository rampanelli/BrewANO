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
      main: '#8b5cf6',
      light: '#b794f4',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#fb923c',
      main: '#f97316',
      dark: '#ea580c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0a14',
      paper: '#14142a',
    },
    text: {
      primary: '#f0f0f8',
      secondary: '#7878a0',
    },
  },
  typography: {
    useNextVariants: true,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      color: '#ffffff',
    },
    subtitle1: {
      fontWeight: 600,
      color: '#d0d0e0',
    },
  },
  shape: {
    borderRadius: 10,
  },
  overrides: {
    MuiPaper: {
      root: {
        backgroundColor: '#14142a',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      },
      rounded: {
        borderRadius: 12,
      },
    },
    MuiButton: {
      root: {
        borderRadius: 10,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.8rem',
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
        },
      },
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        backgroundColor: '#14142a',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        border: '1px solid rgba(139,92,246,0.06)',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(139,92,246,0.12)',
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
        backgroundColor: '#14142a',
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: 'transparent',
        boxShadow: 'none',
      },
    },
    MuiSlider: {
      track: { backgroundColor: '#8b5cf6' },
      thumb: { backgroundColor: '#b794f4' },
    },
    MuiSwitch: {
      switchBase: {
        color: '#a0a0b8',
        '&.Mui-checked': {
          color: '#8b5cf6',
        },
      },
      colorPrimary: {
        '&.Mui-checked + .MuiSwitch-track': {
          backgroundColor: '#b794f4',
        },
      },
    },
    MuiTableCell: {
      head: {
        fontWeight: 700,
        color: '#a0a0b8',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: 'rgba(139,92,246,0.1)',
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        color: '#a0a0b8',
        '&.Mui-selected': {
          color: '#ffffff',
        },
      },
    },
    MuiIconButton: {
      root: {
        color: '#d0d0e0',
        '&:hover': {
          backgroundColor: 'rgba(139,92,246,0.12)',
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
    try {
      ExecuteRestCall(BREW_SETTINGS_ENDPOINT, 'GET', json => {
        if (json && json.language) {
          this.child.current.SetText(json.language)
        }
      });
    } catch (e) {}
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
