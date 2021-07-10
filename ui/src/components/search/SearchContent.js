import React from 'react'
import { useLocation } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import { useCancerQuery } from '../../hooks/cancer';
import DataContent from './DataContent';
import TreeContent from './tree/TreeContent';

const useStyles = makeStyles((theme) => ({
  loading: {
    width: '10%',
    marginTop: theme.spacing(5),
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  alert: {
    width: '80%',
    marginTop: theme.spacing(5),
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  page: {
    width: '100%',
    paddingTop: theme.spacing(2),
  },
  grid: {
    justify: 'space-evenly',
    alignItems: 'center',
    float: 'left', 
    width: "50%",
    height: '100vh', // Check if scroll is needed or pagination
    overflow: 'auto',
  },
  sortableTree: {
    float: 'right',
    width: '50%',
  }
}));

function SearchContent() {

  const classes = useStyles();

  const { search } = useLocation();
  const query = search.match(/query=(.*)/)?.[1];
  
  const {
    data,
    isLoading,
    isError
  } = useCancerQuery(query);
  
  if (isLoading) {
    return (
      <div className={classes.loading}>
        <CircularProgress  />
      </div>
    );
  } else if (isError) {
    return (
      <Alert className={classes.alert} severity='error'>
        <AlertTitle>Error - {isError.message}</AlertTitle>
        {isError.message}
      </Alert>
    );
  }

  function addDataToGrid(data) {
    return (
      <Grid key={data.unique_id} item xs={6}>
        <DataContent data={data} claim={query}/>
      </Grid>
    );
  }
  
  return (
    <div className={classes.page}>
      <div className={classes.grid}>
        <Grid container spacing={2}>
          {data.map(addDataToGrid)}
        </Grid>
      </div>
      <div className={classes.sortableTree}>
        <TreeContent claim={query}/>
      </div>
    </div>
    
  );
};

export default SearchContent;