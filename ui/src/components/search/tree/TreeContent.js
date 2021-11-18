import React, { useState } from 'react';
import {
  SortableTreeWithoutDndContext as SortableTree,
  addNodeUnderParent,
  removeNodeAtPath,
} from "react-sortable-tree";
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
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
  sortableTree: {
    height: '75vh',
    paddingTop: theme.spacing(8),
    paddingLeft: theme.spacing(2)
    // isVirtualized={false}
  },
  buttons: {
    float: 'right',
  },
}));

function TreeContent({ query }) {

  const classes = useStyles();

  const [configModal, setConfigModal] = useState({ openModal: false, nodePath: [] });
  const [treeData, setTreeData] = useState([]);
  const [send, setSend] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  /*function getNodeKey({node}) {
    return node.data.unique_id;
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
          data: { unique_id: 0, Statement: query },
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
    try { await saveTreeData(treeData); setSuccess(true); }
    catch (err) { setError(true); }
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
    <div>
      <div className={classes.buttons}>
        <Button variant="outlined" color="primary" endIcon={<AddIcon />} onClick={handleInsertQuery}>
          {'Insert query'}
        </Button>

        <Button style={{ marginLeft: '2vh' }} variant="outlined" color="primary" endIcon={<ClearIcon />} onClick={handleClearTree}>
          {'Clear Tree'}
        </Button>

        <Button style={{ marginLeft: '2vh' }} variant="outlined" color="primary" endIcon={<SaveIcon />} onClick={handleSaveTree} disabled={send}>
          {send ? 'Saving' : 'Save'}
        </Button>
      </div>

      <div className={classes.sortableTree}>
        <TreeAlert value={error} handleAlertClose={handleAlertClose} type={"error"} message={"Tree could not be saved"} />
        <TreeAlert value={success} handleAlertClose={handleAlertClose} type={"success"} message={"Tree was saved successfully"} />
        <AddChildTreeModal openModal={configModal.openModal} handleSubmitModal={handleSubmitModal} handleCloseModal={handleCloseModal} />
        <SortableTree
          treeData={treeData}
          dndType={nodeTypeData}
          onChange={treeData => setTreeData(treeData)}
          generateNodeProps={({ node, path }) => ({
            buttons:
              [
                <IconButton color="default" onClick={() => handleOpenModal(path)}>
                  <AddCircleIcon />
                </IconButton>,
                // The query should not have the delete button
                (node.data.unique_id === '0') ? [] :
                  <IconButton color="default" onClick={() => setTreeData(treeData => removeNodeAtPath({ treeData, path, getNodeKey }))}>
                    <DeleteIcon />
                  </IconButton>
              ],
          })}
        />
      </div>
    </div>
  );
};

TreeContent.prototype = {
  query: PropTypes.string.isRequired,
};

export default TreeContent;