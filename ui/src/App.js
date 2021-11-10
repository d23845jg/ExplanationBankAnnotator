import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Header from './components/Header';
import MainContent from './components/MainContent';
import SearchContent from './components/search/SearchContent';

function App() {
  
  return (
    <div className='App'>
      <Router>
        <Header />
        <Switch>
          <Route path='/' exact component={MainContent}/>
          <Route path='/search' component={SearchContent}/>
        </Switch>
      </Router>

    </div>
  );
}

export default App;