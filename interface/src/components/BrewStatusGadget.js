import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { PieChart, Pie, Cell } from 'recharts';
import { Line } from 'rc-progress';
import { withStyles } from '@material-ui/core/styles';
import { pad } from '../components/Utils';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import IntText from './IntText'
import LayoutContext from '../context/LayoutContext'

const themeMain = createMuiTheme({
  palette: {
    primary: { main: '#b5b5b5' },
    secondary: { main: '#ffca28' },
  },
});
const themeSparge = createMuiTheme({
  palette: {
    primary: { main: '#b5b5b5' },
    secondary: { main: '#ff7301' },
  },
});
const themeBoil = createMuiTheme({
  palette: {
    primary: { main: '#b5b5b5' },
    secondary: { main: '#f44336' },
  },
});
const themeAuxiliary = createMuiTheme({
  palette: {
    primary: { main: '#b5b5b5' },
    secondary: { main: '#ffca28' },
  },
});

const styles = theme => ({
  gaugeCard: {
    minWidth: 150,
    maxWidth: 200,
    flex: 1,
  },
  gaugeLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  gaugeValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    lineHeight: 1.1,
  },
  gaugeUnit: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
    marginLeft: 2,
  },
  gaugeTarget: {
    fontSize: '0.65rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  gaugeBar: {
    marginTop: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  gaugeBarFill: {
    borderRadius: 3,
    transition: 'width 0.8s ease',
  },
  pwmLabel: {
    fontSize: '0.6rem',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginTop: 6,
    display: 'flex',
    justifyContent: 'space-between',
  },
  timerSection: {
    minWidth: 150,
    maxWidth: 200,
    flex: 1,
  },
  timerLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    marginBottom: 2,
  },
  timerValue: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#a78bfa',
    lineHeight: 1.1,
  },
  timerActive: {
    fontSize: '0.7rem',
    fontWeight: 600,
    marginTop: 4,
    color: '#10b981',
  },
  timerIdle: {
    fontSize: '0.7rem',
    fontWeight: 600,
    marginTop: 4,
    color: theme.palette.text.secondary,
  },
  auxValue: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
    lineHeight: 1.1,
  },
  auxLabel: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
});

function fmt(n) {
  if (n == null || n === '') return '--';
  var num = parseFloat(n);
  if (isNaN(num)) return '--';
  return num.toFixed(2);
}

var classicCardStyle = { background: '#313131', display: 'block' };

class BrewStatusGadget extends Component {
  constructor(props) {
    super(props)
    this.state = { countdown: '00:00:00' }
  }

  componentDidMount() {
    this.timerInterval = setInterval(() => this.brewProgress(), 1000);
  }

  componentWillUnmount() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  brewProgress() {
    if (!this.props.BrewStarted || this.props.StartTime <= 0 || this.props.EndTime <= 0) {
      this.setState({ countdown: '00:00:00' })
      return;
    }
    if (this.props.TimeNotSet === 1) {
      this.setState({ countdown: this.props.Count })
      return;
    }
    var dateEntered = new Date(this.props.EndTime * 1000);
    var now = new Date();
    var difference = !this.props.StepLocked ? dateEntered.getTime() - now.getTime() : now.getTime() - dateEntered.getTime();
    if (difference <= 0 && !this.props.StepLocked) {
      this.setState({ countdown: '00:00:00' })
    } else {
      var seconds = Math.floor(Math.abs(difference) / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      minutes %= 60; seconds %= 60;
      this.setState({ countdown: pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) })
    }
  }

  getProgressData = (value) => {
    var v = Math.min(100, Math.max(0, parseFloat(value) || 0));
    return [{ name: 'A', value: v }, { name: 'B', value: 100 - v }]
  }

