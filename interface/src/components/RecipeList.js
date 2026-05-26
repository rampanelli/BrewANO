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
import Chip from '@material-ui/core/Chip';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import GetAppIcon from '@material-ui/icons/GetApp';
import SearchIcon from '@material-ui/icons/Search';
import { LIST_RECIPES_ENDPOINT, SAVE_RECIPE_ENDPOINT, DELETE_RECIPE_ENDPOINT, ACTIVATE_RECIPE_ENDPOINT, GET_RECIPE_ENDPOINT } from '../constants/Endpoints';
import { ExecuteRestCall } from '../components/Utils';
import { parseBeerSmithFile } from '../utils/BeerSmithImporter';
import IntText from '../components/IntText';
import LayoutContext from '../context/LayoutContext';

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
    gap: theme.spacing.unit,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.unit * 2,
    flexWrap: 'wrap',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.unit,
    flexWrap: 'wrap',
  },
  searchField: {
    minWidth: 200,
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'visible',
  },
  cardContent: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: '4px 8px',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  beerParams: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: theme.spacing.unit,
  },
  param: {
    padding: '2px 8px',
    backgroundColor: theme.palette.type === 'dark' ? '#424242' : '#e8eaf6',
    borderRadius: 4,
    fontSize: '0.7rem',
    fontWeight: 500,
    color: theme.palette.type === 'dark' ? '#ccc' : '#3f51b5',
  },
  empty: {
    textAlign: 'center',
    padding: theme.spacing.unit * 4,
    color: theme.palette.text.secondary,
  },
  recipeName: {
    fontWeight: 600,
    fontSize: '0.95rem',
    marginBottom: 4,
  },
  stepCount: {
    fontSize: '0.7rem',
    color: theme.palette.text.secondary,
    marginTop: 4,
  },
  sortChip: {
    marginRight: 4,
  },
});

