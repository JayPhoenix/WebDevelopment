import {translate} from "./Localization";

const TILE_WIDTH_CM = 50;

export function validateSizes(width, height, locale = 'en_gb') {
  let errors = [];

  const translateFn = (string, args = null) => {
    return translate(string, locale, args);
  };

  if (width < 2 * TILE_WIDTH_CM) {
    errors.push(translateFn('min_width'));
  }

  if (width > 200 * TILE_WIDTH_CM) {
    errors.push(translateFn('max_width'));
  }

  if (height < 2 * TILE_WIDTH_CM) {
    errors.push(translateFn('min_height'));
  }

  if (height > 200 * TILE_WIDTH_CM) {
    errors.push(translateFn('max_height'));
  }

  const rest = width % TILE_WIDTH_CM;

  if (rest !== 0 && rest < 10) {
    errors.push(translateFn('min_overhang', {width, rest}));
  }

  return errors;
}