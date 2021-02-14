import React, {Component} from 'react';
import './WallpaperSelectorApp.css';
import WallpaperImage from './components/WallpaperSelector/WallpaperImage/WallpaperImage';
import Swipe from 'react-easy-swipe';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import {validateSizes} from "./functions/Validators";
import PatternImage from "./components/WallpaperSelector/PatternImage/PatternImage";
import PlainImage from "./components/WallpaperSelector/PlainImage/PlainImage";
import VerticalGallery from "./components/WallpaperSelector/VerticalGallery/VerticalGallery"; // This only needs to be imported once in your app

import arrowLeft from "./img/ios-arrow-thin-left.svg";
import arrowRight from "./img/ios-arrow-thin-right.svg";
import StickerImage from "./components/WallpaperSelector/StickerImage/StickerImage";
import DigitalImage from "./components/WallpaperSelector/DigitalImage/DigitalImage";

import MobileDetect from "mobile-detect";

// First of all - written in js, not ts

class WallpaperSelectorApp extends Component {

  //state is managed here instead of Redux

  state = {
    selectedWidth: 0,
    selectedHeight: 0,
    stickersNumber: 0,
    patternSize: 0,
    rotate: 0,
    flipImage: false,
    imageFilter: '',
    showTiles: false,
    isCropped: false,
    currentImage: '',
    showLightbox: false,
    photoIndex: 0,
    squareMeterPrice: 0,
    color: '#000',
  };

  //Old method 

  static defaultProps = {
    locale: 'en_gb',
    currency: 'GBP',
    basePrice: 0,
    sku: '',
    type: null,
    images: [],
  };

  // Good method
  baseState(props) {
    props = props || this.props;

    return {
      isCropped: false,
      currentImage: this.mainImage(props),
    };
  }


  mainImage(props) {
    // main image for wallpapers is the last one
    const index = props.type === 'wallpaper'
      ? props.images.length - 1
      : 0;

    return props.images[index];
  }


  componentWillReceiveProps(newProps) {
    if (newProps.images !== this.state.images) {
      this.setState(this.baseState(newProps)); //Old state management
    }
  }

  //Repeating code
  refreshBaseState() {
    return this.props.type === 'sticker' || this.props.type === 'digital' || this.props.type === 'pattern'
      ? {}
      : {...this.baseState()};
  }

  //Discontinued
  componentDidMount() {
    this.setState(this.baseState());

    this.mobileDetect = new MobileDetect(window.navigator.userAgent);
    //Event listeners would be handled differently with FBC
    document.addEventListener('wallpaper-selector:onWidthChanged', (e) => {

      this.setState({
        ...this.refreshBaseState(),
        selectedWidth: e.detail.replace(/[^\d.-]/g, '') * 1,
      }, () => this.validate());
    });

    document.addEventListener('wallpaper-selector:onHeightChanged', (e) => {
      this.setState({
        ...this.refreshBaseState(),
        selectedHeight: e.detail.replace(/[^\d.-]/g, '') * 1,
      }, () => this.validate());
    });

    document.addEventListener('wallpaper-selector:onStickersNumberChanged', (e) => {
      this.setState({
        stickersNumber: +e.detail.replace(/\D/g, ''),
      }, () => this.validate());
    });

    document.addEventListener('wallpaper-selector:onRotateChanged', (e) => {
      this.setState({
        ...this.refreshBaseState(),
        rotate: +e.detail.replace(/\D/g, ''),
      }, () => this.validate());
    });

    document.addEventListener('wallpaper-selector:onFlipChanged', (e) => {
      this.setState({
        ...this.refreshBaseState(),
        flipImage: !!e.detail,
      });
    });

    document.addEventListener('wallpaper-selector:onTilesChanged', (e) => {
      this.setState({
        showTiles: !!e.detail,
      });
    });

    document.addEventListener('wallpaper-selector:onFilterChanged', (e) => {
      this.setState({
        ...this.refreshBaseState(),
        imageFilter: e.detail,
      });
    });

    document.addEventListener('wallpaper-selector:onCroppedChanged', (e) => {
      this.setState({
        ...this.refreshBaseState(),
        isCropped: !!e.detail,
      });
    });

    document.addEventListener('wallpaper-selector:onMaterialChanged', (e) => { // something : event would be replaced
      const match = e.detail.text.replace(',', '.')
        .match(/\s[-+]?[\s\$£]?(\d+\.\d+)/);

      const materialPrice = match
        ? match[1]
        : 0;

      let discount = e.detail.percentDiscount;

      if (!discount) {
        discount = 1
      }

      const newBasePrice = materialPrice * discount;

      if (newBasePrice) {
        this.setState({
          basePrice: newBasePrice,
        });

      } else {
        this.setState({basePrice: this.props.basePrice});
      }

    });

    document.addEventListener('wallpaper-selector:onColorChanged', (e) => {
      this.setState({
        color: e.detail,
      });
    });

    document.addEventListener('wallpaper-selector:onPatternSizeChanged', (e) => {
      this.setState({
        patternSize: +e.detail.replace(/[^\d.-]/g, ''),
      }, () => this.validate());
    });

  }


  validate() {
    const inputErrors = this.state.selectedWidth && this.state.selectedHeight
      ? validateSizes(this.state.selectedWidth, this.state.selectedHeight, this.props.locale)
      : [];

    let event = new CustomEvent('wallpaper-selector:onValidate', {detail: inputErrors});
    document.dispatchEvent(event);
  }


