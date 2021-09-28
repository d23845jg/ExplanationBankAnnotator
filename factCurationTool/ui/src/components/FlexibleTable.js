import React from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

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
  }
}));

function FlexibleTable({useGetAll}) {

  const classes = useStyles();

  const {
    data,
    isLoading,
    isError
  } = useGetAll();

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
  
  return (
    <TableContainer className={classes.page} component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {Object.keys(data[0]).map((column) => (<TableCell key={column}>{column}</TableCell>))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.unique_id}>
              {Object.values(row).map((value) => (<TableCell key={row.unique_id+value}>{value}</TableCell>))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

FlexibleTable.propTypes = {
  useGetAll: PropTypes.func.isRequired,
};

export default FlexibleTable;
