import React, { Component } from 'react';
import AppLayout from '../components/AppLayout';
import Brew from './Brew'
import { PageView, initGA, Event } from '../components/Tracking'

class BrewConfiguration extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    initGA('UA-149477072-2');
    PageView();
  }

  render() {
    return (
      <AppLayout sectionTitle="Brew">
        <Brew />
      </AppLayout>
    )
  }
}

export default BrewConfiguration
