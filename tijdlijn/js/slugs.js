// Slugs per gebeurtenis: #slug in de app en <slug>.html als losse pagina.
// Gedeeld door index.html en scripts/bouw-paginas.mjs, zodat beide precies dezelfde slugs maken. Vraagt TILES en WARS uit data.js.
const slugify=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' en ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// bestandsnamen in deze map, naast de kolom- en oorlogslinks (#eeuw17, #ww1) die al bestaan
const SLUG_RESERVED=['index','onderwerpen','404'];
function makeSlugs(all){ // all: gebeurtenissen met id, t (titel), y (jaar) en bij de oorlogen date, in vaste volgorde
  const EVSLUG={},SLUGEV={},base=all.map(e=>slugify(e.t)||e.id),n={};base.forEach(s=>n[s]=(n[s]||0)+1);
  const taken=s=>SLUG_RESERVED.includes(s)||TILES.some(t=>t.id===s)||!!WARS[s];
  // dubbele titels (of een titel die op een gereserveerde naam lijkt) krijgen de datum erbij, ongeacht de volgorde
  all.forEach((e,i)=>{let s=base[i];if(n[s]>1||taken(s))s+='-'+(e.date||(e.y<0?'v'+(-e.y):e.y));while(SLUGEV[s])s+='-'+e.id;EVSLUG[e.id]=s;SLUGEV[s]=e});
  return {EVSLUG,SLUGEV};
}
