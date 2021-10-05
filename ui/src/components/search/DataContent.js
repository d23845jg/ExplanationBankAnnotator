import React, {useState} from 'react';
import { DragSource } from 'react-dnd';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { alpha, makeStyles } from '@material-ui/core/styles';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: alpha('#3f51b5', 0.2),
    '&:hover': {
      backgroundColor: alpha('#3f51b5', 0.4),
    },
  },
  expand: {
    transform: 'rotate(0deg)',
    marginTop: theme.spacing(0),
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  }
}));

export const nodeTypeData = 'card';
const nodeSpec = {
  beginDrag: componentProps => ({ node: { 
    title: componentProps.data.statement, 
    expanded: true, 
    data: {unique_id: componentProps.data.unique_id, statement: componentProps.data.statement},
  }})
};
const nodeCollect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  // isDragging: !!monitor.isDragging(),
  // didDrop: !!monitor.didDrop(),
});

function DataContent({ data, claim, connectDragSource}) {

  const [expanded, setExpanded] = useState(false);

  const classes = useStyles();

  function createData({ title, sentence }) {
    return(
      <div>
        <Typography variant='subtitle1' color='textSecondary' >
          {title}
        </Typography>
        <Typography variant='body1' gutterBottom>
          {sentence}
        </Typography>
      </div>
    );
  }

  return connectDragSource(
    <div>
      <Card className={classes.root}>
        <CardHeader
          action={
            <IconButton 
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={() => setExpanded(!expanded)}
            >
              <ExpandMoreIcon />
            </IconButton>
          }
          title={createData({title:'', sentence:data.statement})}
        />
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            {createData({title:'Cosine Similarity', sentence:data.cosine_similarity})}
            {createData({title:'Resource', sentence:data.resource})}
          </CardContent>
        </Collapse>
      </Card>
    </div>,
    { dropEffect: 'copy' }
  );
};

DataContent.propTypes = {
  data: PropTypes.object.isRequired,
  claim: PropTypes.string.isRequired,
  connectDragSource: PropTypes.func.isRequired,
};

export default DragSource(
  nodeTypeData,
  nodeSpec,
  nodeCollect
)(DataContent);
