import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import MenuIcon from '@material-ui/icons/Menu';
import WifiIcon from '@material-ui/icons/Wifi';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import LocalDrink from '@material-ui/icons/LocalDrink';
import Assignment from '@material-ui/icons/Assignment';
import Bookmark from '@material-ui/icons/Bookmark';
import ContactSupport from '@material-ui/icons/ContactSupport';

import IntText from '../components/IntText';
import { useLayout } from '../context/LayoutContext';

const styles = theme => ({
  root: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#0f111a',
  },
  appBar: {
    backgroundColor: '#13152a',
    boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
    borderBottom: '1px solid rgba(124,58,237,0.15)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: 32,
    marginRight: theme.spacing.unit * 2,
  },
  tabs: {
    marginLeft: theme.spacing.unit * 2,
  },
  tab: {
    minWidth: 64,
    fontSize: '0.75rem',
    textTransform: 'none',
    fontWeight: 500,
    opacity: 0.7,
    color: '#c4c8d4',
    '&.Mui-selected': {
      opacity: 1,
      color: '#a78bfa',
      fontWeight: 700,
    },
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.unit,
  },
  layoutToggleBtn: {
    color: '#a78bfa',
    borderColor: 'rgba(167,139,250,0.4)',
    fontSize: '0.7rem',
    textTransform: 'none',
    padding: '2px 10px',
    marginLeft: theme.spacing.unit,
    minWidth: 'auto',
    borderRadius: 20,
    '&:hover': {
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(124,58,237,0.15)',
    },
  },
  content: {
    padding: theme.spacing.unit * 3,
    maxWidth: 1200,
    margin: '0 auto',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing.unit * 1.5,
    },
  },
  mobileMenuBtn: {
    color: '#ffffff',
  },
  mobileLogo: {
    height: 28,
  },
});

const tabRoutes = [
  { path: '/brew', label: 'Brew.Title', icon: LocalDrink },
  { path: '/brew-configuration', label: 'BrewSettings.Settings', icon: Assignment },
  { path: '/recipes', label: 'Recipe.Title', icon: Bookmark },
  { path: '/wifi-configuration', label: 'WiFiSettings.Settings', icon: WifiIcon },
  { path: '/ntp-configuration', label: 'NTPSettings.Settings', icon: AccessTimeIcon },
];

function ModernMenuAppBar({ classes, children, location }) {
  const { toggleLayout } = useLayout();
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);

  const currentTab = tabRoutes.findIndex(
    r => location.pathname === r.path || location.pathname.startsWith(r.path + '/')
  );

  const tabValue = currentTab >= 0 ? currentTab : 0;

  const handleTabChange = (e, value) => {};

  const extraRoutes = [
    { path: '/ap-configuration', label: 'APSettings.Settings', icon: SettingsInputAntennaIcon },
    { path: '/ota-configuration', label: 'OTASettings.Settings', icon: SystemUpdateIcon },
    { path: '/about', label: 'About', icon: ContactSupport },
  ];

  const handleMobileMenuOpen = (e) => setMobileMenuAnchor(e.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);

  const renderNavLink = (route) => (
    <Tab
      key={route.path}
      component={Link}
      to={route.path}
      label={<IntText text={route.label} />}
      className={classes.tab}
    />
  );

  return (
    <div className={classes.root}>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.toolbarLeft}>
            <Hidden mdUp>
              <IconButton className={classes.mobileMenuBtn} onClick={handleMobileMenuOpen}>
                <MenuIcon />
              </IconButton>
            </Hidden>
            <img src="/app/logo.png" alt="BrewUNO" className={classes.logo} />
            <Hidden smDown>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                className={classes.tabs}
                indicatorColor="primary"
                TabIndicatorProps={{ style: { backgroundColor: '#7c3aed', height: 3 } }}
              >
                {tabRoutes.map(renderNavLink)}
                {extraRoutes.map(renderNavLink)}
              </Tabs>
            </Hidden>
          </div>
          <div className={classes.toolbarRight}>
            <Button
              variant="outlined"
              size="small"
              className={classes.layoutToggleBtn}
              onClick={toggleLayout}
            >
              <IntText text="Layout.Classic" />
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
      >
        {[...tabRoutes, ...extraRoutes].map(route => (
          <MenuItem
            key={route.path}
            component={Link}
            to={route.path}
            onClick={handleMobileMenuClose}
          >
            <route.icon style={{ marginRight: 8, fontSize: 20 }} />
            <IntText text={route.label} />
          </MenuItem>
        ))}
        <MenuItem onClick={() => { toggleLayout(); handleMobileMenuClose(); }}>
          <IntText text="Layout.Classic" />
        </MenuItem>
      </Menu>
      <main className={classes.content}>
        {children}
      </main>
    </div>
  );
}

ModernMenuAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ModernMenuAppBar));
