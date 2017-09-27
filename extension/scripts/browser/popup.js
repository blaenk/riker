import React from 'react';
import ReactDOM from 'react-dom';

import Popup from '../components/Popup/Popup';

function onLoad(_event) {
  ReactDOM.render(<Popup />, document.querySelector('#root'));
}

document.addEventListener('DOMContentLoaded', onLoad);