  renderClassic() {
    const SPARGEPWMCOLORS = ['#ff7301', '#424242'];
    const BOILPWMCOLORS = ['#f44336', '#424242'];
    const TEMPERATURECOLORS = ['#ffca28', '#424242'];

    return (
      <Grid container spacing={16}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={16}>
            {(this.props.ActiveStep.props.text === 'Mash' || this.props.ActiveStep.props.text === 'Stopped' || this.props.EnableBoilKettle) &&
              <ClassicGaugeItem
                theme={themeMain}
                title={"Main"}
                colorPWM={"#83f316"}
                PWM={this.props.PWM}
                TempUnit={this.props.TempUnit}
                titlesufix={this.props.TargetTemperature ? fmt(this.props.TargetTemperature) : ''}
                colors={TEMPERATURECOLORS}
                value={fmt(this.props.Temperature)}
                data={this.getProgressData(this.props.Temperature)}
              />
            }
            {this.props.EnableSparge &&
              <ClassicGaugeItem
                theme={themeSparge}
                title={"Secondary"}
                colorPWM={"#2892ff"}
                PWM={this.props.SpargePWM}
                TempUnit={this.props.TempUnit}
                titlesufix={this.props.SpargeTargetTemperature ? fmt(this.props.SpargeTargetTemperature) : ''}
                colors={SPARGEPWMCOLORS}
                value={fmt(this.props.SpargeTemperature)}
                data={this.getProgressData(this.props.SpargeTemperature)}
              />
            }
            {(this.props.EnableBoilKettle || this.props.ActiveStep.props.text === 'Boil') &&
              <ClassicGaugeItem
                theme={themeBoil}
                title={"Boil"}
                colorPWM={"#ffca28"}
                PWM={this.props.BoilPWM}
                TempUnit={this.props.TempUnit}
                titlesufix={this.props.BoilTargetTemperature ? fmt(this.props.BoilTargetTemperature) : ''}
                colors={BOILPWMCOLORS}
                value={fmt(this.props.BoilTemperature)}
                data={this.getProgressData(this.props.BoilTemperature)}
              />
            }
            <Grid item>
              <Card style={classicCardStyle}>
                <CardContent>
                  <Typography color="textSecondary" variant="subtitle2" gutterBottom><IntText text="Timer" /></Typography>
                  <Typography variant="h5">{this.state.countdown}</Typography>
                  <div style={{ paddingTop: 7, paddingBottom: 0 }}>
                    <Divider variant="fullWidth" />
                  </div>
                  <div style={{ paddingTop: 7 }}>
                    <Typography color="textSecondary" variant="caption" gutterBottom><IntText text="Brew.ActiveStep" /></Typography>
                    <Typography variant="subtitle1">{this.props.ActiveStepName || '-'}</Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container justify="center" spacing={16}>
            {this.props.AuxOneSendorEnabled &&
              <ClassicAuxItem theme={themeAuxiliary} title={"Aux 1"} TempUnit={this.props.TempUnit} value={fmt(this.props.AuxOneTemperature)} />
            }
            {this.props.AuxTwoSendorEnabled &&
              <ClassicAuxItem theme={themeAuxiliary} title={"Aux 2"} TempUnit={this.props.TempUnit} value={fmt(this.props.AuxTwoTemperature)} />
            }
            {this.props.AuxThreeSendorEnabled &&
              <ClassicAuxItem theme={themeAuxiliary} title={"Aux 3"} TempUnit={this.props.TempUnit} value={fmt(this.props.AuxThreeTemperature)} />
            }
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderModern() {
    const { classes } = this.props;
    const activeStep = this.props.ActiveStep && this.props.ActiveStep.props ? this.props.ActiveStep.props.text : '';

    return (
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {this.renderTimer(activeStep)}
          {this.renderModernGauge('Main', fmt(this.props.Temperature), fmt(this.props.TargetTemperature), this.props.TempUnit, '#10b981', this.props.PWM)}
          {this.props.EnableSparge && this.renderModernGauge('Sparge', fmt(this.props.SpargeTemperature), fmt(this.props.SpargeTargetTemperature), this.props.TempUnit, '#3b82f6', this.props.SpargePWM)}
          {this.renderModernGauge('Boil', fmt(this.props.BoilTemperature), fmt(this.props.BoilTargetTemperature), this.props.TempUnit, '#ef4444', this.props.BoilPWM)}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 8 }}>
          {this.props.AuxOneSendorEnabled && this.renderModernAux('Aux 1', fmt(this.props.AuxOneTemperature), this.props.TempUnit)}
          {this.props.AuxTwoSendorEnabled && this.renderModernAux('Aux 2', fmt(this.props.AuxTwoTemperature), this.props.TempUnit)}
          {this.props.AuxThreeSendorEnabled && this.renderModernAux('Aux 3', fmt(this.props.AuxThreeTemperature), this.props.TempUnit)}
        </div>
      </div>
    )
  }

