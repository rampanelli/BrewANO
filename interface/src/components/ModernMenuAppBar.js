import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import WifiIcon from '@material-ui/icons/Wifi';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import LocalDrink from '@material-ui/icons/LocalDrink';
import TuneIcon from '@material-ui/icons/Tune';
import Bookmark from '@material-ui/icons/Bookmark';
import SettingsIcon from '@material-ui/icons/Settings';
import StyleIcon from '@material-ui/icons/Style';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import IntText from './IntText';
import { useLayout } from '../context/LayoutContext';

const styles = theme => ({
  root: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#0a0a14',
    paddingBottom: 56,
  },
  appBar: {
    backgroundColor: 'rgba(12,12,24,0.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: 'none',
    borderBottom: '1px solid rgba(139,92,246,0.08)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingLeft: 16,
    paddingRight: 8,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    height: 24,
  },
  pageTitle: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#ffffff',
    letterSpacing: '0.02em',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
  },
  iconBtn: {
    color: '#a0a0b8',
    padding: 6,
    '&:hover': {
      color: '#ffffff',
      backgroundColor: 'rgba(139,92,246,0.12)',
    },
  },
  content: {
    padding: '12px 8px',
    maxWidth: 900,
    margin: '0 auto',
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(12,12,24,0.92)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(139,92,246,0.08)',
    zIndex: 1100,
  },
  navAction: {
    minWidth: 48,
    maxWidth: 96,
    color: '#6b6b80',
    paddingTop: 6,
    paddingBottom: 4,
    '&.Mui-selected': {
      color: '#8b5cf6',
      paddingTop: 6,
      paddingBottom: 4,
    },
  },
  navLabel: {
    fontSize: '0.6rem',
    fontWeight: 500,
    marginTop: 2,
  },
  menuPaper: {
    backgroundColor: '#12121e',
    border: '1px solid rgba(139,92,246,0.12)',
    borderRadius: 12,
    marginTop: 4,
    minWidth: 180,
  },
  menuItem: {
    fontSize: '0.85rem',
    padding: '10px 16px',
    '&:hover': {
      backgroundColor: 'rgba(139,92,246,0.08)',
    },
  },
});

const navRoutes = [
  { path: '/brew', label: 'Layout.MenuBrew', icon: LocalDrink },
  { path: '/brew-configuration', label: 'Layout.MenuSettings', icon: TuneIcon },
  { path: '/recipes', label: 'Layout.MenuRecipes', icon: Bookmark },
];

const generalRoutes = [
  { path: '/wifi-configuration', label: 'Layout.MenuWiFi', icon: WifiIcon },
  { path: '/ap-configuration', label: 'Layout.MenuAP', icon: SettingsInputAntennaIcon },
  { path: '/ntp-configuration', label: 'Layout.MenuNTP', icon: AccessTimeIcon },
  { path: '/ota-configuration', label: 'Layout.MenuOTA', icon: SystemUpdateIcon },
];

function ModernMenuAppBar({ classes, children, location }) {
  const { toggleLayout, modernLayout } = useLayout();
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  const pageTitles = {
    '/brew': 'Layout.MenuBrew',
    '/brew-configuration': 'Layout.MenuSettings',
    '/recipes': 'Layout.MenuRecipes',
    '/wifi-configuration': 'Layout.MenuWiFi',
    '/ap-configuration': 'Layout.MenuAP',
    '/ntp-configuration': 'Layout.MenuNTP',
    '/ota-configuration': 'Layout.MenuOTA',
    '/about': 'Layout.MenuAbout',
  };

  var pageTitle = pageTitles[location.pathname] || 'Layout.MenuBrew';

  var currentNav = navRoutes.findIndex(r => location.pathname === r.path || location.pathname.startsWith(r.path + '/'));
  var navValue = currentNav >= 0 ? currentNav : 0;

  var handleMenuOpen = (e) => setMenuAnchor(e.currentTarget);
  var handleMenuClose = () => setMenuAnchor(null);

  return (
    <div className={classes.root}>
      <AppBar position="sticky" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <div className={classes.toolbarLeft}>
            <img src="/app/logo.png" alt="BrewANO" className={classes.logo} />
            <span className={classes.pageTitle}>
              <IntText text={pageTitle} />
            </span>
          </div>
          <div className={classes.toolbarRight}>
            <IconButton className={classes.iconBtn} onClick={handleMenuOpen} size="small">
              <MoreVertIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ className: classes.menuPaper }}
      >
        {generalRoutes.map(route => (
          <MenuItem key={route.path} component={Link} to={route.path} onClick={handleMenuClose} className={classes.menuItem}>
            <route.icon style={{ marginRight: 10, fontSize: 18, color: '#a0a0b8' }} />
            <IntText text={route.label} />
          </MenuItem>
        ))}
        <Divider style={{ backgroundColor: 'rgba(139,92,246,0.1)', margin: '4px 0' }} />
        <MenuItem onClick={() => { toggleLayout(); handleMenuClose(); }} className={classes.menuItem}>
          <StyleIcon style={{ marginRight: 10, fontSize: 18, color: '#a0a0b8' }} />
          {modernLayout ? <IntText text="Layout.Classic" /> : <IntText text="Layout.Modern" />}
        </MenuItem>
      </Menu>

      <main className={classes.content}>
        {children}
      </main>

      <Hidden mdUp>
        <BottomNavigation
          value={navValue}
          showLabels
          className={classes.bottomNav}
        >
          {navRoutes.map(route => (
            <BottomNavigationAction
              key={route.path}
              component={Link}
              to={route.path}
              label={<IntText text={route.label} />}
              icon={<route.icon style={{ fontSize: 22 }} />}
              className={classes.navAction}
              classes={{ label: classes.navLabel }}
              showLabel
            />
          ))}
          <BottomNavigationAction
            component={Link}
            to="/about"
            label={<IntText text="Layout.MenuAbout" />}
            icon={<SettingsIcon style={{ fontSize: 22 }} />}
            className={classes.navAction}
            classes={{ label: classes.navLabel }}
            showLabel
          />
        </BottomNavigation>
      </Hidden>
    </div>
  );
}

ModernMenuAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(ModernMenuAppBar));
