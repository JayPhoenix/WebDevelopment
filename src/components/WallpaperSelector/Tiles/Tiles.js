import React, {Component} from 'react';
import './Tiles.css';

const TILE_WIDTH_CM = 50;
export const MIN_TILE_WIDTH_PX = 50;

export default class Tiles extends Component {


  static isLast(i, tilesNo) {
    return i >= tilesNo - 1;
  }


  printTileSize(i, tilesNo) {
    const size = Tiles.isLast(i, tilesNo)
      ? this.restCm() === 0
        ? TILE_WIDTH_CM
        : this.restCm()
      : TILE_WIDTH_CM;

    return size + '\u00A0cm';
  }


  restCm() {
    return this.props.selectedWidth % TILE_WIDTH_CM;
  }


  renderTileContent(i, tilesNo, isSmall) {

    if (isSmall) {
      return (
        <div className="Tiles__vertical-content">
          <span>
            {i + 1}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <small>{this.printTileSize(i, tilesNo)}</small>
          </span>
        </div>
      );
    }


    return (
      <div className="Tiles__content">
        <div style={{margin: '20px 5px',}}>
          {i + 1}
        </div>
        <div className="Tiles__measurement">
          <span>
            <small>{this.printTileSize(i, tilesNo)}</small>
          </span>
        </div>
      </div>
    );
  }


  render() {
    const fullWidth = this.props.selectedWidth - this.restCm();
    const portion = fullWidth / this.props.selectedWidth;
    const tileWidthPx = (this.props.overlayWidthPx * portion) / (fullWidth / TILE_WIDTH_CM);
    const tilesNo = this.props.selectedWidth / TILE_WIDTH_CM;
    const fullTilesNo = Math.ceil(this.props.selectedWidth / TILE_WIDTH_CM);
    const isSmall = tileWidthPx < MIN_TILE_WIDTH_PX;

    let tilesArray = [];

    for (let i = 0; i < fullTilesNo; ++i) {
      tilesArray.push(i);
    }

    console.log(this.props);

    return (
      <div className="Tiles">
        <ul>
          {tilesArray.map(i => (
            <li
              key={i}
              style={{
                left: i * tileWidthPx,
                width: Tiles.isLast(i, tilesNo) && this.restCm()
                  ? tileWidthPx * (this.restCm() / TILE_WIDTH_CM)
                  : tileWidthPx,
              }}>
              {this.renderTileContent(i, fullTilesNo, isSmall)}
            </li>
          ))}
        </ul>
      </div>
    )
  }

}