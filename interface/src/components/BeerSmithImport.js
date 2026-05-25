import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Chip from '@material-ui/core/Chip';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { withSnackbar } from 'notistack';
import { parseBeerSmithFile } from '../utils/BeerSmithImporter';
import {
  SAVE_MASH_SETTINGS_SERVICE_PATH,
  SAVE_BOIL_SETTINGS_SERVICE_PATH,
  BREW_SETTINGS_ENDPOINT
} from '../constants/Endpoints';
import IntText from './IntText';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
  uploadButton: {
    marginBottom: theme.spacing.unit * 2,
  },
  input: {
    display: 'none',
  },
  preview: {
    marginTop: theme.spacing.unit * 2,
  },
  sectionTitle: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit,
  },
  table: {
    maxHeight: 200,
    overflow: 'auto',
  },
  actions: {
    marginTop: theme.spacing.unit * 2,
    textAlign: 'right',
  },
  chip: {
    margin: theme.spacing.unit / 2,
  },
});

class BeerSmithImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipe: null,
      recipeName: '',
      loading: false,
    };
  }

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = parseBeerSmithFile(event.target.result, file.name);
        if (!result.mashSteps.length && !result.boilSteps.length) {
          this.props.enqueueSnackbar('No mash steps or hop additions found in file.', { variant: 'warning' });
          return;
        }
        this.setState({
          recipe: result,
          recipeName: file.name.replace(/\.(bsmx|xml|json)$/i, ''),
        });
      } catch (err) {
        this.props.enqueueSnackbar(err.message || 'Failed to parse file.', { variant: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  saveToDevice = async () => {
    const { recipe } = this.state;
    if (!recipe) return;

    this.setState({ loading: true });

    try {
      if (recipe.mashSteps.length > 0) {
        const mashResponse = await fetch(SAVE_MASH_SETTINGS_SERVICE_PATH, {
          method: 'POST',
          body: JSON.stringify({ st: recipe.mashSteps }),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        if (!mashResponse.ok) throw new Error('Mash save failed');
      }

      if (recipe.boilSteps.length > 0) {
        const boilResponse = await fetch(SAVE_BOIL_SETTINGS_SERVICE_PATH, {
          method: 'POST',
          body: JSON.stringify({ st: recipe.boilSteps }),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        if (!boilResponse.ok) throw new Error('Boil save failed');
      }

      if (recipe.brewSettings && Object.keys(recipe.brewSettings).length > 0) {
        await fetch(BREW_SETTINGS_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(recipe.brewSettings),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
      }

      this.props.enqueueSnackbar('Recipe imported successfully!', { variant: 'success' });
      if (this.props.onImported) this.props.onImported();
    } catch (err) {
      this.props.enqueueSnackbar('Failed to save recipe: ' + err.message, { variant: 'error' });
    }

    this.setState({ loading: false });
  };

  render() {
    const { classes } = this.props;
    const { recipe, recipeName } = this.state;

    return (
      <div className={classes.root}>
        <input
          accept=".bsmx,.xml,.json"
          className={classes.input}
          id="beersmith-upload"
          type="file"
          onChange={this.handleFileChange}
        />
        <label htmlFor="beersmith-upload">
          <Button
            variant="contained"
            component="span"
            color="default"
            className={classes.uploadButton}
          >
            <CloudUploadIcon style={{ marginRight: 8 }} />
            <IntText text="Import.SelectFile" />
          </Button>
        </label>

        {recipe && (
          <Paper className={classes.preview}>
            <Typography variant="h6" style={{ padding: '16px 16px 0 16px' }}>
              {recipeName}
            </Typography>

            {recipe.brewSettings.bt && (
              <div style={{ padding: '0 16px' }}>
                <Chip className={classes.chip} label={`Boil: ${recipe.brewSettings.bt} min`} />
              </div>
            )}

            {recipe.mashSteps.length > 0 && (
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle} style={{ paddingLeft: 16 }}>
                  <IntText text="MashSettings.Settings" /> ({recipe.mashSteps.length} steps)
                </Typography>
                <div className={classes.table}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><IntText text="Name" /></TableCell>
                        <TableCell align="right"><IntText text="Temperature" /></TableCell>
                        <TableCell align="right"><IntText text="Time" /> (min)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recipe.mashSteps.map((step, i) => (
                        <TableRow key={i}>
                          <TableCell>{step.n}</TableCell>
                          <TableCell align="right">{step.t}°C</TableCell>
                          <TableCell align="right">{step.tm}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {recipe.boilSteps.length > 0 && (
              <div>
                <Typography variant="subtitle1" className={classes.sectionTitle} style={{ paddingLeft: 16 }}>
                  <IntText text="BoilSettings.Settings" /> ({recipe.boilSteps.length} additions)
                </Typography>
                <div className={classes.table}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><IntText text="Name" /></TableCell>
                        <TableCell align="right"><IntText text="Time" /> (min)</TableCell>
                        <TableCell align="right"><IntText text="Amount" /> (g)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recipe.boilSteps.map((step, i) => (
                        <TableRow key={i}>
                          <TableCell>{step.n}</TableCell>
                          <TableCell align="right">{step.tm}</TableCell>
                          <TableCell align="right">{step.a}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className={classes.actions} style={{ padding: 16 }}>
              <Button onClick={this.props.onCancel} style={{ marginRight: 8 }}>
                <IntText text="Cancel" />
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={this.saveToDevice}
                disabled={this.state.loading}
              >
                <IntText text="Import.Apply" />
              </Button>
            </div>
          </Paper>
        )}
      </div>
    );
  }
}

export default withSnackbar(withStyles(styles)(BeerSmithImport));
