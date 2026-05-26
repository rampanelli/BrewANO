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
import Divider from '@material-ui/core/Divider';

import MenuIcon from '@material-ui/icons/Menu';
import WifiIcon from '@material-ui/icons/Wifi';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import LocalDrink from '@material-ui/icons/LocalDrink';
import Assignment from '@material-ui/icons/Assignment';
import Bookmark from '@material-ui/icons/Bookmark';
import SettingsIcon from '@material-ui/icons/Settings';
import StyleIcon from '@material-ui/icons/Style';

import IntText from './IntText';
import { useLayout } from '../context/LayoutContext';

const styles = theme => ({
  root: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#0a0a14',
  },
  appBar: {
    backgroundColor: '#0c0c18',
    boxShadow: '0 2px 20px rgba(139,92,246,0.15)',
    borderBottom: '1px solid rgba(139,92,246,0.12)',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    height: 28,
    marginRight: theme.spacing.unit * 2,
  },
  tabs: {
    marginLeft: theme.spacing.unit * 2,
    minHeight: 48,
  },
  tab: {
    minWidth: 56,
    fontSize: '0.75rem',
    textTransform: 'none',
    fontWeight: 500,
    opacity: 0.7,
    color: '#a0a0b8',
    minHeight: 48,
    padding: '0 12px',
    '&.Mui-selected': {
      opacity: 1,
      color: '#ffffff',
      fontWeight: 700,
    },
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.unit,
  },
  generalBtn: {
    color: '#a0a0b8',
    textTransform: 'none',
    fontSize: '0.75rem',
    fontWeight: 500,
    padding: '4px 10px',
    minWidth: 'auto',
    borderRadius: 8,
    '&:hover': {
      color: '#ffffff',
      backgroundColor: 'rgba(139,92,246,0.15)',
    },
  },
  content: {
    padding: theme.spacing.unit * 2,
    maxWidth: 1200,
    margin: '0 auto',
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing.unit,
    },
  },
  mobileMenuBtn: {
    color: '#d0d0e0',
  },
  menuItem: {
    fontSize: '0.85rem',
  },
});

const mainRoutes = [
  { path: '/brew', label: 'Layout.MenuBrew', icon: LocalDrink },
  { path: '/brew-configuration', label: 'Layout.MenuSettings', icon: Assignment },
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
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState(null);
  const [generalMenuAnchor, setGeneralMenuAnchor] = React.useState(null);

  const currentTab = mainRoutes.findIndex(
    r => location.pathname === r.path || location.pathname.startsWith(r.path + '/')
  );
  const tabValue = currentTab >= 0 ? currentTab : 0;

  const handleMobileMenuOpen = (e) => setMobileMenuAnchor(e.currentTarget);
  const handleMobileMenuClose = () => setMobileMenuAnchor(null);
  const handleGeneralMenuOpen = (e) => setGeneralMenuAnchor(e.currentTarget);
  const handleGeneralMenuClose = () => setGeneralMenuAnchor(null);

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
            <img src="/app/logo.png" alt="BrewANO" className={classes.logo} />
            <Hidden smDown>
              <Tabs
                value={tabValue}
                className={classes.tabs}
                TabIndicatorProps={{ style: { backgroundColor: '#8b5cf6', height: 3 } }}
              >
                {mainRoutes.map(route => (
                  <Tab key={route.path} component={Link} to={route.path} label={<IntText text={route.label} />} className={classes.tab} />
                ))}
              </Tabs>
            </Hidden>
          </div>
          <div className={classes.toolbarRight}>
            <Button className={classes.generalBtn} onClick={handleGeneralMenuOpen}>
              <SettingsIcon style={{ fontSize: 16, marginRight: 4 }} />
              General
            </Button>
          </div>
        </Toolbar>
      </AppBar>

      {/* General menu dropdown */}
      <Menu
        anchorEl={generalMenuAnchor}
        open={Boolean(generalMenuAnchor)}
        onClose={handleGeneralMenuClose}
        PaperProps={{ style: { backgroundColor: '#12121e', border: '1px solid rgba(139,92,246,0.15)' } }}
      >
        {generalRoutes.map(route => (
          <MenuItem
            key={route.path}
            component={Link}
            to={route.path}
            onClick={handleGeneralMenuClose}
            className={classes.menuItem}
          >
            <route.icon style={{ marginRight: 10, fontSize: 20, color: '#a0a0b8' }} />
            <IntText text={route.label} />
          </MenuItem>
        ))}
        <Divider style={{ backgroundColor: 'rgba(139,92,246,0.1)' }} />
        <MenuItem onClick={() => { toggleLayout(); handleGeneralMenuClose(); }} className={classes.menuItem}>
          <StyleIcon style={{ marginRight: 10, fontSize: 20, color: '#a0a0b8' }} />
          {modernLayout ? <IntText text="Layout.Classic" /> : <IntText text="Layout.Modern" />}
        </MenuItem>
      </Menu>

      {/* Mobile menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        PaperProps={{ style: { backgroundColor: '#12121e', border: '1px solid rgba(139,92,246,0.15)' } }}
      >
        {[...mainRoutes, ...generalRoutes].map(route => (
          <MenuItem
            key={route.path}
            component={Link}
            to={route.path}
            onClick={handleMobileMenuClose}
            className={classes.menuItem}
          >
            <route.icon style={{ marginRight: 10, fontSize: 20, color: '#a0a0b8' }} />
            <IntText text={route.label} />
          </MenuItem>
        ))}
        <Divider style={{ backgroundColor: 'rgba(139,92,246,0.1)' }} />
        <MenuItem onClick={() => { toggleLayout(); handleMobileMenuClose(); }} className={classes.menuItem}>
          <StyleIcon style={{ marginRight: 10, fontSize: 20, color: '#a0a0b8' }} />
          {modernLayout ? <IntText text="Layout.Classic" /> : <IntText text="Layout.Modern" />}
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
