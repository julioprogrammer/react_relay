import React from 'react'
import { render } from 'react-dom'
import App from './App'
import CreatePage from './CreatePage'
import registerServiceWorker from './registerServiceWorker'
import { Router, Route, browserHistory } from 'react-router'

render (
    <Router history={browserHistory}>
        <Route path='/' component={App} />
        <Route path='/create' component={CreatePage} />
    </Router>, 
    document.getElementById('root')
)
registerServiceWorker()
