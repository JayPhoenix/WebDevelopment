import React, {Component}  from 'react';
import './PlainImage.css';
import searchIco from "../../../img/search.png";


export default class PlainImage  extends Component {

  constructor(props) {
    super(props);

    this.imgRef = React.createRef();
  }

  render() {
    const props = this.props;

    return (
      <div className="PlainImage">

        <a className="PlainImage__search"
           onClick={() => props.onMagnifierClick && props.onMagnifierClick(props.currentImage)}>
          <img src={searchIco} alt=""/>
        </a>

        <img
          ref={this.imgRef}
          onLoad={() => {
            this.imgRef.current.style.maxWidth = this.imgRef.current.naturalWidth;
          }}
          alt=""
          src={props.currentImage}
          className="PlainImage__img"/>

      </div>
    );
  }

}