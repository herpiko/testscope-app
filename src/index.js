import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const origin = console.error;
console.error = (error) => {
  if (/Loading chunk [\d]+ failed/.test(error.message)) {
    alert('A new version released. Need to reload the page to apply changes.');
    window.location.reload();
  } else {
    origin(error);
  }
};

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
