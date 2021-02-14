import React, { Component } from 'react';
import './VerticalGallery.css';


export default class VerticalGallery extends Component {

  render() {

    return (
      <div className="VerticalGallery">
        <ul>
          {this.props.images.map(img => (
            <li key={img}>
              <a
                className={`VerticalGallery__img ${this.props.currentImage === img ? 'VerticalGallery__img--active' : ''}`}
                onClick={() => this.props.onSelect && this.props.onSelect(img)}>
                <img src={img} alt=""/>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );

  }

}