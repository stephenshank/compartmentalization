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
  componentWillReceiveProps(nextProps) {
    this.runCompartmentTest(nextProps);
  }
  runCompartmentTest(nextProps) {
    if(nextProps.json) {
      const { newick, regexes } = nextProps.json,
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
      var cherries = 0,
        cherries11 = 0,
        cherries12 = 0,
        cherries22 = 0;
      tree.traverse_and_compute(function(node){
        if(node.parent) {
          const is_unvisited_cherry = _.every(node.parent.children, function(node) {
            return d3.layout.phylotree.is_leafnode(node) && !node.cherry_visit;
          });
          if(is_unvisited_cherry && node.parent.children.length == 2) {
            if(node.parent.children[0][regexes[0]] && node.parent.children[1][regexes[0]]) {
              cherries11++;
            } else if(node.parent.children[0][regexes[1]] && node.parent.children[1][regexes[1]]) {
              cherries22++;
            } else {
              cherries12++;
            }
          } else if (is_unvisited_cherry && node.parent.children.length > 2) {
            console.log('TRIFURCATING CHERRY!');
          }
          cherries += is_unvisited_cherry;
        }
        node.cherry_visit = true;
      });

      const legend = tree_svg.append('g')
        .attr('transform', 'translate(550, 50)')
        .selectAll('g')
        .data(regexes)
        .enter()
        .append('g');
      legend.append('text')
          .attr('x', 30)
          .attr('y', (d,i) => 30*i+15)
          .text(d=>d);
      legend.append('rect')
        .attr('x', 0)
        .attr('y', (d,i) => 30*i)
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', (d,i) => i == regexes.length-1 ? 'red' : label_to_color(d));

      const E = [
        [ cherries11/cherries, cherries12/(2*cherries)],
        [ cherries12/(2*cherries), cherries22/cherries]
      ],
        a = [ E[0][0] + E[0][1], E[1][0]+E[1][1] ],
        b = [ E[0][0] + E[1][0], E[0][1]+E[1][1] ],
        numerator = E[0][0]+E[1][1]-(a[0]*b[0]+a[1]*b[1]),
        denominator = 1 - ((a[0]*b[0]+a[1]*b[1])),
        r = numerator / denominator;
      this.setState({
        cherries: cherries,
        cherries11: cherries11,
        cherries12: cherries12,
        cherries22: cherries22,
        r: r
      });
    }
  }
  render() {
    return (<Row>
      <Col xs={12}>
        <Row>
          <h3>{this.props.json ? this.props.json.dataset : 'Loading...'}</h3>
        </Row>
      </Col>
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
              <tr>
                <td><MathJax.Node>{'C_{11}'}</MathJax.Node></td>
                <td><MathJax.Node>{this.state.cherries11}</MathJax.Node></td>
              </tr>
              <tr>
                <td><MathJax.Node>{'C_{12}'}</MathJax.Node></td>
                <td><MathJax.Node>{this.state.cherries12}</MathJax.Node></td>
              </tr>
              <tr>
                <td><MathJax.Node>{'C_{22}'}</MathJax.Node></td>
                <td><MathJax.Node>{this.state.cherries22}</MathJax.Node></td>
              </tr>
              <tr>
                <td><MathJax.Node>{'r'}</MathJax.Node></td>
                <td><MathJax.Node>{this.state.r}</MathJax.Node></td>
              </tr>
            </tbody>
          </Table>
        </MathJax.Context>
      </Col>
    </Row>); 
  }
}

module.exports = CompartmentalizationModel;
