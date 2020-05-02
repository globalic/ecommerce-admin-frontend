import React from 'react';
import ReactDOM from 'react-dom';
import { createBrowserHistory } from 'history';
import {
  // HashRouter,
  BrowserRouter, Route, Switch,
} from 'react-router-dom';
import './assets/css/material-dashboard-react.css';
import indexRoutes from './routes/index';
import Auth from './services/Auth';

const hist = createBrowserHistory();

ReactDOM.render(
  <BrowserRouter history={hist}>
    <Switch>
      {indexRoutes.map((prop) => {
        if (Auth.isSignedIn()) {
          return (
            <Route
              path={prop.path}
              component={prop.component}
              key={prop.path}
            />
          );
        }
        return (
          <Route
            path={prop.path}
            component={prop.component}
            key={prop.path}
          />
        );
      })}
    </Switch>
  </BrowserRouter>,
  document.getElementById('root'),
);
