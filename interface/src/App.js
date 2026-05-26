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
    type: 'light',
    primary: {
      main: '#1a1a2e',
      light: '#16213e',
      dark: '#0f3460',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#ffe0b2',
      main: '#ffa726',
      dark: '#ff9800',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
  },
  typography: {
    useNextVariants: true,
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    subtitle1: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  overrides: {
    MuiPaper: {
      root: {
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      },
      rounded: {
        borderRadius: 12,
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
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
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
        borderRadius: 16,
      },
    },
    MuiSlider: {
      track: { backgroundColor: '#ffa726' },
      thumb: { backgroundColor: '#ffa726' },
    },
    MuiSwitch: {
      switchBase: {
        '&.Mui-checked': {
          color: '#ffa726',
        },
      },
      colorPrimary: {
        '&.Mui-checked + .MuiSwitch-track': {
          backgroundColor: '#ffa726',
        },
      },
    },
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#1a1a2e',
      },
    },
    MuiTableCell: {
      head: {
        fontWeight: 700,
        color: '#7f8c8d',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
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
  success: { backgroundColor: '#2ecc71' },
  error: { backgroundColor: '#e74c3c' },
  warning: { backgroundColor: '#ffa726' },
  info: { backgroundColor: '#3498db' },
};

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modernLayout: false,
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
