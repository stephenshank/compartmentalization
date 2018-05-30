import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Nav, Navbar, NavItem, NavDropdown, MenuItem, Grid } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import CompartmentalizationModel from './compartmentalization_model.js';

const d3 = require('d3');
require('./app.css');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { json: null };
  }
  componentDidMount() {
    this.loadDataset('NotCompartmentalized');
  }
  loadDataset(dataset) {
    d3.json(`/data/${dataset}.json`, (error, json) => {
      this.setState({json: json});
    });
  }
  onSelect(dataset) {
    this.loadDataset(dataset);
  }
  render(){
    const datasets = ['Compartmentalized', 'NotCompartmentalized'];
    return (<div>
      <Navbar fixedTop onSelect={key=>this.onSelect(key)}>
        <Navbar.Header>
          <Navbar.Brand>
            VEG Compartmentalization Models
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <NavDropdown title='Dataset' id='dataset-dropdown'>
            {datasets.map(dataset => {
              return (<MenuItem eventKey={dataset} key={dataset}>
                {dataset}
              </MenuItem>);
            })}
          </NavDropdown>
        </Nav>
      </Navbar>
      <Grid>
        <CompartmentalizationModel json={this.state.json} />
      </Grid>
    </div>);
  }
}

ReactDOM.render(
  <App />,
  document.body.appendChild(document.createElement('div'))
)
