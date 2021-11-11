/** Slóð á frétta vefþjónustu */
const NEWS_API = 'https://vef2-2021-ruv-rss-json-proxy.herokuapp.com/';

/**
 * Hlutur sem heldur utan um in-memory „cache“ af gögnum í minni á client (í vafra).
 * Nýtir það að þegar forrit er keyrt mun `fetchNews` fallið *alltaf* keyra þar sem `cache` er í
 * scope, og það verður alltaf sami hluturinn. Við getum því bætt við niðurstöðum í hlutinn með
 * vel þekktum „lykli“ (cache key), við næstu köll getum við athugað hvort hlutur innihaldi þennan
 * lykil og skilað þá þeirri niðurstöðu í stað þess að gera sama kall aftur.
 */
const cache = {};

/**
 * Sækir fréttir frá vefþjónustu. Geymir í in-memory cache gögn eftir `id`.
 * @param {string} [id=''] ID á fréttaflokk til að sækja, sjálgefið tómi (grunn) flokkurinn
 * @returns {Promise<Array<object> | null>} Promise sem verður uppfyllt með fylki af fréttum.
 *           Skilar `null` ef villa kom upp við að sækja gögn.
 */
export async function fetchNews(id = '') {
  // TODO útfæra
  if(cache[id]) {
    return cache[id];
  }

  try {
    const ruvUrl = new URL(NEWS_API, id);
    const result = await fetch(ruvUrl);

    if (!result.ok) {
      throw new Error('result not ok');
    }

    let resultjson = await result.json();
    if(id !== '') {
      resultjson = resultjson.filter( element => element.id===id);
    }

    cache[id] = resultjson;
    return cache[id];

  } catch (e) {
    console.warn('unable to fetch', e);
    return null;
  }
}
