import React from 'react';
import { DragSource } from 'react-dnd';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import EditIcon from '@material-ui/icons/Edit';


export const nodeTypeData = 'row';
const nodeSpec = {
  beginDrag: componentProps => {
    console.log(componentProps);
    return ({
    node: {
      title: componentProps.data.Statement,
      expanded: true,
      data: { unique_id: componentProps.data.unique_id, statement: componentProps.data.Statement, type: componentProps.data.Type, query: componentProps.query },
    }
  })
}};
const nodeCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  // isDragging: !!monitor.isDragging(),
  // didDrop: !!monitor.didDrop(),
});

function DragTableRow({ actionsCol, actionsFunc, query, data, displayCol, draggable, connectDragSource }) {

  return (
    <TableRow innerRef={instance => (draggable) ? connectDragSource(instance) : instance}>
      {/*Object.values(data).map((value) => (<TableCell key={data.unique_id+value}>{value}</TableCell>))*/}
      {Object.keys(data).map((key) => (displayCol.includes(key)) ? (<TableCell key={data.unique_id + data[key]}>{data[key]}</TableCell>) : undefined)}

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
  draggable: PropTypes.bool.isRequired,
  displayCol: PropTypes.array.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource(
  nodeTypeData,
  nodeSpec,
  nodeCollect
)(DragTableRow);