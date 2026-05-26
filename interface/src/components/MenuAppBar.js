import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Hidden from '@material-ui/core/Hidden';
import Divider from '@material-ui/core/Divider';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import MenuIcon from '@material-ui/icons/Menu';
import WifiIcon from '@material-ui/icons/Wifi';
import SystemUpdateIcon from '@material-ui/icons/SystemUpdate';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import SettingsInputAntennaIcon from '@material-ui/icons/SettingsInputAntenna';
import LocalDrink from '@material-ui/icons/LocalDrink'
import Assignment from '@material-ui/icons/Assignment'
import Bookmark from '@material-ui/icons/Bookmark'
import ContactSupport from '@material-ui/icons/ContactSupport'
import StyleIcon from '@material-ui/icons/Style'

import IntText from '../components/IntText'
import LayoutContext from '../context/LayoutContext'

const drawerWidth = 250;
const drawerWidthPermanent = 60

const styles = theme => ({
  root: {
    zIndex: 1,
    width: '100%',
    height: '100%',
  },
  toolbar: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing.unit * 3,
      paddingRight: theme.spacing.unit * 3,
    }
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    backgroundColor: '#313131',
    position: 'absolute',
    marginLeft: drawerWidth,
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - 80px)`,
    },
  },
  navIconHide: {
    marginRight: 20,
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
  drawerPaper: {
    width: drawerWidth,
    height: '100%',
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'fixed',
      left: 0,
      top: 0,
      overflow: 'auto'
    },
  },
  drawerWidthPermanent: {
    width: drawerWidthPermanent,
    height: '100%',
    [theme.breakpoints.up('md')]: {
      width: drawerWidthPermanent,
      position: 'fixed',
      left: 0,
      top: 0,
      overflow: 'auto'
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: "100%",
    marginTop: 56,
    [theme.breakpoints.up('md')]: {
      paddingLeft: drawerWidthPermanent
    },
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
  layoutToggle: {
    position: 'fixed',
    bottom: 0,
    width: drawerWidthPermanent,
    display: 'flex',
    justifyContent: 'center',
    padding: 8,
    [theme.breakpoints.up('md')]: {
      width: drawerWidthPermanent,
    },
  },
  layoutToggleMobile: {
    width: drawerWidth,
  },
  toggleBtn: {
    minWidth: 'auto',
    padding: '4px 8px',
    fontSize: '0.65rem',
    textTransform: 'none',
    color: theme.palette.text.secondary,
    borderColor: 'rgba(255,167,38,0.5)',
    borderRadius: 20,
    '&:hover': {
      borderColor: '#ffa726',
      color: '#ffa726',
      backgroundColor: 'rgba(255,167,38,0.1)',
    },
  },
});

class MenuAppBarBase extends React.Component {
  state = {
    mobileOpen: false,
  };

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  render() {
    const { classes, theme, children, sectionTitle, onToggleLayout } = this.props;

    const drawer = (
      <div>
        <Divider />
        <List>
          <ListItem button component={Link} to='/brew'>
            <ListItemIcon>
              <LocalDrink />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="Brew.Title" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/brew-configuration'>
            <ListItemIcon>
              <Assignment />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="BrewSettings.Settings" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/recipes'>
            <ListItemIcon>
              <Bookmark />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="Recipe.Title" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/wifi-configuration'>
            <ListItemIcon>
              <WifiIcon />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="WiFiSettings.Settings" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/ap-configuration'>
            <ListItemIcon>
              <SettingsInputAntennaIcon />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="APSettings.Settings" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/ntp-configuration'>
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="NTPSettings.Settings" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/ota-configuration'>
            <ListItemIcon>
              <SystemUpdateIcon />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="OTASettings.Settings" />} />
              : null}
          </ListItem>
          <ListItem button component={Link} to='/about'>
            <ListItemIcon>
              <ContactSupport />
            </ListItemIcon>
            {this.state.mobileOpen ?
              <ListItemText primary={<IntText text="About" />} />
              : null}
          </ListItem>
        </List>
        <div className={classes.layoutToggle + (this.state.mobileOpen ? ' ' + classes.layoutToggleMobile : '')}>
          <Button
            variant="outlined"
            size="small"
            className={classes.toggleBtn}
            onClick={onToggleLayout}
          >
            <StyleIcon style={{ fontSize: 14, marginRight: 4 }} />
            {this.state.mobileOpen ? <IntText text="Layout.Modern" /> : null}
          </Button>
        </div>
      </div>
    );

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar className={classes.appBar}>
            <Toolbar className={classes.toolbar} disableGutters={true}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerToggle}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
              <img src="/app/logo.png" alt="Logo" />
            </Toolbar>
          </AppBar>
          <Hidden>
            <Drawer
              variant="temporary"
              anchor={theme.direction === 'rtl' ? 'right' : 'left'}
              open={this.state.mobileOpen}
              classes={{
                paper: classes.drawerPaper,
              }}
              onClose={this.handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: classes.drawerWidthPermanent,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <main className={classes.content}>
            {children}
          </main>
        </div>
      </div>
    );
  }
}

MenuAppBarBase.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  sectionTitle: PropTypes.string,
  children: PropTypes.node,
  onToggleLayout: PropTypes.func,
};

const StyledMenuAppBar = withStyles(styles, { withTheme: true })(MenuAppBarBase);

function MenuAppBar(props) {
  return (
    <LayoutContext.Consumer>
      {({ toggleLayout }) => (
        <StyledMenuAppBar {...props} onToggleLayout={toggleLayout} />
      )}
    </LayoutContext.Consumer>
  );
}

MenuAppBar.propTypes = {
  sectionTitle: PropTypes.string,
  children: PropTypes.node,
};

export default MenuAppBar;
