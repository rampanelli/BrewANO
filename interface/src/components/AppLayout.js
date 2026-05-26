import React from 'react';
import PropTypes from 'prop-types';
import MenuAppBar from './MenuAppBar';
import ModernMenuAppBar from './ModernMenuAppBar';
import LayoutContext from '../context/LayoutContext';

function AppLayout(props) {
  return (
    <LayoutContext.Consumer>
      {({ modernLayout }) => {
        if (modernLayout) {
          return <ModernMenuAppBar {...props} />;
        }
        return <MenuAppBar {...props} />;
      }}
    </LayoutContext.Consumer>
  );
}

AppLayout.propTypes = {
  sectionTitle: PropTypes.string,
  children: PropTypes.node,
};

export default AppLayout;
