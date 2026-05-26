import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { pad } from '../components/Utils';
import IntText from './IntText'

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
    fontFamily: '"SF Mono", "Fira Code", monospace',
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

var cardStyle = {
  background: 'inherit',
  display: 'block',
}

class BrewStatusGadget extends Component {
  constructor(props) {
    super(props)
    this.state = {
      countdown: '00:00:00',
    }
  }

  componentDidMount() {
    this.timerInterval = setInterval(() => {
      this.brewProgress();
    }, 1000);
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
      this.setState({
        countdown: pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2),
      })
    }
  }

  renderGauge(title, value, target, unit, color, pwm) {
    const { classes } = this.props;
    const targetNum = parseFloat(target) || 0;
    const percent = targetNum > 0 ? Math.min(100, (parseFloat(value) / targetNum) * 100) : 0;
    return (
      <div className={classes.gaugeCard}>
        <Card style={cardStyle}>
          <CardContent style={{ padding: '12px 16px' }}>
            <Typography className={classes.gaugeLabel}>{title}</Typography>
            <Typography className={classes.gaugeValue}>
              {value || '--'}<span className={classes.gaugeUnit}>°{unit || 'C'}</span>
            </Typography>
            <Typography className={classes.gaugeTarget}>
              Target: {target || '--'}°{unit || 'C'}
            </Typography>
            <div className={classes.gaugeBar}>
              <div className={classes.gaugeBarFill} style={{
                width: percent + '%',
                height: 6,
                backgroundColor: color,
              }} />
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

  renderAux(title, value, unit) {
    const { classes } = this.props;
    return (
      <div className={classes.gaugeCard}>
        <Card style={cardStyle}>
          <CardContent style={{ padding: '10px 16px' }}>
            <Typography className={classes.auxLabel}>{title}</Typography>
            <Typography className={classes.auxValue}>
              {value || '--'}<span className={classes.gaugeUnit}>°{unit || 'C'}</span>
            </Typography>
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const activeStep = this.props.ActiveStep && this.props.ActiveStep.props ? this.props.ActiveStep.props.text : '';

    return (
      <Grid container spacing={8}>
        <Grid item xs={12}>
          <Grid container spacing={8} style={{ display: 'flex', flexWrap: 'wrap' }}>
            {this.renderTimer(activeStep)}
            {this.renderGauge(
              'Main',
              this.props.Temperature,
              this.props.TargetTemperature,
              this.props.TempUnit,
              '#10b981',
              this.props.PWM
            )}
            {this.props.EnableSparge && this.renderGauge(
              'Sparge',
              this.props.SpargeTemperature,
              this.props.SpargeTargetTemperature,
              this.props.TempUnit,
              '#3b82f6',
              this.props.SpargePWM
            )}
            {this.renderGauge(
              'Boil',
              this.props.BoilTemperature,
              this.props.BoilTargetTemperature,
              this.props.TempUnit,
              '#ef4444',
              this.props.BoilPWM
            )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={8} style={{ display: 'flex', flexWrap: 'wrap' }}>
            {this.props.AuxOneSendorEnabled && this.renderAux('Aux 1', this.props.AuxOneTemperature, this.props.TempUnit)}
            {this.props.AuxTwoSendorEnabled && this.renderAux('Aux 2', this.props.AuxTwoTemperature, this.props.TempUnit)}
            {this.props.AuxThreeSendorEnabled && this.renderAux('Aux 3', this.props.AuxThreeTemperature, this.props.TempUnit)}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderTimer(activeStep) {
    const { classes } = this.props;
    const isRunning = this.props.BrewStarted && activeStep !== 'Stopped';
    return (
      <div className={classes.timerSection}>
        <Card style={cardStyle}>
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
}

export default withStyles(styles)(BrewStatusGadget);
