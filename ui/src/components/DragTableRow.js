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
  beginDrag: componentProps => {
    return ({
      node: {
        title: componentProps.data.Statement,
        expanded: true,
        query: componentProps.query,
        data: componentProps.data,
        allQueryData: componentProps.allQueryData,
      }
    });
  }
};
const nodeCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  // isDragging: !!monitor.isDragging(),
  // didDrop: !!monitor.didDrop(),
});

function DragTableRow({ actionsCol, actionsFunc, data, showDisplayCol, draggable, connectDragSource }) {

  return (
    <TableRow innerRef={instance => (draggable) ? connectDragSource(instance) : instance}>
      {/*Object.values(data).map((value) => (<TableCell key={data._id+value}>{value}</TableCell>))*/}
      {Object.keys(data).map((key) => (showDisplayCol.includes(key)) ? (<TableCell key={data._id + data[key]}>{data[key]}</TableCell>) : undefined)}

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
            if (action === 'delete') {
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
  query: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  allQueryData: PropTypes.array.isRequired,
  draggable: PropTypes.bool.isRequired,
  showDisplayCol: PropTypes.array.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource(
  nodeTypeData,
  nodeSpec,
  nodeCollect
)(DragTableRow);