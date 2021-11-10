import React from 'react';
import { useLocation } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { useCancerQuery } from '../../hooks/cancer';
import TreeContent from './tree/TreeContent';
import FlexibleTable from '../FlexibleTable';

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
  const query = search.match(/query=(.*)/)[1];

  const useGetCancerFacts = () => useCancerQuery(query);
  
  return (
    <div className={classes.page}>
      <div className={classes.grid}>
        <FlexibleTable useGetAll={useGetCancerFacts} filterBurron={true} draggable={true} displayCol={['Statement', 'Resource', 'Type']} disabledAttributes={[]}/>
      </div>
      <div className={classes.sortableTree}>
        <TreeContent claim={query}/>
      </div>
    </div>
    
  );
};

export default SearchContent;