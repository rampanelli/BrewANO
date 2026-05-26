import React, { Component } from 'react';
import AppLayout from '../components/AppLayout';
import About from './About'
import { PageView, initGA, Event } from '../components/Tracking'
import IntText from '../components/IntText'

class AboutContainer extends Component {
  constructor() {
    super();
  }

  componentDidMount() {
    initGA('UA-149477072-2');
    PageView();
  }

  render() {
    const { data, fetched, errorMessage } = this.props;
    return (
      <AppLayout sectionTitle={<IntText text="About" />}>
        <About />
      </AppLayout>
    )
  }
}

export default AboutContainer
