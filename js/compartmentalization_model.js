import React, { Component } from 'react';
import { Row, Col, Grid, Table } from 'react-bootstrap';
import 'phylotree/phylotree.css';
import MathJax from 'react-mathjax2';

const d3 = require('d3');
const _ = require('underscore');

require("phylotree");


class CompartmentalizationModel extends Component {
  constructor(props) {
    super(props);
    this.state = { cherries: null };
  }
  componentDidMount() {
    this.runCompartmentTest();
  }
  componentDidUpdate() {
    this.runCompartmentTest();
  }
  shouldComponentUpdate(nextProps, nextState) {
    const different_json = nextProps.json != this.props.json,
      different_cherries = nextState.cherries != this.state.cherries,
      should_update = different_json || different_cherries;
    return should_update;
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
        .size([800, 600]);
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
      });
      var cherries = 0;
      tree.traverse_and_compute(function(node){
        if(node.parent) {
          const is_unvisited_cherry = _.every(node.parent.children, function(node) {
            return d3.layout.phylotree.is_leafnode(node) && !node.cherry_visit;
          });
          cherries += is_unvisited_cherry;
        }
        node.cherry_visit = true;
      });
      this.setState({ cherries: cherries });
    }
  }
  render() {
    return (<Row>
      <Col xs={8}>
        <svg id="tree_display" width={600} height={600}></svg>          
      </Col>
      <Col xs={4}>
        <p>Assortativity index distribution will go here.</p>
        <MathJax.Context input='tex'>
          <Table striped hover>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><MathJax.Node>{'C'}</MathJax.Node></td>
                <td><MathJax.Node>{this.state.cherries}</MathJax.Node></td>
              </tr>
            </tbody>
          </Table>
        </MathJax.Context>
      </Col>
    </Row>); 
  }
}

module.exports = CompartmentalizationModel;
