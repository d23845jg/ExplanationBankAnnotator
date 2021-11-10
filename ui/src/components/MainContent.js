import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import { alpha, makeStyles } from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';

import FlexibleTable from './FlexibleTable';
import {
  useGetAllDefinitions,
  useGetAllGuidelines,
  useGetAllStatements,
  postAGuidelines,
  postAStatement,
} from '../hooks/factCuration';


const useStyles = makeStyles((theme) => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.black, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIconButton: {
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    color: theme.palette.common.black,
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '100ch',
      '&:focus': {
        width: '150ch',
      },
    },
  },
  paper: {
    maxHeight: '92vh',
  },
}));

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

  const history = useHistory();
  const classes = useStyles();

  const [value, setValue] = useState(0);

  function keyPressSearch(event) {
    // keyCode 13 is Enter key
    if (event.keyCode === 13) {
      history.push(`/search?query=${event.target.value}`)
    }
  }

  return (
    <div>
      <Paper className={classes.paper}>
        <Tabs value={value} onChange={(_, value) => setValue(value)}>
          <Tab label="Search" />
          <Tab label="View all definitions" />
          <Tab label="View all statements" />
          <Tab label="View all guidelines" />
        </Tabs>

        <TabPanel value={value} index={0}>
          <div className={classes.search}>
            <div className={classes.searchIconButton}>
              <IconButton type='submit'>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
              </IconButton>
            </div>
            <InputBase
              placeholder='Search'
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              onKeyDown={keyPressSearch}
            />
          </div>
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
      </Paper>
    </div>
  );
};

export default MainContent;
