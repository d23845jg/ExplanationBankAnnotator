import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, styled } from '@material-ui/core/styles';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Snackbar from '@material-ui/core/Snackbar';
import { Typography } from '@material-ui/core';

import Alert from '@material-ui/lab/Alert';

import { postAllExplanationBank } from '../hooks/factCuration';


const Input = styled('input')({
  display: 'none',
});

const useStyles = makeStyles((theme) => ({
  page: {
    paddingTop: theme.spacing(2),
  },
}));

function AddNewFacts() {

  const classes = useStyles();

  const [send, setSend] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  async function uploadFile(event) {
    setSend(true);
    //console.log(event.target.files)
    let file = event.target.files[0];

    if (file) {
      let data = new FormData();
      data.append('file', file);

      try { await postAllExplanationBank(file); setSuccess(true); }
      catch (err) { setError(true) }
    }
    setSend(false);
  };

  function handleAlertClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    setError(false);
    setSuccess(false);
  };

  const TreeAlert = ({ value, handleAlertClose, type, message }) => (
    < Snackbar open={value} autoHideDuration={5000} onClose={handleAlertClose} >
      <Alert onClose={handleAlertClose} severity={type} >
        {message}
      </Alert>
    </Snackbar >
  )

  return (
    <div className={classes.page}>
      <TreeAlert value={error} handleAlertClose={handleAlertClose} type={"error"} message={"File could not be saved"} />
      <TreeAlert value={success} handleAlertClose={handleAlertClose} type={"success"} message={"File was saved successfully"} />

      <Typography variant="body1">
        Please upload a csv file that contains your explanation bank information.
      </Typography>

      <label htmlFor="outlined-button-file">
        <Input accept=".csv" id="outlined-button-file" type="file" onChange={uploadFile} />
        <Button variant="outlined" endIcon={send ? <CircularProgress size='1rem'/> : <CloudUploadIcon />} component="span" disabled={send}>
          {send ? 'Uploading File...' : 'Upload File'}
        </Button>
      </label>
    </div>
  );
};

export default AddNewFacts;
