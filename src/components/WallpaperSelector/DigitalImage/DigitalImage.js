import React, {Component} from 'react';
import './DigitalImage.css';
import {SwatchesPicker, ChromePicker} from 'react-color';
import Tooltip from 'rc-tooltip';
import 'rc-tooltip/assets/bootstrap_white.css';
import './rc-tooltip.css';
import Ruler from "../Ruler/Ruler";
import searchIco from "../../../img/search.png";


const REAL_ROOM_SIZE = 350; // in cm
let IMG_CACHE = {};

const ROOM_POSITIONS = {
  room_bedroom: {
    right: '5%',
    bottom: '25%',
  },
  room_living: {
    left: '10%',
    right: '10%',
  },
  room_kitchen: {
    top: '15%',
    left: '15%',
    bottom: '35%',
    right: '30%',
  }
};


function getPngPreviewUrl(sku) {
  return `${window.BASE_URL}/aardvark/api-axz456.php/images/thumb?sku=${sku}&format=png&width=1000&height=1000`;
}


function hexToRgb(hex) {
  if (typeof hex !== 'string') {
    throw new TypeError('Expected a string');
  }

  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  const num = parseInt(hex, 16);

  return [num >> 16, num >> 8 & 255, num & 255];
}


function countPixelSize(cm, canvasPixelSize) {
  return cm / REAL_ROOM_SIZE * canvasPixelSize;
}


function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (IMG_CACHE[url]) {
      resolve(IMG_CACHE[url]);
      return;
    }

    let img = new Image;

    img.onload = () => {
      IMG_CACHE[url] = img;
      resolve(img);
    };

    img.onerror = reject;
    img.src = url;
  });
}


function loadImages(urls) {
  return Promise.all(urls.map(loadImage));
}


export default class DigitalImage extends Component {

  state = {
    backgroundColor: '#ffffff',
    showColorPicker: false,
    imgLoaded: false,

    canvasSize: {
      width: 0,
      height: 0,
    },

    ruler: {
      width: 0,
      height: 0,
    },
  };


  constructor(props) {
    super(props);

    this.imgRef = React.createRef();
    this.canvasRef = React.createRef();
    this.canvasMaskRef = React.createRef();
  }


  async measureAndRepaint() {
    await this.measure();
    return this.repaintCanvas();
  }


