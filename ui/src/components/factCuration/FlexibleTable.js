import React, {useState} from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import EditModal from './EditModal';


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

function FlexibleTable({useGetAll, updateRow, disabledAttributes, actions}) {

  const classes = useStyles();

  const [openEdit, setOpenEdit] = useState({open: false, data: {}});

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

  const handleOpenEdit = (row) => setOpenEdit({open: true, data: row});
  const handleCloseEdit = () => setOpenEdit({open: false, data: {}});

  // TODO: this approach for the add item has to be changed
  const bb = Object.keys(data[0]).reduce((a, v) => ({ ...a, [v]: ''}), {}) 
  delete bb['unique_id'];

  return (
    <div>
      <EditModal disabledAttributes={disabledAttributes} openModal={openEdit} setOpenModal={setOpenEdit} handleSubmitModal={updateRow} handleCloseModal={handleCloseEdit}/>
      
      <IconButton onClick={() => handleOpenEdit(bb)}>
        <AddIcon />
      </IconButton>
      
      <TableContainer className={classes.page} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/*(tableAttributes.length !== 0) ? tableAttributes.map((column) => (<TableCell key={column}>{column}</TableCell>)): <TableCell>No Data</TableCell>*/}
              {(typeof data[0] !== 'undefined') ? Object.keys(data[0]).map((column) => (<TableCell key={column}>{column}</TableCell>)): <TableCell>No Data</TableCell>}
              {(typeof actions !== 'undefined' && actions.length !== 0) ? <TableCell key={'Action'}>{'Action'}</TableCell> : undefined /* Adding action column if needed */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.unique_id}>
                {Object.values(row).map((value) => (<TableCell key={row.unique_id+value}>{value}</TableCell>))}
                {(typeof actions !== 'undefined' && actions.length !== 0) ? 

                  <TableCell key={'Action'}>
                    {(actions.map((action) => {
                      if (action === 'edit') {
                        return (
                          <IconButton key={action} color="default" onClick={() => handleOpenEdit(row)}>
                            <EditIcon />
                          </IconButton>
                        );
                      }
                      else if (action === 'delete') {
                        return (
                          <IconButton key={action} color="default" onClick={() => null}>
                            <DeleteIcon />
                          </IconButton>
                        );
                      }
                      else {
                        return undefined;
                      }
                    }))}
                  </TableCell>
                  : undefined /* Adding action buttons to the action row if needed */
                }
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

FlexibleTable.propTypes = {
  useGetAll: PropTypes.func.isRequired,
  updateRow: PropTypes.func,
  actions: PropTypes.array,
  disabledAttributes: PropTypes.array,
};

export default FlexibleTable;
