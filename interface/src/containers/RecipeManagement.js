import React, { Component } from 'react';
import MenuAppBar from '../components/MenuAppBar';
import RecipeList from '../components/RecipeList';
import RecipeEditor from '../components/RecipeEditor';
import IntText from '../components/IntText';

class RecipeManagement extends Component {
  constructor() {
    super();
    this.state = {
      view: 'list',
      editRecipeId: null,
    };
  }

  handleEdit = (recipeId) => {
    this.setState({ view: 'edit', editRecipeId: recipeId });
  };

  handleBack = () => {
    this.setState({ view: 'list', editRecipeId: null });
  };

  handleSaved = () => {
    this.setState({ view: 'list', editRecipeId: null });
  };

  render() {
    const { view, editRecipeId } = this.state;

    return (
      <MenuAppBar sectionTitle={<IntText text="Recipe.Title" />}>
        {view === 'list' && (
          <RecipeList onEdit={this.handleEdit} />
        )}
        {view === 'edit' && (
          <RecipeEditor recipeId={editRecipeId} onBack={this.handleBack} onSaved={this.handleSaved} />
        )}
      </MenuAppBar>
    );
  }
}

export default RecipeManagement;