  async componentDidMount() {
    // intently awaiting
    await this.measureAndRepaint();

    this.imgRef.current.addEventListener('load', () => {
      this.measureAndRepaint();
      this.setState({imgLoaded: true});
    });

    window.addEventListener('resize', async () => this.measureAndRepaint());

    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        this.setState({showColorPicker: false});
      }
    }, false);

  }


  async componentDidUpdate(prevProps) {

    if (this.props.selectedWidth !== prevProps.selectedWidth && this.getImageType() === 'normal') {
      this.props.changeToMainImage && this.props.changeToMainImage();
    }

    if (this.props.currentImage !== prevProps.currentImage) {
      this.measureAndRepaint();
    }
  }


  getStickerPositionInRoom() {
    if (this.getImageType() !== 'room') {
      return {};
    }

    const matches = this.props.currentImage.match(/\/(\w+)\.(jpe?g|png|gif)$/i);

    if (!matches) {
      return {};
    }

    return ROOM_POSITIONS[matches[1]] || {};
  }


  getImageType() {
    if (this.props.currentImage.match(/\/room_/)) {
      return 'room';
    }

    if (this.props.currentImage.match(/\/WS-\d+(_\w+)?\.(jpe?g|png|gif)/i)) {
      return 'main';
    }

    return 'normal';
  }


  async measure() {
    if (!this.props.currentImage) {
      return;
    }

    let w = this.imgRef.current.offsetWidth;

    const canvasSize = {
      width: w,
      height: w,
      maxWidth: '100%',
    };

    return new Promise((resolve) => {
      this.setState({canvasSize}, resolve);
    });
  }


  async repaintCanvas() {
    let canvas = this.canvasRef.current;
    let canvasMask = this.canvasMaskRef.current;
    const {width, height} = this.state.canvasSize;

    if (!(width && height) || this.getImageType() !== 'room') {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    canvasMask.width = width;
    canvasMask.height = height;

    let ctx = canvas.getContext('2d');
    let maskCtx = canvasMask.getContext('2d');

    const [sourceImage, maskImage] = await loadImages([this.props.currentImage, this.props.currentImage.replace('.jpg', '_mask.png')]);

    maskCtx.drawImage(maskImage, 0, 0, maskImage.width, maskImage.height, 0, 0, width, height);

    const imageData = maskCtx.getImageData(0, 0, width, height);
    let pixels = imageData.data;

    const rgb = hexToRgb(this.state.backgroundColor);

    for (let i = 0, len = pixels.length; i < len; i += 4) {
      pixels[i + 0] = rgb[0];
      pixels[i + 1] = rgb[1];
      pixels[i + 2] = rgb[2];
    }

    ctx.globalCompositeOperation = 'multiply';

    ctx.putImageData(imageData, 0, 0);
    ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, width, height);
  }


  renderImage() {
    const imageType = this.getImageType();

    if (imageType === 'main') {
      return (
        <React.Fragment>
          <div style={{
            maxWidth: '100%',
            maxHeight: '100%',
            position: 'absolute',
            top: 20,
            left: 50,
            right: 20,
            bottom: 85,
            transform: this.props.flipImage ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 200ms ease',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <img
              src={getPngPreviewUrl(this.props.sku)}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
              }}
              onLoad={(e) => {
                const {offsetWidth, offsetHeight} = e.target;

                this.setState({
                  ruler: {
                    width: offsetWidth,
                    height: offsetHeight,
                  }
                });
              }}
            />
          </div>
          <img
            className="DigitalImage__img"
            style={{visibility: 'none', position: 'relative', zIndex: -1}}
            ref={this.imgRef}
            src={this.props.currentImage}/>
        </React.Fragment>
      )
    }

    if (imageType === 'room') {
      return (
        <img
          className="DigitalImage__img DigitalImage__img--room"
          ref={this.imgRef}
          key={this.props.currentImage}
          src={this.props.currentImage}/>
      )
    }

    return (
      <img
        className="DigitalImage__img"
        ref={this.imgRef}
        key={this.props.currentImage}
        src={this.props.currentImage}/>
    )
  }


  renderHorizontalRuler() {
    if (this.props.selectedWidth <= 0 || this.getImageType() !== 'main') {
      return null;
    }

    return (
      <Ruler
        orientation="horizontal"
        selectedWidth={this.props.selectedWidth}
        selectedHeight={this.props.selectedHeight}
        imgWidth={this.state.ruler.width}
        imgHeight={this.state.ruler.height}
      />
    );

  }


  renderVerticalRuler() {
    if (this.props.selectedHeight <= 0 || this.getImageType() !== 'main') {
      return null;
    }

    return (
      <Ruler
        orientation="vertical"
        selectedWidth={this.props.selectedWidth}
        selectedHeight={this.props.selectedHeight}
        imgWidth={this.state.ruler.width}
        imgHeight={this.state.ruler.height}
      />
    );
  }


  render() {
    const imageType = this.getImageType();
    const pixelWidth = countPixelSize(this.state.canvasSize.width, this.props.selectedWidth);

    const backgroundColor = window.WALLPAPER_SELECTOR_SHOW_ROOMS || window.WALLPAPER_SELECTOR_VARIABLE_IMAGE_BGR || this.state.backgroundColor.match(/#ffffff|#cccccc/)
      ? this.state.backgroundColor
      : '#ffffff';

    let tooltipProps = {
      visible: false,
      placement: 'bottom',
      overlay: '',
      align: {
        offset: [0, -1 * (this.state.canvasSize.height - 20)],
      },
      destroyTooltipOnHide: true,
    };

    if (imageType === 'room' && !this.props.selectedWidth) {
      tooltipProps.visible = true;
      tooltipProps.overlay = (
        <div style={{textAlign: 'center'}}>
          <strong>Select Size to View Example</strong>
          <br/>
          Artwork is shown relative to room
          <br/>
          is width 3.5 x height 3.5 meters.
        </div>
      );

    } else if (pixelWidth > countPixelSize(this.state.canvasSize.width, REAL_ROOM_SIZE) && imageType === 'room') {
      tooltipProps.visible = true;
      tooltipProps.overlay = (
        <div style={{textAlign: 'center'}}>
          This size is too big for our large wall
          <br/>
          however may be the right size for your wall space.
        </div>
      );

    } else if (pixelWidth < countPixelSize(this.state.canvasSize.width, 100) && imageType === 'room') {
      tooltipProps.visible = true;
      tooltipProps.overlay = (
        <div style={{textAlign: 'center'}}>
          This size is very small for our large wall
          <br/>
          however may be the right size for your wall space.
        </div>
      );

    } else if (this.props.stickersNumber) {
      tooltipProps.visible = true;
      tooltipProps.overlay = (
        <div style={{textAlign: 'center'}}>
          {this.props.stickersNumber} Stickers
        </div>
      );
    }

    if (tooltipProps.visible && (!this.state.imgLoaded || !this.state.canvasSize.width)) {
      tooltipProps.visible = false;
    }

    return (
      <Tooltip {...tooltipProps}>
        <div
          className="DigitalImage"
          style={{backgroundColor}}>

          {this.props.showMagnifier && (
            <a className="DigitalImage__search"
               onClick={() => this.props.onMagnifierClick && this.props.onMagnifierClick(this.props.currentImage)}>
              <img src={searchIco} alt=""/>
            </a>
          )}

          {this.renderHorizontalRuler()}
          {this.renderVerticalRuler()}

          <div
            className="DigitalImage__canvas-wrapper"
            style={{
              ...this.state.canvasSize,
              display: imageType === 'room' ? 'block' : 'none'
            }}>

            {this.props.selectedWidth > 0 && imageType === 'room' && (
              <div className="DigitalImage__img-wrapper" style={this.getStickerPositionInRoom()}>
                <img
                  src={getPngPreviewUrl(this.props.sku)}
                  style={{
                    width: pixelWidth,
                    transform: this.props.flipImage ? 'scaleX(-1)' : 'scaleX(1)',
                  }}
                />
              </div>
            )}

            <canvas
              className="DigitalImage__canvas-mask"
              ref={this.canvasMaskRef}
            />

            <canvas
              className="DigitalImage__canvas"
              ref={this.canvasRef}
              style={{...this.state.canvasSize, display: imageType === 'room' ? 'block' : 'none'}}
            />

          </div>

          {this.renderImage()}

          <div
            className="DigitalImage__color-input"
            style={
              {display: imageType === 'room' || imageType === 'main' && window.WALLPAPER_SELECTOR_VARIABLE_IMAGE_BGR ? 'block' : 'none'}
            }>

            <div>
              <button onClick={() => this.setState({showColorPicker: true})}>
                Select wall colour
              </button>

              {this.state.backgroundColor !== '#ffffff' && (
                <button
                  style={{marginLeft: 10}}
                  onClick={() => {
                    this.setState({
                        backgroundColor: '#ffffff'
                      }, () => this.repaintCanvas()
                    );
                  }}>
                  Reset wall colour
                </button>
              )}
            </div>

            {this.state.showColorPicker && (
              <div style={{zIndex: 2, position: 'absolute'}}>
                <div
                  onClick={() => this.setState({showColorPicker: false})}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                  }}
                />

                {window.WALLPAPER_SELECTOR_COLOR_PICKER === 'swatches'
                  ? (
                    <SwatchesPicker
                      color={this.state.backgroundColor}
                      colors={[
                        ...SwatchesPicker.defaultProps.colors,
                        ['#BEA488', '#DFCCB1', '#E8DCC6', '#F8F2E4', '#F6F2E5'],
                      ]}
                      onChange={(color) => {
                        this.setState({
                          backgroundColor: color.hex,
                          showColorPicker: false
                        }, () => this.repaintCanvas());
                      }}
                    />
                  )
                  : (
                    <ChromePicker
                      color={this.state.backgroundColor}
                      onChange={(color) => {
                        this.setState({
                          backgroundColor: color.hex,
                        }, () => this.repaintCanvas());
                      }}
                    />
                  )}


              </div>
            )}
          </div>


        </div>
      </Tooltip>
    )
  }

}