import React from 'react';
import { useHistory } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Link from '@material-ui/core/Link';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { fade, makeStyles } from '@material-ui/core/styles';

import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginLeft: 0,
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  link: {
    color: theme.palette.common.white,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
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
    color: theme.palette.common.white,
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
      width: '30ch',
      '&:focus': {
        width: '50ch',
      },
    },
  },
  offset: theme.mixins.toolbar,
}));

function Header() {
  const history = useHistory();
  const classes = useStyles();

  function keyPress(event){
    // keyCode 13 is Enter key
    if(event.keyCode === 13){
       history.push(`/search?query=${event.target.value}`) // TODO: chage this
    }
 }


  return (
    <div className={classes.root}>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography className={classes.title} variant='h6' noWrap>
            <Link href="/" className={classes.link}>
              Cancer Explanation Fact Curation
            </Link>
          </Typography>
          <div className={classes.search}>
            <div className={classes.searchIconButton}>
              <IconButton type='submit'>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              </IconButton>
            </div>
            <InputBase
              placeholder='Search facts by ID …'
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              onKeyDown={keyPress}
              autoFocus
            />
          </div>
        </Toolbar>
      </AppBar>
      <div className={classes.offset} />
    </div>
  );
}

export default Header;