import React, {Component} from "react";
import './Svg.css'
import {getRawSvg, getSwatchPatternFileUrl, SWATCHES_FILES} from "../../../functions/Api";
import {select} from 'd3-selection';

export default class Svg extends Component {

  static defaultProps = {
    fill: '#ffffff'
  };

  state = {
    svgContent: null,
  };


  constructor(props) {
    super(props);

    this.svgContainerRef = React.createRef();
  }


  async loadSvg() {
    const svg = await getRawSvg(this.props.sku);

    return new Promise((resolve) => {
      this.setState({svgContent: svg}, resolve);
    });
  }


  async componentDidMount() {
    await this.loadSvg();
    this.defineSwatches();
    this.replaceColors();
    this.setMaxBoundaries();
  }


  async componentDidUpdate(prevProps) {
    if (this.props.sku !== prevProps.sku) {
      await this.loadSvg();
      this.defineSwatches();
      this.replaceColors();
      this.setMaxBoundaries();
    }

    if (this.props.fill !== prevProps.fill) {
      this.replaceColors();
    }

    if (this.props.innerSvgStyle !== prevProps.innerSvgStyle && this.props.innerSvgStyle) {
      let svgEl = this.svgContainerRef.current.querySelector('svg');

      if (svgEl) {
        svgEl.style = Object.keys(this.props.innerSvgStyle)
          .map(key => `${key}: ${this.props.innerSvgStyle[key]}`)
          .join('; ');
      }

    }
  }


  defineSwatches() {
    let defs = select(this.svgContainerRef.current)
      .select('svg')
      .append('defs');

    Object.keys(SWATCHES_FILES)
      .forEach(key => {
        defs.append('pattern')
          .attr('id', key)
          .attr('patternUnits', 'userSpaceOnUse')
          .attr('width', 28)
          .attr('height', 28)
          .append('image')
          .attr('xlink:href', getSwatchPatternFileUrl(key))
          .attr('width', 30)
          .attr('height', 30);
      });
  }


  replaceColors() {
    const patternUrl = getSwatchPatternFileUrl(this.props.fill);

    const style = patternUrl
      ? `fill: url(#${this.props.fill})`
      : `fill: ${this.props.fill} !important; fill-opacity:1; fill-rule:nonzero`;

    select(this.svgContainerRef.current)
      .selectAll('path, polygon, rect, ellipse, circle')
      .each(function () {
        let el = select(this);
        const styleAttr = el.attr('style');

        if (styleAttr && styleAttr.match(/(#\w+)|(url\(#)|evenodd/i)) {
          el.attr('style', style)

        } else if (!styleAttr) {
          el.attr('style', style);
        }

      });
  }


  setMaxBoundaries() {

    const svgEl = select(this.svgContainerRef.current)
      .select('svg');

    const {width, height} = svgEl.node().getBBox();

    if (width * 1 < height * 1) {
      svgEl.attr('style', 'height: 100%; width: initial');
    } else {
      svgEl.attr('style', 'width: 100%; height: initial');
    }

    if (this.props.onDimensionsChanged) {
      this.props.onDimensionsChanged(svgEl.node().getBoundingClientRect());
    }

  }


  render() {
    return (
      <div
        className="Svg"
        ref={this.svgContainerRef}
        style={this.props.style}
        dangerouslySetInnerHTML={{__html: this.state.svgContent}}>
      </div>
    );
  }

}