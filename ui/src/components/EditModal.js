import React, {useState} from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import SaveAltIcon from '@material-ui/icons/SaveAlt';

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
}));

function EditModal({disabledAttributes, openModal, setOpenModal, handleSubmitModal, handleCloseModal}) {

  const classes = useStyles();

  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = useState(getModalStyle);

  const handleChange = ({ value, key}) => {
    setOpenModal({
      ...openModal,
      data: {
        ...openModal.data,
        [key]: value,
      }
    })
  };
  
  const body = (
    <div style={modalStyle} className={classes.paper}>
      {
        Object.keys(openModal.data).map((key) => {
          return(
            <div key={key}>
              <Typography variant='h5' color='textPrimary' >
                {key}
              </Typography>
              <TextField
                disabled={disabledAttributes.includes(key)}
                required
                fullWidth
                defaultValue={openModal.data[key]}
                onChange={(event) => handleChange({value: event.target.value, key})}
              />
              <br />
              <br />
            </div>
          );
        })
      }
      <Button variant="contained" color="primary" endIcon={<SaveAltIcon />} onClick={() => {
        handleSubmitModal(openModal.data);
        handleCloseModal();
      }}>
        Save
      </Button>
    </div>
  );

  return (
    <Modal open={openModal.open} onClose={handleCloseModal}>
      {body}
    </Modal>
  );
};

EditModal.prototype = {
  disabledAttributes: PropTypes.array.isRequired,
  openModal: {
    open: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
  },
  setOpenModal: PropTypes.func.isRequired,
  handleSubmitModal: PropTypes.func.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
};

export default EditModal;
