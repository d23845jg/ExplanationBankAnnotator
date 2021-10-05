import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';


import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import EditModal from './EditModal';

function TablePaginationActions({ count, page, rowsPerPage, onPageChange }) {
  const theme = useTheme();

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box >
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};


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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // TODO: this approach for the add item has to be changed
  const bb = Object.keys(data[0]).reduce((a, v) => ({ ...a, [v]: ''}), {}) 
  delete bb['unique_id'];

  return (
    <div>
      <EditModal disabledAttributes={disabledAttributes} openModal={openEdit} setOpenModal={setOpenEdit} handleSubmitModal={updateRow} handleCloseModal={handleCloseEdit}/>
      
      <TableContainer className={classes.page} component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <IconButton onClick={() => handleOpenEdit(bb)}>
                  <AddIcon />
                </IconButton>
              </TableCell>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={Object.keys(data[0]).length}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: {
                    'aria-label': 'rows per page',
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
            
            <TableRow>
              {/*(tableAttributes.length !== 0) ? tableAttributes.map((column) => (<TableCell key={column}>{column}</TableCell>)): <TableCell>No Data</TableCell>*/}
              {(typeof data[0] !== 'undefined') ? Object.keys(data[0]).map((column) => (<TableCell key={column}>{column}</TableCell>)): <TableCell>No Data</TableCell>}
              {(typeof actions !== 'undefined' && actions.length !== 0) ? <TableCell key={'Action'}>{'Action'}</TableCell> : undefined /* Adding action column if needed */}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map((row) => (
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

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
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
