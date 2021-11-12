import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import AddIcon from '@material-ui/icons/Add';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

import EditModal from './EditModal';
import DragTableRow from './DragTableRow';

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
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
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
  paper: {
    width: '100%',
    overflow: 'auto',
  },
  table: {
    maxHeight: '80vh',
  }
}));

function FlexibleTable({ useGetAll, query, updateRow, addButton, filterBurron, draggable, displayCol, actionsCol, disabledAttributes }) {

  const classes = useStyles();

  const [openEdit, setOpenEdit] = useState({ open: false, data: {} });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selFilter, setSelFilter] = useState('all');
  const [textFilter, setTextFilter] = useState('');

  const {
    data,
    isLoading,
    isError
  } = useGetAll();

  if (isLoading) {
    return (
      <div className={classes.loading}>
        <CircularProgress />
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

  let filterData = data.filter((data) => selFilter === 'all' || data.Type === selFilter);
  filterData = filterData.filter((data) => textFilter === '' || data.Statement.toLowerCase().includes(textFilter.toLowerCase()));
  const filterFirstElement = (typeof filterData[0] !== 'undefined') ? filterData[0] : [];

  // If you don't specify the displayCol, the default is to show all
  displayCol = (displayCol.length === 0) ? Object.keys(filterFirstElement) : displayCol;

  const handleOpenEdit = (row) => setOpenEdit({ open: true, data: row });
  const handleCloseEdit = () => setOpenEdit({ open: false, data: {} });

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filterData.length) : 0;

  // TODO: this approach for the add item has to be changed
  const bb = Object.keys(filterFirstElement).reduce((a, v) => ({ ...a, [v]: '' }), {})
  delete bb['unique_id'];

  return (
    <div>
      <EditModal disabledAttributes={disabledAttributes} openModal={openEdit} setOpenModal={setOpenEdit} handleSubmitModal={updateRow} handleCloseModal={handleCloseEdit} />

      <TableContainer className={classes.table} component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell colSpan={displayCol.length + 1}>
                <div>
                  <TextField
                    label="Filter by statement"
                    variant="outlined"
                    value={textFilter}
                    onChange={(event) => setTextFilter(event.target.value)}
                  />

                  {(addButton) ?
                    <Button
                      style={{ float: 'right' }}
                      variant="outlined"
                      endIcon={<AddIcon />}
                      onClick={() => handleOpenEdit(bb)}
                    >
                      Create
                    </Button>
                    : undefined
                  }

                  {(filterBurron) ?
                    <Select
                      style={{ marginLeft: '2vh' }}
                      variant="outlined"
                      value={selFilter}
                      onChange={(event) => setSelFilter(event.target.value)}
                    >
                      <MenuItem value={'all'}>all</MenuItem>
                      <MenuItem value={'statement'}>statement</MenuItem>
                      <MenuItem value={'guideline'}>guideline</MenuItem>
                      <MenuItem value={'cancer_term_definition'}>cancer_term_definition</MenuItem>
                      <MenuItem value={'drug_dictionary_definition'}>drug_dictionary_definition</MenuItem>
                      <MenuItem value={'genetics_term_definition'}>genetics_term_definition</MenuItem>
                    </Select>
                    : undefined
                  }
                </div>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableHead>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={displayCol.length + 1}
                count={filterData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableHead>

          <TableHead>
            <TableRow>
              {/*(tableAttributes.length !== 0) ? tableAttributes.map((column) => (<TableCell key={column}>{column}</TableCell>)): <TableCell>No Data</TableCell>*/}
              {(typeof filterFirstElement !== 'undefined') ? Object.keys(filterFirstElement).map((column) => (displayCol.includes(column)) ?
                (<TableCell key={column}>{column}</TableCell>) : undefined)
                : <TableCell>No Data</TableCell>
              }
              {(actionsCol.length !== 0) ? <TableCell key={'Action'}>{'Action'}</TableCell> : undefined /* Adding action column if needed */}
            </TableRow>
          </TableHead>

          <TableBody>
            {(rowsPerPage > 0
              ? filterData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : filterData
            ).map((row) => (<DragTableRow key={row.unique_id} draggable={draggable} query={query} data={row} displayCol={displayCol} actionsCol={actionsCol} actionsFunc={[() => handleOpenEdit(row), (() => undefined)]} />)
            )}

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

FlexibleTable.defaultProps = {
  query: '',
  updateRow: () => undefined,
  addButton: false,
  filterButton: false,
  draggable: false,
  displayCol: [],
  actionsCol: [],
  disabledAttributes: []
}

FlexibleTable.propTypes = {
  useGetAll: PropTypes.func.isRequired,
  query: PropTypes.string,
  updateRow: PropTypes.func,
  addButton: PropTypes.bool,
  filterButton: PropTypes.bool,
  draggable: PropTypes.bool,
  displayCol: PropTypes.array,
  actionsCol: PropTypes.array,
  disabledAttributes: PropTypes.array,
};

export default FlexibleTable;
