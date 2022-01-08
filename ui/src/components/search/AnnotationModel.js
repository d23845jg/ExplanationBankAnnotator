import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import TreeContent from './tree/TreeContent';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-annotation-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

function AnnotationModel({ query }) {

  const [tab, setTab] = useState(0);
  const [treeData, setTreeData] = useState([]);

  /*
    Index Map
    0: Premise Selection
    1: Question Answering
  */
  return (
    <div>
      <Tabs value={tab} onChange={(_, value) => { setTab(value); setTreeData([]) }} centered>
        <Tab label="Premise Selection" />
        <Tab label="Question Answering" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <TreeContent treeData={treeData} setTreeData={setTreeData} query={query} />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <TreeContent treeData={treeData} addQA={true} setTreeData={setTreeData} query={query} />
      </TabPanel>
    </div>
  );
};

AnnotationModel.prototype = {
  query: PropTypes.string.isRequired,
};

export default AnnotationModel;
