import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import GetAppIcon from '@material-ui/icons/GetApp';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import { GET_RECIPE_ENDPOINT, SAVE_RECIPE_ENDPOINT } from '../constants/Endpoints';
import { ExecuteRestCall } from '../components/Utils';
import IntText from '../components/IntText';
import LayoutContext from '../context/LayoutContext';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
    maxWidth: 900,
    margin: '0 auto',
  },
  section: {
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
  },
  sectionTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.unit,
  },
  actions: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing.unit,
  },
  stepCard: {
    marginBottom: theme.spacing.unit,
    position: 'relative',
  },
  stepCardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    padding: '12px 16px',
    '&:last-child': {
      paddingBottom: 12,
    },
  },
  stepInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.unit * 2,
    flexWrap: 'wrap',
    flex: 1,
  },
  stepName: {
    fontWeight: 600,
    minWidth: 120,
  },
  stepChip: {
    height: 24,
    fontSize: '0.65rem',
  },
  stepParams: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  emptySteps: {
    padding: theme.spacing.unit * 3,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    border: '2px dashed',
    borderColor: theme.palette.type === 'dark' ? '#555' : '#ddd',
    borderRadius: 8,
  },
  paramGrid: {
    marginTop: theme.spacing.unit,
  },
});

const defaultMashStep = () => ({ n: '', t: 0, tm: 0, r: true, sl: false, ho: true, fp: false });
const defaultBoilStep = () => ({ n: '', tm: 0, a: 0 });

class RecipeEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
      name: '',
      mashSteps: [],
      boilSteps: [],
      brewSettings: {},
      beerParams: { ibu: 0, abv: 0, cor: 0, fg: 0 },
      impressions: '',
      loading: true,
      stepDialogOpen: false,
      stepDialogType: 'mash',
      stepDialogEdit: null,
      stepDialogIndex: -1,
    };
  }

  componentDidMount() {
    if (this.props.recipeId) this.loadRecipe(this.props.recipeId);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.recipeId !== this.props.recipeId && this.props.recipeId) {
      this.loadRecipe(this.props.recipeId);
    }
  }

  loadRecipe = (id) => {
    this.setState({ loading: true });
    ExecuteRestCall(GET_RECIPE_ENDPOINT + '?id=' + id, 'GET', json => {
      this.setState({
        id: json.id || id,
        name: json.name || '',
        mashSteps: json.mashSteps || [],
        boilSteps: json.boilSteps || [],
        brewSettings: json.brewSettings || {},
        beerParams: {
          ibu: (json.beerParams && json.beerParams.ibu) || 0,
          abv: (json.beerParams && json.beerParams.abv) || 0,
          cor: (json.beerParams && json.beerParams.cor) || 0,
          fg: (json.beerParams && json.beerParams.fg) || 0,
        },
        impressions: json.impressions || '',
        loading: false,
      });
    }, () => {
      this.setState({ loading: false });
      this.props.enqueueSnackbar('Failed to load recipe.', { variant: 'error' });
    }, this.props);
  };

  handleSave = () => {
    const { id, name, mashSteps, boilSteps, brewSettings, beerParams, impressions } = this.state;
    const body = { id, name, mashSteps, boilSteps, brewSettings, beerParams, impressions };

    fetch(SAVE_RECIPE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (response.ok) return response.json();
        throw new Error('Save failed');
      })
      .then(() => {
        this.props.enqueueSnackbar('Recipe saved.', { variant: 'success' });
        if (this.props.onSaved) this.props.onSaved();
      })
      .catch(() => {
        this.props.enqueueSnackbar('Failed to save recipe.', { variant: 'error' });
      });
  };

  handleExport = () => {
    const { name, mashSteps, boilSteps, brewSettings, beerParams, impressions } = this.state;
    const exportData = {
      name,
      mashSteps,
      boilSteps,
      brewSettings,
      beerParams,
      impressions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (name || 'recipe') + '.json';
    a.click();
    URL.revokeObjectURL(url);
    this.props.enqueueSnackbar('Recipe exported!', { variant: 'success' });
  };

  handleChange = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };

  handleBeerParamChange = (field) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    this.setState(prev => ({ beerParams: { ...prev.beerParams, [field]: value } }));
  };

  handleBrewSettingChange = (field) => (e) => {
    const val = e.target.type === 'number' ? (e.target.value.includes('.') ? parseFloat(e.target.value) : parseInt(e.target.value)) : e.target.value;
    this.setState(prev => ({ brewSettings: { ...prev.brewSettings, [field]: val || 0 } }));
  };

  openStepDialog = (type, edit, index) => {
    this.setState({
      stepDialogOpen: true,
      stepDialogType: type,
      stepDialogEdit: edit || (type === 'mash' ? defaultMashStep() : defaultBoilStep()),
      stepDialogIndex: index,
    });
  };

  closeStepDialog = () => {
    this.setState({ stepDialogOpen: false });
  };

  saveStep = () => {
    const { stepDialogType, stepDialogEdit, stepDialogIndex } = this.state;
    const key = stepDialogType === 'mash' ? 'mashSteps' : 'boilSteps';
    const items = [...this.state[key]];

    if (stepDialogIndex >= 0 && stepDialogIndex < items.length) {
      items[stepDialogIndex] = stepDialogEdit;
    } else {
      items.push(stepDialogEdit);
    }

    this.setState({ [key]: items, stepDialogOpen: false });
  };

  deleteStep = (type, index) => {
    const key = type === 'mash' ? 'mashSteps' : 'boilSteps';
    const items = [...this.state[key]];
    items.splice(index, 1);
    this.setState({ [key]: items });
  };

  renderStepDialog() {
    const { stepDialogOpen, stepDialogType, stepDialogEdit } = this.state;
    const isMash = stepDialogType === 'mash';
    const edit = stepDialogEdit || (isMash ? defaultMashStep() : defaultBoilStep());

    return (
      <Dialog open={stepDialogOpen} onClose={this.closeStepDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isMash ? <IntText text="Recipe.EditMashStep" /> : <IntText text="Recipe.EditBoilStep" />}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={<IntText text="Name" />}
            value={edit.n || ''}
            onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, n: e.target.value } }))}
            fullWidth
            margin="normal"
          />
          {isMash ? (
            <>
              <TextField
                label={<IntText text="Temperature" /> + ' (°C)'}
                type="number"
                value={edit.t || 0}
                onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, t: parseFloat(e.target.value) || 0 } }))}
                fullWidth
                margin="normal"
              />
              <TextField
                label={<IntText text="Time" /> + ' (min)'}
                type="number"
                value={edit.tm || 0}
                onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, tm: parseInt(e.target.value) || 0 } }))}
                fullWidth
                margin="normal"
              />
              <Grid container spacing={8} style={{ marginTop: 8 }}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={edit.r} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, r: e.target.checked } }))} />}
                    label={<Typography variant="body2"><IntText text="Recipe.Recirculation" /></Typography>}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={edit.sl} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, sl: e.target.checked } }))} />}
                    label={<Typography variant="body2"><IntText text="Recipe.StepLock" /></Typography>}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={edit.ho} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, ho: e.target.checked } }))} />}
                    label={<Typography variant="body2"><IntText text="Recipe.Heater" /></Typography>}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={<Switch checked={edit.fp} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, fp: e.target.checked } }))} />}
                    label={<Typography variant="body2"><IntText text="Recipe.FullPower" /></Typography>}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              <TextField
                label={<IntText text="Time" /> + ' (min)'}
                type="number"
                value={edit.tm || 0}
                onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, tm: parseInt(e.target.value) || 0 } }))}
                fullWidth
                margin="normal"
              />
              <TextField
                label={<IntText text="Amount" /> + ' (g)'}
                type="number"
                value={edit.a || 0}
                onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, a: parseInt(e.target.value) || 0 } }))}
                fullWidth
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeStepDialog}><IntText text="Cancel" /></Button>
          <Button onClick={this.saveStep} variant="contained" color="primary"><IntText text="Save" /></Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderMashStepCard(step, i) {
    const { classes } = this.props;
    return (
      <Card className={classes.stepCard} key={'mash-' + i}>
        <CardContent className={classes.stepCardContent}>
          <div className={classes.stepInfo}>
            <Typography className={classes.stepName}>
              {step.n || 'Step ' + (i + 1)}
            </Typography>
            <div className={classes.stepParams}>
              <Chip label={step.t + '°C'} size="small" className={classes.stepChip} />
              <Chip label={step.tm + ' min'} size="small" className={classes.stepChip} />
              {step.r && <Chip label="Pump" size="small" className={classes.stepChip} />}
              {step.ho && <Chip label="Heat" size="small" className={classes.stepChip} />}
              {step.sl && <Chip label="Lock" size="small" className={classes.stepChip} color="secondary" />}
              {step.fp && <Chip label="Full" size="small" className={classes.stepChip} color="primary" />}
            </div>
          </div>
          <div>
            <IconButton size="small" onClick={() => this.openStepDialog('mash', step, i)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => this.deleteStep('mash', i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  renderBoilStepCard(step, i) {
    const { classes } = this.props;
    return (
      <Card className={classes.stepCard} key={'boil-' + i}>
        <CardContent className={classes.stepCardContent}>
          <div className={classes.stepInfo}>
            <Typography className={classes.stepName}>
              {step.n || 'Addition ' + (i + 1)}
            </Typography>
            <div className={classes.stepParams}>
              <Chip label={step.tm + ' min'} size="small" className={classes.stepChip} />
              {step.a > 0 && <Chip label={step.a + ' g'} size="small" className={classes.stepChip} />}
            </div>
          </div>
          <div>
            <IconButton size="small" onClick={() => this.openStepDialog('boil', step, i)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => this.deleteStep('boil', i)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        </CardContent>
      </Card>
    );
  }

  render() {
    const { classes } = this.props;
    const { name, mashSteps, boilSteps, brewSettings, beerParams, impressions, loading } = this.state;

    if (loading) {
      return (
        <div className={classes.root}>
          <Typography><IntText text="Loading" />...</Typography>
        </div>
      );
    }

    return (
      <LayoutContext.Consumer>
        {({ modernLayout }) => (
          <div className={classes.root}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="h6" gutterBottom style={{ marginBottom: 0 }}>
                <IntText text="Recipe.Editor" />
              </Typography>
              <Button
                size="small"
                onClick={this.handleExport}
                color={modernLayout ? "secondary" : "default"}
              >
                <GetAppIcon style={{ marginRight: 4, fontSize: 18 }} />
                <IntText text="Recipe.Export" />
              </Button>
            </div>

            <Paper className={classes.section}>
              <TextField
                label={<IntText text="Name" />}
                value={name}
                onChange={this.handleChange('name')}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </Paper>

            <Paper className={classes.section}>
              <div className={classes.sectionTitle}>
                <Typography variant="subtitle1">
                  <IntText text="Recipe.MashSteps" />
                  {mashSteps.length > 0 && (
                    <Chip label={mashSteps.length} size="small" style={{ marginLeft: 8, height: 20 }} />
                  )}
                </Typography>
                <Button
                  size="small"
                  color={modernLayout ? "secondary" : "primary"}
                  onClick={() => this.openStepDialog('mash', null, -1)}
                >
                  <AddIcon style={{ fontSize: 18 }} /> <IntText text="Recipe.AddStep" />
                </Button>
              </div>
              <Divider style={{ marginBottom: 12 }} />
              {mashSteps.length === 0 ? (
                <div className={classes.emptySteps}>
                  <Typography variant="body2"><IntText text="Recipe.NoSteps" /></Typography>
                </div>
              ) : (
                mashSteps.map((step, i) => this.renderMashStepCard(step, i))
              )}
            </Paper>

            <Paper className={classes.section}>
              <div className={classes.sectionTitle}>
                <Typography variant="subtitle1">
                  <IntText text="Recipe.BoilSteps" />
                  {boilSteps.length > 0 && (
                    <Chip label={boilSteps.length} size="small" style={{ marginLeft: 8, height: 20 }} />
                  )}
                </Typography>
                <Button
                  size="small"
                  color={modernLayout ? "secondary" : "primary"}
                  onClick={() => this.openStepDialog('boil', null, -1)}
                >
                  <AddIcon style={{ fontSize: 18 }} /> <IntText text="Recipe.AddStep" />
                </Button>
              </div>
              <Divider style={{ marginBottom: 12 }} />
              {boilSteps.length === 0 ? (
                <div className={classes.emptySteps}>
                  <Typography variant="body2"><IntText text="Recipe.NoSteps" /></Typography>
                </div>
              ) : (
                boilSteps.map((step, i) => this.renderBoilStepCard(step, i))
              )}
            </Paper>

            <Paper className={classes.section}>
              <div className={classes.sectionTitle}>
                <Typography variant="subtitle1"><IntText text="Recipe.BrewParams" /></Typography>
              </div>
              <Divider />
              <Grid container spacing={16} style={{ marginTop: 8 }}>
                <Grid item xs={6} sm={4}>
                  <TextField
                    label={<IntText text="Recipe.BoilTime" />}
                    value={brewSettings.bt != null ? brewSettings.bt : ''}
                    onChange={this.handleBrewSettingChange('bt')}
                    type="number"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={6} sm={4}>
                  <TextField
                    label={<IntText text="Recipe.BoilTemp" />}
                    value={brewSettings.btemp != null ? brewSettings.btemp : ''}
                    onChange={this.handleBrewSettingChange('btemp')}
                    type="number"
                    fullWidth
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper className={classes.section}>
              <div className={classes.sectionTitle}>
                <Typography variant="subtitle1"><IntText text="Recipe.BeerParams" /></Typography>
              </div>
              <Divider />
              <Grid container spacing={16} className={classes.paramGrid}>
                <Grid item xs={6} sm={3}>
                  <TextField label="IBU" value={beerParams.ibu} onChange={this.handleBeerParamChange('ibu')} type="number" fullWidth margin="normal" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField label="ABV (%)" value={beerParams.abv} onChange={this.handleBeerParamChange('abv')} type="number" inputProps={{ step: 0.1 }} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField label="COR (EBC)" value={beerParams.cor} onChange={this.handleBeerParamChange('cor')} type="number" inputProps={{ step: 0.1 }} fullWidth margin="normal" />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField label="FG" value={beerParams.fg} onChange={this.handleBeerParamChange('fg')} type="number" inputProps={{ step: 0.001 }} fullWidth margin="normal" />
                </Grid>
              </Grid>
            </Paper>

            <Paper className={classes.section}>
              <div className={classes.sectionTitle}>
                <Typography variant="subtitle1"><IntText text="Recipe.Impressions" /></Typography>
              </div>
              <Divider />
              <TextField
                label={<IntText text="Recipe.ImpressionsDesc" />}
                value={impressions}
                onChange={this.handleChange('impressions')}
                fullWidth
                multiline
                rows={4}
                margin="normal"
                variant="outlined"
              />
            </Paper>

            <div className={classes.actions}>
              <Button onClick={this.props.onBack}>
                <IntText text="Cancel" />
              </Button>
              <Button variant="contained" color={modernLayout ? "secondary" : "primary"} onClick={this.handleSave}>
                <IntText text="Save" />
              </Button>
            </div>

            {this.renderStepDialog()}
          </div>
        )}
      </LayoutContext.Consumer>
    );
  }
}

export default withSnackbar(withStyles(styles)(RecipeEditor));
