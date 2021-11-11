import React, {useState} from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import { alpha, makeStyles } from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';

import { useCancerQuery } from '../../hooks/cancer';
import TreeContent from './tree/TreeContent';
import FlexibleTable from '../FlexibleTable';

const useStyles = makeStyles((theme) => ({
  page: {
    paddingTop: theme.spacing(2),
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.black, 0.25),
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
    width: '93vw',

  },
  content: {
    paddingTop: theme.spacing(2),
  },
  grid: {
    float: 'left',
    width: "50%",
  },
  sortableTree: {
    float: 'right',
    width: '50%',
  }
}));

function SearchContent() {

  const classes = useStyles();
  const history = useHistory();
  const { search } = useLocation();

  function keyPressSearch(event) {
    // keyCode 13 is Enter key
    if (event.keyCode === 13) {
      history.push(`/search?query=${event.target.value}`)
    }
  }

  let useGetCancerFacts = () => ({
    data: [],
    isLoading: false,
    isError: false,
  });

  let query = '';
  if (search.length !== 0) {
    query = search.match(/query=(.*)/)[1];
    useGetCancerFacts = () => useCancerQuery(query);
  }

  const [value, setValue] = useState(query);

  return (
    <div className={classes.page}>
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
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={keyPressSearch}
        />
      </div>

      {(query.length !== 0) ?
        (
          <div className={classes.content}>
            <div className={classes.grid}>
              <FlexibleTable useGetAll={useGetCancerFacts} query={query} filterBurron={true} draggable={true} displayCol={['Statement', 'Resource', 'Type']} disabledAttributes={[]} />
            </div>
            <div className={classes.sortableTree}>
              <TreeContent />
            </div>
          </div>
        )
        : null
      }
    </div>
  );
};

export default SearchContent;