import React, { Component } from 'react';
import AppLayout from '../components/AppLayout';
import MashSettings from './MashSettings';
import BoilSettings from './BoilSettings';
import BrewSettings from './BrewSettings'
import BeerSmithImport from '../components/BeerSmithImport'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IntText from '../components/IntText'
import { PageView, initGA, Event } from '../components/Tracking'

class BrewConfiguration extends Component {
  constructor() {
    super();
    this.state = {
      selectedTab: 'MashSettings',
      importOpen: false
    }
  }

  componentDidMount() {
    initGA('UA-149477072-2');
    PageView();
  }

  handleTabChange = (event, selectedTab) => {
    this.setState({
      selectedTab: selectedTab
    })
  }

  handleImportOpen = () => {
    this.setState({ importOpen: true });
  }

  handleImportClose = () => {
    this.setState({ importOpen: false });
  }

  render() {
    const { selectedTab, importOpen } = this.state
    return (
      <AppLayout sectionTitle="Brew Settings">
        <Tabs value={selectedTab} onChange={this.handleTabChange} indicatorColor="secondary" textColor="contrastText" fullWidth scrollable>
          <Tab value="MashSettings" label={<IntText text="Mash" />} />
          <Tab value="BoilSettings" label={<IntText text="Boil" />} />
          <Tab value="BrewSettings" label={<IntText text="BrewSettings.Settings" />} />
        </Tabs>
        <Button
          variant="outlined"
          size="small"
          onClick={this.handleImportOpen}
          style={{ margin: '8px 12px' }}
        >
          <IntText text="Import.Button" />
        </Button>
        <Dialog open={importOpen} onClose={this.handleImportClose} maxWidth="md" fullWidth>
          <DialogTitle><IntText text="Import.Title" /></DialogTitle>
          <DialogContent>
            <BeerSmithImport
              onCancel={this.handleImportClose}
              onImported={() => {
                this.handleImportClose();
                window.location.reload();
              }}
            />
          </DialogContent>
        </Dialog>
        {selectedTab === "MashSettings" && <MashSettings />}
        {selectedTab === "BoilSettings" && <BoilSettings />}
        {selectedTab === "BrewSettings" && <BrewSettings />}
      </AppLayout>
    )
  }
}

export default BrewConfiguration
