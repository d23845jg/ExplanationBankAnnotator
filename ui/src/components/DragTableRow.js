import React from 'react';
import { DragSource } from 'react-dnd';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';


export const nodeTypeData = 'row';
const nodeSpec = {
  beginDrag: componentProps => ({ node: { 
    title: componentProps.data.statement, 
    expanded: true, 
    data: {unique_id: componentProps.data.unique_id, statement: componentProps.data.statement, type: componentProps.data.type},
  }})
};
const nodeCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  // isDragging: !!monitor.isDragging(),
  // didDrop: !!monitor.didDrop(),
});

function DragTableRow({ actionsCol, actionsFunc, data, draggable, connectDragSource }) {

  return (
    <TableRow innerRef={instance => (draggable) ? connectDragSource(instance) : instance}>
      {Object.values(data).map((value) => (<TableCell key={data.unique_id+value}>{value}</TableCell>))}
      
      {(actionsCol.length !== 0) ? 
        <TableCell key={'Action'}>
          {(actionsCol.map((action) => {
            if (action === 'edit') {
              return (
                <IconButton key={action} color="default" onClick={actionsFunc[0]}>
                  <EditIcon />
                </IconButton>
              );
            }
            else if (action === 'delete') {
              return (
                <IconButton key={action} color="default" onClick={actionsFunc[1]}>
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
  );
};

DragTableRow.propTypes = {
  actionsCol: PropTypes.array.isRequired,
  actionsFunc: PropTypes.arrayOf(PropTypes.func).isRequired,
  data: PropTypes.object.isRequired,
  draggable: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource(
  nodeTypeData,
  nodeSpec,
  nodeCollect
)(DragTableRow);