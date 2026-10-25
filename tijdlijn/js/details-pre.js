// Uitgebreide achtergrond per gebeurtenis — prehistorie en Romeinse tijd. Sleutel = titel van de gebeurtenis.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
Object.assign(window.DETAILS, {

'Neanderthalers bij Maastricht': {
 aanloop: [
  'In de oude steentijd wisselden koude ijstijden en warmere perioden elkaar af. Nederland was toen geen land aan zee maar een open vlakte waar grote dieren rondtrokken. Kleine groepen mensachtigen volgden die dieren. Ze trokken rond en bleven nooit lang op één plek, wat hun sporen schaars en kwetsbaar maakt.',
  'In de zand- en grindgroeve Belvédère bij Maastricht kwamen bij het afgraven oude rivierafzettingen van de Maas bloot te liggen. Amateurarcheologen vonden er in 1980 bewerkte vuursteen, waarna archeologen van de Universiteit Leiden jarenlang onderzoek deden. De lagen waren goed bewaard gebleven, zodat ze konden zien waar de jagers precies hadden gewerkt.'
 ],
 verloop: [
  'De onderzoekers vonden vuurstenen werktuigen, afslagen en de botten van dieren zoals neushoorn, paard en hert. Menselijke botten zijn er niet gevonden. De werktuigen worden toegeschreven aan vroege Neanderthalers die hier ongeveer 250.000 tot 200.000 jaar geleden verbleven.',
  'Uit de vondsten blijkt dat de jagers hun prooi ter plekke slachtten. Verhitte vuursteen wijst waarschijnlijk op het gebruik van vuur. Ook werden kleine resten rode oker gevonden, een kleurstof die mogelijk voor versiering of het bewerken van huiden werd gebruikt.',
  'Belvédère behoort tot de oudste vindplaatsen van mensachtigen in Nederland. De vondsten helpen begrijpen hoe Neanderthalers leefden in een gebied dat telkens weer onder invloed van ijstijden stond.'
 ],
 cijfers: [['Ouderdom','ca. 250.000 – 200.000 jaar'],['Ontdekking','1980'],['Menselijke botten','niet gevonden'],['Ligging','Maasdal bij Maastricht']],
 figuren: [['Groeve Belvédère','vindplaats aan de rand van Maastricht'],['Wil Roebroeks','archeoloog, leidde het onderzoek'],['Neanderthalers','jagers uit de oude steentijd']],
 bronnen: [['Wikipedia: Belvédère (Maastricht)',W('Belvédère groeve Maastricht Neanderthaler')],['Wikipedia: Neanderthaler',W('Neanderthaler')]]
},

'Trijntje': {
 aanloop: [
  'Na de laatste ijstijd werd het klimaat warmer en steeg de zeespiegel. In het rivierengebied ontstond een landschap van moerassen en kreken, met hier en daar hoge zandruggen: rivierduinen. Daar woonden jager-verzamelaars uit de midden-steentijd.',
  'In 1997 werd voor de aanleg van de Betuweroute onderzoek gedaan bij Hardinxveld-Giessendam. Onder een dikke laag klei en veen lagen de resten van kampementen op zo’n rivierduin. Door het natte milieu waren ook botten, hout en plantenresten goed bewaard gebleven.'
 ],
 verloop: [
  'Tussen de vondsten lag het skelet van een vrouw, dat de naam Trijntje kreeg. Ze werd volgens de dateringen rond 5500 voor Christus begraven, gestrekt op haar rug. Het is het oudste bijna complete skelet dat in Nederland is gevonden.',
  'Uit de vindplaatsen blijkt hoe Trijntje en haar groep leefden. Ze visten, jaagden op dieren als bever en otter, verzamelden noten en planten en verplaatsten zich waarschijnlijk per kano door het natte landschap. Ook zijn er resten van honden gevonden.',
  'Trijntje leefde in een overgangstijd. Niet ver hiervandaan begonnen kort daarna de eerste boeren, en contacten tussen jagers en boeren werden in de eeuwen daarna steeds belangrijker. Langzaam namen de jager-verzamelaars zelf elementen van de landbouw over, zoals vee en aardewerk.'
 ],
 cijfers: [['Begraven','ca. 5500 v.C.'],['Gevonden','1997'],['Vindplaats','rivierduin bij Hardinxveld-Giessendam'],['Periode','midden-steentijd (mesolithicum)']],
 figuren: [['Trijntje','jager-verzamelaar uit het rivierengebied'],['Hardinxveld-Giessendam','vindplaats bij de Betuweroute'],['Jager-verzamelaars','bewoners van de rivierduinen']],
 bronnen: [CANON,['Wikipedia: Trijntje',W('Trijntje skelet')],['Wikipedia: Mesolithicum',W('Mesolithicum')]]
},

'Eerste boeren in Zuid-Limburg': {
 aanloop: [
  'Landbouw ontstond ruim tienduizend jaar geleden in het Midden-Oosten. Via de Balkan en het Donaugebied verspreidde de nieuwe manier van leven zich langzaam over Europa. Boeren namen graan, schapen, geiten en runderen mee.',
  'Rond 5300 voor Christus bereikten deze boeren Zuid-Limburg. De lössgrond was er vruchtbaar en goed te bewerken, en het lag hoog genoeg om droog te blijven. Archeologen noemen hen Bandkeramiekers, naar de banden en lijnen op hun aardewerk. Op de natte, lage gronden elders in Nederland woonden toen nog jager-verzamelaars.'
 ],
 verloop: [
  'De Bandkeramiekers woonden in dorpen met grote langhuizen van hout, leem en riet. Zo’n huis kon tientallen meters lang zijn en bood plaats aan mensen, voorraden en soms vee. Ze verbouwden onder meer emmer- en eenkoorntarwe.',
  'Bij Elsloo ontdekte archeoloog Pieter Modderman in de jaren 1950 en 1960 een groot dorp en een grafveld met meer dan honderd graven. Ook bij Stein, Sittard en Geleen zijn nederzettingen opgegraven. Daar vonden archeologen onder meer paalsporen van huizen, kuilen met afval, maalstenen en vuurstenen sikkels.',
  'Rond 4900 voor Christus verdwijnt de bandkeramiek uit Limburg. Toch was de stap naar landbouw blijvend. Jagen en verzamelen werd vanaf nu steeds meer vervangen door een vaste woonplaats en eigen voedselproductie.'
 ],
 cijfers: [['Aankomst','ca. 5300 v.C.'],['Einde bandkeramiek','ca. 4900 v.C.'],['Graven Elsloo','ruim 100'],['Bodem','vruchtbare löss']],
 figuren: [['Bandkeramiekers','eerste boeren van Nederland'],['Pieter Modderman','archeoloog, groef Elsloo en Stein op'],['Elsloo','dorp en grafveld aan de Maas']],
 bronnen: [['Wikipedia: Bandkeramische cultuur',W('Bandkeramische cultuur')],['Wikipedia: Neolithicum',W('Neolithicum')]]
},

'Vuursteenmijnen van Rijckholt': {
 aanloop: [
  'De eerste boeren hadden veel bijlen nodig om bos te kappen voor akkers en hout. Vuursteen was daarvoor het beste materiaal. Aan de oppervlakte lag vaak verweerde steen, die snel brak.',
  'Op het plateau tussen Rijckholt en Sint Geertruid zit vuursteen in lagen in de kalk. Rond 4000 voor Christus begonnen boeren, waarschijnlijk uit de Michelsbergcultuur, die lagen via schachten op te graven.'
 ],
 verloop: [
  'De mijnwerkers groeven verticale schachten tot vele meters diep en hakten van daaruit gangen in de kalk. Als gereedschap gebruikten ze vuistgrote knollen vuursteen en mogelijk geweien. Ter plekke sloegen ze de steen ruw tot bijlen, die elders werden geslepen.',
  'Tussen 1964 en 1972 groef een werkgroep van vrijwilligers een tunnel door het mijngebied. Ze vonden tientallen schachten en duizenden gebroken werktuigen. Het totaal aantal schachten wordt op enkele duizenden geschat.',
  'De mijnen laten zien dat er al grootschalige, georganiseerde winning van grondstoffen was. Bijlen van Rijckholt-vuursteen zijn ver buiten Limburg teruggevonden. Een deel van de gangen is nog te bezoeken. Het mijngebied is een beschermd archeologisch monument en behoort tot de belangrijkste prehistorische vindplaatsen van Limburg.'
 ],
 cijfers: [['Begin winning','ca. 4000 v.C.'],['Opgraving','1964 – 1972'],['Geschat aantal schachten','enkele duizenden'],['Product','bijlen (ruw gevormd)']],
 figuren: [['Michelsbergcultuur','boeren die de mijnen waarschijnlijk exploiteerden'],['Werkgroep Prehistorische Vuursteenmijnbouw','vrijwilligers die de mijnen onderzochten']],
 bronnen: [['Wikipedia: Vuursteenmijn van Rijckholt',W('Vuursteenmijnen Rijckholt')],['Wikipedia: Vuursteen',W('Vuursteen')]]
},

'Het wiel': {
 aanloop: [
  'Lang voordat er wielen waren, verplaatsten mensen zware dingen op sleden of door ze over boomstammen te laten rollen. Elke keer dat de last voorbij een stam kwam, werd die stam achteraan weer voor de last gelegd.',
  'Uit dat rollen ontstond waarschijnlijk het idee van een as: een balk waaraan schijven vastzitten. Zo ontstond een slee met wielen, de eerste kar.'
 ],
 verloop: [
  'De oudste vondsten en afbeeldingen van wagens stammen uit ongeveer 3500 v.C. Ze komen uit heel verschillende streken: van de Alpen en Zuid-Polen tot Mesopotamië, de Kaukasus en het Indusgebied. Het wiel is dus waarschijnlijk niet op één plek bedacht.',
  'Op een pot uit Bronocice in Zuid-Polen staat een tekening van een wagen. In Slovenië werd in het veen een houten wiel met een as gevonden, het oudste houten wiel dat we kennen. Ook in Mesopotamië draaide een schijf, bij de pottenbakkers: de draaischijf, waarop ze aardewerk maakten.',
  'De eerste wielen waren massieve houten schijven. Later kwamen er spaken, zodat wielen lichter werden. Zonder wiel hadden er geen wagens, watermolens en tandwielen bestaan, en later ook geen fietsen, treinen en auto’s.'
 ],
 cijfers: [['Oudste wagens','ca. 3500 v.C.'],['Draaischijf uit Uruk','ca. 3130 v.C.'],['Oudste houten wiel','gevonden in Slovenië'],['Daarvoor','sleden en boomstammen']],
 figuren: [['Onbekende uitvinders','het wiel is op meerdere plekken bedacht'],['Pottenbakkers in Mesopotamië','gebruikten een draaischijf'],['Wagenbouwers','maakten de eerste karren']],
 bronnen: [['Wikipedia: Wiel',W('Wiel (voortbeweging)')],['Wikipedia: Wiel van Stare gmajne',W('Wiel van Stare gmajne')]]
},

'De Maashagedis': {
 aanloop: [
  'Ongeveer 75 tot 66 miljoen jaar geleden, aan het eind van het Krijt, lag het zuiden van Limburg onder een ondiepe, warme zee. In die tijd leefden er ook dinosaurussen op het land, maar mensen bestonden nog lang niet.',
  'In die zee leefde de Mosasaurus. Het was geen dinosaurus, maar een reusachtig zeereptiel, familie van de varanen van nu. Mosasaurus hoffmannii werd naar schatting zo’n 17 tot 18 meter lang en was een toproofdier: hij at vissen, haaien, inktvissen en andere zeereptielen.'
 ],
 verloop: [
  'Uit de kalk van de bodem van die zee ontstond later mergel. In de mergelgroeven van de Sint-Pietersberg bij Maastricht vonden arbeiders al eeuwenlang fossielen. Rond 1766 kwam er een schedel met kaken boven, die later in Teylers Museum in Haarlem terechtkwam. Daar ligt hij nog steeds.',
  'In 1778 werd er een nog mooiere schedel gevonden. Die werd zo belangrijk gevonden dat Franse revolutionaire troepen hem in beslag namen en naar Parijs brachten.',
  'In 1808 concludeerde de Franse natuuronderzoeker Georges Cuvier dat het om een reusachtige uitgestorven zeehagedis ging. Dat hielp hem bij een nieuw idee: dat dieren voorgoed kunnen uitsterven. Het dier kreeg de naam Mosasaurus, naar de Latijnse naam van de Maas. Ook het laatste deel van het Krijt heet naar Maastricht: het Maastrichtien.'
 ],
 perspectieven: [
  'In de film Jurassic World is de Mosasaurus zo’n zestig meter lang. Het grootste exemplaar dat echt gevonden is, was ongeveer 17 meter: nog steeds zo lang als een flinke bus én een auto achter elkaar.'
 ],
 cijfers: [['Leefde','ca. 75 – 66 miljoen jaar geleden'],['Lengte','tot ca. 17 à 18 meter'],['Eerste schedel','rond 1766, nu in Teylers Museum'],['Tweede schedel','1778, nu in Parijs']],
 figuren: [['Georges Cuvier','Franse natuuronderzoeker die het dier verklaarde'],['Johann Leonard Hoffmann','Maastrichtse fossielenverzamelaar, naar hem heet de soort'],['Martinus van Marum','eerste directeur van Teylers Museum']],
 bronnen: [['Wikipedia: Mosasaurus',W('Mosasaurus')]]
},

'Hunebedden': {
 aanloop: [
  'Tijdens de voorlaatste ijstijd schoof landijs uit Scandinavië over het noorden van Nederland. Toen het smolt, bleven grote zwerfkeien achter op de Hondsrug en de rest van Drenthe.',
  'Rond 3400 voor Christus woonden er boeren van de Trechterbekercultuur, genoemd naar hun bekers met een trechtervormige hals. Zij gebruikten de keien om grafkamers te bouwen voor hun doden. Ze woonden in boerderijen in de buurt, hielden vee en verbouwden graan op kleine akkers.'
 ],
 verloop: [
  'Een hunebed bestaat uit rechtopstaande draagstenen met daarop zware dekstenen. Oorspronkelijk werd het bouwwerk grotendeels met aarde bedekt. In de grafkamers zijn resten van aardewerk, bijlen en barnsteen gevonden, vaak van veel generaties.',
  'Hoe de boeren stenen van vele tonnen verplaatsten, weten we niet precies. Waarschijnlijk gebruikten ze rollen, hefbomen en veel mankracht. In latere eeuwen dachten mensen dat reuzen, of Hunen, ze hadden gebouwd. Daar komt de naam hunebed vandaan. Pas in de 19e en 20e eeuw werd duidelijk dat het om graven van vroege boeren ging.',
  'Veel hunebedden werden gesloopt voor bouwsteen of dijkversterking. In 1734 kregen ze in Drenthe al bescherming. Er zijn er nog 54, waarvan 52 in Drenthe en 2 in Groningen. De grootste, D27, staat bij Borger.'
 ],
 cijfers: [['Gebouwd','ca. 3400 – 3100 v.C.'],['Nog bewaard','54'],['Grootste','D27 bij Borger, ca. 22 m lang'],['Bescherming in Drenthe','1734']],
 figuren: [['Trechterbekercultuur','boeren die de hunebedden bouwden'],['Albert Egges van Giffen','archeoloog, onderzocht en nummerde de hunebedden'],['Hunebedcentrum Borger','museum bij het grootste hunebed']],
 bronnen: [CANON,['Wikipedia: Hunebed',W('Hunebed')],['Hunebedcentrum','https://www.hunebedcentrum.nl/']]
},

'Brons en grafheuvels': {
 aanloop: [
  'Lange tijd maakten mensen hun werktuigen van steen, hout en been. In Midden-Europa en elders leerde men koper en tin te smelten en te mengen tot brons. Dat metaal was harder en kon in mallen worden gegoten.',
  'In de Lage Landen kwamen geen koper en tin voor. Brons moest dus via handelsnetwerken worden gehaald, uit gebieden als Midden-Europa en de Britse eilanden. Wie toegang had tot die netwerken, kon rijkdom en aanzien opbouwen. Waarschijnlijk werden er vee, zout, barnsteen of huiden tegen geruild.'
 ],
 verloop: [
  'Vanaf ongeveer 2000 voor Christus begint in Nederland de bronstijd. Bronzen bijlen, zwaarden, speerpunten en sieraden bleven lang zeldzaam en kostbaar. Daarnaast bleven mensen vuursteen gebruiken voor alledaagse werktuigen.',
  'Belangrijke doden werden begraven onder ronde grafheuvels, soms omringd door een kring van palen of een greppel. Op de Veluwe, in Brabant en in Drenthe liggen er nog veel. Een bekend voorbeeld is het graf van de zogenaamde Vorst van Drouwen, met een bronzen zwaard als grafgift.',
  'Ook voorwerpen werden soms bewust in moerassen of rivieren gelegd, waarschijnlijk als offer. De ongelijkheid tussen mensen nam in deze periode zichtbaar toe. Tegelijk woonden de meeste mensen gewoon als boer in verspreide boerderijen, waar ze vee hielden en graan verbouwden.'
 ],
 cijfers: [['Begin bronstijd','ca. 2000 v.C.'],['Einde bronstijd','ca. 800 v.C.'],['Brons','ca. 9 delen koper op 1 deel tin'],['Grondstoffen','geïmporteerd']],
 figuren: [['Vorst van Drouwen','rijk begraven man uit de bronstijd'],['Albert Egges van Giffen','archeoloog, onderzocht veel grafheuvels']],
 bronnen: [['Wikipedia: Bronstijd',W('Bronstijd')],['Wikipedia: Grafheuvel',W('Grafheuvel')]]
},

'Urnenvelden': {
 aanloop: [
  'In de vroege en midden bronstijd werden belangrijke doden onverbrand begraven onder een grafheuvel. Rond 1300 voor Christus ontstond in Midden-Europa een nieuwe gewoonte: lijkverbranding, waarbij de as in een urn werd bijgezet.',
  'Die gewoonte verspreidde zich over grote delen van Europa en bereikte aan het eind van de bronstijd ook de Lage Landen. Archeologen spreken van de urnenveldencultuur. Waarom mensen overgingen op cremeren, weten we niet precies; mogelijk hing het samen met veranderde ideeën over leven na de dood.'
 ],
 verloop: [
  'Vanaf ongeveer 1100 voor Christus werden in Nederland de meeste doden gecremeerd. De verbrande botresten werden in een aardewerken pot of direct in de grond begraven. Daarboven kwam vaak een klein heuveltje, omringd door een ronde of langwerpige greppel.',
  'Zo ontstonden grafvelden met tientallen tot honderden graven, die soms eeuwenlang in gebruik bleven. Ze liggen vooral op de hogere zandgronden, zoals in Brabant, Limburg, Gelderland en Drenthe. Op heidevelden zijn de heuveltjes soms nog te zien.',
  'Anders dan bij de oudere grafheuvels kreeg bijna iedereen zo’n graf. Dat wijst op een samenleving waarin de gemeenschap belangrijk was. De gewoonte bleef tot ver in de ijzertijd bestaan. Veel urnenvelden zijn in de 20e eeuw vernield door ontginning en bebouwing, maar sommige zijn nu beschermd.'
 ],
 cijfers: [['Begin in Nederland','ca. 1100 v.C.'],['Gebruik tot','ver in de ijzertijd'],['Omvang','tientallen tot honderden graven'],['Ligging','hogere zandgronden']],
 figuren: [['Urnenveldencultuur','Europese cultuur met lijkverbranding'],['Boeren van de late bronstijd','legden de grafvelden aan']],
 bronnen: [['Wikipedia: Urnenveld',W('Urnenveld')],['Wikipedia: Urnenveldencultuur',W('Urnenveldencultuur')]]
},

'Vorstengraf van Oss': {
 aanloop: [
  'Rond 800 voor Christus begon in de Lage Landen de ijzertijd. IJzer kon uit plaatselijk moerasijzererts worden gewonnen, maar kostbare voorwerpen bleven komen via contacten met Midden-Europa, waar de Hallstattcultuur bloeide.',
  'In die tijd verschenen in West-Europa enkele zeer rijke graven van leiders. Bij Oss lag zo’n graf onder een uitzonderlijk grote grafheuvel, met een doorsnede van ruim vijftig meter.'
 ],
 verloop: [
  'In 1933 stuitten mensen die zand afgroeven in de heuvel op een bronzen emmer. Daarin zat de verbrande as van een man, samen met een ijzeren zwaard met inleg van goud. Het zwaard was bewust krom gebogen, waarschijnlijk om het buiten gebruik te stellen.',
  'Bij de emmer lagen ook onderdelen van paardentuig en andere metalen voorwerpen. De emmer kwam waarschijnlijk uit Midden-Europa. Het graf wordt gedateerd rond 700 voor Christus.',
  'Bij later onderzoek bleek dat de heuvel de grootste grafheuvel uit de ijzertijd in West-Europa is. Het graf laat zien dat er toen machtige leiders waren met verre contacten. De vondsten zijn te zien in het Rijksmuseum van Oudheden in Leiden. De heuvel zelf is na onderzoek gereconstrueerd en is bij Oss te bezoeken.'
 ],
 gevolgen: [
  "Het graf liet zien dat de Lage Landen in de vroege ijzertijd geen afgelegen uithoek waren. Leiders hier hadden contacten met het Alpengebied en verder, en kregen kostbare voorwerpen via geschenken en handel. Wie zulke spullen had, liet daarmee zijn macht zien.",
  "In 2009 werd op een paar honderd meter afstand, in de grafheuvels van De Zevenbergen, een tweede vorstengraf ontdekt. Ook daar lag een zwaard, samen met paardentuig en andere bronzen voorwerpen. In 2010 volgde nog een vorstengraf bij Uden. Het gebied rond Oss was dus een belangrijke plek voor de elite van die tijd."
 ],
 perspectieven: [
  "We noemen de man een “vorst”, maar we weten niet welke titel hij had of hoe zijn volk hem noemde. Uit deze tijd zijn geen geschreven bronnen. Alles wat we weten, komt uit de grond: uit het graf zelf en uit de manier waarop hij begraven werd."
 ],
 misverstanden: [
  ["“Het zwaard was van goud.”","Het zwaard is van ijzer, met een inleg van goud in het gevest. IJzer was in die tijd nieuw en kostbaar, en het goud maakte het tot een pronkstuk."],
  ["“Het zwaard was kapot.”","Het zwaard werd bewust krom gebogen voordat het in het graf kwam. Dat gebeurde vaker in deze tijd. Waarschijnlijk wilde men het zwaard “doden” of buiten gebruik stellen, zodat het alleen nog de dode toebehoorde."]
 ],
 hoeWeten: [
  "Het graf werd in 1933 ontdekt bij het afgraven van zand voor een woonwagenkamp. De vondst werd in gips verpakt en naar het Rijksmuseum van Oudheden gebracht. In 1997 werd de plek herontdekt en opnieuw onderzocht. Met nieuwe technieken, zoals CT-scans, kunnen onderzoekers nu ook in verroeste voorwerpen kijken zonder ze te beschadigen."
 ],
 nu: [
  "De vondsten uit het eerste graf zijn te zien in het Rijksmuseum van Oudheden in Leiden. De vondsten uit het tweede graf zijn naar Museum Jan Cunen in Oss gebracht. Op de Maashorst bij Oss kun je de gereconstrueerde grafheuvel en de grafheuvels van De Zevenbergen bezoeken."
 ],
 vertellen: "Op 13 februari 1933 zagen twee mannen die zand afgroeven iets blinkends in de grond. Ze belden vanuit een herberg in de buurt een heemkundige, die het Rijksmuseum van Oudheden inschakelde. Zo werd een van de rijkste graven uit de Nederlandse prehistorie gered.",
 verbanden: [["Brons en grafheuvels","de oudere traditie van grafheuvels"],["Urnenvelden","de gewone begraafplaatsen uit dezelfde tijd"],["Ambiorix en de Eburonen","leiders in de late ijzertijd"]],
 onderwijs: {"ka":[]},
 cijfers: [['Begraving','ca. 700 v.C.'],['Ontdekking','1933'],['Doorsnede heuvel','ca. 53 m'],['Bekendste vondst','zwaard met gouden inleg']],
 figuren: [['Vorst van Oss','leider uit de vroege ijzertijd'],['Hallstattcultuur','Midden-Europese cultuur waarmee contacten bestonden'],['Rijksmuseum van Oudheden','bewaart de vondsten']],
 bronnen: [['Wikipedia: Vorstengraf van Oss',W('Vorstengraf Oss')],['Rijksmuseum van Oudheden','https://www.rmo.nl/']]
},

'Terpen in het noorden': {
 aanloop: [
  'Langs de kust van Friesland en Groningen lag een kwelder: een vruchtbaar maar laag gebied dat bij hoog water overstroomde. Er groeide zout gras waar vee goed op kon grazen.',
  'Rond 600 voor Christus trokken mensen dit gebied in. Eerst woonden ze op natuurlijke hoogten, maar door stijgend water moesten ze hun woonplekken kunstmatig ophogen. Dijken waren er in deze tijd nog niet.'
 ],
 verloop: [
  'Met klei, mest en afval wierpen ze heuvels op, in Friesland terpen en in Groningen wierden genoemd. Generatie na generatie werden ze hoger en breder, tot er soms hele dorpen op stonden. Er waren er in totaal ongeveer duizend. Het vee stond in de winter in grote boerderijen, deels onder hetzelfde dak als de mensen.',
  'De Romeinse schrijver Plinius de Oudere beschreef in de 1e eeuw de bewoners van zulke heuvels, de Chauken, als arme mensen tussen zee en land. Archeologisch onderzoek laat juist zien dat ze veeteelt en handel hadden en goed konden leven.',
  'In de 19e en vroege 20e eeuw werden veel terpen afgegraven, omdat de grond goede mest was. Daarbij kwamen veel vondsten boven. Hogebeintum is een van de hoogste overgebleven terpen; Ezinge werd beroemd door de opgraving van Van Giffen.'
 ],
 gevolgen: [
  "Op de terpen ontstonden echte dorpen, met boerderijen in een kring rond een open middenplein. Sommige terpen werden zo hoog en breed dat er eeuwenlang mensen bleven wonen. Veel dorpen in Friesland en Groningen liggen nog op een terp, met de kerk op het hoogste punt.",
  "Rond het jaar 1000 begonnen mensen dijken te bouwen. Daardoor hoefden ze hun terpen niet meer op te hogen. Het gebied achter de dijken kon worden bewoond en bewerkt zonder dat het bij elke vloed overstroomde."
 ],
 perspectieven: [
  "De Romeinse schrijver Plinius zag het terpenland in de 1e eeuw door Romeinse ogen. Voor hem was het een armoedig leven zonder akkers en zonder bomen, waar de mensen bij vloed leken op zeelieden en bij eb op schipbreukelingen. Archeologen laten een ander beeld zien: de bewoners hadden vee, verbouwden gewassen op de hogere delen en dreven handel."
 ],
 misverstanden: [
  ["“Een terp werd in één keer opgeworpen.”","De meeste terpen groeiden langzaam, generatie na generatie. Bewoners legden steeds een nieuwe laag aan, met klei, mest en afval, als het water hoger kwam. Sommige terpen werden zo in eeuwen tot meters hoog."],
  ["“Terpen bestaan alleen in Friesland.”","Terpen en wierden liggen in het hele Noord-Nederlandse kustgebied, van Noord-Holland tot Groningen, en verder langs de Duitse en Deense kust. In Groningen heten ze wierden, in Noord-Holland soms werven."]
 ],
 hoeWeten: [
  "Bij het afgraven van terpen in de 19e en vroege 20e eeuw kwamen veel vondsten boven. Archeoloog Albert Egges van Giffen groef tussen 1923 en 1934 de wierde van Ezinge op. Hij vond de resten van boerderijen uit verschillende eeuwen, boven op elkaar. Zo kon hij laten zien hoe de wierde in de loop der tijd groeide."
 ],
 nu: [
  "Hogebeintum in Friesland is met bijna negen meter boven NAP de hoogste terp van Nederland. Er staan nog honderden terpen en wierden in het landschap. Veel plaatsnamen herinneren eraan, zoals de Friese namen op -um en de Groningse op -werd of -wier."
 ],
 vertellen: "Plinius schreef over de mensen op de terpen dat ze hun voedsel kookten op gedroogde modder, en dat ze regenwater dronken uit kuilen bij hun huizen. Hij vond het een ellendig leven. Een mooie bron om met leerlingen te bespreken: klopt het beeld van een buitenstaander altijd?",
 verbanden: [["Friezen beheersen de kust","de latere bewoners van het terpengebied"],["Romeinen aan de Rijn","de Romeinen kwamen in contact met de bewoners van het noorden"],["Allerheiligenvloed","het water bleef een bedreiging"]],
 onderwijs: {"ka":["De confrontatie tussen de Grieks-Romeinse cultuur en de Germaanse cultuur van Noordwest-Europa."]},
 cijfers: [['Begin bewoning','ca. 600 v.C.'],['Aantal terpen en wierden','ca. 1000'],['Hogebeintum','ca. 9 m boven NAP'],['Afgraving','vooral 19e en vroege 20e eeuw']],
 figuren: [['Plinius de Oudere','Romeins schrijver, beschreef de terpbewoners'],['Albert Egges van Giffen','archeoloog, groef de wierde van Ezinge op'],['Hogebeintum','dorp op een van de hoogste terpen']],
 bronnen: [['Wikipedia: Terp (heuvel)',W('Terp heuvel')],['Wikipedia: Wierde',W('Wierde')]]
},

'Ambiorix en de Eburonen': {
 aanloop: [
  'Vanaf 58 voor Christus veroverde Julius Caesar Gallië. Hij beschreef zijn veldtochten zelf in De Bello Gallico, onze belangrijkste bron. Ook de volken in het noorden, die hij Belgen noemde, kregen met zijn legers te maken.',
  'De Eburonen woonden tussen Maas en Rijn, in een gebied waartoe ook het huidige Limburg behoorde. Ze werden geleid door twee koningen, Ambiorix en Catuvolcus. Na een slechte oogst moesten ze in de winter van 54 voor Christus ook nog een Romeins legioen onderhouden. Dat legde zware druk op de voorraden en vergrootte de onvrede.'
 ],
 verloop: [
  'Ambiorix lokte de Romeinen onder Sabinus en Cotta met een list uit hun winterkamp bij Atuatuca. Onderweg werden ze in een hinderlaag vrijwel allemaal gedood. Het ging volgens Caesar om anderhalf legioen.',
  'Caesar nam wraak. Hij liet het land van de Eburonen plunderen en riep naburige volken op mee te doen. Catuvolcus pleegde zelfmoord. Ambiorix wist te ontsnappen en werd nooit gevangen.',
  'Volgens Caesar werd het volk vrijwel uitgeroeid. Later trokken andere groepen het gebied in. In de 19e eeuw werd Ambiorix een nationale held in België; in Tongeren staat een groot standbeeld van hem.'
 ],
 gevolgen: [
  "Caesar gebruikte de opstand om te laten zien dat verzet tegen Rome zwaar gestraft werd. Zijn wraak was een waarschuwing voor alle volken in Gallië. Toch kwam enkele jaren later, in 52 voor Christus, een grote opstand onder Vercingetorix. Pas daarna was Gallië echt onderworpen.",
  "Na de Romeinse verovering werd het gebied deel van het Romeinse Rijk. Tongeren, Atuatuca Tungrorum, groeide uit tot de hoofdplaats van de streek. Zo kwam ook het huidige Zuid-Limburg in de Romeinse wereld terecht."
 ],
 perspectieven: [
  "Alles wat we over Ambiorix weten, komt van zijn vijand. Caesar schreef zijn verslag om in Rome te laten zien hoe goed hij oorlog voerde. Hij had er belang bij om de nederlaag van Sabinus en Cotta af te schuiven op hun fouten, en om zijn eigen wraak als terecht voor te stellen.",
  "In de 19e eeuw werd Ambiorix in België een nationale held, een voorbeeld van verzet tegen een overheerser. Zo kreeg een stamleider uit de oudheid een nieuwe rol in de geschiedenis van een jonge staat."
 ],
 misverstanden: [
  ["“De Eburonen werden volledig uitgeroeid.”","Caesar schreef dat hij het volk wilde vernietigen, en de bevolking heeft zwaar geleden. Maar archeologie en plaatsnamen laten zien dat er wel mensen bleven wonen. Volken die later in het gebied genoemd worden, zoals de Tungri, waren waarschijnlijk deels nazaten van de Eburonen."],
  ["“We weten waar Atuatuca lag.”","Caesar noemt Atuatuca als vesting van de Eburonen, maar waar die precies lag, is onduidelijk. Het is waarschijnlijk niet hetzelfde als het latere Romeinse Tongeren, dat Atuatuca Tungrorum heette."]
 ],
 hoeWeten: [
  "De belangrijkste bron is De Bello Gallico, het verslag van Caesar zelf. Daarnaast zijn er archeologische vondsten. Gouden muntjes van de Eburonen laten zien waar ze woonden. Bij Maastricht werd een schat met zulke gouden munten gevonden."
 ],
 nu: [
  "Op de Grote Markt van Tongeren staat sinds 1866 een groot standbeeld van Ambiorix. Tongeren noemt zich de oudste stad van België. Het Gallo-Romeins Museum in Tongeren vertelt over de Eburonen en de Romeinse tijd."
 ],
 vertellen: "Ambiorix overtuigde de Romeinse bevelhebbers Sabinus en Cotta ervan dat er een groot Germaans leger in aantocht was. Hij beloofde hen een veilige doortocht naar een ander Romeins kamp. Toen de soldaten het kamp hadden verlaten, liepen ze in een dal in een hinderlaag. Cotta had zich tegen het vertrek verzet, maar Sabinus had hem overstemd.",
 verbanden: [["Romeinen aan de Rijn","na Caesar werd de Rijn de grens"],["Coriovallum (Heerlen)","de Romeinse tijd in Zuid-Limburg"],["Vorstengraf van Oss","een veel oudere leider uit de ijzertijd"]],
 onderwijs: {"ka":["De confrontatie tussen de Grieks-Romeinse cultuur en de Germaanse cultuur van Noordwest-Europa.","De groei van het Romeinse Rijk waardoor de Grieks-Romeinse cultuur zich in Europa verspreidde."]},
 cijfers: [['Hinderlaag','winter 54 v.C.'],['Romeinse verliezen','ca. anderhalf legioen'],['Bron','De Bello Gallico (Caesar)'],['Standbeeld Tongeren','1866']],
 figuren: [['Ambiorix','koning van de Eburonen'],['Catuvolcus','tweede koning van de Eburonen'],['Julius Caesar','Romeins veldheer'],['Sabinus en Cotta','Romeinse bevelhebbers, omgekomen']],
 bronnen: [['Wikipedia: Ambiorix',W('Ambiorix')],['Wikipedia: Eburonen',W('Eburonen')]]
},

'Romeinen aan de Rijn': {
 aanloop: [
  'Na de verovering van Gallië door Caesar werd de Rijn een grensrivier tussen Romeins gebied en het land van de Germanen. Keizer Augustus wilde dat gebied verder uitbreiden, misschien tot aan de Elbe.',
  'Hij gaf die taak aan zijn stiefzoon Drusus. Om troepen en voorraden te kunnen verplaatsen, waren legerkampen en waterwegen in het rivierengebied nodig. De rivieren vormden handige routes richting de Noordzee en het noorden.'
 ],
 verloop: [
  'Vanaf 12 voor Christus trok Drusus met zijn legers Germanië binnen, deels over land en deels over het water. Volgens de bronnen liet hij een kanaal graven, de Fossa Drusiana, mogelijk tussen Rijn en IJssel.',
  'Op de Hunerberg in Nijmegen lag rond deze tijd een groot legerkamp. Ook elders langs de Rijn verschenen Romeinse steunpunten. Drusus overleed in 9 voor Christus na een val van zijn paard.',
  'In 9 na Christus werden drie Romeinse legioenen onder Varus vernietigd in het Teutoburgerwoud. Daarna gaf Rome de verovering van Germanië geleidelijk op. Zo werd de Rijn de blijvende grens. Ten noorden ervan bleven Germaanse volken zoals de Friezen zelfstandig, al dreven ze wel handel met de Romeinen.'
 ],
 gevolgen: [
  "Ook na de Varusslag bleven de Romeinen nog enkele jaren actief ten noorden van de Rijn. Germanicus voerde tussen 14 en 16 na Christus grote veldtochten, deels met een vloot die via de Nederlandse wateren naar de Eems voer. Bij Velsen lag een Romeins fort aan de kust. Daarna trokken de Romeinen zich terug.",
  "De Rijn werd een grens waar twee werelden elkaar raakten. Ten zuiden ontstonden forten, wegen en later steden. Ten noorden woonden Germaanse volken die handel dreven met de Romeinen, en soms ook met hen in oorlog waren."
 ],
 perspectieven: [
  "Voor de Friezen was de Romeinse overheersing niet altijd mild. Ze moesten belasting betalen in runderhuiden. Toen de Romeinse bevelhebber Olennius eiste dat de huiden zo groot moesten zijn als die van oerossen, konden de Friezen niet betalen. Hun vee, hun land en uiteindelijk hun vrouwen en kinderen werden afgenomen. In het jaar 28 kwamen ze in opstand en hingen ze de belastinginners op.",
  "Voor de Bataven, die in het rivierengebied woonden, was het bondgenootschap met Rome juist voordelig. Zij hoefden geen belasting te betalen, maar leverden soldaten. Zo verschilde de verhouding met Rome per volk."
 ],
 misverstanden: [
  ["“De Romeinen veroverden heel Nederland.”","Alleen het gebied ten zuiden van de Rijn hoorde blijvend bij het Romeinse Rijk. Het noorden, waar de Friezen woonden, bleef zelfstandig, al hadden de Romeinen er af en toe invloed en dreven ze er handel."],
  ["“De Varusslag vond plaats in het Teutoburgerwoud.”","Zo heet de slag nog altijd, maar archeologen vonden vanaf 1987 bij Kalkriese, ten noorden van Osnabrück, duizenden Romeinse voorwerpen, waaronder een ijzeren ruitermasker. Daar vond de slag waarschijnlijk plaats."]
 ],
 hoeWeten: [
  "Romeinse schrijvers als Tacitus en Suetonius beschrijven de veldtochten. Archeologen vonden legerkampen in Nijmegen en bij Velsen, met munten, wapens en aardewerk die precies te dateren zijn. De Fossa Drusiana is nog niet met zekerheid teruggevonden. Over de juiste plek wordt nog steeds gediscussieerd."
 ],
 nu: [
  "In Nijmegen zijn op de Hunerberg en het Kops Plateau resten van de vroegste legerkampen gevonden; het Museum Het Valkhof toont de vondsten. Bij Kalkriese is een museum en park over de Varusslag. Het Romeinse verleden van het rivierengebied is ook een thema in de vele Romeinse festivals en reconstructies in Nijmegen."
 ],
 vertellen: "De Romeinse geschiedschrijver Suetonius vertelt dat keizer Augustus na het nieuws over de Varusslag zo ontdaan was, dat hij zijn hoofd tegen de deur sloeg en riep: “Quintilius Varus, geef me mijn legioenen terug!” De nummers van de drie verloren legioenen zijn daarna nooit meer gebruikt.",
 verbanden: [["De Romeinse Limes","de vaste grens die volgde"],["Bataafse Opstand","de Bataven, bondgenoten van Rome"],["Terpen in het noorden","de Friezen en Chauken ten noorden van de Rijn"]],
 onderwijs: {"ka":["De groei van het Romeinse Rijk waardoor de Grieks-Romeinse cultuur zich in Europa verspreidde.","De confrontatie tussen de Grieks-Romeinse cultuur en de Germaanse cultuur van Noordwest-Europa."]},
 cijfers: [['Begin veldtochten','12 v.C.'],['Dood van Drusus','9 v.C.'],['Varusslag','9 n.C.'],['Verloren legioenen','3']],
 figuren: [['Drusus','Romeins veldheer, stiefzoon van Augustus'],['Augustus','eerste Romeinse keizer'],['Varus','bevelhebber, verloor in het Teutoburgerwoud']],
 bronnen: [['Wikipedia: Nero Claudius Drusus',W('Nero Claudius Drusus')],['Wikipedia: Romeinen in Nederland',W('Romeinen in Nederland')]]
},

'De Romeinse Limes': {
 aanloop: [
  'Na de nederlaag in het Teutoburgerwoud bleven de Romeinen nog jaren actief ten noorden van de Rijn, onder meer bij de Friezen. Een permanente verovering lukte niet.',
  'In 47 na Christus wilde veldheer Corbulo verder oprukken, maar keizer Claudius gaf hem opdracht zich terug te trekken achter de Rijn. Corbulo liet volgens de bronnen een kanaal graven tussen Rijn en Maas. Zijn soldaten moesten zo bezig blijven, en het kanaal maakte vervoer over water veiliger.'
 ],
 verloop: [
  'Vanaf dat moment werd de Rijn de vaste noordgrens van het rijk in deze streek. Langs de rivier verrezen forten, zoals bij Valkenburg, Woerden, Utrecht en Vechten, met wachttorens en een weg langs de oever. De Romeinen noemden zo’n grens limes.',
  'De forten waren eerst van hout en aarde, later deels van steen. Er waren soldaten uit het hele rijk gelegerd, vaak hulptroepen uit de streek zelf. Rond de forten ontstonden dorpen van handelaren en ambachtslieden. Bij opgravingen zijn ook schepen gevonden, zoals bij De Meern, die voorraden over de Rijn vervoerden.',
  'Ten zuiden van de grens raakte het land steeds meer Romeins, met steden, wegen en villa’s. In 2021 werd de Neder-Germaanse Limes, ook het Nederlandse deel, Werelderfgoed van UNESCO.'
 ],
 gevolgen: [
  "Rond de forten ontstonden dorpen waar soldaten, hun gezinnen, handelaren en ambachtslieden woonden. Romeinse munten, aardewerk, wijn en olijfolie kwamen het rivierengebied binnen. Bewoners uit de streek dienden als hulptroepen en werden na vijfentwintig jaar diensttijd Romeins burger.",
  "Op sommige plekken langs de Limes ontstonden later steden. Utrecht groeide uit het fort Traiectum, waar later Willibrord zijn kerk bouwde. Ook Woerden, Valkenburg en Katwijk hebben Romeinse wortels."
 ],
 perspectieven: [
  "Voor de Romeinen was de Limes een grens tussen beschaving en barbaren. Voor de mensen aan beide kanten was het eerder een zone van contact. Er werd over en weer gehandeld, er werd getrouwd, en Germanen dienden in het Romeinse leger. De grens scheidde, maar verbond ook."
 ],
 misverstanden: [
  ["“De Limes was een muur, zoals de Muur van Hadrianus.”","In Nederland was er geen muur. De Rijn zelf was de grens, met forten, wachttorens en een weg langs de oever. De Romeinen controleerden vooral het verkeer over en langs de rivier."],
  ["“De Limes lag langs de Rijn van nu.”","De Limes volgde de toenmalige loop van de Rijn, die nu de Oude Rijn en de Kromme Rijn heet. Die lag op veel plaatsen anders dan de grote rivieren van nu."]
 ],
 hoeWeten: [
  "Opgravingen bij forten als Valkenburg, Woerden en Vechten leveren veel kennis op. In De Meern bij Utrecht werd in 2003 een bijna compleet Romeins rivierschip gevonden, met een kajuit en spullen van de bemanning. Inscripties op grafstenen en altaren vertellen wie er woonden en waar ze vandaan kwamen. De Romeinse schrijver Tacitus beschrijft hoe Corbulo zijn soldaten een kanaal liet graven."
 ],
 nu: [
  "Sinds 2021 staat de Neder-Germaanse Limes op de werelderfgoedlijst van UNESCO, samen met de Duitse delen. In Castellum Hoge Woerd in De Meern is het Romeinse schip te zien. Op veel plaatsen langs de Oude Rijn zijn de omtrekken van forten in het landschap of in de bestrating aangegeven."
 ],
 vertellen: "Volgens Tacitus zei de veldheer Corbulo, toen hij het bevel kreeg om zich terug te trekken achter de Rijn: “Gelukkig de Romeinse bevelhebbers van vroeger!” Hij bedoelde dat zij nog mochten veroveren. Om zijn soldaten bezig te houden, liet hij hen een kanaal graven tussen Rijn en Maas, waarschijnlijk de latere Vliet.",
 verbanden: [["Romeinen aan de Rijn","het begin van de Romeinse aanwezigheid"],["Einde van de Limes","het einde van de grens rond 400"],["Willibrord","hij bouwde zijn kerk in het oude fort van Utrecht"]],
 onderwijs: {"ka":["De groei van het Romeinse Rijk waardoor de Grieks-Romeinse cultuur zich in Europa verspreidde.","De confrontatie tussen de Grieks-Romeinse cultuur en de Germaanse cultuur van Noordwest-Europa."],"venster":"3. De Romeinse Limes"},
 cijfers: [['Rijn als vaste grens','47 n.C.'],['Werelderfgoed','2021'],['Voorbeelden van forten','Valkenburg, Woerden, Utrecht, Vechten']],
 figuren: [['Keizer Claudius','gaf het bevel tot terugtrekking achter de Rijn'],['Corbulo','Romeins veldheer, liet een kanaal graven'],['Hulptroepen','soldaten die de forten bemanden']],
 bronnen: [CANON,['Wikipedia: Limes (Neder-Germaanse)',W('Neder-Germaanse Limes')],['Wikipedia: Gnaeus Domitius Corbulo',W('Gnaeus Domitius Corbulo')]]
},

'Coriovallum (Heerlen)': {
 aanloop: [
  'De Romeinen legden in hun rijk een netwerk van wegen aan voor het leger, de post en de handel. Een van de belangrijkste in deze streek was de Via Belgica, die van de kust bij Boulogne via Tongeren naar Keulen liep.',
  'Waar de Via Belgica een noord-zuidweg kruiste, ontstond in de 1e eeuw een nederzetting: Coriovallum, het huidige Heerlen. Het was een gunstige plek om te rusten, te handelen en goederen te maken. Er was geen legerkamp, maar een burgerlijke nederzetting langs de weg.'
 ],
 verloop: [
  'Coriovallum groeide uit tot een levendige plaats met pottenbakkers, smeden en andere ambachtslieden. Er werd aardewerk gemaakt voor de wijde omgeving. De bewoners hadden contact met de boeren op de villa’s in de omgeving.',
  'In 1940 werden resten van een groot badhuis ontdekt, dat daarna werd opgegraven. Zo’n thermen had baden met koud, lauw en warm water en een sportveld. Het werd verwarmd met een hypocaustum, een ruimte onder de vloer waar warme lucht doorheen stroomde.',
  'In de 3e eeuw kwam de nederzetting onder druk door invallen. Toch bleef Heerlen bewoond. De fundamenten van het badhuis zijn overdekt bewaard gebleven. Het behoort tot de best bewaarde Romeinse bouwwerken van Nederland.'
 ],
 gevolgen: [
  "Coriovallum werd een centrum van nijverheid. Er zijn meer dan veertig pottenbakkersovens opgegraven. Het aardewerk werd in de wijde omgeving verkocht. De Heerlense Uilestraat dankt haar naam aan die vondsten: in het dialect heten potjes “ölles”.",
  "Romeins Heerlen was misschien groter dan lang gedacht. Volgens nieuwer onderzoek was het een flinke plaats, groter dan Romeins Maastricht of Aken. In de 3e eeuw werd de nederzetting na invallen van Franken waarschijnlijk verkleind tot een versterking."
 ],
 perspectieven: [
  "Een badhuis was voor de Romeinen meer dan een plek om je te wassen. Het was een ontmoetingsplaats waar mensen praatten, sportten en zaken deden. Wie in Coriovallum naar het badhuis ging, deed mee aan de Romeinse manier van leven, ook als hij of zij uit de streek kwam."
 ],
 misverstanden: [
  ["“Coriovallum was een legerkamp.”","De naam doet aan een versterking denken, maar de vondsten wijzen op een burgerlijke nederzetting van handelaren en ambachtslieden. De betekenis van de naam is niet zeker."],
  ["“Iedereen wist altijd al dat Coriovallum in Heerlen lag.”","De naam stond op een oude Romeinse wegenkaart, maar lang was onduidelijk waar de plaats lag. Pas in 1876 toonde de priester-archeoloog Jos Habets aan dat het Heerlen moest zijn."]
 ],
 hoeWeten: [
  "De Romeinse wegenkaart die bekendstaat als de Peutingerkaart noemt Coriovallum. Opgravingen in het centrum van Heerlen leverden het badhuis, pottenbakkersovens, grafvelden en resten van huizen op. Bij bouwwerkzaamheden in de stad worden nog steeds nieuwe vondsten gedaan."
 ],
 nu: [
  "Het badhuis geldt als het oudste, grootste en best bewaarde antieke gebouw van Nederland. Het museum dat in 1977 rond de opgraving werd gebouwd, heette eerst Thermenmuseum en heet nu Het Romeins Museum. In de binnenstad van Heerlen zijn op verschillende plekken Romeinse resten en markeringen te zien."
 ],
 vertellen: "In een Romeins badhuis liep je langs verschillende ruimtes: eerst de kleedkamer, dan het koude bad, het lauwe bad en het warme bad. De vloer van het warme bad rustte op kleine pilaartjes van baksteen. Daaronder stroomde hete lucht van een stookplaats. Laat leerlingen bedenken waarom het warme bad het dichtst bij het vuur lag.",
 verbanden: [["Villa’s in het Heuvelland","de boerderijen rond Coriovallum"],["Ambiorix en de Eburonen","de bewoners van de streek vóór de Romeinen"],["De grens raakt onder druk","de invallen van de 3e eeuw"]],
 onderwijs: {"ka":["De groei van het Romeinse Rijk waardoor de Grieks-Romeinse cultuur zich in Europa verspreidde.","De klassieke vormentaal van de Grieks-Romeinse cultuur."]},
 cijfers: [['Ontstaan','1e eeuw n.C.'],['Ontdekking thermen','1940'],['Belangrijke weg','Via Belgica (Boulogne – Keulen)']],
 figuren: [['Pottenbakkers van Coriovallum','maakten aardewerk voor de regio'],['Thermenmuseum','museum boven de resten van het badhuis']],
 bronnen: [['Wikipedia: Coriovallum',W('Coriovallum')],['Wikipedia: Via Belgica',W('Via Belgica')],['Thermenmuseum','https://www.thermenmuseum.nl/']]
},

'Bataafse Opstand': {
 aanloop: [
  'De Bataven woonden in het rivierengebied, rond het huidige Nijmegen en de Betuwe. Ze hoefden geen belasting te betalen, maar leverden wel veel soldaten aan het Romeinse leger. Bataafse ruiters stonden bekend om hun vaardigheid.',
  'In 68 en 69 na Christus raakte het Romeinse Rijk in een burgeroorlog, het Vierkeizerjaar. Tegelijk groeide de onvrede onder de Bataven over harde ronselpraktijken. De Bataafse edelman Julius Civilis, zelf officier in Romeinse dienst, greep die kans. Hij zei aanvankelijk de kant te kiezen van Vespasianus, een van de kandidaten voor de keizerstroon.'
 ],
 verloop: [
  'Civilis bracht de Bataven en andere volken in opstand. Ze versloegen Romeinse eenheden en belegerden het legerkamp Vetera bij Xanten, dat zich ten slotte overgaf. Ook enkele Gallische groepen sloten zich aan.',
  'Nadat Vespasianus keizer was geworden, stuurde hij een groot leger onder Petillius Cerialis. In 70 na Christus werden de opstandelingen verslagen en er volgden onderhandelingen. Hoe het met Civilis afliep, is onbekend. Onze belangrijkste bron is de Romeinse geschiedschrijver Tacitus.',
  'Vanaf de 16e eeuw zagen Nederlanders de Bataven als hun dappere voorouders die tegen een overheerser vochten. Rembrandt schilderde de samenzwering van Civilis voor het Amsterdamse stadhuis.'
 ],
 gevolgen: [
  "Na de opstand werd de Bataafse hoofdplaats bij Nijmegen verwoest. De Romeinen bouwden een nieuwe stad en een groot legerkamp op de Hunerberg. De Bataven bleven daarna soldaten leveren aan het Romeinse leger, zelfs als lijfwacht van de keizer.",
  "In de 16e en 17e eeuw werd de opstand een nationale mythe. De opstandelingen tegen Spanje zagen zichzelf als nieuwe Bataven die vochten voor hun vrijheid. In 1795 heette de nieuwe staat de Bataafse Republiek, en de VOC noemde haar hoofdstad op Java Batavia."
 ],
 perspectieven: [
  "Volgens Tacitus was Civilis vooral uit op eigen macht, niet op vrijheid voor zijn volk. Hij koos eerst de kant van Vespasianus in de Romeinse burgeroorlog. Pas later werd het een opstand tegen Rome zelf. Het beeld van een dappere vrijheidsstrijder komt dus vooral uit latere eeuwen.",
  "De Bataven waren geen vreemden voor Rome. Ze dienden al generaties in het Romeinse leger, en Civilis zelf was Romeins burger en officier. De opstand was daardoor ook een conflict binnen de Romeinse wereld."
 ],
 misverstanden: [
  ["“De Bataven zijn onze voorouders.”","De Bataven woonden in het rivierengebied, maar zij zijn niet de voorouders van alle Nederlanders. Na de Romeinse tijd vestigden zich veel nieuwe groepen. De Bataven werden in de 16e eeuw vooral als symbool gekozen."],
  ["“De Bataven wonnen hun vrijheid.”","De opstand werd in 70 na Christus neergeslagen. Daarna bleven de Bataven bondgenoten van Rome, en het rivierengebied bleef nog eeuwenlang Romeins."]
 ],
 hoeWeten: [
  "Bijna alles wat we over de opstand weten, komt uit de Historiae van Tacitus, die enkele tientallen jaren later schreef. Zijn verhaal houdt halverwege op, omdat de rest van zijn boek verloren is. Daardoor weten we niet hoe het met Civilis afliep. Archeologen vonden in Nijmegen de sporen van de verwoeste Bataafse hoofdplaats."
 ],
 nu: [
  "Rembrandts schilderij De samenzwering van Claudius Civilis werd teruggestuurd door het stadsbestuur van Amsterdam. Rembrandt sneed het daarna kleiner. Het overgebleven deel hangt nu in het Nationalmuseum in Stockholm. Namen als Batavia, de Betuwe en de Bataafse Republiek herinneren aan de Bataven."
 ],
 vertellen: "Volgens Tacitus had Civilis maar één oog, net als de grote vijanden van Rome Hannibal en Sertorius. Hij zwoer dat hij zijn haar, dat hij rood had geverfd, pas zou knippen als hij de Romeinse legioenen had verslagen. Na de inname van het kamp bij Xanten liet hij het afknippen.",
 verbanden: [["Romeinen aan de Rijn","de Bataven waren bondgenoten van Rome"],["Nijmegen krijgt stadsrecht","de nieuwe Romeinse stad na de opstand"],["Rembrandt van Rijn","hij schilderde de samenzwering van Civilis"]],
 onderwijs: {"ka":["De confrontatie tussen de Grieks-Romeinse cultuur en de Germaanse cultuur van Noordwest-Europa."]},
 cijfers: [['Opstand','69 – 70 n.C.'],['Bron','Historiae (Tacitus)'],['Schilderij Rembrandt','ca. 1661–1662']],
 figuren: [['Julius Civilis','Bataafse leider van de opstand'],['Petillius Cerialis','Romeinse veldheer die de opstand neersloeg'],['Vespasianus','keizer vanaf 69'],['Tacitus','Romeins geschiedschrijver']],
 bronnen: [['Wikipedia: Bataafse Opstand',W('Bataafse Opstand')],['Wikipedia: Julius Civilis',W('Julius Civilis')]]
},

'Nijmegen krijgt stadsrecht': {
 aanloop: [
  'Na de Bataafse Opstand werd de Bataafse hoofdplaats bij Nijmegen verwoest. De Romeinen bouwden een nieuwe nederzetting op een andere plek, iets westelijker langs de Waal.',
  'Op de Hunerberg kwam vanaf 71 een groot stenen legioenskamp voor het Tiende Legioen, Legio X Gemina. Duizenden soldaten en hun aanhang zorgden voor handel en bedrijvigheid in de omgeving. Rond het kamp ontstond een eigen dorp waar handelaren, ambachtslieden en families van soldaten woonden.'
 ],
 verloop: [
  'Rond 104 vertrok het legioen. In dezelfde periode kreeg de burgerlijke nederzetting onder keizer Trajanus marktrecht en een nieuwe naam: Ulpia Noviomagus Batavorum. Ulpia verwijst naar de familienaam van Trajanus.',
  'Daarmee werd Nijmegen een erkende Romeinse stad met een eigen bestuur. Een stadsrecht zoals in de middeleeuwen was het niet, maar de nederzetting had wel een officiële status. Er kwamen openbare gebouwen, tempels en een badhuis. De stad was het bestuurlijk centrum van het Bataafse gebied.',
  'Omdat dit de eerste nederzetting in Nederland was met zo’n Romeins stadsrecht, noemt Nijmegen zich de oudste stad van het land. In 2005 vierde de stad haar 2000-jarig bestaan, gerekend vanaf de eerste Romeinse vestiging.'
 ],
 cijfers: [['Legioen op de Hunerberg','ca. 71 – 104'],['Marktrecht','ca. 104'],['Naam','Ulpia Noviomagus Batavorum'],['2000-jarig bestaan gevierd','2005']],
 figuren: [['Keizer Trajanus','gaf de stad marktrecht'],['Legio X Gemina','legioen op de Hunerberg']],
 bronnen: [['Wikipedia: Ulpia Noviomagus Batavorum',W('Ulpia Noviomagus Batavorum')],['Wikipedia: Geschiedenis van Nijmegen',W('Geschiedenis van Nijmegen')]]
},

'Villa’s in het Heuvelland': {
 aanloop: [
  'Het Romeinse leger aan de Rijn moest worden gevoed. Duizenden soldaten hadden graan, vlees en andere producten nodig. Ook steden als Keulen en Tongeren groeiden. Hun inwoners hadden voedsel, hout en bouwmaterialen nodig uit het platteland.',
  'De lössgrond van Zuid-Limburg was zeer geschikt voor akkerbouw. Vanaf de 1e eeuw ontstonden er grote boerenbedrijven naar Romeins voorbeeld: villa’s.'
 ],
 verloop: [
  'Een villa was een landbouwbedrijf met een woonhuis voor de eigenaar en gebouwen voor knechten, dieren en voorraden. De rijkste hoofdgebouwen waren van steen, met pannendaken, beschilderde muren, vloerverwarming en een eigen badhuis.',
  'Een van de grootste in Nederland was de villa van Voerendaal. Daar zijn onder meer een groot hoofdgebouw en een graanschuur gevonden. In het Heuvelland zijn tientallen villaterreinen bekend, vaak dicht bij Romeinse wegen. Langs die wegen kon het graan gemakkelijk naar de legerplaatsen en steden worden vervoerd.',
  'In de 3e eeuw kwamen de villa’s onder druk door invallen en economische crisis. Veel werden verlaten. Toch bleef het gebied ook daarna bewoond en bewerkt. Romeinse dakpannen en bouwstenen werden later vaak hergebruikt in kerken en boerderijen. Van veel villa’s zijn alleen nog sporen in de grond over.'
 ],
 cijfers: [['Bloeitijd','ca. 1e – 3e eeuw'],['Bodem','vruchtbare löss'],['Belangrijkste product','graan']],
 figuren: [['Villa Voerendaal','een van de grootste villa’s van Nederland'],['Romeins leger aan de Rijn','belangrijkste afnemer van graan']],
 bronnen: [['Wikipedia: Villa rustica',W('Villa rustica')],['Wikipedia: Romeinse villa Voerendaal',W('Romeinse villa Voerendaal')]]
},

'De grens raakt onder druk': {
 aanloop: [
  'Aan de overkant van de Rijn vormden kleinere Germaanse groepen in de 3e eeuw grotere verbanden, zoals de Franken. Zij waren aangetrokken door de rijkdom van het Romeinse gebied.',
  'Tegelijk zat het Romeinse Rijk in een diepe crisis. Keizers volgden elkaar snel op, legers vochten tegen elkaar en de economie verzwakte. Het geld verloor waarde en soldaten werden van de grenzen weggehaald voor binnenlandse strijd.'
 ],
 verloop: [
  'Rond 260 riep de generaal Postumus zich uit tot keizer van een eigen Gallisch Keizerrijk, dat tot 274 bestond. In deze onrustige jaren vielen Germaanse groepen het gebied ten zuiden van de Rijn steeds vaker binnen.',
  'Forten en nederzettingen werden verwoest of verlaten. Mensen begroeven hun geld en kostbaarheden, en veel van die muntschatten zijn later teruggevonden. Villa’s in het zuiden werden verlaten. In het kustgebied liep de bevolking sterk terug, mogelijk ook doordat het land natter werd en vaker overstroomde.',
  'Later in de 3e eeuw herstelden de keizers het gezag gedeeltelijk. Ze bouwden versterkingen langs wegen en rivieren. Maar het oude grenssysteem langs de Rijn werd nooit meer zoals vroeger. Steden kregen muren, zoals in Maastricht, en de verdediging verschoof naar versterkte plaatsen in het binnenland.'
 ],
 cijfers: [['Gallisch Keizerrijk','ca. 260 – 274'],['Periode van crisis','ca. 235 – 284'],['Bewijs van onrust','begraven muntschatten']],
 figuren: [['Franken','Germaans volk dat het gebied binnenviel'],['Postumus','stichter van het Gallisch Keizerrijk']],
 bronnen: [['Wikipedia: Crisis van de derde eeuw',W('Crisis van de derde eeuw')],['Wikipedia: Gallische Keizerrijk',W('Gallische Keizerrijk')]]
},

'Einde van de Limes': {
 aanloop: [
  'In de 4e eeuw probeerden de keizers de Rijngrens opnieuw te versterken. Keizer Julianus herstelde rond 358 forten langs de rivier. Hij liet de Salische Franken wel als bondgenoten wonen in Toxandrië, ongeveer het huidige Brabant.',
  'Het Romeinse leger bestond steeds meer uit Germaanse soldaten. Tegelijk moest het rijk zich op veel plaatsen tegelijk verdedigen, ook tegen de Goten en andere volken. Er waren te weinig soldaten en te weinig geld om alle grenzen tegelijk goed te bewaken.'
 ],
 verloop: [
  'Rond 400 werden de laatste reguliere legereenheden van de Rijn teruggetrokken om Italië te beschermen. Op 31 december 406 staken Vandalen en andere groepen bij Mainz de Rijn over. De grens was niet meer te houden.',
  'In de Lage Landen verdween het Romeinse bestuur geleidelijk. Steden liepen leeg, de geldeconomie stortte grotendeels in en veel Romeinse gebouwen raakten in verval. In het zuiden, rond Maastricht, bleef wel een deel van de Romeinse bevolking en cultuur over.',
  'Germaanse groepen namen het gebied over. Toch leefden Romeinse invloeden voort, vooral via de kerk en de Latijnse taal. Ook Romeinse wegen bleven nog eeuwen in gebruik. Daarmee begon in de Lage Landen de vroege middeleeuwen.'
 ],
 cijfers: [['Herstel door Julianus','ca. 358'],['Terugtrekking troepen','ca. 400'],['Oversteek Rijn','31 dec 406']],
 figuren: [['Keizer Julianus','herstelde de Rijngrens'],['Salische Franken','bondgenoten in Toxandrië'],['Vandalen','staken de Rijn over in 406']],
 bronnen: [CANON,['Wikipedia: Neder-Germaanse Limes',W('Neder-Germaanse Limes')],['Wikipedia: Rijnoversteek van 406',W('Rijnoversteek 406')]]
},

'Sint-Servaas in Maastricht': {
 aanloop: [
  'In de 4e eeuw werd het christendom de belangrijkste godsdienst van het Romeinse Rijk. In grotere plaatsen kwamen bisschoppen. In deze streek lag de bisschopszetel in Tongeren, de hoofdplaats van het gebied.',
  'Servatius was bisschop van Tongeren. Hij is bekend uit verslagen van kerkvergaderingen in het midden van de 4e eeuw, waaraan hij deelnam. Over zijn leven verder weten we weinig zeker. Veel verhalen over hem zijn pas eeuwen later opgeschreven en hebben het karakter van legendes.'
 ],
 verloop: [
  'Volgens de overlevering verplaatste Servatius zijn zetel naar Maastricht, dat een versterkte plaats aan de Maas was. Hij zou daar in 384 zijn overleden en buiten de stad zijn begraven, langs de Romeinse weg.',
  'Zijn graf trok al snel pelgrims. De geschiedschrijver Gregorius van Tours vertelde in de 6e eeuw over een kerk boven het graf. Daardoor bleef Maastricht in een woelige tijd een belangrijke plaats. Rond het graf verscheen later de Sint-Servaasbasiliek.',
  'Servaas werd de schutspatroon van Maastricht. Zijn relieken worden bewaard in een rijk versierd reliekschrijn, de Noodkist. Tijdens de Heiligdomsvaart, die eens in de zeven jaar plaatsvindt, worden ze door de stad gedragen. Die traditie gaat terug tot de middeleeuwen en trekt nog steeds veel bezoekers.'
 ],
 cijfers: [['Overlijden (overlevering)','384'],['Heiligdomsvaart','eens in de 7 jaar'],['Reliekschrijn','de Noodkist']],
 figuren: [['Sint-Servaas','bisschop van Tongeren-Maastricht'],['Gregorius van Tours','geschiedschrijver, schreef over zijn graf']],
 bronnen: [['Wikipedia: Servatius',W('Servatius van Maastricht')],['Wikipedia: Sint-Servaasbasiliek',W('Sint-Servaasbasiliek')]]
},

'Franken, Friezen en Saksen': {
 aanloop: [
  'Toen het Romeinse gezag verdween, raakte het gebied van de huidige Nederlanden dunner bevolkt. Vooral in het kustgebied liepen veel plaatsen leeg. Uit deze periode zijn weinig geschreven bronnen, dus archeologische vondsten zijn belangrijk om te weten wat er gebeurde.',
  'In de 5e eeuw vestigden zich nieuwe groepen. Er was veel beweging: in dezelfde tijd staken Angelen en Saksen vanaf de Noordzeekust over naar Engeland.'
 ],
 verloop: [
  'Langs de kust woonden de Friezen. In het oosten vestigden zich Saksen, en in het zuiden de Franken, die ook ver in Gallië doordrongen. De grenzen tussen deze groepen waren niet scherp en veranderden in de loop der tijd.',
  'De Friezen werden een handelsvolk. Later, vanaf de 7e eeuw, speelden ze een grote rol in de handel via Dorestad. Hun leiders stonden later lang tegenover de Franken. Die werden steeds machtiger en breidden hun gebied uit naar het noorden.',
  'De talen van deze groepen legden de basis voor het Nederlands, het Fries en de dialecten. Het Nederlands komt grotendeels voort uit het Oudnederfrankisch. Het Fries is nog steeds een eigen taal, en in het oosten zijn Saksische dialecten te horen. Ook plaatsnamen herinneren nog aan deze tijd.'
 ],
 cijfers: [['Vestiging','ca. 5e eeuw'],['Drie hoofdgroepen','Friezen, Saksen, Franken'],['Bron van het Nederlands','Oudnederfrankisch']],
 figuren: [['Friezen','volk langs de kust'],['Saksen','volk in het oosten'],['Franken','volk in het zuiden']],
 bronnen: [['Wikipedia: Franken (volk)',W('Franken volk')],['Wikipedia: Friezen',W('Friezen')],['Wikipedia: Saksen (volk)',W('Saksen volk')]]
},

'Clovis wordt christen': {
 aanloop: [
  'De Franken waren verdeeld in kleinere groepen met eigen koningen. Clovis, uit het geslacht van de Merovingen, werd rond 481 koning van de Salische Franken. Hij versloeg rivalen en breidde zijn rijk snel uit over Gallië.',
  'Veel Germaanse koningen waren aanhangers van het arianisme, een richting die door de kerk in Rome als ketterij werd gezien. De Gallo-Romeinse bevolking was katholiek. Clovis’ vrouw Clotilde was ook katholiek. Volgens de overlevering probeerde zij hem al langer te overtuigen.'
 ],
 verloop: [
  'Volgens Gregorius van Tours beloofde Clovis tijdens een veldslag tegen de Alemannen christen te worden als hij zou winnen. Hij won en liet zich in Reims dopen door bisschop Remigius, samen met veel van zijn krijgers. Het jaar is onzeker: traditioneel 496, maar mogelijk later.',
  'Door voor het katholieke geloof te kiezen, kreeg Clovis de steun van de bisschoppen en van de Gallo-Romeinse bevolking. Dat maakte zijn macht stabieler dan die van andere Germaanse koningen.',
  'Clovis stierf in 511. Het Frankische Rijk groeide uit tot de machtigste staat van West-Europa. Vanuit dat rijk werd later ook het christendom in de Nederlanden verspreid, onder meer door missionarissen als Willibrord. Zo legde de doop van Clovis een basis voor de kerstening van West-Europa.'
 ],
 cijfers: [['Koning','vanaf ca. 481'],['Doop (traditioneel)','496'],['Overlijden','511']],
 figuren: [['Clovis','koning van de Franken'],['Clotilde','zijn katholieke vrouw'],['Remigius','bisschop van Reims, doopte Clovis'],['Gregorius van Tours','geschiedschrijver']],
 bronnen: [['Wikipedia: Clovis I',W('Clovis I')],['Wikipedia: Merovingen',W('Merovingen')]]
}

});
})();
