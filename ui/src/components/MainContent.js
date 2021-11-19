import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import AddNewFacts from './AddNewFacts';
import FlexibleTable from './FlexibleTable';
import SearchContent from './search/SearchContent';
import {
  useGetAllFacts,
  postAFact,
} from '../hooks/factCuration';


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function MainContent() {

  const [value, setValue] = useState(0);

  return (
    <div>
      <Tabs value={value} onChange={(_, value) => setValue(value)}>
        <Tab label="Search" />
        <Tab label="Add new facts" />
        <Tab label="View all facts" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <SearchContent />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AddNewFacts />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <FlexibleTable useGetAll={useGetAllFacts} updateRow={postAFact} hideDisplayCol={['unique_id', 'Embedding']} disabledAttributes={['unique_id', 'Embedding']} addButton={true} filterBurron={true} actionsCol={['edit']} />
      </TabPanel>
    </div>
  );
};

export default MainContent;
