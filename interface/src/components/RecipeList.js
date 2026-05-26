import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import { LIST_RECIPES_ENDPOINT, SAVE_RECIPE_ENDPOINT, DELETE_RECIPE_ENDPOINT, ACTIVATE_RECIPE_ENDPOINT, GET_RECIPE_ENDPOINT } from '../constants/Endpoints';
import { ExecuteRestCall } from '../components/Utils';
import { parseBeerSmithFile } from '../utils/BeerSmithImporter';
import IntText from '../components/IntText';

const styles = theme => ({
  root: {
    padding: theme.spacing.unit * 2,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.unit * 2,
    flexWrap: 'wrap',
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  beerParams: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.unit,
    marginTop: theme.spacing.unit,
  },
  param: {
    padding: '2px 8px',
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : '#e0e0e0',
    borderRadius: 4,
    fontSize: '0.75rem',
  },
  empty: {
    textAlign: 'center',
    padding: theme.spacing.unit * 4,
    color: theme.palette.text.secondary,
  },
});

class RecipeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
      importOpen: false,
      importName: '',
    };
  }

  componentDidMount() {
    this.loadRecipes();
  }

  loadRecipes = () => {
    ExecuteRestCall(LIST_RECIPES_ENDPOINT, 'GET', json => {
      this.setState({ recipes: json.recipes || [] });
    }, null, this.props);
  };

  handleActivate = (recipe) => {
    fetch(ACTIVATE_RECIPE_ENDPOINT + '?id=' + recipe.id, { method: 'POST' })
      .then(response => {
        if (response.ok) {
          this.props.enqueueSnackbar('Recipe activated!', { variant: 'success' });
        } else {
          this.props.enqueueSnackbar('Failed to activate recipe.', { variant: 'error' });
        }
      });
  };

  handleDelete = (recipe) => {
    if (window.confirm('Delete recipe "' + recipe.name + '"?')) {
      fetch(DELETE_RECIPE_ENDPOINT + '?id=' + recipe.id, { method: 'DELETE' })
        .then(response => {
          if (response.ok) {
            this.loadRecipes();
            this.props.enqueueSnackbar('Recipe deleted.', { variant: 'info' });
          } else {
            this.props.enqueueSnackbar('Failed to delete recipe.', { variant: 'error' });
          }
        });
    }
  };

  handleEdit = (recipe) => {
    if (this.props.onEdit) this.props.onEdit(recipe.id);
  };

  handleImportOpen = () => {
    this.setState({ importOpen: true, importName: '', importRecipe: null });
    if (this.props.onImport) this.props.onImport(true);
  };

  handleImportClose = () => {
    this.setState({ importOpen: false });
    if (this.props.onImport) this.props.onImport(false);
  };

  handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = parseBeerSmithFile(event.target.result, file.name);
        if (!result.mashSteps.length && !result.boilSteps.length) {
          this.props.enqueueSnackbar('No mash steps or hop additions found.', { variant: 'warning' });
          return;
        }
        this.setState({
          importRecipe: result,
          importName: file.name.replace(/\.(bsmx|xml|json)$/i, ''),
        });
      } catch (err) {
        this.props.enqueueSnackbar(err.message || 'Failed to parse file.', { variant: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  handleImportSave = () => {
    const { importRecipe, importName } = this.state;
    if (!importRecipe) return;

    const body = {
      name: importName,
      mashSteps: importRecipe.mashSteps,
      boilSteps: importRecipe.boilSteps,
      brewSettings: importRecipe.brewSettings || {},
      beerParams: { ibu: 0, abv: 0, cor: 0, fg: 0 },
      impressions: '',
    };

    fetch(SAVE_RECIPE_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    })
      .then(response => {
        if (response.ok) {
          this.props.enqueueSnackbar('Recipe imported!', { variant: 'success' });
          this.handleImportClose();
          this.loadRecipes();
        } else {
          this.props.enqueueSnackbar('Failed to save recipe.', { variant: 'error' });
        }
      });
  };

  renderBeerParams(recipe) {
    const { classes } = this.props;
    const bp = recipe.beerParams || {};
    const hasParams = bp.ibu > 0 || bp.abv > 0 || bp.cor > 0 || bp.fg > 0;
    if (!hasParams) return null;
    return (
      <div className={classes.beerParams}>
        {bp.ibu > 0 && <span className={classes.param}>IBU: {bp.ibu}</span>}
        {bp.abv > 0 && <span className={classes.param}>ABV: {bp.abv}%</span>}
        {bp.cor > 0 && <span className={classes.param}>COR: {bp.cor}</span>}
        {bp.fg > 0 && <span className={classes.param}>FG: {bp.fg}</span>}
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const { recipes, importOpen, importName, importRecipe } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.header}>
          <Typography variant="h6"><IntText text="Recipe.List" /></Typography>
          <div>
            <input
              accept=".bsmx,.xml,.json"
              style={{ display: 'none' }}
              id="recipe-import-file"
              type="file"
              onChange={this.handleImportFile}
            />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={this.handleImportOpen}
              style={{ marginRight: 8 }}
            >
              <AddIcon style={{ marginRight: 4 }} />
              <IntText text="Recipe.New" />
            </Button>
          </div>
        </div>

        {recipes.length === 0 ? (
          <Typography className={classes.empty}>
            <IntText text="Recipe.NoRecipes" />
          </Typography>
        ) : (
          <Grid container spacing={16}>
            {recipes.map(recipe => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                <Card className={classes.card}>
                  <CardContent className={classes.cardContent}>
                    <Typography variant="subtitle1" noWrap>
                      {recipe.name || 'Recipe #' + recipe.id}
                    </Typography>
                    {this.renderBeerParams(recipe)}
                  </CardContent>
                  <CardActions className={classes.cardActions}>
                    <IconButton size="small" onClick={() => this.handleActivate(recipe)} title="Activate">
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => this.handleEdit(recipe)} title="Edit">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => this.handleDelete(recipe)} title="Delete">
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={importOpen} onClose={this.handleImportClose} maxWidth="md" fullWidth>
          <DialogTitle><IntText text="Import.Title" /></DialogTitle>
          <DialogContent>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="recipe-import-file">
                <Button variant="outlined" component="span">
                  <CloudUploadIcon style={{ marginRight: 8 }} />
                  <IntText text="Import.SelectFile" />
                </Button>
              </label>
            </div>
            {importRecipe ? (
              <div>
                <TextField
                  label={<IntText text="Name" />}
                  value={importName}
                  onChange={e => this.setState({ importName: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <Typography variant="subtitle2" style={{ marginTop: 8 }}>
                  {importRecipe.mashSteps.length} mash steps, {importRecipe.boilSteps.length} hop additions
                </Typography>
              </div>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleImportClose}><IntText text="Cancel" /></Button>
            <Button onClick={this.handleImportSave} variant="contained" color="primary" disabled={!importRecipe}>
              <IntText text="Import.Apply" />
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default withSnackbar(withStyles(styles)(RecipeList));
