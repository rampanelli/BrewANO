import React, { Component } from 'react';
import AppLayout from '../components/AppLayout';
import OTASettings from './OTASettings';
import { PageView, initGA, Event } from '../components/Tracking'
import IntText from '../components/IntText'

class OTAConfiguration extends Component {
  componentDidMount() {
    initGA('UA-149477072-2');
    PageView();
  }

  render() {
    return (
      <AppLayout sectionTitle={<IntText text="OTASettings.OTAConfiguration" />}>
        <OTASettings />
      </AppLayout>
    )
  }
}

export default OTAConfiguration
