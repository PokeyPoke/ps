import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CandidateCard from './components/CandidateCard';
import './styles/tailwind.css';

const App = () => {
  return (
    <Router>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">2028 Election Popularity Tracker</h1>
        <Switch>
          <Route path="/" exact>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Placeholder for candidate cards */}
              <CandidateCard />
              <CandidateCard />
              <CandidateCard />
            </div>
          </Route>
          {/* Additional routes can be added here */}
        </Switch>
      </div>
    </Router>
  );
};

export default App;