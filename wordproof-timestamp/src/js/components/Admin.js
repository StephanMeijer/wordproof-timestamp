import React, { Component } from 'react'
import './Admin.scss'
import Dashboard from './Tabs/Dashboard/Dashboard';
import Configure from './Tabs/Configure/Configure';
import Customize from './Tabs/Customize/Customize';
import Timestamp from './Tabs/Timestamp/Timestamp';
import Support from './Tabs/Support/Support';
import Learn from './Tabs/Learn/Learn';

export default class Admin extends Component {

  constructor(props) {
    super(props)
    this.state = {
      hash: '',
      content: ''
    }
  }

  componentDidMount() {
    window.addEventListener("hashchange", () => {
      this.setState({hash: window.location.hash})
    }, false)
    this.setState({hash: window.location.hash})
  }

  isActive = (tab) => {
    return this.state.hash === tab
  }

  activeTab = (...tabs) => {
    if (tabs.includes(this.state.hash)) {
      return 'nav-tab-active'
    } else {
      return ''
    }
  }

  tabContent = (hash) => {
    switch(hash) {
      case '#configure':
        return <Configure />;
      case '#customize':
        return <Customize />;
      case '#timestamp':
        return <Timestamp />;
      case '#support':
        return <Support />;
      case '#learn':
        return <Learn />;
      default:
        return <Dashboard />
    }
  }

  render () {
    return (
      <div className='wordproof-admin-app'>
        <h2 className="nav-tab-wrapper">
          <a href="#dashboard" className={`nav-tab ${this.activeTab('', '#dashboard')}`}>Dashboard</a>
          <a href="#configure" className={`nav-tab ${this.activeTab('#configure')}`}>1. Configure</a>
          <a href="#customize" className={`nav-tab ${this.activeTab('#customize')}`}>2. Customize</a>
          <a href="#timestamp" className={`nav-tab ${this.activeTab('#timestamp')}`}>3. Timestamp</a>
          <a href="#support" className={`nav-tab ${this.activeTab('#support')}`}>Support</a>
          <a href="#learn" className={`nav-tab ${this.activeTab('#learn')}`}>Learn</a>
        </h2>
        <div className="tab-content">
          { this.tabContent(this.state.hash) }
        </div>
      </div>
    )
  }
}