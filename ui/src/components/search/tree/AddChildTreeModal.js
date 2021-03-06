import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import AddCircleIcon from '@material-ui/icons/AddCircle';

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '40%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  form: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  }
}));

function AddChildTreeModal({openModal, handleSubmitModal, handleCloseModal}) {

  const classes = useStyles();

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = useState(getModalStyle);
  const[fact, setFact] = useState({_id: -1, Statement: '', Resource: ''});

  const body = (
    <div style={modalStyle} className={classes.paper}>
      <Typography variant='h5' color='textPrimary' >
        Create new statement
      </Typography>
      <Divider />
      
      <form className={classes.form} noValidate autoComplete="off">
        <TextField variant="outlined" label="Input New Fact" value={fact.Statement} onChange={(event) => setFact({...fact, Statement: event.target.value})} />
      </form>
      
      <form className={classes.form} noValidate autoComplete="off">
        <TextField variant="outlined"  label="Input Resource" value={fact.Resource} onChange={(event) => setFact({...fact, Resource: event.target.value})} />
      </form>

      <Button variant="contained" color="primary" endIcon={<AddCircleIcon />} onClick={() => {
        handleSubmitModal(fact);
        setFact({});
      }}>
        Create
      </Button>
    </div>
  );

  return (
    <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="add-child-to-tree-modal">
      {body}
    </Modal>
  );
};

AddChildTreeModal.propTypes = {
  openModal: PropTypes.bool.isRequired,
  handleSubmitModal: PropTypes.func.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
};

export default AddChildTreeModal;