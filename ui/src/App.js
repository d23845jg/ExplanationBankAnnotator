import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Header from './components/Header';
import MainContent from './components/MainContent';


function App() {

  return (
    <div className='App'>
      <Router>
        <Header />
        <Switch>
          <Route path='/' exact component={MainContent} />
          <Route path='/search' component={MainContent} />

          {/* TODO: create Notfound component*/}
          <Route component={() => <div>hola</div>} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;