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
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import IntText from '../components/IntText'
import { PageView, initGA } from '../components/Tracking'

class BrewConfiguration extends Component {
  constructor() {
    super();
    this.state = {
      selectedTab: 'MashSettings',
      importOpen: false,
    }
  }

  componentDidMount() {
    initGA('UA-149477072-2');
    PageView();
  }

  handleTabChange = (event, selectedTab) => {
    this.setState({ selectedTab })
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tabs value={selectedTab} onChange={this.handleTabChange} indicatorColor="secondary" textColor="contrastText" fullWidth scrollable style={{ flex: 1 }}>
            <Tab value="MashSettings" label={<IntText text="Mash" />} />
            <Tab value="BoilSettings" label={<IntText text="Boil" />} />
            <Tab value="BrewSettings" label={<IntText text="BrewSettings.Settings" />} />
          </Tabs>
          <Button size="small" onClick={this.handleImportOpen} style={{ margin: '0 12px', whiteSpace: 'nowrap', minWidth: 'auto' }}>
            <CloudUploadIcon style={{ marginRight: 4, fontSize: 18 }} />
            <IntText text="Import.Button" />
          </Button>
        </div>
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
