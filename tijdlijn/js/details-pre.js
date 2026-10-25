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
  'In de 3e eeuw kwam de nederzetting onder druk door invallen. Toch bleef Heerlen bewoond. De fundamenten van het badhuis zijn nu overdekt te bezoeken in het Thermenmuseum. Het behoort tot de best bewaarde Romeinse bouwwerken van Nederland.'
 ],
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
