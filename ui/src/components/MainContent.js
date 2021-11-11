import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import FlexibleTable from './FlexibleTable';
import SearchContent from './search/SearchContent';
import {
  useGetAllDefinitions,
  useGetAllGuidelines,
  useGetAllStatements,
  postAGuidelines,
  postAStatement,
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
        <Tab label="View all definitions" />
        <Tab label="View all statements" />
        <Tab label="View all guidelines" />
      </Tabs>

      <TabPanel value={value} index={0}>
        <SearchContent />
      </TabPanel>
      <TabPanel value={value} index={9 /*TODO: change index*/}>
        <FlexibleTable useGetAll={useGetAllDefinitions} disabledAttributes={['unique_id']} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <FlexibleTable useGetAll={useGetAllStatements} updateRow={postAStatement} disabledAttributes={['unique_id']} addButton={true} actionsCol={['edit']} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <FlexibleTable useGetAll={useGetAllGuidelines} updateRow={postAGuidelines} disabledAttributes={['unique_id']} addButton={true} actionsCol={['edit']} />
      </TabPanel>
    </div>
  );
};

export default MainContent;
