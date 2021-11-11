// TODO importa því sem nota þarf
import { fetchAndRenderCategory, createCategoryBackLink, fetchAndRenderLists } from './lib/ui';

/** Fjöldi frétta til að birta á forsíðu */
const CATEGORY_ITEMS_ON_FRONTPAGE = 5;

/** Vísun í <main> sem geymir allt efnið og við búum til element inn í */
const main = document.querySelector('main');

/**
 * Athugar útfrá url (`window.location`) hvað skal birta:
 * - `/` birtir yfirlit
 * - `/?category=X` birtir yfirlit fyrir flokk `X`
 */
function route() {
  // Athugum hvort það sé verið að biðja um category í URL, t.d.
  // /?category=menning
  const category = window.location.search;

  // Ef svo er, birtum fréttir fyrir þann flokk
  if(category !== null) {
    const param = new URLSearchParams(window.location);
    const id = param.get('category');

    const link = createCategoryBackLink(main, 20);

    fetchAndRenderCategory(id, main, link, 20);
  }

  // Annars birtum við „forsíðu“
  else {
    fetchAndRenderLists(main, CATEGORY_ITEMS_ON_FRONTPAGE);
  }
}

/**
 * Sér um að taka við `popstate` atburð sem gerist þegar ýtt er á back takka í
 * vafra. Sjáum þá um að birta réttan skjá.
 */
window.onpopstate = () => {
  window.history.back();
};

// Í fyrsta skipti sem vefur er opnaður birtum við það sem beðið er um út frá URL
route();
