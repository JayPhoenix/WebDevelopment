//Change this to I18N 
const STRINGS = {
  min_width: {
    en: 'Minimum width is 100cm',
    fr: 'La largeur minimale est de 100 cm',
    de: 'Die Mindestbreite beträgt 100 cm',
    it: 'La larghezza minima è 100 cm',
    es: 'El ancho mínimo es de 100cm',
  },
  max_width: {
    en: 'Maximum width is 1000cm',
    fr: 'La largeur maximale est de 1000cm',
    de: 'Maximale Breite ist 1000cm',
    it: 'La larghezza massima è 1000 cm',
    es: 'El ancho máximo es de 1000cm',
  },
  min_height: {
    en: 'Minimum height is 100cm',
    fr: 'La hauteur minimale est de 100 cm',
    de: 'Die Mindesthöhe beträgt 100 cm',
    it: "L'altezza minima è 100 cm",
    es: "La altura mínima es de 100 cm",
  },
  max_height: {
    en: 'Maximum height is 1000cm',
    fr: 'La hauteur maximale est de 1000 cm',
    de: 'Maximale Höhe ist 1000cm',
    it: "L'altezza massima è 1000 cm",
    es: 'La altura máxima es de 1000 cm',
  },
  min_overhang: {
    en: ({width, rest}) => `Minimum width of the last tile is 10cm, please increase the mural width to ${width - rest + 10}cm`,
    fr: ({width, rest}) => `La largeur minimale de la dernière tuile est de 10 cm, veuillez augmenter la largeur de la fresque à ${width - rest + 10}cm`,
    de: ({width, rest}) => `Mindestbreite der letzten Fliese ist 10cm, bitte vergrößern Sie die Wandbreite auf ${width - rest + 10}cm`,
    it: ({width, rest}) => `La larghezza minima dell'ultima tessera è 10 cm, si prega di aumentare la larghezza del murale a ${width - rest + 10}cm`,
    es: ({width, rest}) => `El ancho mínimo de la última losa es de 10 cm, aumente el ancho del mural a ${width - rest + 10}cm`,
  }
};


function splitLocale(locale) {
  const [lang, country] = locale.trim().toLowerCase().split('_');

  return {lang, country};
}


export function getCurrency(locale) {
  const {country} = splitLocale(locale);

  switch (country) {
    case 'de':
    case 'it':
    case 'es':
    case 'fr':
      return 'EUR';
    case 'us':
      return 'USD';
    default:
      return 'GBP';
  }
}


export function formatPrice(amount, locale, currency = null) {

  const {lang, country} = splitLocale(locale);

  const formatter = new Intl.NumberFormat(lang + '-' + country.toUpperCase(), {
    style: 'currency',
    currency: currency || getCurrency(locale),
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}


export function translate(string, locale = 'en_gb', args = null) {

  const {lang, country} = splitLocale(locale);

  if (!STRINGS[string]) {
    return string;
  }

  const trans = STRINGS[string][`${lang}_${country}`] || STRINGS[string][lang];

  if (!trans) {
    return string;
  }

  if (typeof trans === 'function') {
    return trans(args);
  }

  return trans;
}