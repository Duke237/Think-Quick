import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Splash from './components/Splash';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import './styles/App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/splash" component={Splash} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
};

export default App;