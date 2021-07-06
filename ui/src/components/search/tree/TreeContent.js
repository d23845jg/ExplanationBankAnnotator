import React, {useState} from 'react';
import { SortableTreeWithoutDndContext as SortableTree, addNodeUnderParent, removeNodeAtPath} from "react-sortable-tree";
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';

import { nodeTypeData } from '../DataContent';
import AddChildTreeModal from './AddChildTreeModal';
import { saveTreeData } from '../../../hooks/tree';

const useStyles = makeStyles((theme) => ({
  alert: {
    paddingTop: theme.spacing(7),
  },
  sortableTree: {
    height: '80vh', // TODO
    // isVirtualized={false}
  },
  buttons: {
    margin: theme.spacing(1),
    float: 'right',
  },
}));

function TreeContent({claim}) {

  const classes = useStyles();

  const [configModal, setConfigModal] = useState({ openModal: false, nodePath: []});
  const [treeData, setTreeData] = useState([
    { title: claim, expanded: true, data: {unique_id: '0', sentence: claim} }
  ]);
  const [sending, setSending] = useState(false);

  /*function getNodeKey({node}) {
    return node.data.unique_id;
  }*/

  function getNodeKey({treeIndex}) {
    return treeIndex;
  }

  function handleOpenModal(path) {
    setConfigModal({ openModal: true, nodePath: path});
  };

  function handleSubmitModal(data) {
    setTreeData(treeData => 
      addNodeUnderParent({
        treeData: treeData,
        parentKey: configModal.nodePath[configModal.nodePath.length - 1],
        expandParent: true,
        getNodeKey,
        newNode: {
          title: data.sentence,
          expanded: true,
          data
        }
      }).treeData
    );
    setConfigModal({ openModal: false, nodePath: []});
  };

  function handleCloseModal() {
    setConfigModal({ openModal: false, nodePath: []});
  };

  async function handleSaveTree() {
    setSending(true);
    await saveTreeData(treeData);
    setSending(false);
  };

  return (
    <div className={classes.sortableTree}>
      <AddChildTreeModal openModal={configModal.openModal} handleSubmitModal={handleSubmitModal} handleCloseModal={handleCloseModal}/>
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
            <IconButton color="default" onClick={() => setTreeData(treeData => removeNodeAtPath({treeData,path,getNodeKey}))}>
              <DeleteIcon />
            </IconButton>
          ],
        })}
      />
      
      <div className={classes.buttons}>
        <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSaveTree} disabled={sending}>
          {sending ? 'Saving' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

TreeContent.propTypes = {
  claim: PropTypes.string.isRequired,
};

export default TreeContent;