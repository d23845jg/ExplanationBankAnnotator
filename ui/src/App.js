import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Header from './components/Header';
import FactContent from './components/factCuration/FactContent';
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
          <Route path='/find' component={FactContent}/>
        </Switch>
      </Router>

    </div>
  );
}

export default App;