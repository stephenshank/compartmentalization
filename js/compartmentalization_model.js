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
    this.state = { r: null };
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
      var number_of_compartments = regexes.length,
        cherry_counts = d3.range(number_of_compartments)
          .map(d=>d3.range(number_of_compartments).map(e=>0)),
        number_of_cherries = 0,
        i, j;
      tree.traverse_and_compute(function(node){
        if(node.parent) {
          const is_unvisited_cherry = _.every(node.parent.children, function(node) {
            return d3.layout.phylotree.is_leafnode(node) && !node.cherry_visit;
          });
          if(is_unvisited_cherry && node.parent.children.length == 2) {
            number_of_cherries++;
            const first_child = node.parent.children[0],
              second_child = node.parent.children[1];
            regexes.forEach((d, index) => { 
              if(first_child[d]) {
                i = index;
              }
              if(second_child[d]) {
                j = index;
              }
            });
            cherry_counts[i][j] += .5;
            cherry_counts[j][i] += .5;
          } else if (is_unvisited_cherry && node.parent.children.length > 2) {
            console.log('TRIFURCATING CHERRY!');
          }
        }
        node.cherry_visit = true;
      });
      
      var a = d3.range(number_of_compartments).map(d=>0),
        b = d3.range(number_of_compartments).map(d=>0),
        sumieii = 0;
      for(let i=0; i<number_of_compartments; i++) {
        sumieii += cherry_counts[i][i]/number_of_cherries;
        for(let j=0; j<number_of_compartments; j++) {
          a[i] += cherry_counts[i][j]/number_of_cherries;
          b[j] += cherry_counts[i][j]/number_of_cherries;
        }
      }
      const a_dot_b = a.map((d,i)=>d*b[i]).reduce((a,b)=>a+b,0),
        numerator = sumieii-a_dot_b,
        denominator = 1-a_dot_b,
        r = numerator/denominator;
      this.setState({r: r});

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
        <MathJax.Context input='tex'>
          <MathJax.Node>{'r='+this.state.r}</MathJax.Node>
        </MathJax.Context>
        <p>Assortativity index distribution will go here.</p>
      </Col>
    </Row>); 
  }
}

module.exports = CompartmentalizationModel;
