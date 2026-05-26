import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { GET_RECIPE_ENDPOINT, SAVE_RECIPE_ENDPOINT } from '../constants/Endpoints';
import { ExecuteRestCall } from '../components/Utils';
import IntText from '../components/IntText';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
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

  handleStepEditChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    this.setState(prev => ({
      stepDialogEdit: { ...prev.stepDialogEdit, [field]: value }
    }));
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
            onChange={this.handleStepEditChange('n')}
            fullWidth
            margin="normal"
          />
          {isMash ? (
            <>
              <TextField
                label={<IntText text="Temperature" />}
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
              <FormControlLabel
                control={<Switch checked={edit.r} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, r: e.target.checked } }))} />}
                label={<IntText text="Recirculation" />}
              />
              <FormControlLabel
                control={<Switch checked={edit.sl} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, sl: e.target.checked } }))} />}
                label={<IntText text="StepLockON" />}
              />
              <FormControlLabel
                control={<Switch checked={edit.ho} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, ho: e.target.checked } }))} />}
                label={<IntText text="Heater" />}
              />
              <FormControlLabel
                control={<Switch checked={edit.fp} onChange={e => this.setState(prev => ({ stepDialogEdit: { ...prev.stepDialogEdit, fp: e.target.checked } }))} />}
                label={<IntText text="FullPower" />}
              />
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

  render() {
    const { classes } = this.props;
    const { name, mashSteps, boilSteps, brewSettings, beerParams, impressions, loading } = this.state;

    if (loading) {
      return <Typography className={classes.root}><IntText text="Loading" />...</Typography>;
    }

    return (
      <div className={classes.root}>
        <Typography variant="h6" gutterBottom>
          <IntText text="Recipe.Editor" />
        </Typography>

        <Paper className={classes.section}>
          <TextField
            label={<IntText text="Name" />}
            value={name}
            onChange={this.handleChange('name')}
            fullWidth
            margin="normal"
          />
        </Paper>

        <Paper className={classes.section}>
          <div className={classes.sectionTitle}>
            <Typography variant="subtitle1"><IntText text="MashSettings.Settings" /></Typography>
            <Button size="small" onClick={() => this.openStepDialog('mash', null, -1)}>
              <AddIcon /> <IntText text="Recipe.AddStep" />
            </Button>
          </div>
          <Divider />
          {mashSteps.length === 0 ? (
            <Typography style={{ padding: 16, color: '#999' }}><IntText text="Recipe.NoSteps" /></Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><IntText text="Name" /></TableCell>
                  <TableCell align="right"><IntText text="Temperature" /></TableCell>
                  <TableCell align="right"><IntText text="Time" /></TableCell>
                  <TableCell align="center"><IntText text="Recirculation" /></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {mashSteps.map((step, i) => (
                  <TableRow key={i}>
                    <TableCell>{step.n}</TableCell>
                    <TableCell align="right">{step.t}°C</TableCell>
                    <TableCell align="right">{step.tm} min</TableCell>
                    <TableCell align="center">{step.r ? 'On' : 'Off'}</TableCell>
                    <TableCell align="right" style={{ padding: 0 }}>
                      <IconButton size="small" onClick={() => this.openStepDialog('mash', step, i)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => this.deleteStep('mash', i)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper className={classes.section}>
          <div className={classes.sectionTitle}>
            <Typography variant="subtitle1"><IntText text="BoilSettings.Settings" /></Typography>
            <Button size="small" onClick={() => this.openStepDialog('boil', null, -1)}>
              <AddIcon /> <IntText text="Recipe.AddStep" />
            </Button>
          </div>
          <Divider />
          {boilSteps.length === 0 ? (
            <Typography style={{ padding: 16, color: '#999' }}><IntText text="Recipe.NoSteps" /></Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><IntText text="Name" /></TableCell>
                  <TableCell align="right"><IntText text="Time" /></TableCell>
                  <TableCell align="right"><IntText text="Amount" /></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {boilSteps.map((step, i) => (
                  <TableRow key={i}>
                    <TableCell>{step.n}</TableCell>
                    <TableCell align="right">{step.tm} min</TableCell>
                    <TableCell align="right">{step.a} g</TableCell>
                    <TableCell align="right" style={{ padding: 0 }}>
                      <IconButton size="small" onClick={() => this.openStepDialog('boil', step, i)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => this.deleteStep('boil', i)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        <Paper className={classes.section}>
          <div className={classes.sectionTitle}>
            <Typography variant="subtitle1"><IntText text="Recipe.BrewParams" /></Typography>
          </div>
          <Divider />
          <TextField
            label={<IntText text="Recipe.BoilTime" />}
            value={brewSettings.bt != null ? brewSettings.bt : ''}
            onChange={this.handleBrewSettingChange('bt')}
            type="number"
            margin="normal"
            style={{ marginRight: 16 }}
          />
          <TextField
            label={<IntText text="Recipe.BoilTemp" />}
            value={brewSettings.btemp != null ? brewSettings.btemp : ''}
            onChange={this.handleBrewSettingChange('btemp')}
            type="number"
            margin="normal"
          />
        </Paper>

        <Paper className={classes.section}>
          <div className={classes.sectionTitle}>
            <Typography variant="subtitle1"><IntText text="Recipe.BeerParams" /></Typography>
          </div>
          <Divider />
          <Grid container spacing={16} style={{ marginTop: 8 }}>
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
          />
        </Paper>

        <div className={classes.actions}>
          <Button onClick={this.props.onBack} style={{ marginRight: 8 }}>
            <IntText text="Cancel" />
          </Button>
          <Button variant="contained" color="primary" onClick={this.handleSave}>
            <IntText text="Save" />
          </Button>
        </div>

        {this.renderStepDialog()}
      </div>
    );
  }
}

export default withSnackbar(withStyles(styles)(RecipeEditor));
