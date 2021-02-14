import axios from 'axios';

export const BASE_URL = (window.BASE_URL || 'https://www.azutura.com/').replace(/\/$/, '');
export const BASE_API_URL = BASE_URL + '/aardvark/api-axz456.php';

export async function getImageInfo(sku) {
  let response = await axios.get(BASE_API_URL + '/images/info', {
    params: {sku},
    headers: {
      'Accept': 'application/json, text/plain, */*',
    }
  });

  return response.data;
}


export async function getRawSvg(sku) {
  console.log("custom log - ", sku, BASE_API_URL)
  let response = await axios.get(BASE_API_URL + '/images/rawSvg', {
    params: {sku},
    headers: {
      'Accept': 'text/plain, */*',
    }
  });
  
  return response.data;
}


export const SWATCHES_FILES = {
  SMJPG: 'SilverMetallic.swatch.jpg',
  GMJPG: 'GoldMetallic.swatch.jpg'
};


export function getSwatchPatternFileUrl(code) {
  if(!code) {
    return null;
  }

  const swatchFile = SWATCHES_FILES[code.toUpperCase()];

  if (!swatchFile) {
    return null;
  }

  return BASE_URL + '/media/aardvark/swatches/' + swatchFile;
}