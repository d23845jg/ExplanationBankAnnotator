import React, {useState} from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import FlexibleTable from './FlexibleTable';
import { 
  useGetAllGuidelines, 
  useGetAllStatements,
  postAGuidelines,
  postAStatement,
} from '../hooks/factCuration';

function MainContent() {

  const [value, setValue] = useState(0);

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

  return (
    <div>

      <Tabs value={value} onChange={(_, value) => setValue(value)}>
        <Tab label="Create new fact"/>
        <Tab label="View all definitions"/>
        <Tab label="View all statements"/>
        <Tab label="View all guidelines"/>
      </Tabs>

      <TabPanel value={value} index={0}>
        Item One, Crete new fact
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two, ver todos los definitions
      </TabPanel>
      <TabPanel value={value} index={2}>
      <FlexibleTable useGetAll={useGetAllStatements} updateRow={postAStatement} disabledAttributes={['unique_id']} actions={['edit', 'delete']}/>
      </TabPanel>
      <TabPanel value={value} index={3}>
        <FlexibleTable useGetAll={useGetAllGuidelines} updateRow={postAGuidelines} disabledAttributes={['unique_id']} actions={['edit', 'delete']}/>
      </TabPanel>

    </div>
  );
};

export default MainContent;
