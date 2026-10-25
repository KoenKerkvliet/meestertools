// Uitgebreide achtergrond per gebeurtenis — vroegmoderne tijd (1500–1700). Sleutel = titel van de gebeurtenis.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
Object.assign(window.DETAILS, {

'Karel V en het Verdrag van Venlo': {
 aanloop: [
  'Karel V erfde in 1506 de Bourgondische Nederlanden. Hij was ook koning van Spanje en later keizer van het Heilige Roomse Rijk. Stap voor stap voegde hij de noordelijke gewesten aan zijn bezit toe: Friesland, Utrecht, Overijssel, Groningen en Drenthe.',
  'Het hertogdom Gelre bleef zich lang verzetten. Daar hoorde ook het Overkwartier bij, met steden als Roermond en Venlo. In 1538 werd Willem van Kleef hertog van Gelre. Hij zocht steun bij Frankrijk, de grote rivaal van Karel V.'
 ],
 verloop: [
  'In 1543 trok Karel V met een groot leger op. Hij veroverde de Kleefse stad Düren, waarna Willem van Kleef zich overgaf. Op 7 september 1543 tekende hij in Venlo een verdrag waarin hij afstand deed van Gelre en Zutphen.',
  'Daarmee vielen alle zeventien gewesten onder één vorst. In 1549 legde Karel V met de Pragmatieke Sanctie vast dat ze voortaan als één geheel zouden worden geërfd. Het bestuur werd steeds meer vanuit Brussel geregeld.',
  'Op 25 oktober 1555 deed Karel V in Brussel afstand ten gunste van zijn zoon Filips II. Filips regeerde vanuit Spanje en had minder band met de Nederlanden. Zijn strenge beleid tegen het protestantisme leidde later tot de Opstand.'
 ],
 cijfers: [['Verdrag van Venlo','7 september 1543'],['Aantal gewesten','17'],['Pragmatieke Sanctie','1549'],['Afstand Karel V','25 oktober 1555']],
 figuren: [['Karel V','keizer en heer der Nederlanden'],['Willem van Kleef','hertog van Gelre 1538–1543'],['Maarten van Rossum','Gelderse veldheer'],['Filips II','zoon en opvolger van Karel V']],
 bronnen: [['Wikipedia: Verdrag van Venlo',W('Verdrag van Venlo 1543')],['Wikipedia: Gelderse Successieoorlog',W('Gelderse Successieoorlog')]]
},

'Beeldenstorm': {
 aanloop: [
  'In de 16e eeuw verspreidden de ideeën van Luther en vooral Calvijn zich over de Nederlanden. Filips II liet ketters streng vervolgen. Toch groeide het aantal protestanten, vooral in de steden van Vlaanderen en Brabant.',
  'In april 1566 boden edelen landvoogdes Margaretha van Parma een smeekschrift aan om de vervolgingen te matigen. Zij werden spottend geuzen genoemd. In de zomer trokken duizenden mensen naar hagenpreken, kerkdiensten in de open lucht.'
 ],
 verloop: [
  'Op 10 augustus 1566 vernielden protestanten na een hagenpreek bij Steenvoorde in Vlaanderen de beelden in een kapel. Binnen enkele weken verspreidde de beweging zich naar Antwerpen en daarna naar het noorden, tot in Holland, Utrecht en Friesland.',
  'Groepen trokken kerken en kloosters binnen en sloegen beelden, altaren en schilderijen kapot. Voor calvinisten waren die afgoderij. Veel kunst uit de middeleeuwen ging daarbij verloren.',
  'Filips II zag de Beeldenstorm als opstand. In 1567 stuurde hij de hertog van Alva met een leger. Diens Raad van Beroerten veroordeelde duizenden mensen. In 1568 werden de graven van Egmont en Horne in Brussel onthoofd. Het geweld dreef de spanningen verder op.'
 ],
 cijfers: [['Begin bij Steenvoorde','10 augustus 1566'],['Antwerpen','20 augustus 1566'],['Komst van Alva','augustus 1567'],['Egmont en Horne onthoofd','5 juni 1568']],
 figuren: [['Filips II','koning van Spanje en heer der Nederlanden'],['Margaretha van Parma','landvoogdes'],['Hertog van Alva','legeraanvoerder en landvoogd vanaf 1567']],
 bronnen: [CANON,['Wikipedia: Beeldenstorm',W('Beeldenstorm')],['Wikipedia: Raad van Beroerten',W('Raad van Beroerten')]]
},

'Begin Tachtigjarige Oorlog': {
 aanloop: [
  'Na de komst van Alva vluchtte Willem van Oranje naar zijn stamslot Dillenburg in Duitsland. Hij werd door de Raad van Beroerten veroordeeld en zijn bezittingen werden in beslag genomen. Vanuit Duitsland bereidde hij een gewapende inval voor.',
  'Het plan was om vanuit verschillende richtingen tegelijk de Nederlanden binnen te vallen. Oranjes broer Lodewijk van Nassau trok met een leger Groningerland binnen.'
 ],
 verloop: [
  'Op 23 mei 1568 versloeg Lodewijk bij Heiligerlee een Spaans leger onder de stadhouder graaf van Aremberg. Aremberg sneuvelde, maar ook Lodewijks broer Adolf van Nassau kwam om.',
  'Het succes was kort. Alva trok zelf naar het noorden en versloeg Lodewijk op 21 juli 1568 bij Jemmingen in Oost-Friesland. Ook de veldtocht van Willem van Oranje in het najaar liep op niets uit. Kort na Heiligerlee, op 5 juni 1568, liet Alva in Brussel de graven van Egmont en Horne onthoofden.',
  'Pas in 1572, toen de watergeuzen Den Briel innamen, kreeg de Opstand vaste grond in Holland en Zeeland. De slag bij Heiligerlee geldt als het symbolische begin van een oorlog die, met een bestand van twaalf jaar, tot 1648 zou duren.'
 ],
 cijfers: [['Slag bij Heiligerlee','23 mei 1568'],['Slag bij Jemmingen','21 juli 1568'],['Inname Den Briel','1 april 1572'],['Einde oorlog','1648']],
 figuren: [['Willem van Oranje','leider van de Opstand'],['Lodewijk van Nassau','aanvoerder bij Heiligerlee'],['Adolf van Nassau','sneuvelde bij Heiligerlee'],['Graaf van Aremberg','Spaanse aanvoerder, sneuvelde']],
 bronnen: [['Wikipedia: Slag bij Heiligerlee',W('Slag bij Heiligerlee')],['Wikipedia: Tachtigjarige Oorlog',W('Tachtigjarige Oorlog')]]
},

'Slag op de Mookerheide': {
 aanloop: [
  'In 1574 belegerden Spaanse troepen de stad Leiden. Willem van Oranje zocht een manier om de druk op Holland te verlichten. Zijn broer Lodewijk van Nassau verzamelde in Duitsland een huurlingenleger.',
  'Lodewijk wilde via de Maas naar het zuiden trekken en zo Spaanse troepen uit Holland weglokken. Een Spaans leger onder Sancho Dávila trok hem tegemoet en sneed hem de weg af bij Mook, ten zuiden van Nijmegen.'
 ],
 verloop: [
  'Op 14 april 1574 kwam het op de heide bij Mook tot een slag. Het leger van de opstandelingen werd verslagen. Lodewijk en zijn broer Hendrik van Nassau sneuvelden. Hun lichamen zijn nooit gevonden.',
  'Voor Willem van Oranje was het een zware klap. Hij verloor twee broers en een leger. Wel had de veldtocht Spaanse troepen tijdelijk van Leiden weggetrokken.',
  'Leiden hield stand. Door dijken door te steken kon een vloot van geuzen de stad over het water bereiken. Op 3 oktober 1574 werd Leiden ontzet, wat de stad nog altijd viert. Mook ligt tegenwoordig in de Limburgse gemeente Mook en Middelaar.'
 ],
 cijfers: [['Slag','14 april 1574'],['Gesneuvelde broers van Oranje','2 (Lodewijk en Hendrik)'],['Leidens Ontzet','3 oktober 1574'],['Universiteit Leiden','opgericht 1575']],
 figuren: [['Lodewijk van Nassau','aanvoerder, sneuvelde'],['Hendrik van Nassau','jongste broer van Oranje, sneuvelde'],['Sancho Dávila','Spaanse bevelhebber'],['Willem van Oranje','leider van de Opstand']],
 bronnen: [['Wikipedia: Slag op de Mookerheide',W('Slag op de Mookerheide')],['Wikipedia: Beleg van Leiden',W('Beleg van Leiden 1574')]]
},

'Beleg van Maastricht': {
 aanloop: [
  'Maastricht was een sterke vestingstad aan de Maas en een belangrijke oversteekplaats. De stad had twee heren: de hertog van Brabant en de prins-bisschop van Luik. Wie Maastricht bezat, beheerste een groot deel van het Maasdal.',
  'In 1579 koos Maastricht de kant van de Opstand. De nieuwe Spaanse landvoogd Alexander Farnese, hertog van Parma, wilde de zuidelijke Nederlanden terugwinnen en begon met deze stad. Bijna een eeuw later was Maastricht in handen van de Republiek, en toen richtte de Franse koning Lodewijk XIV er zijn pijlen op.'
 ],
 verloop: [
  'In maart 1579 sloeg Parma het beleg. Hij liet mijngangen graven en bestookte de muren maandenlang. Eind juni 1579 drongen zijn troepen de stad binnen. Bij het beleg en de plundering kwamen veel inwoners om. Maastricht bleef Spaans tot Frederik Hendrik de stad in 1632 veroverde.',
  'In juni 1673, tijdens de oorlog die met het Rampjaar begon, belegerde Lodewijk XIV de stad zelf. Zijn vestingbouwer Vauban liet loopgraven aanleggen die zigzaggend naar de muren liepen. Die aanpak werd daarna overal in Europa nagevolgd.',
  'Bij een aanval sneuvelde op 25 juni 1673 Charles d’Artagnan, kapitein van de musketiers, later beroemd door de romans van Alexandre Dumas. Na enkele weken gaf de stad zich over. Bij de Vrede van Nijmegen in 1678 kreeg de Republiek Maastricht terug.'
 ],
 cijfers: [['Inname door Parma','juni 1579'],['Verovering door Frederik Hendrik','1632'],['Franse verovering','juli 1673'],['Terug naar de Republiek','1678']],
 figuren: [['Alexander Farnese','hertog van Parma, veroverde Maastricht in 1579'],['Lodewijk XIV','Franse koning, leidde het beleg van 1673'],['Sébastien Le Prestre de Vauban','Franse vestingbouwer'],['Charles d’Artagnan','musketier, sneuvelde in 1673']],
 bronnen: [['Wikipedia: Beleg van Maastricht (1579)',W('Beleg van Maastricht 1579')],['Wikipedia: Beleg van Maastricht (1673)',W('Beleg van Maastricht 1673')]]
},

'Plakkaat van Verlatinghe': {
 aanloop: [
  'Rond 1579 viel de Opstand uiteen in een noordelijk en een zuidelijk blok. Een aantal noordelijke gewesten sloot in januari 1579 de Unie van Utrecht om samen verder te vechten. Filips II bleef officieel hun vorst.',
  'In 1580 verklaarde Filips II Willem van Oranje vogelvrij en loofde een beloning uit voor wie hem doodde. Oranje antwoordde met zijn Apologie, een felle verdediging van zichzelf. De breuk met de koning werd zo onvermijdelijk.'
 ],
 verloop: [
  'Op 26 juli 1581 namen de Staten-Generaal in Den Haag het Plakkaat van Verlatinghe aan. Daarin verklaarden ze dat Filips II zijn recht op de troon had verloren.',
  'De redenering was dat een vorst er is voor zijn onderdanen. Een vorst die hen onderdrukt en hun privileges schendt, is een tiran. Dan mogen de onderdanen hem verlaten en een andere heer kiezen.',
  'De opstandelingen wilden nog geen republiek. Ze boden de soevereiniteit aan de Franse hertog van Anjou aan. Toch wordt het plakkaat vaak een van de eerste onafhankelijkheidsverklaringen genoemd. Sommige historici zien er een voorbeeld in voor de Amerikaanse onafhankelijkheidsverklaring van 1776.'
 ],
 cijfers: [['Unie van Utrecht','23 januari 1579'],['Ban tegen Oranje','1580'],['Plakkaat aangenomen','26 juli 1581']],
 figuren: [['Filips II','afgezworen vorst'],['Willem van Oranje','leider van de Opstand'],['Hertog van Anjou','nieuwe heer, kreeg de soevereiniteit aangeboden']],
 bronnen: [CANON,['Wikipedia: Plakkaat van Verlatinghe',W('Plakkaat van Verlatinghe')],['Nationaal Archief','https://www.nationaalarchief.nl/']]
},

'Moord op Willem van Oranje': {
 aanloop: [
  'Willem van Oranje werd in 1533 geboren in Dillenburg. Hij erfde jong het prinsdom Orange en grote bezittingen in de Nederlanden. Hij groeide op aan het hof van Karel V, maar werd later de leider van de Opstand tegen Filips II.',
  'In 1580 verklaarde Filips II hem vogelvrij. Wie Oranje doodde, kreeg een grote beloning. Er volgden meerdere aanslagen. In 1582 raakte hij in Antwerpen zwaargewond, maar hij overleefde.'
 ],
 verloop: [
  'Op 10 juli 1584 schoot Balthasar Gerards hem neer in het Prinsenhof in Delft, waar Oranje woonde. Gerards had zich voorgedaan als aanhanger van de Opstand. Oranje overleed kort daarna.',
  'Gerards werd gevangengenomen en na een proces op gruwelijke wijze terechtgesteld. Oranje werd begraven in de Nieuwe Kerk in Delft, waar later een groot praalgraf voor hem werd gebouwd. In het Prinsenhof, nu een museum, zijn de kogelgaten nog te zien.',
  'De moord was een schok voor de Opstand, maar die ging door. Zijn zoon Maurits werd stadhouder en legeraanvoerder. Willem van Oranje wordt de Vader des Vaderlands genoemd. Het Wilhelmus gaat over hem.'
 ],
 cijfers: [['Geboren','1533, Dillenburg'],['Vogelvrij verklaard','1580'],['Moord in Delft','10 juli 1584']],
 figuren: [['Willem van Oranje','leider van de Opstand'],['Balthasar Gerards','moordenaar'],['Filips II','verklaarde Oranje vogelvrij'],['Maurits van Nassau','zoon en opvolger als legeraanvoerder']],
 bronnen: [CANON,['Wikipedia: Willem van Oranje',W('Willem van Oranje')],['Wikipedia: Balthasar Gerards',W('Balthasar Gerards')]]
},

'De Republiek': {
 aanloop: [
  'Na het Plakkaat van Verlatinghe zochten de opstandige gewesten een nieuwe vorst. De hertog van Anjou en daarna de Engelse graaf van Leicester kregen het gezag, maar beiden raakten in conflict met de Staten.',
  'Ondertussen veroverde Parma grote delen van het zuiden, in 1585 ook Antwerpen. Tienduizenden protestanten en kooplieden vluchtten naar het noorden. Ze brachten kennis, kapitaal en handelscontacten mee.'
 ],
 verloop: [
  'Toen Leicester eind 1587 vertrok, besloten de Staten-Generaal in 1588 het zonder vorst te doen. Zo ontstond de Republiek der Zeven Verenigde Nederlanden: Holland, Zeeland, Utrecht, Gelre, Overijssel, Friesland en Groningen.',
  'Elk gewest bleef grotendeels zelfstandig en had één stem in de Staten-Generaal. Drenthe had een eigen bestuur, maar geen stem. Holland was het rijkst en had de meeste invloed. De landsadvocaat van Holland, Johan van Oldenbarnevelt, leidde het bestuur. Stadhouder Maurits voerde het leger aan.',
  'De Republiek groeide uit tot een wereldmacht in handel en scheepvaart. Andere gebieden, zoals Staats-Brabant en later delen van Limburg, werden als generaliteitslanden bestuurd zonder eigen stem. De Republiek bestond tot 1795.'
 ],
 cijfers: [['Begin Republiek','1588'],['Stemhebbende gewesten','7'],['Val van Antwerpen','1585'],['Einde Republiek','1795']],
 figuren: [['Johan van Oldenbarnevelt','landsadvocaat van Holland'],['Maurits van Nassau','stadhouder en legeraanvoerder'],['Graaf van Leicester','Engelse landvoogd 1586–1587']],
 bronnen: [CANON,['Wikipedia: Republiek der Zeven Verenigde Nederlanden',W('Republiek der Zeven Verenigde Nederlanden')]]
},

'VOC': {
 aanloop: [
  'Rond 1595 voeren de eerste Nederlandse schepen naar Azië om specerijen te halen. Daarna richtten kooplieden in verschillende steden eigen compagnieën op. Ze concurreerden met elkaar, waardoor de prijzen in Azië stegen en in Europa daalden.',
  'Op aandringen van Oldenbarnevelt werden ze in 1602 samengevoegd tot de Verenigde Oost-Indische Compagnie. De Staten-Generaal gaven de VOC het alleenrecht op handel tussen Kaap de Goede Hoop en Straat Magellaan. Iedereen kon aandelen kopen.'
 ],
 verloop: [
  'De VOC mocht forten bouwen, verdragen sluiten en oorlog voeren. In 1619 stichtte Jan Pieterszoon Coen Batavia op Java als hoofdkwartier. Vandaar uit beheerste de compagnie een netwerk van handelsposten van Zuid-Afrika tot Japan.',
  'De winsten kwamen met veel geweld tot stand. In 1621 veroverde Coen de Banda-eilanden om de handel in nootmuskaat in handen te krijgen. Het grootste deel van de bevolking werd gedood, verdreven of tot slaaf gemaakt. Ook elders in Azië gebruikte de VOC dwangarbeid en slavenarbeid.',
  'De VOC werd een van de grootste ondernemingen van haar tijd. In de 18e eeuw liepen de schulden op. In 1799 werd de compagnie opgeheven. In 1621 kreeg de West-Indische Compagnie (WIC) een vergelijkbaar monopolie voor Afrika en Amerika.'
 ],
 cijfers: [['Oprichting','20 maart 1602'],['Startkapitaal','ca. 6,4 miljoen gulden'],['Stichting Batavia','1619'],['Opgeheven','1799']],
 figuren: [['Johan van Oldenbarnevelt','drong aan op de oprichting'],['Jan Pieterszoon Coen','gouverneur-generaal, stichter van Batavia'],['Heren XVII','het bestuur van de VOC']],
 bronnen: [CANON,['Wikipedia: VOC',W('Verenigde Oost-Indische Compagnie')],['Rijksmuseum','https://www.rijksmuseum.nl/']]
},

'De Beemster': {
 aanloop: [
  'Ten noorden van Amsterdam lag het Beemstermeer, een binnenmeer dat steeds groter werd en het omliggende land bedreigde. Rond 1600 hadden Amsterdamse kooplieden veel geld verdiend met handel, onder meer via de VOC.',
  'Ze zochten een veilige belegging. Droogmaken van een meer leverde vruchtbare landbouwgrond op die ze konden verpachten. In 1607 kregen de investeerders toestemming om het meer droog te leggen.'
 ],
 verloop: [
  'Molenmaker Jan Adriaanszoon Leeghwater speelde een belangrijke rol bij het werk. Eerst werd een ringdijk met een ringvaart aangelegd. Daarna pompten tientallen windmolens het water in trappen omhoog naar de ringvaart.',
  'Een eerste poging mislukte in 1610, toen een dijk doorbrak bij een storm. In 1612 viel het meer definitief droog. Het land werd verdeeld volgens een strak raster van wegen, sloten en rechthoekige kavels. Er kwamen boerderijen en ook buitenplaatsen van rijke Amsterdammers.',
  'Na de Beemster volgden de Purmer, de Wormer en de Schermer. De Beemster liet zien hoe kapitaal en techniek samen nieuw land konden maken. Sinds 1999 staat de droogmakerij op de Werelderfgoedlijst van UNESCO.'
 ],
 cijfers: [['Toestemming','1607'],['Drooggevallen','1612'],['Oppervlakte','ca. 7000 hectare'],['UNESCO-werelderfgoed','1999']],
 figuren: [['Jan Adriaanszoon Leeghwater','molenmaker en waterbouwkundige'],['Dirck van Os','koopman en een van de initiatiefnemers']],
 bronnen: [CANON,['Wikipedia: Beemster',W('Droogmakerij de Beemster')]]
},

'Oldenbarnevelt onthoofd': {
 aanloop: [
  'Johan van Oldenbarnevelt was als landsadvocaat van Holland de machtigste politicus van de Republiek. In 1609 sloot hij met Spanje het Twaalfjarig Bestand, tegen de zin van stadhouder Maurits, die liever doorvocht.',
  'Tijdens het Bestand ontstond een felle ruzie onder protestantse theologen. De volgelingen van Arminius, de remonstranten, dachten milder over de vrije wil dan de strenge aanhangers van Gomarus. Oldenbarnevelt steunde de remonstranten, Maurits koos uiteindelijk voor de contraremonstranten.'
 ],
 verloop: [
  'In 1617 gaf Holland steden het recht eigen soldaten aan te nemen, de waardgelders. Maurits zag dat als een bedreiging van de eenheid van het leger. In augustus 1618 liet hij Oldenbarnevelt arresteren, samen met onder anderen Hugo de Groot.',
  'Een speciale rechtbank veroordeelde Oldenbarnevelt voor het verstoren van de rust in staat en kerk. Op 13 mei 1619 werd hij op het Binnenhof in Den Haag onthoofd. Hij was 71 jaar oud.',
  'Tegelijk besliste de Synode van Dordrecht in het voordeel van de contraremonstranten. Remonstrantse predikanten werden afgezet of verbannen. Het proces geldt nog altijd als een van de meest omstreden politieke processen uit de Nederlandse geschiedenis.'
 ],
 cijfers: [['Twaalfjarig Bestand','1609–1621'],['Arrestatie','augustus 1618'],['Onthoofding','13 mei 1619'],['Leeftijd','71 jaar']],
 figuren: [['Johan van Oldenbarnevelt','landsadvocaat van Holland'],['Prins Maurits','stadhouder en legeraanvoerder'],['Jacobus Arminius','theoloog, inspirator van de remonstranten'],['Franciscus Gomarus','theoloog, leider van de contraremonstranten']],
 bronnen: [CANON,['Wikipedia: Johan van Oldenbarnevelt',W('Johan van Oldenbarnevelt')],['Wikipedia: Synode van Dordrecht',W('Synode van Dordrecht')]]
},

'Hugo de Groot ontsnapt': {
 aanloop: [
  'Hugo de Groot was een wonderkind. Hij studeerde al jong in Leiden en werd een bekend jurist en geleerde. In 1609 schreef hij Mare Liberum, waarin hij betoogde dat de zee vrij moest zijn voor alle volken.',
  'Als pensionaris van Rotterdam stond hij aan de kant van Oldenbarnevelt. In 1618 werd hij met hem gearresteerd. In 1619 kreeg hij levenslange gevangenisstraf in slot Loevestein, een vesting bij de samenvloeiing van Maas en Waal.'
 ],
 verloop: [
  'In de gevangenis mocht De Groot boeken lezen. Die werden in een grote kist aan- en afgevoerd. Zijn vrouw Maria van Reigersberch bedacht een plan. Op 22 maart 1621 kroop hij in de kist en werd zo naar buiten gedragen.',
  'Dienstmeid Elsje van Houweningen begeleidde de kist naar Gorinchem. Daar vluchtte De Groot, vermomd als metselaar, naar Antwerpen en daarna naar Parijs. Hij keerde nooit blijvend terug naar de Republiek.',
  'In ballingschap schreef hij in 1625 De iure belli ac pacis, over het recht van oorlog en vrede. Dat werk legde een basis voor het internationaal recht. Meerdere musea bezitten een kist die als de echte boekenkist wordt getoond.'
 ],
 cijfers: [['Mare Liberum','1609'],['Levenslang','1619'],['Ontsnapping','22 maart 1621'],['De iure belli ac pacis','1625']],
 figuren: [['Hugo de Groot','jurist en geleerde'],['Maria van Reigersberch','zijn vrouw, bedacht de ontsnapping'],['Elsje van Houweningen','dienstmeid, begeleidde de kist']],
 bronnen: [CANON,['Wikipedia: Hugo de Groot',W('Hugo de Groot')],['Rijksmuseum','https://www.rijksmuseum.nl/']]
},

'Statenbijbel': {
 aanloop: [
  'Protestanten vonden dat gelovigen de bijbel zelf moesten kunnen lezen. In de Nederlanden circuleerden wel vertalingen, maar die waren vaak gebaseerd op andere vertalingen, zoals de Duitse van Luther, en niet op de oorspronkelijke teksten.',
  'De Synode van Dordrecht besloot in 1618 tot een nieuwe vertaling rechtstreeks uit het Hebreeuws en Grieks. De Staten-Generaal namen de kosten op zich. Daarom heet deze vertaling de Statenbijbel.'
 ],
 verloop: [
  'De vertalers werkten vanaf 1626 in Leiden. Johannes Bogerman, de voorzitter van de synode, werkte mee aan het Oude Testament. De vertaling moest nauwkeurig zijn en begrijpelijk voor mensen uit alle gewesten. Revisoren uit verschillende gewesten controleerden het werk.',
  'In 1637 verscheen de Statenbijbel. Hij werd lange tijd in vrijwel elk protestants gezin en in elke protestantse kerk gebruikt. Bij sommige orthodox-protestantse gemeenten is dat nog steeds zo.',
  'De vertalers kozen bewust taal die in het hele land begrepen werd. Daardoor droeg de Statenbijbel bij aan een gemeenschappelijke Nederlandse standaardtaal. Veel uitdrukkingen komen eruit voort, zoals zijn handen in onschuld wassen.'
 ],
 cijfers: [['Besluit synode','1618'],['Begin vertaalwerk','1626'],['Verschenen','1637']],
 figuren: [['Johannes Bogerman','voorzitter Synode van Dordrecht, vertaler'],['Willem Baudartius','vertaler van het Oude Testament']],
 bronnen: [CANON,['Wikipedia: Statenvertaling',W('Statenvertaling')]]
},

'Slavernij': {
 aanloop: [
  'Na de oprichting van de WIC in 1621 raakte de Republiek betrokken bij de trans-Atlantische slavenhandel. In 1637 veroverde de WIC het fort Elmina aan de kust van het huidige Ghana. Vandaar en vanaf andere posten werden Afrikanen verscheept.',
  'In Amerika groeide de vraag naar arbeidskrachten op suiker-, koffie- en katoenplantages. Nederland kreeg kolonies als Curaçao en in 1667 Suriname. Ook de VOC hield in Azië en Zuid-Afrika mensen in slavernij.'
 ],
 verloop: [
  'Nederlandse handelaren vervoerden naar schatting zo’n 600.000 Afrikanen naar Amerika. Velen stierven al tijdens de overtocht. Op de plantages werkten slaafgemaakten onder dwang, met zware straffen bij verzet.',
  'Er was steeds verzet. In Suriname vluchtten mensen het oerwoud in en vormden marrongemeenschappen. Op Curaçao leidde Tula in 1795 een grote opstand, die hard werd neergeslagen.',
  'Op 1 juli 1863 schafte Nederland de slavernij af in Suriname en op de Antillen. Plantage-eigenaren kregen een vergoeding, de slaafgemaakten niets. In Suriname moesten zij nog tien jaar onder staatstoezicht verplicht doorwerken. Op 1 juli wordt Keti Koti gevierd. In 2022 bood de regering excuses aan.'
 ],
 cijfers: [['Verovering Elmina','1637'],['Vervoerde Afrikanen','ca. 600.000'],['Afschaffing','1 juli 1863'],['Einde staatstoezicht','1873']],
 figuren: [['Tula','leider van de opstand op Curaçao in 1795'],['Boni','leider van marrons in Suriname']],
 bronnen: [CANON,['Wikipedia: Slavernij in Suriname',W('Slavernij in Suriname')],['Wikipedia: Nederlandse slavenhandel',W('Nederlandse trans-Atlantische slavenhandel')]]
},

'De Nachtwacht': {
 aanloop: [
  'In de 17e eeuw hadden steden schutterijen, burgerwachten die de stad moesten beschermen. Hun leden lieten zich graag samen schilderen. Zo’n schuttersstuk werd opgehangen in de doelen, het gebouw van de schutterij.',
  'Rembrandt van Rijn kwam uit Leiden en had in Amsterdam snel naam gemaakt als portretschilder. Rond 1639 kreeg hij de opdracht voor een groot schuttersstuk voor de nieuwe zaal van de Kloveniersdoelen.'
 ],
 verloop: [
  'Rembrandt schilderde de compagnie van kapitein Frans Banninck Cocq en luitenant Willem van Ruytenburch. Anders dan gebruikelijk zette hij de schutters niet keurig in een rij. Ze lijken net in beweging te komen, met wapens, een trom en een vaandel.',
  'Met licht en donker liet hij sommige figuren oplichten, zoals de luitenant en een meisje in het goud. In 1642 was het doek klaar. In 1715 werd het aan de randen ingekort om het in het stadhuis op de Dam te laten passen.',
  'De naam De Nachtwacht ontstond pas later, toen het vernis donker was geworden. Het schilderij hangt in het Rijksmuseum. Sinds 2019 wordt het daar onder de naam Operatie Nachtwacht onderzocht en gerestaureerd, terwijl bezoekers kunnen meekijken.'
 ],
 cijfers: [['Voltooid','1642'],['Afmeting','ca. 3,8 bij 4,5 meter'],['Ingekort','1715'],['Operatie Nachtwacht','vanaf 2019']],
 figuren: [['Rembrandt van Rijn','schilder'],['Frans Banninck Cocq','kapitein van de schutterscompagnie'],['Willem van Ruytenburch','luitenant']],
 bronnen: [CANON,['Rijksmuseum','https://www.rijksmuseum.nl/'],['Wikipedia: De Nachtwacht',W('De Nachtwacht')]]
},

'Vrede van Munster': {
 aanloop: [
  'Na het Twaalfjarig Bestand laaide de oorlog met Spanje in 1621 weer op. Onder stadhouder Frederik Hendrik veroverde de Republiek steden als ’s-Hertogenbosch, Maastricht en Breda. Spanje was ondertussen ook in oorlog met Frankrijk.',
  'Tegelijk woedde in Duitsland de Dertigjarige Oorlog. Vanaf 1643 kwamen gezanten van heel Europa bijeen in Münster en Osnabrück om over vrede te praten. Ook Spanje en de Republiek onderhandelden daar.'
 ],
 verloop: [
  'Op 30 januari 1648 werd het verdrag tussen Spanje en de Republiek ondertekend. Op 15 mei 1648 bezwoeren de gezanten de vrede in het stadhuis van Münster. Gerard ter Borch legde die plechtigheid vast op een beroemd schilderij. Op 5 juni 1648 werd de vrede in de Republiek feestelijk afgekondigd.',
  'Spanje erkende de Republiek als onafhankelijke staat. De Republiek hield de veroverde gebieden in Brabant, Vlaanderen en Limburg. De Schelde bleef gesloten, wat gunstig was voor Amsterdam en slecht voor Antwerpen.',
  'De vrede maakte deel uit van de Vrede van Westfalen, die ook de Dertigjarige Oorlog beëindigde. De Republiek stond aan het begin van het hoogtepunt van haar macht en welvaart.'
 ],
 cijfers: [['Begin onderhandelingen','ca. 1643–1646'],['Ondertekend','30 januari 1648'],['Bezworen','15 mei 1648'],['Duur van de oorlog','80 jaar, met 12 jaar bestand']],
 figuren: [['Adriaan Pauw','Hollandse gezant'],['Graaf van Peñaranda','Spaanse gezant'],['Gerard ter Borch','schilderde de bezwering van de vrede']],
 bronnen: [['Wikipedia: Vrede van Münster',W('Vrede van Münster')],['Rijksmuseum','https://www.rijksmuseum.nl/']]
},

'Huygens en het slingeruurwerk': {
 aanloop: [
  'Christiaan Huygens werd in 1629 in Den Haag geboren. Zijn vader Constantijn was secretaris van de stadhouder, dichter en geleerde. Christiaan kreeg thuis een brede opleiding en studeerde in Leiden en Breda.',
  'Klokken waren in die tijd onnauwkeurig. Voor sterrenkunde en voor plaatsbepaling op zee was een betrouwbare tijdmeting erg belangrijk. Galileo had al ontdekt dat een slinger in een vast ritme heen en weer gaat.'
 ],
 verloop: [
  'In 1656 bedacht Huygens hoe een slinger de gang van een uurwerk kon regelen. In 1657 kreeg hij octrooi, en de Haagse klokkenmaker Salomon Coster bouwde de eerste slingerklokken. Ze waren veel nauwkeuriger dan eerdere klokken.',
  'Huygens deed ook belangrijk werk in de sterrenkunde. Met zelf geslepen lenzen ontdekte hij in 1655 Titan, de grootste maan van Saturnus. Hij verklaarde dat Saturnus omringd is door een dunne, platte ring.',
  'Later werkte hij aan de Franse Académie des Sciences in Parijs. Hij ontwikkelde een golftheorie van het licht. Huygens geldt als een van de belangrijkste wetenschappers van de 17e eeuw. Hij overleed in 1695.'
 ],
 cijfers: [['Geboren','1629, Den Haag'],['Titan ontdekt','1655'],['Slingeruurwerk','1656'],['Octrooi','1657']],
 figuren: [['Christiaan Huygens','natuurkundige, wiskundige en sterrenkundige'],['Constantijn Huygens','zijn vader, dichter en diplomaat'],['Salomon Coster','Haagse klokkenmaker']],
 bronnen: [CANON,['Wikipedia: Christiaan Huygens',W('Christiaan Huygens')],['Rijksmuseum Boerhaave','https://www.rijksmuseumboerhaave.nl/']]
},

'Partagetraktaat': {
 aanloop: [
  'Ten oosten van de Maas lagen de Landen van Overmaas: Valkenburg, Dalhem en ’s-Hertogenrade. Ze hoorden bij het hertogdom Brabant. Na de verovering van Maastricht in 1632 nam de Republiek ook een deel van dit gebied in.',
  'Bij de Vrede van Munster in 1648 bleef onduidelijk wie de Landen van Overmaas precies bezat. Spanje en de Republiek maakten er allebei aanspraak op. Dat leidde jarenlang tot onzekerheid en conflicten.'
 ],
 verloop: [
  'Op 26 december 1661 sloten de Republiek en Spanje in Den Haag het Partagetraktaat, het verdelingsverdrag. Elk van de drie landen werd verdeeld in een Staats deel en een Spaans deel.',
  'Zo ontstond een lappendeken van dorpen en heerlijkheden met verschillende heren, soms vlak naast elkaar. Wie door het gebied reisde, kon op korte afstand meerdere grenzen passeren. In het Staatse deel werd de gereformeerde kerk de officiële kerk, terwijl de bevolking grotendeels katholiek bleef.',
  'Deze verdeling bleef met enkele wijzigingen bestaan tot de Franse tijd aan het eind van de 18e eeuw. Pas in de 19e eeuw groeide Zuid-Limburg samen tot een deel van de nieuwe provincie Limburg.'
 ],
 cijfers: [['Verdrag','26 december 1661'],['Verdeelde landen','3: Valkenburg, Dalhem, ’s-Hertogenrade'],['Einde verdeling','Franse tijd, 1794–1795']],
 figuren: [['Filips IV','koning van Spanje'],['Johan de Witt','raadpensionaris van Holland']],
 bronnen: [['Wikipedia: Partagetraktaat',W('Partagetraktaat')],['Wikipedia: Landen van Overmaas',W('Landen van Overmaas')]]
},

'Atlas Maior van Blaeu': {
 aanloop: [
  'In de 17e eeuw was Amsterdam het centrum van de wereldhandel. Schippers, kooplieden en bestuurders hadden behoefte aan goede kaarten. Uitgevers als Willem Jansz. Blaeu en Joan Blaeu verzamelden kennis van zeelieden van over de hele wereld.',
  'Willem Blaeu werd in 1633 kaartenmaker van de VOC. Na zijn dood in 1638 nam zijn zoon Joan het bedrijf en die functie over. Zo had de familie toegang tot de nieuwste geografische informatie.'
 ],
 verloop: [
  'In 1662 bracht Joan Blaeu de Atlas Maior uit, de grote atlas. De Latijnse uitgave telde elf delen met bijna zeshonderd kaarten. Er verschenen ook uitgaven in het Frans, Nederlands, Spaans en Duits.',
  'De atlas was een van de grootste en duurste boeken van de 17e eeuw. Rijke kopers lieten de kaarten met de hand inkleuren en de banden met goud versieren. Een exemplaar werd vaak als staatsgeschenk gegeven.',
  'In 1672 verwoestte een brand een groot deel van de drukkerij van Blaeu. Joan Blaeu overleed een jaar later. De Atlas Maior laat zien hoe sterk Amsterdam toen de kaartenwereld beheerste.'
 ],
 cijfers: [['Verschenen','1662'],['Delen (Latijnse uitgave)','11'],['Aantal kaarten','bijna 600'],['Brand drukkerij','1672']],
 figuren: [['Joan Blaeu','kaartenmaker en uitgever'],['Willem Jansz. Blaeu','zijn vader, oprichter van het bedrijf']],
 bronnen: [CANON,['Wikipedia: Atlas Maior',W('Atlas Maior Blaeu')],['Wikipedia: Joan Blaeu',W('Joan Blaeu')]]
},

'Tocht naar Chatham': {
 aanloop: [
  'De Republiek en Engeland waren grote handelsconcurrenten. Dat leidde tot een reeks zeeoorlogen. De Tweede Engelse Oorlog begon in 1665. Raadpensionaris Johan de Witt liet een sterke vloot bouwen onder leiding van Michiel de Ruyter.',
  'In 1667 waren beide landen uitgeput en werd in Breda over vrede gepraat. Engeland had geldgebrek en had veel oorlogsschepen opgelegd. De Witt wilde met een harde klap de onderhandelingen versnellen.'
 ],
 verloop: [
  'In juni 1667 voer de vloot naar de Theems. Cornelis de Witt ging mee als vertegenwoordiger van de Staten. Een eskader onder Willem Joseph van Ghent voer de rivier de Medway op naar de marinebasis Chatham.',
  'De Nederlanders doorbraken een zware ketting over de rivier en staken een reeks Engelse oorlogsschepen in brand. Het vlaggenschip Royal Charles werd buitgemaakt en meegenomen naar de Republiek. Het sierlijke achterschip is nu te zien in het Rijksmuseum.',
  'De aanval was een grote vernedering voor Engeland en wordt daar nog altijd gezien als een van de zwaarste nederlagen van de marine. Op 31 juli 1667 werd de Vrede van Breda gesloten. De Republiek behield Suriname, Engeland Nieuw-Amsterdam, het latere New York.'
 ],
 cijfers: [['Tocht','juni 1667'],['Buitgemaakt','de Royal Charles'],['Vrede van Breda','31 juli 1667']],
 figuren: [['Michiel de Ruyter','luitenant-admiraal, opperbevelhebber van de vloot'],['Johan de Witt','raadpensionaris, bedenker van het plan'],['Cornelis de Witt','vertegenwoordiger van de Staten aan boord'],['Willem Joseph van Ghent','leidde de aanval op de Medway']],
 bronnen: [CANON,['Rijksmuseum','https://www.rijksmuseum.nl/'],['Wikipedia: Tocht naar Chatham',W('Tocht naar Chatham')]]
},

'Spinoza': {
 aanloop: [
  'Baruch de Spinoza werd in 1632 in Amsterdam geboren in een Portugees-Joodse familie. Zijn ouders waren gevlucht voor vervolging op het Iberisch schiereiland. In de Republiek konden Joden hun geloof relatief vrij beleven.',
  'Spinoza stelde al jong kritische vragen over de godsdienst. In 1656 sprak de Portugees-Joodse gemeente een banvloek over hem uit. Hij verliet Amsterdam en verdiende zijn brood onder meer met het slijpen van lenzen, in Rijnsburg, Voorburg en Den Haag.'
 ],
 verloop: [
  'In 1670 verscheen zijn Tractatus theologico-politicus. Om zichzelf te beschermen stond er geen auteur op en een verzonnen drukker in Hamburg. In werkelijkheid werd het boek in Amsterdam uitgegeven door Jan Rieuwertsz.',
  'Spinoza betoogde dat de bijbel als een historisch boek gelezen moest worden. Volgens hem moest de staat vrijheid van denken en spreken toestaan. Kerkelijke en wereldlijke overheden vonden het boek gevaarlijk. In 1674 werd het in Holland verboden.',
  'Spinoza overleed in 1677. Kort daarna verscheen zijn hoofdwerk Ethica, waarin hij God en de natuur als één geheel beschreef. Hij geldt als een van de grondleggers van de Verlichting.'
 ],
 cijfers: [['Geboren','1632, Amsterdam'],['Banvloek','1656'],['Tractatus','1670'],['Verbod in Holland','1674']],
 figuren: [['Baruch de Spinoza','filosoof'],['Jan Rieuwertsz','Amsterdamse uitgever'],['Franciscus van den Enden','leraar Latijn van Spinoza']],
 bronnen: [CANON,['Wikipedia: Baruch de Spinoza',W('Baruch de Spinoza')],['Wikipedia: Tractatus theologico-politicus',W('Tractatus theologico-politicus')]]
},

'Rampjaar': {
 aanloop: [
  'Na de dood van stadhouder Willem II in 1650 regeerde de Republiek zonder stadhouder. Raadpensionaris Johan de Witt leidde het land en zorgde voor een sterke vloot, maar het landleger was verwaarloosd.',
  'De Franse koning Lodewijk XIV wilde zijn rijk naar het noorden uitbreiden. Hij sloot een geheim verbond met de Engelse koning Karel II. Ook de bisschop van Munster en de keurvorst van Keulen sloten zich bij hem aan.'
 ],
 verloop: [
  'In 1672 vielen de vier tegelijk aan. Het Franse leger trok over de Rijn en veroverde in korte tijd grote delen van het land, ook Utrecht. Holland werd gered door de Hollandse Waterlinie: het land werd onder water gezet. Op zee hield De Ruyter bij Solebay de Engelse en Franse vloot tegen.',
  'Onder de bevolking heersten paniek en woede. De jonge Willem III werd stadhouder. Op 20 augustus 1672 werden Johan en Cornelis de Witt in Den Haag door een woedende menigte vermoord.',
  'Groningen doorstond eind augustus een beleg door de bisschop van Munster. In 1673 en 1674 trokken de vijanden zich geleidelijk terug. Willem III werd later ook koning van Engeland.'
 ],
 cijfers: [['Aanvallers','4: Frankrijk, Engeland, Munster, Keulen'],['Zeeslag bij Solebay','7 juni 1672'],['Moord op de De Witts','20 augustus 1672'],['Ontzet van Groningen','28 augustus 1672']],
 figuren: [['Johan de Witt','raadpensionaris, vermoord'],['Willem III','stadhouder vanaf 1672'],['Lodewijk XIV','koning van Frankrijk'],['Bernhard von Galen','bisschop van Munster']],
 bronnen: [['Wikipedia: Rampjaar',W('Rampjaar 1672')],['Wikipedia: Hollandse Waterlinie',W('Hollandse Waterlinie')]]
}

});
})();
