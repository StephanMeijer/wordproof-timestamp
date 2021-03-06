import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from "./components/Settings/Dashboard";
import Settings from "./components/Settings/Settings";
import Bulk from "./components/Settings/Bulk";
import Support from "./components/Settings/Support";
import Upgrade from "./components/Settings/Upgrade";
import Timestamps from "./components/Settings/Timestamps";

import './components/Settings/Settings.scss';

if (document.querySelector('#wordproof-admin-app-dashboard')) {
  ReactDOM.render(<Dashboard/>, document.querySelector('#wordproof-admin-app-dashboard'));
}

if (document.querySelector('#wordproof-admin-app-settings')) {
  ReactDOM.render(<Settings/>, document.querySelector('#wordproof-admin-app-settings'));
}

if (document.querySelector('#wordproof-admin-app-bulk')) {
  ReactDOM.render(<Bulk/>, document.querySelector('#wordproof-admin-app-bulk'));
}

if (document.querySelector('#wordproof-admin-app-support')) {
  ReactDOM.render(<Support/>, document.querySelector('#wordproof-admin-app-support'));
}

if (document.querySelector('#wordproof-admin-app-upgrade')) {
  ReactDOM.render(<Upgrade/>, document.querySelector('#wordproof-admin-app-upgrade'));
}

if (document.querySelector('#wordproof-admin-app-timestamps')) {
  ReactDOM.render(<Timestamps/>, document.querySelector('#wordproof-admin-app-timestamps'));
}
