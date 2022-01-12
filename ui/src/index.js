import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import 'react-sortable-tree/style.css';

// ReactDOM.render(
//   <DndProvider backend={HTML5Backend}>
//     <App />
//   </DndProvider>,
//   document.getElementById('root')
// );

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

