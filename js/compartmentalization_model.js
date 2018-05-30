import React, { Component } from 'react';
import { Row, Col, Grid, Table } from 'react-bootstrap';
import 'phylotree/phylotree.css';

const d3 = require('d3');
const _ = require('underscore');

require("phylotree");


class CompartmentalizationModel extends Component {
  componentDidMount() {
    this.runCompartmentTest();
  }
  componentDidUpdate() {
    this.runCompartmentTest();
  }
  runCompartmentTest() {
    if(this.props.json) {
      const { newick, regexes } = this.props.json,
        tree_svg = d3.select('#tree_display');
      tree_svg.html('');
      var tree = d3.layout.phylotree()
        .svg(tree_svg)
        .options({
          'left-right-spacing': 'fit-to-size',
          'top-bottom-spacing': 'fit-to-size'
        })
        .size([600, 600]);
      tree(newick)
        .layout();
      const label_to_color = d3.scale.category10()
        .domain(regexes);
      tree.style_edges(function(element, data) {
        regexes.forEach(regex_string=>{
          if(data.target[regex_string]) {
            element.style("stroke", label_to_color(regex_string));
          }
        });
      });
      regexes.forEach((regex_string, index)=>{
        tree.selection_label(regex_string);
        const regex = new RegExp(regex_string);
        tree.modify_selection(node => {
          return regex.test(node.target.name)
        })
        tree.max_parsimony(true);
      });
      tree.update();
    }
  }
  render() {
    return (<Row>
      <Col xs={8}>
        <svg id="tree_display" width={600} height={600}></svg>          
      </Col>
      <Col xs={4}>
        <Table striped hover>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>); 
  }
}

module.exports = CompartmentalizationModel;