class RecipeList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
      importOpen: false,
      importRecipes: [],
      importSaving: false,
      search: '',
      sortBy: 'newest',
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

  handleDuplicate = (recipe) => {
    ExecuteRestCall(GET_RECIPE_ENDPOINT + '?id=' + recipe.id, 'GET', (fullRecipe) => {
      const body = {
        name: (fullRecipe.name || recipe.name) + ' (copy)',
        mashSteps: fullRecipe.mashSteps || [],
        boilSteps: fullRecipe.boilSteps || [],
        brewSettings: fullRecipe.brewSettings || {},
        beerParams: fullRecipe.beerParams || { ibu: 0, abv: 0, cor: 0, fg: 0 },
        impressions: fullRecipe.impressions || '',
      };
      fetch(SAVE_RECIPE_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      }).then(response => {
        if (response.ok) {
          this.props.enqueueSnackbar('Recipe duplicated!', { variant: 'success' });
          this.loadRecipes();
        } else {
          this.props.enqueueSnackbar('Failed to duplicate recipe.', { variant: 'error' });
        }
      });
    }, () => {
      this.props.enqueueSnackbar('Failed to load recipe for duplicate.', { variant: 'error' });
    }, this.props);
  };

  handleExport = (recipe) => {
    ExecuteRestCall(GET_RECIPE_ENDPOINT + '?id=' + recipe.id, 'GET', (fullRecipe) => {
      const exportData = {
        name: fullRecipe.name || recipe.name,
        mashSteps: fullRecipe.mashSteps || [],
        boilSteps: fullRecipe.boilSteps || [],
        brewSettings: fullRecipe.brewSettings || {},
        beerParams: fullRecipe.beerParams || {},
        impressions: fullRecipe.impressions || '',
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (exportData.name || 'recipe') + '.json';
      a.click();
      URL.revokeObjectURL(url);
      this.props.enqueueSnackbar('Recipe exported!', { variant: 'success' });
    }, () => {
      this.props.enqueueSnackbar('Failed to export recipe.', { variant: 'error' });
    }, this.props);
  };

  handleImportOpen = () => {
    this.setState({ importOpen: true, importRecipes: [] });
  };

  handleImportClose = () => {
    this.setState({ importOpen: false, importRecipes: [] });
  };

  handleImportFile = (e) => {
    const files = [].slice.call(e.target.files);
    if (!files.length) return;
    this.setState({ importRecipes: [] });

    var loaded = 0;
    const recipes = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        loaded++;
        try {
          const result = parseBeerSmithFile(event.target.result, file.name);
          var baseName = file.name.replace(/\.(bsmx|xml|json)$/i, '');
          if (!baseName || baseName === file.name) baseName = file.name;
          recipes.push({
            name: baseName,
            mashSteps: result.mashSteps || [],
            boilSteps: result.boilSteps || [],
            brewSettings: result.brewSettings || {},
          });
        } catch (err) {
          this.props.enqueueSnackbar('Failed to parse: ' + file.name, { variant: 'error' });
        }
        if (loaded === files.length) {
          if (recipes.length === 0) {
            this.props.enqueueSnackbar('No valid recipes found.', { variant: 'warning' });
          }
          this.setState({ importRecipes: recipes });
        }
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  handleImportSave = async () => {
    const { importRecipes } = this.state;
    if (!importRecipes.length) return;

    this.setState({ importSaving: true });
    var saved = 0;
    var failed = 0;
    var total = importRecipes.length;

    for (var i = 0; i < importRecipes.length; i++) {
      var recipe = importRecipes[i];
      var body = {
        name: recipe.name || ('Recipe ' + (i + 1)),
        mashSteps: recipe.mashSteps,
        boilSteps: recipe.boilSteps,
        brewSettings: recipe.brewSettings || {},
        beerParams: { ibu: 0, abv: 0, cor: 0, fg: 0 },
        impressions: '',
      };

      try {
        var response = await fetch(SAVE_RECIPE_ENDPOINT, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          saved++;
        } else {
          failed++;
        }
      } catch (err) {
        failed++;
      }
    }

    if (saved === total) {
      this.props.enqueueSnackbar(saved + ' recipe(s) imported!', { variant: 'success' });
    } else if (saved > 0) {
      this.props.enqueueSnackbar(saved + ' saved, ' + failed + ' failed.', { variant: 'warning' });
    } else {
      this.props.enqueueSnackbar('Failed to import recipes. Check device connection.', { variant: 'error' });
    }

    this.handleImportClose();
    this.loadRecipes();
    this.setState({ importSaving: false });
  };

  getFilteredAndSorted() {
    const { recipes, search, sortBy } = this.state;
    let filtered = recipes;
    if (search) {
      const s = search.toLowerCase();
      filtered = recipes.filter(r => (r.name || '').toLowerCase().includes(s));
    }
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
      if (sortBy === 'oldest') return (a.id || 0) - (b.id || 0);
      return 0;
    });
    return sorted;
  }

  renderBeerParams(recipe) {
    const { classes } = this.props;
    const bp = recipe.beerParams || {};
    const hasParams = bp.ibu > 0 || bp.abv > 0 || bp.cor > 0 || bp.fg > 0;
    if (!hasParams) return null;
    return (
      <div className={classes.beerParams}>
        {bp.ibu > 0 && <span className={classes.param}>IBU {bp.ibu}</span>}
        {bp.abv > 0 && <span className={classes.param}>ABV {bp.abv}%</span>}
        {bp.cor > 0 && <span className={classes.param}>EBC {bp.cor}</span>}
        {bp.fg > 0 && <span className={classes.param}>FG {bp.fg}</span>}
      </div>
    );
  }

  render() {
    const { classes } = this.props;
    const { importOpen, importRecipes, importSaving, search, sortBy } = this.state;
    const filtered = this.getFilteredAndSorted();

    return (
      <LayoutContext.Consumer>
        {({ modernLayout }) => (
          <div className={classes.root}>
            <div className={classes.header}>
              <div className={classes.headerLeft}>
                <Typography variant={modernLayout ? "h6" : "h6"}>
                  <IntText text="Recipe.List" />
                </Typography>
                <TextField
                  className={classes.searchField}
                  placeholder="Buscar receitas..."
                  value={search}
                  onChange={e => this.setState({ search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  margin="none"
                />
                <div>
                  <Chip
                    label="A-Z"
                    size="small"
                    className={classes.sortChip}
                    variant={sortBy === 'name' ? 'default' : 'outlined'}
                    color={sortBy === 'name' ? 'primary' : 'default'}
                    onClick={() => this.handleSortChange('name')}
                  />
                  <Chip
                    label="Newest"
                    size="small"
                    className={classes.sortChip}
                    variant={sortBy === 'newest' ? 'default' : 'outlined'}
                    color={sortBy === 'newest' ? 'primary' : 'default'}
                    onClick={() => this.handleSortChange('newest')}
                  />
                  <Chip
                    label="Oldest"
                    size="small"
                    className={classes.sortChip}
                    variant={sortBy === 'oldest' ? 'default' : 'outlined'}
                    color={sortBy === 'oldest' ? 'primary' : 'default'}
                    onClick={() => this.handleSortChange('oldest')}
                  />
                </div>
              </div>
              <div className={classes.headerRight}>
                <input
                  accept=".bsmx,.xml,.json"
                  style={{ display: 'none' }}
                  id="recipe-import-file"
                  type="file"
                  multiple
                  onChange={this.handleImportFile}
                />
                <Button
                  variant="contained"
                  color={modernLayout ? "secondary" : "primary"}
                  size="small"
                  onClick={this.handleImportOpen}
                >
                  <AddIcon style={{ marginRight: 4 }} />
                  <IntText text="Recipe.New" />
                </Button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className={classes.empty}>
                <Typography color="textSecondary">
                  <IntText text="Recipe.NoRecipes" />
                </Typography>
              </div>
            ) : (
              <Grid container spacing={16}>
                {filtered.map(recipe => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                    <Card className={classes.card}>
                      <CardContent className={classes.cardContent}>
                        <Typography className={classes.recipeName} noWrap>
                          {recipe.name || 'Recipe #' + recipe.id}
                        </Typography>
                        {recipe.mashStepsCount || recipe.boilStepsCount ? (
                          <Typography className={classes.stepCount}>
                            {(recipe.mashStepsCount || 0)} mash · {(recipe.boilStepsCount || 0)} boil
                          </Typography>
                        ) : null}
                        {this.renderBeerParams(recipe)}
                      </CardContent>
                      <CardActions className={classes.cardActions}>
                        <Tooltip title="Activate">
                          <IconButton size="small" onClick={() => this.handleActivate(recipe)}>
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => this.handleEdit(recipe)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <IconButton size="small" onClick={() => this.handleDuplicate(recipe)}>
                            <FileCopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export">
                          <IconButton size="small" onClick={() => this.handleExport(recipe)}>
                            <GetAppIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => this.handleDelete(recipe)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
                {importRecipes.length > 0 ? (
                  <div>
                    <Typography variant="subtitle2" style={{ marginBottom: 8 }}>
                      {importRecipes.length} file(s) parsed successfully
                    </Typography>
                    {importRecipes.map((r, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <TextField
                          label={<IntText text="Name" />}
                          value={r.name}
                          onChange={e => {
                            const updated = [...importRecipes];
                            updated[i].name = e.target.value;
                            this.setState({ importRecipes: updated });
                          }}
                          fullWidth
                          margin="dense"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {r.mashSteps.length} mash steps, {r.boilSteps.length} hop additions
                        </Typography>
                      </div>
                    ))}
                  </div>
                ) : null}
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleImportClose}><IntText text="Cancel" /></Button>
                <Button onClick={this.handleImportSave} variant="contained" color="primary" disabled={!importRecipes.length || importSaving}>
                  <IntText text="Import.Apply" /> ({importRecipes.length})
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </LayoutContext.Consumer>
    );
  }
}

export default withSnackbar(withStyles(styles)(RecipeList));
