import React, { useState } from 'react';
import {
  SortableTreeWithoutDndContext as SortableTree,
  addNodeUnderParent,
  removeNodeAtPath,
} from "react-sortable-tree";
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';

import Alert from '@material-ui/lab/Alert';

import { nodeTypeData } from '../../DragTableRow';
import AddChildTreeModal from './AddChildTreeModal';
import { saveTreeData } from '../../../hooks/tree';


const useStyles = makeStyles((theme) => ({
  treeArea: {
    paddingTop: '1rem',
  },
  sortableTree: {
    height: '60vh',
    paddingTop: theme.spacing(8),
    paddingLeft: theme.spacing(2)
    // isVirtualized={false}
  },
  sortableTreeTitle: {
    width: "55vh",
    overflow: 'scroll',
  },
  treeButtons: {
    float: 'right',
  },
  textInput: {
    paddingRight: '1rem',
    paddingBottom: '1rem',
  },
}));

function TreeContent({ treeData, setTreeData, query, addQA }) {

  const classes = useStyles();

  const [configModal, setConfigModal] = useState({ openModal: false, nodePath: [] });
  const [send, setSend] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savesuccess, setSaveSuccess] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  /*function getNodeKey({node}) {
    return node.data._id;
  }*/

  function getNodeKey({ treeIndex }) {
    return treeIndex;
  }

  function handleOpenModal(path) {
    setConfigModal({ openModal: true, nodePath: path });
  };

  function handleSubmitModal(data) {
    setTreeData(treeData =>
      addNodeUnderParent({
        treeData: treeData,
        parentKey: configModal.nodePath[configModal.nodePath.length - 1],
        expandParent: true,
        getNodeKey,
        newNode: {
          title: data.Statement,
          expanded: true,
          query,
          data,
          allQueryData: [],
        }
      }).treeData
    );
    setConfigModal({ openModal: false, nodePath: [] });
  };

  function handleCloseModal() {
    setConfigModal({ openModal: false, nodePath: [] });
  };

  function handleInsertQuery() {
    setTreeData(treeData =>
      addNodeUnderParent({
        treeData: treeData,
        parentKey: configModal.nodePath[configModal.nodePath.length - 1],
        expandParent: true,
        getNodeKey,
        newNode: {
          title: query,
          expanded: true,
          query,
          data: { _id: 0, Statement: query },
          allQueryData: [],
        }
      }).treeData
    );
  };

  function handleClearTree() {
    setTreeData([]);
  };

  async function handleSaveTree() {
    setSend(true);
    try {
      var data = { 'proof': treeData }
      if (addQA) {
        data['question'] = question
        data['answer'] = answer
      }
      await saveTreeData(data);
      setSaveSuccess(true);
      setTreeData([]);
      setQuestion('');
      setAnswer('');
    }
    catch (err) { setSaveError(true); }
    setSend(false);
  };

  function handleAlertClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }
    setSaveError(false);
    setSaveSuccess(false);
  };

  const TreeAlert = ({ value, handleAlertClose, type, message }) => (
    < Snackbar open={value} autoHideDuration={5000} onClose={handleAlertClose} >
      <Alert onClose={handleAlertClose} severity={type} >
        {message}
      </Alert>
    </Snackbar >
  );

  function createTextField({ title, value, setValue }) {
    return (
      <TextField
        className={classes.textInput}
        label={title}
        variant="outlined"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    );
  };

  return (
    <div>
      {
        (addQA) ?
          (
            <div>
              {createTextField({ title: 'Question', value: question, setValue: setQuestion })}
              {createTextField({ title: 'Answer', value: answer, setValue: setAnswer })}
              <Divider />
            </div>
          )
          : <div />
      }

      <div className={classes.treeArea}>
        <div className={classes.treeButtons}>
          <Button variant="outlined" color="primary" endIcon={<AddIcon />} onClick={handleInsertQuery}>
            {'Insert query'}
          </Button>

          <Button style={{ marginLeft: '2vh' }} variant="outlined" color="primary" endIcon={<ClearIcon />} onClick={handleClearTree}>
            {'Clear'}
          </Button>

          <Button style={{ marginLeft: '2vh' }} variant="outlined" color="primary" endIcon={<SaveIcon />} onClick={handleSaveTree} disabled={send}>
            {send ? 'Saving' : 'Save'}
          </Button>
        </div>

        <div className={classes.sortableTree}>
          <TreeAlert value={saveError} handleAlertClose={handleAlertClose} type={"error"} message={"Tree could not be saved"} />
          <TreeAlert value={savesuccess} handleAlertClose={handleAlertClose} type={"success"} message={"Tree was saved successfully"} />
          <AddChildTreeModal openModal={configModal.openModal} handleSubmitModal={handleSubmitModal} handleCloseModal={handleCloseModal} />
          <SortableTree
            treeData={treeData}
            dndType={nodeTypeData}
            onChange={treeData => setTreeData(treeData)}
            generateNodeProps={({ node, path }) => ({
              title: (
                <div className={classes.sortableTreeTitle}>
                  {node.title}
                </div>
              ),
              buttons:
                [
                  <IconButton color="default" onClick={() => handleOpenModal(path)}>
                    <AddCircleIcon />
                  </IconButton>,
                  // The query should not have the delete button
                  (node.data._id === '0') ? [] :
                    <IconButton color="default" onClick={() => setTreeData(treeData => removeNodeAtPath({ treeData, path, getNodeKey }))}>
                      <DeleteIcon />
                    </IconButton>
                ],
            })}
          />
        </div>
      </div >
    </div>
  );
};

TreeContent.defaultProps = {
  addQA: false,
};

TreeContent.prototype = {
  treeData: PropTypes.array.isRequired,
  setTreeData: PropTypes.func.isRequired,
  addQA: PropTypes.bool,
  query: PropTypes.string.isRequired,
};

export default TreeContent;