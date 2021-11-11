import { empty, el } from './helpers.js';
import { fetchNews } from './news.js';

/**
 * Föll sem sjá um að kalla í `fetchNews` og birta viðmót:
 * - Loading state meðan gögn eru sótt
 * - Villu state ef villa kemur upp við að sækja gögn
 * - Birta gögnin ef allt OK
 * Fyrir gögnin eru líka búnir til takkar sem leyfa að fara milli forsíðu og
 * flokks *án þess* að nota sjálfgefna <a href> virkni—við tökum yfir og sjáum
 * um sjálf með History API.
 */

/**
 * Sér um smell á flokk og birtir flokkinn *á sömu síðu* og við erum á.
 * Þarf að:
 * - Stoppa sjálfgefna hegðun <a href>
 * - Tæma `container` þ.a. ekki sé verið að setja efni ofan í annað efni
 * - Útbúa link sem fer til baka frá flokk á forsíðu, þess vegna þarf `newsItemLimit`
 * - Sækja og birta flokk
 * - Bæta við færslu í `history` þ.a. back takki virki
 *
 * Notum lokun þ.a. við getum útbúið föll fyrir alla flokka með einu falli. Notkun:
 * ```
 * link.addEventListener('click', handleCategoryClick(categoryId, container, newsItemLimit));
 * ```
 *
 * @param {string} id ID á flokk sem birta á eftir að smellt er
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {function} Fall sem bundið er við click event á link/takka
 */
function handleCategoryClick(id, container, newsItemLimit) {
  return (e) => {
    e.preventDefault();

    empty(container);

    const link = createCategoryBackLink(container, newsItemLimit/4);

    fetchAndRenderCategory(id, container, link, newsItemLimit);

    window.history.pushState(null, null, `/?category=${id}`);
  };
}

/**
 * Eins og `handleCategoryClick`, nema býr til link sem fer á forsíðu.
 *
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {function} Fall sem bundið er við click event á link/takka
 */
function handleBackClick(container, newsItemLimit) {
  return (e) => {
    e.preventDefault();

    empty(container);

    fetchAndRenderLists(container,newsItemLimit);

    window.history.pushState(null, null, window.origin);
  };
}

/**
 * Útbýr takka sem fer á forsíðu.
 * @param {HTMLElement} container Element sem á að birta fréttirnar í
 * @param {number} newsItemLimit Hámark frétta sem á að birta
 * @returns {HTMLElement} Element með takka sem fer á forsíðu
 */
export function createCategoryBackLink(container, newsItemLimit) {
  // TODO útfæra
  const link = el('a', 'Til baka');
  link.className = 'news__links';
  link.addEventListener('click', handleBackClick(container, newsItemLimit));
  return link;
}

/**
 * Sækir grunnlista af fréttum, síðan hvern flokk fyrir sig og birtir nýjustu
 * N fréttir úr þeim flokk með `fetchAndRenderCategory()`
 * @param {HTMLElement} container Element sem mun innihalda allar fréttir
 * @param {number} newsItemLimit Hámark fjöldi frétta sem á að birta í yfirliti
 */
export async function fetchAndRenderLists(container, newsItemLimit) {
  // Byrjum á að birta loading skilaboð
  container.innerText = 'Sæki lista af fréttum...';

  // Birtum þau beint á container

  // Sækjum yfirlit með öllum flokkum, hér þarf að hugsa um Promises!
  const flokkar = await fetchNews();


  // Fjarlægjum loading skilaboð
  container.innerText = '';

  // Athugum hvort villa hafi komið upp => fetchNews skilaði null
  if(flokkar === null) {
    container.innerText = 'Villa kom upp :(';
  }

  // Athugum hvort engir fréttaflokkar => fetchNews skilaði tómu fylki
  else if(flokkar.length === 0) {
    container.innerText = 'Engin gögn';
  }

  else {
  // Búum til <section> sem heldur utan um allt
  const section = document.createElement('section');
  section.className = 'newsList__list'
  container.appendChild(section);
  
  // Höfum ekki-tómt fylki af fréttaflokkum! Ítrum í gegn og birtum
  for(const nafn of flokkar) {
    const link = el('a', 'Allar fréttir');
    link.className = 'news__links news__link';
    link.addEventListener('click', handleCategoryClick(nafn.id, container, newsItemLimit*4));
    fetchAndRenderCategory(nafn.id, section, link, newsItemLimit);
  }

  // Þegar það er smellt á flokka link, þá sjáum við um að birta fréttirnar, ekki default virknin
  }
}

/**
 * Sækir gögn fyrir flokk og birtir í DOM.
 * @param {string} id ID á category sem við erum að sækja
 * @param {HTMLElement} parent Element sem setja á flokkinn í
 * @param {HTMLELement | null} [link=null] Linkur sem á að setja eftir fréttum
 * @param {number} [limit=Infinity] Hámarks fjöldi frétta til að sýna
 */
export async function fetchAndRenderCategory(
  id,
  parent,
  link = null,
  limit = Infinity
) {
  // Búum til <section> sem heldur utan um flokkinn
  const container = document.createElement('section');
  container.className = 'newsList__item news';

  // Bætum við parent og þannig DOM, allar breytingar héðan í frá fara gegnum
  // container sem er tengt parent
  parent.appendChild(container);

  // Setjum inn loading skilaboð fyrir flokkinn
  container.innerText = 'Sæki gögn...';

  // Sækjum gögn fyrir flokkinn og bíðum
  const gogn = await fetchNews(id);

  // Fjarlægjum loading skilaboð
  container.innerText = '';

  // Ef það er linkur, bæta honum við
  if(link !== null) {
    container.appendChild(link);
  }

  // Villuskilaboð ef villa og hættum
  // Skilaboð ef engar fréttir og hættum
  if (gogn === null) {
    container.innerText = 'villa kom upp';
    return null;
  }

  // Bætum við titli
  const title = document.createElement('h2');
  title.innerText = gogn.title;
  title.className = 'news__title';
  container.appendChild(title);
  
  // Höfum fréttir! Ítrum og bætum við <ul>
  const list = document.createElement('ul');
  container.appendChild(list);
  list.className = 'news__list';
  for(let i = 0; i < limit; i++) {
    const item = document.createElement('li');
    const a = document.createElement('a');
    a.innerText = gogn.items[i].title;
    item.appendChild(a);
    list.appendChild(item);
  }
  return null;
}