  nextImage() {
    const {currentImage} = this.state;
    const {images} = this.props;
    const i = images.indexOf(currentImage);

    this.setState({
      currentImage: images[i + 1] || images[0]
    });
  }


  prevImage() {
    const {currentImage} = this.state;
    const {images} = this.props;
    const i = images.indexOf(currentImage);

    this.setState({
      currentImage: images[i - 1] || images[images.length - 1]
    });
  }


  showArrows() {
    return this.props.images.length > 1
      && !(this.state.selectedWidth && this.state.selectedHeight);
  }


  swipeLeft() {
    if (this.props.type === 'wallpaper' && this.mobileDetect.phone()) {
      return;
    }

    this.nextImage();
  }


  swipeRight() {
    if (this.props.type === 'wallpaper' && this.mobileDetect.phone()) {
      return;
    }

    this.prevImage();
  }


  renderImageComponent() {
    const {currentImage} = this.state;
    const {customProductFile, locale, currency, basePrice, sku, images} = this.props;
    const mainImage = this.mainImage(this.props);
    const isMainImage = currentImage === mainImage;
    const isSecondImage = images[1] && currentImage === images[1];

    const imageProps = {
      ...this.state,
      images,
      isMainImage,
      mainImage,
      customProductFile,
      locale,
      currency,
      basePrice: this.state.basePrice || basePrice,
      sku,
    };

    if (this.props.type === 'pattern') {
      return <PatternImage {...imageProps} />;
    }

    if (this.props.type === 'wallpaper') {
      return (
        <WallpaperImage
          {...imageProps}
          allowSelector={isMainImage}
          onMagnifierClick={() => this.setState({showLightbox: true})}
        />
      )
    }


    if (this.props.type === 'sticker') {
      return (
        <StickerImage
          {...imageProps}
          currentImage={currentImage}
          showMagnifier={isMainImage || isSecondImage}
          onMagnifierClick={() => this.setState({showLightbox: true})}
          changeToMainImage={() => {
            const currentImage = this.props.images.find((img) => img.match(/\/WS-\d+(_\w+)?\.(jpe?g|png|gif)/i));

            if (currentImage) {
              this.setState({currentImage});
            }

          }}
        />
      )
    }

    if (this.props.type === 'digital') {
      return (
        <DigitalImage
          {...imageProps}
          currentImage={currentImage}
          showMagnifier={isMainImage || isSecondImage}
          onMagnifierClick={() => this.setState({showLightbox: true})}
          changeToMainImage={() => {
            const currentImage = this.props.images.find((img) => img.match(/\/WS-\d+(_\w+)?\.(jpe?g|png|gif)/i));

            if (currentImage) {
              this.setState({currentImage});
            }

          }}
        />
      )
    }

    return (
      <PlainImage
        currentImage={currentImage}
        onMagnifierClick={() => this.setState({showLightbox: true})}
      />
    )
  }


  render() {
    const {currentImage, showLightbox, photoIndex} = this.state;
    const hideArrows = !this.showArrows();

    return (
      <div className="WallpaperSelectorApp"> {/* CSS classnames would be erased by CSS Modules,*/}

        <div className="WallpaperSelectorApp__image-wrap">

          <Swipe
            className="WallpaperSelectorApp__image-wrap__image"
            tolerance={40}
            onSwipeRight={() => this.swipeRight()}
            onSwipeLeft={() => this.swipeLeft()}>
            {this.props.images.length > 1 && (
              <React.Fragment>
                <a
                  className={`WallpaperSelectorApp__image-wrap__image__arrow WallpaperSelectorApp__image-wrap__image__arrow--left ${hideArrows ? 'WallpaperSelectorApp__image-wrap__image__arrow--hidden' : ''}`}
                  onClick={() => this.prevImage()}>
                  <img src={arrowLeft}/>
                </a>
                <a
                  className={`WallpaperSelectorApp__image-wrap__image__arrow WallpaperSelectorApp__image-wrap__image__arrow--right ${hideArrows ? 'WallpaperSelectorApp__image-wrap__image__arrow--hidden' : ''}`}
                  onClick={() => this.nextImage()}>
                  <img src={arrowRight}/>
                </a>
              </React.Fragment>
            )}
            {this.renderImageComponent()}
          </Swipe>

          {this.props.images.length > 1 && (
            <div className="WallpaperSelectorApp__image-wrap__vertical-gallery">
              <VerticalGallery
                images={this.props.images}
                currentImage={currentImage}
                onSelect={(currentImage) => this.setState({
                  currentImage,
                  photoIndex: this.props.images.indexOf(currentImage),
                })}
              />
            </div>
          )}

        </div>

        {showLightbox && (
          <Lightbox
            mainSrc={this.props.images[photoIndex]}
            nextSrc={this.props.images[(photoIndex + 1) % this.props.images.length]}
            prevSrc={this.props.images[(photoIndex + this.props.images.length - 1) % this.props.images.length]}
            onCloseRequest={() => this.setState({showLightbox: false})}
            onMovePrevRequest={() =>
              this.setState({
                photoIndex: (photoIndex + this.props.images.length - 1) % this.props.images.length,
              })
            }
            onMoveNextRequest={() =>
              this.setState({
                photoIndex: (photoIndex + 1) % this.props.images.length,
              })
            }/>)
        }

      </div>
    );
  }
}

export default WallpaperSelectorApp;