  renderModernGauge(title, value, target, unit, color, pwm) {
    const { classes } = this.props;
    const targetNum = parseFloat(target) || 0;
    const valNum = parseFloat(value) || 0;
    const percent = targetNum > 0 ? Math.min(100, (valNum / targetNum) * 100) : 0;
    return (
      <div className={classes.gaugeCard}>
        <Card style={{ background: 'inherit', display: 'block' }}>
          <CardContent style={{ padding: '12px 16px' }}>
            <Typography className={classes.gaugeLabel}>{title}</Typography>
            <Typography className={classes.gaugeValue}>
              {value}<span className={classes.gaugeUnit}>°{unit || 'C'}</span>
            </Typography>
            <Typography className={classes.gaugeTarget}>
              Target: {target}°{unit || 'C'}
            </Typography>
            <div className={classes.gaugeBar}>
              <div className={classes.gaugeBarFill} style={{ width: percent + '%', height: 6, backgroundColor: color }} />
            </div>
            {pwm != null && (
              <div className={classes.pwmLabel}>
                <span>PWM</span>
                <span style={{ color: color }}>{pwm}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  renderModernAux(title, value, unit) {
    const { classes } = this.props;
    return (
      <div className={classes.gaugeCard}>
        <Card style={{ background: 'inherit', display: 'block' }}>
          <CardContent style={{ padding: '10px 16px' }}>
            <Typography className={classes.auxLabel}>{title}</Typography>
            <Typography className={classes.auxValue}>
              {value}<span className={classes.gaugeUnit}>°{unit || 'C'}</span>
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  renderTimer(activeStep) {
    const { classes } = this.props;
    const isRunning = this.props.BrewStarted && activeStep !== 'Stopped';
    return (
      <div className={classes.timerSection}>
        <Card style={{ background: 'inherit', display: 'block' }}>
          <CardContent style={{ padding: '12px 16px' }}>
            <Typography className={classes.timerLabel}><IntText text="Timer" /></Typography>
            <Typography className={classes.timerValue}>{this.state.countdown}</Typography>
            <Typography className={isRunning ? classes.timerActive : classes.timerIdle}>
              {isRunning ? (this.props.ActiveStepName || activeStep) : <IntText text="Stopped" />}
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    return (
      <LayoutContext.Consumer>
        {({ modernLayout }) => (
          modernLayout ? this.renderModern() : this.renderClassic()
        )}
      </LayoutContext.Consumer>
    )
  }
}

class ClassicGaugeItem extends Component {
  render() {
    return (
      <Grid item>
        <Card style={classicCardStyle}>
          <CardContent>
            <MuiThemeProvider theme={this.props.theme}>
              <div style={{ display: "flex" }}>
                <Typography color="primary" variant="subtitle2" gutterBottom noWrap>
                  <IntText text={this.props.title} />
                </Typography>
                &nbsp;&nbsp;
                <Typography color="secondary" variant="subtitle2">
                  {this.props.titlesufix} °{this.props.TempUnit}
                </Typography>
              </div>
            </MuiThemeProvider>
            <PieChart width={100} height={50}>
              <Pie data={this.props.data}
                cx={45} cy={45}
                startAngle={180}
                endAngle={0}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={3}
                stroke={0}
                label={false}
              >
                {this.props.data.map((entry, index) => (
                  <Cell key={index} fill={this.props.colors[index % this.props.colors.length]} />
                ))}
              </Pie>
            </PieChart>
            <Typography align="center" variant="h5">
              {this.props.value} °{this.props.TempUnit}
            </Typography>
            <div style={{ display: "flex" }}>
              <Typography color="textSecondary" variant="subtitle2">PWM:</Typography>
              &nbsp;
              <Typography variant="subtitle2">{this.props.PWM}%</Typography>
            </div>
            <Line percent={this.props.PWM} strokeWidth="8" strokeColor={this.props.colorPWM} trailWidth="4" trailColor="#424242" />
          </CardContent>
        </Card>
      </Grid>
    )
  }
}

class ClassicAuxItem extends Component {
  render() {
    return (
      <Grid item>
        <Card style={classicCardStyle}>
          <CardContent>
            <MuiThemeProvider theme={this.props.theme}>
              <div style={{ display: "flex" }}>
                <Typography color="primary" variant="subtitle2" gutterBottom noWrap>{this.props.title}</Typography>
              </div>
              <div style={{ display: "flex" }}>
                <Typography color="secondary" variant="subtitle2">{this.props.value} °{this.props.TempUnit}</Typography>
              </div>
            </MuiThemeProvider>
          </CardContent>
        </Card>
      </Grid>
    )
  }
}

export default withStyles(styles)(BrewStatusGadget);
