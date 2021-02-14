import './polyfills/arrayFilter.polyfill';
import './polyfills/customEvent.polyfill';
import './polyfills/eventListener.polyfill';
import './polyfills/isNan.polyfill';
import 'raf/polyfill';
import 'intl';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WallpaperSelectorApp from './WallpaperSelectorApp';
import * as Sentry from '@sentry/browser';
import VideoBtn from "./components/VideoBtn/VideoBtn";

if (typeof process !== undefined && process.env.NODE_ENV !== 'development') {
  Sentry.init({ dsn: 'https://ef4961cf82204205a35ef5d30db3bc06@sentry.io/1291713' });
}

let wallpaperSelectorEl = document.getElementById('wallpaper-selector');
let videoBtnEl = document.getElementById('video-btn');

if(videoBtnEl) {

  console.log(videoBtnEl.dataset);
  ReactDOM.render(<VideoBtn {...videoBtnEl.dataset}/>, videoBtnEl);
}

if (wallpaperSelectorEl) {

  const props = {
    sku: window.WALLPAPER_SELECTOR_SKU,
    images: window.WALLPAPER_SELECTOR_IMAGES,
    locale: window.WALLPAPER_SELECTOR_LOCALE,
    currency: window.WALLPAPER_SELECTOR_CURRENCY,
    basePrice: window.WALLPAPER_SELECTOR_BASE_PRICE,
    type: window.WALLPAPER_SELECTOR_TYPE,
  };

  ReactDOM.render(<WallpaperSelectorApp {...props}/>, wallpaperSelectorEl);

  document.addEventListener('wallpaper-selector:updateMainImage', (e) => {
    let images = [...props.images];
    const {url, customProductFile} = e.detail;

    images[images.length - 1] = url;

    const newProps = {
      ...props,
      images,
      customProductFile,
    };

    ReactDOM.render(<WallpaperSelectorApp {...newProps}/>, wallpaperSelectorEl);
  });

  document.addEventListener('wallpaper-selector:onRotateChanged', (e) => {
    let images = [...props.images];
    const rotate = +e.detail;
    const url = encodeURIComponent(images[images.length - 1]);

    images[images.length - 1] = `https://www.azutura.com/aardvark/api-axz456.php/image-proxy?url=${url}&rotate=${rotate}`;

    const newProps = {
      ...props,
      images,
    };

    ReactDOM.render(<WallpaperSelectorApp {...newProps}/>, wallpaperSelectorEl);
  });


  document.addEventListener('wallpaper-selector:onTypeChanged', (e) => {
    const newProps = {
      ...props,
      type: e.detail,
    };

    ReactDOM.render(<WallpaperSelectorApp {...newProps}/>, wallpaperSelectorEl);
  });
}
