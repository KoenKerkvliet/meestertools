// Uitgebreide achtergrond per gebeurtenis — 18e en 19e eeuw. Sleutel = titel van de gebeurtenis.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
Object.assign(window.DETAILS, {

'Vrede van Utrecht': {
 aanloop: [
  'In 1700 stierf de Spaanse koning Karel II zonder kinderen. Hij had de Franse prins Filips van Anjou, een kleinzoon van Lodewijk XIV, als opvolger aangewezen. Andere Europese landen vreesden dat Frankrijk en Spanje samen veel te machtig zouden worden.',
  'Daarom brak in 1701 de Spaanse Successieoorlog uit. De Republiek vocht samen met Engeland en Oostenrijk tegen Frankrijk en Spanje. De oorlog werd grotendeels in de Zuidelijke Nederlanden uitgevochten en kostte de Republiek enorme bedragen.'
 ],
 verloop: [
  'In januari 1712 begon in Utrecht een vredescongres. Diplomaten uit heel Europa onderhandelden ruim een jaar. In april 1713 werden de belangrijkste verdragen getekend. Met de keizer werd pas in 1714 vrede gesloten, in Rastatt en Baden.',
  'Filips van Anjou mocht koning van Spanje blijven, maar moest afzien van de Franse troon. De Zuidelijke Nederlanden gingen naar Oostenrijk. Groot-Brittannië kreeg onder meer Gibraltar en werd de grote winnaar. De Republiek kreeg het recht om in een reeks vestingen in het zuiden troepen te legeren, de zogeheten Barrière.',
  'Voor de Republiek was de vrede een keerpunt. Ze had zware schulden en speelde daarna geen leidende rol meer in de Europese politiek. Toch gold Utrecht als een vroeg voorbeeld van een groot internationaal vredesoverleg.'
 ],
 cijfers: [['Spaanse Successieoorlog','1701 – 1713/1714'],['Opening vredescongres','januari 1712'],['Belangrijkste verdragen','april 1713'],['Barrièretraktaat','1715']],
 figuren: [['Lodewijk XIV','koning van Frankrijk'],['Filips V','kleinzoon van Lodewijk XIV, koning van Spanje'],['Anthonie Heinsius','raadpensionaris van Holland']],
 bronnen: [['Wikipedia: Vrede van Utrecht',W('Vrede van Utrecht 1713')],['Wikipedia: Spaanse Successieoorlog',W('Spaanse Successieoorlog')]]
},

'Roggeveen bij Paaseiland': {
 aanloop: [
  'Lang dachten geleerden dat er op het zuidelijk halfrond een groot continent moest liggen: het Zuidland. De Zeeuwse kaartmaker Arent Roggeveen wilde het gaan zoeken, maar overleed voordat het ervan kwam.',
  'Zijn zoon Jacob Roggeveen, jurist en oud-medewerker van de VOC, zette het plan door. Op 1 augustus 1721 vertrok hij op 62-jarige leeftijd van Texel, in dienst van de West-Indische Compagnie, met drie schepen en 244 man.'
 ],
 verloop: [
  'De schepen voeren om Kaap Hoorn de Grote Oceaan in. Op 5 april 1722, paaszondag, zagen ze een onbekend eiland. Roggeveen noemde het Paaseiland. Bewoners kwamen met kano’s naar de schepen en gingen aan boord.',
  'Op 10 april ging Roggeveen met 134 man aan land. Door zenuwachtigheid openden enkele soldaten het vuur. Ongeveer tien bewoners werden gedood of gewond. Daarna werden er toch geschenken geruild. De Nederlanders verbaasden zich over de enorme stenen beelden: de moai.',
  'Het Zuidland vonden ze niet, want het bestond niet. Eén schip leed schipbreuk en veel opvarenden stierven. In Batavia nam de VOC de schepen in beslag, omdat Roggeveen in haar handelsgebied was gekomen. Minder dan de helft van de bemanning kwam terug in Nederland.'
 ],
 perspectieven: [
  'De Rapanui woonden al eeuwen op het eiland. Ze hadden er akkers aangelegd en de moai opgericht als beelden van hun voorouders. Het bezoek van Roggeveen was hun eerste bekende contact met Europeanen, en het begon met doden. In de eeuw daarna volgden meer bezoekers, slavenhandelaren en ziektes, waardoor de bevolking sterk kromp.'
 ],
 cijfers: [['Vertrek','1 augustus 1721, Texel'],['Schepen en bemanning','3 schepen, 244 man'],['Paaseiland','5 april 1722'],['Terug in Nederland','minder dan de helft']],
 figuren: [['Jacob Roggeveen','commandeur van de expeditie'],['Arent Roggeveen','zijn vader, bedacht de tocht'],['Cornelis Bouman','kapitein van de Tienhoven']],
 bronnen: [['Wikipedia: Jacob Roggeveen',W('Jacob Roggeveen')],['Wikipedia: Paaseiland',W('Paaseiland')]]
},

'De Bokkenrijders': {
 aanloop: [
  'In de 18e eeuw was het gebied tussen Maas en Rijn, de Landen van Overmaas, sterk versnipperd. Stukjes land hoorden bij de Republiek, bij Oostenrijk of bij kleine heerlijkheden. Er was veel armoede, en rondtrekkende benden pleegden inbraken en overvallen.',
  'Het volksgeloof vertelde over mannen die een verbond met de duivel sloten en ’s nachts op bokken door de lucht reden. In het strafrecht van die tijd mocht een rechtbank verdachten folteren om een bekentenis te krijgen.'
 ],
 verloop: [
  'Vanaf 1743 begonnen lokale rechtbanken, de schepenbanken, rond Herzogenrath en Kerkrade processen tegen vermeende Bokkenrijders. Verdachten werden gemarteld tot ze bekenden en andere namen noemden. Zo groeide het aantal verdachten steeds verder.',
  'In de jaren 1770 volgde een tweede golf van processen in een groter gebied. Veel veroordeelden werden opgehangen of geradbraakt. Bij elkaar werden honderden mensen ter dood gebracht, onder wie ook mensen met een gewone baan en een goede naam.',
  'Historici zien veel vonnissen nu als gerechtelijke dwaling. Er waren wel echte rovers, maar het beeld van een grote geheime bende kwam vooral voort uit angst en marteling. De Bokkenrijders leven voort in sagen, straatnamen en beelden in Limburg.'
 ],
 cijfers: [['Begin processen','1743'],['Tweede golf','jaren 1770'],['Gebied','Landen van Overmaas'],['Terechtgesteld','honderden mensen']],
 figuren: [['Schepenbanken','lokale rechtbanken die de vonnissen velden'],['Anton Blok','historicus, schreef De Bokkerijders (1991)']],
 bronnen: [['Wikipedia: Bokkenrijders',W('Bokkenrijders')],['Wikipedia: Landen van Overmaas',W('Landen van Overmaas')]]
},

'Eise Eisinga': {
 aanloop: [
  'Eise Eisinga werd in 1744 geboren in Dronrijp in Friesland. Hij was wolkammer, net als zijn vader, maar leerde zichzelf wiskunde en sterrenkunde. Hij vestigde zich in Franeker, een stad met een universiteit.',
  'In mei 1774 stonden de maan en vier planeten dicht bij elkaar aan de hemel. Een dominee voorspelde dat de aarde daardoor in de zon zou storten. Veel mensen raakten in paniek. Eisinga wilde laten zien hoe het zonnestelsel echt werkt.'
 ],
 verloop: [
  'Hij begon in 1774 aan een schaalmodel van het zonnestelsel in het plafond van zijn woonkamer. De planeten draaien rond de zon in hun werkelijke omlooptijd. Een slingeruurwerk met gewichten drijft een groot raderwerk op zolder aan.',
  'In 1781 was het planetarium klaar. Bezoekers konden zien dat de planeten nooit tegen elkaar of tegen de aarde zouden botsen. In 1825 kocht de staat het planetarium. Eisinga mocht er blijven wonen. Hij stierf in 1828.',
  'Het planetarium draait nog steeds en geldt als het oudste werkende planetarium ter wereld. In 2023 werd het opgenomen op de Werelderfgoedlijst van UNESCO.'
 ],
 cijfers: [['Bouwtijd','1774 – 1781'],['Aangekocht door de staat','1825'],['Overlijden Eisinga','1828'],['UNESCO-werelderfgoed','2023']],
 figuren: [['Eise Eisinga','wolkammer en bouwer van het planetarium'],['Koning Willem I','onder zijn bewind kocht de staat het planetarium']],
 bronnen: [CANON,['Wikipedia: Eise Eisinga',W('Eise Eisinga')],['Wikipedia: Eise Eisinga Planetarium',W('Eise Eisinga Planetarium')]]
},

'Sara Burgerhart': {
 aanloop: [
  'In de 18e eeuw waren in Engeland romans in briefvorm populair, vooral die van Samuel Richardson. In Nederland lazen mensen vooral stichtelijke boeken, toneel en poëzie. Een moderne roman over gewone burgers in eigen land bestond nog nauwelijks.',
  'Betje Wolff was een domineesvrouw met scherpe ideeën over opvoeding, geloof en de positie van vrouwen. Na de dood van haar man ging ze samenwonen met haar vriendin Aagje Deken. Samen gingen ze schrijven.'
 ],
 verloop: [
  'In 1782 verscheen de Historie van mejuffrouw Sara Burgerhart, in twee delen. Het verhaal wordt verteld in brieven van verschillende personages. Zo hoort de lezer veel stemmen, elk met een eigen toon.',
  'Sara is een jonge wees die ontsnapt aan het strenge huishouden van haar tante en in Amsterdam op kamers gaat. Ze is vrolijk en wil zelf keuzes maken, maar door haar onervarenheid komt ze in gevaar. Het boek waarschuwt tegen zowel overdreven vroomheid als lichtzinnigheid.',
  'Sara Burgerhart wordt vaak de eerste moderne Nederlandse roman genoemd. Wolff en Deken schreven daarna nog meer briefromans. Ze stierven in 1804 kort na elkaar en liggen samen begraven.'
 ],
 cijfers: [['Verschenen','1782'],['Vorm','briefroman in twee delen'],['Voorbeeld','Engelse briefromans'],['Overlijden schrijfsters','1804']],
 figuren: [['Betje Wolff','schrijfster'],['Aagje Deken','schrijfster en levensgezellin van Wolff'],['Samuel Richardson','Engelse schrijver van briefromans']],
 bronnen: [CANON,['Wikipedia: Sara Burgerhart',W('Sara Burgerhart')],['DBNL','https://www.dbnl.org/']]
},

'De patriotten': {
 aanloop: [
  'Rond 1780 ging het slecht met de Republiek. De Vierde Engelse Oorlog (1780–1784) liep uit op een vernedering, want de Engelsen kaapten veel Nederlandse schepen. Veel burgers gaven stadhouder Willem V en zijn aanhangers, de orangisten, de schuld.',
  'In 1781 verscheen anoniem het pamflet Aan het Volk van Nederland van Joan Derk van der Capellen tot den Pol. Hij riep burgers op zich te bewapenen en zelf mee te beslissen. De Amerikaanse onafhankelijkheidsstrijd was voor velen een voorbeeld.'
 ],
 verloop: [
  'In veel steden richtten patriotten vrijkorpsen op, burgermilities die gingen exerceren. Ze namen in verschillende steden het bestuur over. De Republiek raakte verdeeld tussen patriotten en orangisten, soms met gewapende botsingen.',
  'In juni 1787 werd prinses Wilhelmina, de vrouw van Willem V, bij Goejanverwellesluis door een vrijkorps tegengehouden. Haar broer, de koning van Pruisen, gebruikte dit als aanleiding. In september 1787 viel een Pruisisch leger het land binnen en herstelde de macht van de stadhouder.',
  'Duizenden patriotten vluchtten naar Frankrijk. Hun ideeën over burgerrechten en volkssoevereiniteit verdwenen niet. In 1795 keerden ze met Franse troepen terug.'
 ],
 cijfers: [['Vierde Engelse Oorlog','1780 – 1784'],['Pamflet Van der Capellen','1781'],['Goejanverwellesluis','28 juni 1787'],['Pruisische inval','september 1787']],
 figuren: [['Joan Derk van der Capellen tot den Pol','edelman en patriottenleider'],['Willem V','stadhouder'],['Wilhelmina van Pruisen','echtgenote van Willem V'],['Frederik Willem II','koning van Pruisen']],
 bronnen: [CANON,['Wikipedia: Patriottentijd',W('Patriottentijd')],['Wikipedia: Aan het Volk van Nederland',W('Aan het Volk van Nederland')]]
},

'Bataafse Republiek': {
 aanloop: [
  'Na de Franse Revolutie van 1789 verklaarde Frankrijk de oorlog aan de Republiek. Gevluchte patriotten vochten mee aan Franse zijde. Zij hoopten de stadhouder te verdrijven en een nieuw bestuur op te bouwen.',
  'In de strenge winter van 1794 op 1795 bevroren de grote rivieren. Franse troepen onder generaal Pichegru konden daardoor snel naar het noorden oprukken. Er was weinig verzet.'
 ],
 verloop: [
  'Op 18 januari 1795 vluchtte stadhouder Willem V vanuit Scheveningen naar Engeland. In Amsterdam en andere steden namen patriotten de macht over. De Bataafse Republiek werd uitgeroepen, genoemd naar de Bataven uit de Romeinse tijd.',
  'De vrijheid had een prijs. Bij het Verdrag van Den Haag moest de nieuwe republiek Frankrijk 100 miljoen gulden betalen en een Frans leger onderhouden. Ook stond ze gebied af, waaronder Maastricht en Venlo.',
  'Na jaren van strijd tussen unitarissen en federalisten kwam er in 1798 een eerste grondwet, de Staatsregeling. Het land werd een eenheidsstaat met gelijke rechten voor alle burgers en gescheiden kerk en staat. In 1806 maakte Napoleon er een koninkrijk van.'
 ],
 cijfers: [['Vlucht van Willem V','18 januari 1795'],['Oorlogsschatting','100 miljoen gulden'],['Eerste grondwet','1798'],['Einde republiek','1806']],
 figuren: [['Willem V','stadhouder, vluchtte naar Engeland'],['Charles Pichegru','Franse generaal'],['Herman Willem Daendels','patriot en generaal'],['Rutger Jan Schimmelpenninck','raadpensionaris in 1805']],
 bronnen: [['Wikipedia: Bataafse Republiek',W('Bataafse Republiek')],['Wikipedia: Staatsregeling 1798',W('Staatsregeling voor het Bataafsche Volk')]]
},

'Departement Nedermaas': {
 aanloop: [
  'Het gebied van het latere Limburg was in de 18e eeuw een lappendeken. Delen hoorden bij de Republiek, bij de Oostenrijkse Nederlanden, bij het prinsbisdom Luik of bij kleine heerlijkheden. Maastricht had zelfs twee heren tegelijk.',
  'In 1794 trokken Franse revolutionaire legers het gebied binnen. Na een beleg onder generaal Kléber gaf Maastricht zich in november 1794 over.'
 ],
 verloop: [
  'Op 1 oktober 1795 lijfde Frankrijk de Oostenrijkse Nederlanden en Luik in. De Republiek had Maastricht en Venlo al afgestaan. Het gebied werd verdeeld in departementen. Een ervan was de Meuse-Inférieure, in het Nederlands Nedermaas, met Maastricht als hoofdstad.',
  'Het departement was ingedeeld in arrondissementen rond Maastricht, Hasselt en Roermond. Er gold Frans recht, met de burgerlijke stand en later de Code civil. Kloosters werden opgeheven en de oude standen en heerlijkheden verdwenen.',
  'Na de val van Napoleon in 1814 kwam er een einde aan het departement. In 1815 vormde het grotendeels de nieuwe provincie Limburg in het Verenigd Koninkrijk der Nederlanden. Zo legde de Franse tijd de basis voor één Limburg.'
 ],
 cijfers: [['Overgave Maastricht','november 1794'],['Inlijving bij Frankrijk','1 oktober 1795'],['Hoofdstad','Maastricht'],['Einde departement','1814']],
 figuren: [['Jean-Baptiste Kléber','Franse generaal, belegerde Maastricht'],['Napoleon Bonaparte','Frans staatshoofd vanaf 1799'],['Koning Willem I','vormde in 1815 de provincie Limburg']],
 bronnen: [['Wikipedia: Nedermaas',W('Nedermaas departement')],['Wikipedia: Geschiedenis van Limburg',W('Geschiedenis van Limburg')]]
},

'Opstand van Tula': {
 aanloop: [
  'Op Curaçao werkten in de 18e eeuw duizenden tot slaaf gemaakte Afrikanen en hun nakomelingen op plantages en in de haven. Het eiland was een belangrijk centrum van de slavenhandel van de West-Indische Compagnie. De omstandigheden waren hard.',
  'In 1795 kwam het nieuws van de Franse Revolutie en de slavenopstand op Saint-Domingue (Haïti) ook op Curaçao aan. Tegelijk werd Nederland een Franse bondgenoot. Volgens Tula moesten de idealen van vrijheid en gelijkheid dan ook voor hen gelden.'
 ],
 verloop: [
  'Op 17 augustus 1795 weigerden tot slaaf gemaakten op plantage Knip in het westen van het eiland aan het werk te gaan. Onder leiding van Tula trokken ze langs andere plantages. Honderden mensen sloten zich aan. Belangrijke medeleiders waren Bastiaan Karpata, Louis Mercier en Pedro Wakao.',
  'Een priester probeerde te bemiddelen, maar het koloniale bestuur gaf niet toe. Na enkele weken werden de opstandelingen verslagen. Tula werd verraden en gevangengenomen. Op 3 oktober 1795 werd hij op wrede wijze terechtgesteld, net als andere leiders.',
  'Tula geldt nu als vrijheidsstrijder en nationale held op Curaçao. Op 17 augustus wordt jaarlijks de Dag van de Vrijheidsstrijd herdacht.'
 ],
 cijfers: [['Begin opstand','17 augustus 1795'],['Startpunt','plantage Knip'],['Terechtstelling Tula','3 oktober 1795'],['Herdenking','17 augustus']],
 figuren: [['Tula','leider van de opstand'],['Bastiaan Karpata','medeleider'],['Louis Mercier','medeleider'],['Pedro Wakao','medeleider']],
 bronnen: [['Wikipedia: Tula',W('Tula vrijheidsstrijder Curaçao')],['Wikipedia: Slavenopstand Curaçao 1795',W('Slavenopstand van 1795 Curaçao')]]
},

'Lodewijk Napoleon koning': {
 aanloop: [
  'Napoleon Bonaparte wilde de landen rond Frankrijk stevig in zijn macht houden. De Bataafse Republiek was hem te onrustig en te weinig volgzaam. In 1805 had raadpensionaris Schimmelpenninck nog geprobeerd het land zelfstandig te besturen.',
  'In 1806 besloot Napoleon van de republiek een koninkrijk te maken. Hij plaatste zijn jongere broer Lodewijk op de troon, zoals hij ook elders familieleden koning maakte.'
 ],
 verloop: [
  'Het Koninkrijk Holland begon in juni 1806. Lodewijk deed zijn best om een echte Hollandse koning te zijn. Hij leerde Nederlands en richtte het stadhuis op de Dam in als paleis. Hij stichtte een Koninklijk Instituut voor wetenschap en kunst en een Koninklijk Museum, een voorloper van het Rijksmuseum.',
  'Napoleon vond zijn broer te veel opkomen voor Nederlandse belangen, bijvoorbeeld bij het smokkelverbod met Engeland. In juli 1810 trad Lodewijk af en lijfde Napoleon Holland in bij het Franse keizerrijk.',
  'Uit de Franse tijd stammen blijvende vernieuwingen. In 1811 werd de burgerlijke stand ingevoerd en moest iedereen een vaste achternaam laten registreren. Ook met de voorbereiding van een kadaster werd in deze periode begonnen.'
 ],
 cijfers: [['Koninkrijk Holland','1806 – 1810'],['Aftreden Lodewijk','juli 1810'],['Inlijving bij Frankrijk','1810'],['Vaste achternamen','1811']],
 figuren: [['Lodewijk Napoleon','koning van Holland'],['Napoleon Bonaparte','keizer van Frankrijk, zijn broer'],['Hortense de Beauharnais','koningin, echtgenote van Lodewijk']],
 bronnen: [CANON,['Wikipedia: Koninkrijk Holland',W('Koninkrijk Holland')],['Wikipedia: Lodewijk Napoleon',W('Lodewijk Napoleon Bonaparte')]]
},

'Koning Willem I': {
 aanloop: [
  'Willem Frederik was de zoon van stadhouder Willem V en leefde na 1795 in ballingschap. In 1813 verloor Napoleon de Volkerenslag bij Leipzig en trokken de Franse troepen zich terug.',
  'Een groep notabelen rond Gijsbert Karel van Hogendorp nam in november 1813 het initiatief om de prins terug te halen. Op 30 november landde hij bij Scheveningen en werd hij soeverein vorst.'
 ],
 verloop: [
  'De grote mogendheden wilden een sterke buffer tegen Frankrijk. Daarom werden de Noordelijke en Zuidelijke Nederlanden samengevoegd. In maart 1815 riep Willem zich uit tot koning. In juni 1815 werd Napoleon definitief verslagen bij Waterloo, waar ook Nederlandse troepen onder kroonprins Willem vochten.',
  'Willem I regeerde met veel persoonlijke macht. Hij stimuleerde handel en industrie en kreeg de bijnaam koning-koopman. Hij liet kanalen graven, zoals het Noordhollandsch Kanaal en de Zuid-Willemsvaart, en richtte in 1824 de Nederlandsche Handel-Maatschappij op.',
  'De eenheid met het zuiden hield geen stand. In 1830 kwamen de Belgen in opstand. Willem I trad in 1840 af. Hij geldt als grondlegger van het Nederlandse koningshuis.'
 ],
 cijfers: [['Landing in Scheveningen','30 november 1813'],['Koning','maart 1815'],['Nederlandsche Handel-Maatschappij','1824'],['Aftreden','1840']],
 figuren: [['Willem I','eerste koning der Nederlanden'],['Gijsbert Karel van Hogendorp','leidde de machtsovername in 1813'],['Kroonprins Willem','vocht bij Waterloo, later Willem II']],
 bronnen: [CANON,['Wikipedia: Willem I der Nederlanden',W('Willem I der Nederlanden')],['Koninklijk Huis','https://www.koninklijkhuis.nl/']]
},

'Belgische Opstand': {
 aanloop: [
  'In het Verenigd Koninkrijk der Nederlanden voelden veel zuiderlingen zich achtergesteld. Het bestuur zat vooral in het noorden, Nederlands werd als bestuurstaal opgelegd en katholieken wantrouwden de protestantse koning. Liberalen ergerden zich aan zijn eigenmachtige stijl.',
  'In 1830 brak in Parijs de Julirevolutie uit. Die werkte aanstekelijk. Op 25 augustus 1830 leidde een operavoorstelling in Brussel tot rellen die uitgroeiden tot een opstand.'
 ],
 verloop: [
  'Een Nederlands leger probeerde in september Brussel te heroveren, maar moest zich terugtrekken. Op 4 oktober 1830 riep een voorlopig bewind de onafhankelijkheid van België uit. In 1831 werd Leopold van Saksen-Coburg de eerste Belgische koning.',
  'Ook in Limburg kozen de meeste steden en dorpen voor België. Venlo viel in november 1830 in Belgische handen. Alleen Maastricht bleef Nederlands, omdat generaal Dibbets de vesting met een sterk garnizoen in handen hield. De stad lag jarenlang als een eiland in Belgisch gebied.',
  'In augustus 1831 voerde Willem I de Tiendaagse Veldtocht, maar Frankrijk greep in. Pas in 1839 erkende hij België en werd ook de toekomst van Limburg geregeld.'
 ],
 cijfers: [['Begin opstand','25 augustus 1830'],['Onafhankelijkheid uitgeroepen','4 oktober 1830'],['Tiendaagse Veldtocht','augustus 1831'],['Erkenning door Nederland','1839']],
 figuren: [['Willem I','koning, weigerde lang de afscheiding'],['Generaal Bernardus Dibbets','commandant van Maastricht'],['Leopold I','eerste koning der Belgen']],
 bronnen: [['Wikipedia: Belgische Revolutie',W('Belgische Revolutie')],['Wikipedia: Tiendaagse Veldtocht',W('Tiendaagse Veldtocht')]]
},

'De eerste spoorlijn': {
 aanloop: [
  'In Engeland reden vanaf de jaren 1820 de eerste stoomtreinen voor personen en goederen. In Nederland ging vervoer nog vooral over water, met trekschuiten en zeilschepen. Veel mensen twijfelden of een spoorweg in zo’n waterrijk land wel zin had.',
  'Er waren plannen voor een spoorlijn van Amsterdam naar het Duitse achterland, maar die kwamen eerst niet van de grond. Een particuliere maatschappij, de Hollandsche IJzeren Spoorweg-Maatschappij, begon met een korter traject.'
 ],
 verloop: [
  'Op 20 september 1839 reed de eerste trein van Amsterdam naar Haarlem. Voorop reed de locomotief De Arend, gebouwd in Engeland. Een tweede locomotief heette De Snelheid. Het traject was ongeveer 16 kilometer lang. Ingenieur Frederik Willem Conrad had de aanleg geleid.',
  'De lijn werd daarna doorgetrokken naar Leiden, Den Haag en Rotterdam. In 1843 kwam ook de lijn Amsterdam–Utrecht in gebruik. De eerste lijnen hadden een breder spoor dan later gebruikelijk werd en moesten worden omgebouwd.',
  'De spoorwegen maakten reizen sneller, goedkoper en betrouwbaarder. Ze brachten steden dichter bij elkaar en waren belangrijk voor de groei van industrie en handel in de tweede helft van de 19e eeuw.'
 ],
 cijfers: [['Eerste rit','20 september 1839'],['Traject','Amsterdam – Haarlem, ca. 16 km'],['Locomotieven','De Arend en De Snelheid'],['Lijn Amsterdam – Utrecht','1843']],
 figuren: [['Frederik Willem Conrad','ingenieur van de spoorlijn'],['Hollandsche IJzeren Spoorweg-Maatschappij','particuliere aanlegger en exploitant']],
 bronnen: [CANON,['Wikipedia: De Arend',W('De Arend locomotief')],['Spoorwegmuseum','https://www.spoorwegmuseum.nl/']]
},

'Limburg gesplitst': {
 aanloop: [
  'Na de Belgische Opstand van 1830 was Limburg verdeeld. Maastricht bleef in Nederlandse handen, de rest van de provincie werd door België bestuurd. De grote mogendheden stelden in 1831 een verdeling voor, maar Willem I weigerde die jarenlang te aanvaarden.',
  'In 1838 gaf Willem I toe, omdat zijn koppigheid veel geld kostte en de steun in eigen land afnam. Daarna werd in Londen een definitief verdrag opgesteld.'
 ],
 verloop: [
  'Op 19 april 1839 werd het Verdrag van Londen getekend. België werd erkend als onafhankelijke en neutrale staat. Limburg werd gesplitst. Het westelijke deel werd Belgisch. Het oostelijke deel, met Maastricht, Roermond en Venlo, werd Nederlands. De grens liep grotendeels langs de Maas, al hoorde ook een strook ten westen ervan, met onder meer Weert, bij Nederland.',
  'Ook Luxemburg werd verdeeld. Het westelijke deel ging naar België. Als compensatie voor de Duitse Bond werd Nederlands Limburg als hertogdom lid van die Bond. Limburg was daardoor tegelijk een Nederlandse provincie en een Duits bondsland.',
  'Voor veel Limburgers voelde de splitsing kunstmatig. Families, handel en parochies lagen nu aan twee kanten van een grens. Zo ontstonden de twee provincies Limburg die er nu nog zijn.'
 ],
 cijfers: [['Verdrag van Londen','19 april 1839'],['Grens','grotendeels langs de Maas'],['Ook gesplitst','Luxemburg'],['Hertogdom in Duitse Bond','1839 – 1866']],
 figuren: [['Willem I','aanvaardde de scheiding in 1838'],['Leopold I','koning der Belgen'],['Lord Palmerston','Brits minister van Buitenlandse Zaken']],
 bronnen: [['Wikipedia: Verdrag van Londen 1839',W('Verdrag van Londen 1839')],['Wikipedia: Hertogdom Limburg',W('Hertogdom Limburg 1839-1867')]]
},

'De Grondwet': {
 aanloop: [
  'Na 1815 had de koning veel macht. Ministers waren alleen verantwoording schuldig aan hem en het parlement had weinig te zeggen. Liberalen onder leiding van de Leidse hoogleraar Johan Rudolph Thorbecke wilden dat veranderen.',
  'In 1848 braken in grote delen van Europa revoluties uit. Koning Willem II vreesde voor zijn troon. Hij zei later dat hij in één nacht van zeer conservatief zeer liberaal was geworden.'
 ],
 verloop: [
  'In maart 1848 gaf Willem II een commissie onder leiding van Thorbecke de opdracht een nieuwe grondwet te schrijven. Binnen enkele weken lag er een voorstel. Op 3 november 1848 werd de nieuwe Grondwet afgekondigd.',
  'Voortaan waren de ministers verantwoordelijk en niet de koning. De Tweede Kamer werd rechtstreeks gekozen en kreeg het recht om de begroting te wijzigen en onderzoek te doen. Ook vrijheid van onderwijs, godsdienst, vergadering en vereniging werden vastgelegd.',
  'Het kiesrecht bleef beperkt tot mannen die genoeg belasting betaalden. Toch legde de Grondwet van 1848 de basis voor de parlementaire democratie. Thorbecke werd in 1849 zelf minister en leider van het kabinet.'
 ],
 cijfers: [['Opdracht aan commissie','maart 1848'],['Afkondiging','3 november 1848'],['Kiesrecht','alleen mannen die genoeg belasting betaalden'],['Eerste kabinet-Thorbecke','1849']],
 figuren: [['Johan Rudolph Thorbecke','liberaal staatsman, schreef de Grondwet'],['Koning Willem II','gaf opdracht tot de herziening']],
 bronnen: [CANON,['Wikipedia: Grondwetsherziening 1848',W('Grondwetsherziening van 1848')],['Parlement.com','https://www.parlement.com/']]
},

'Max Havelaar': {
 aanloop: [
  'Vanaf 1830 gold in Nederlands-Indië het cultuurstelsel. Javaanse boeren moesten een deel van hun grond en arbeid inzetten voor gewassen als koffie en suiker voor de Nederlandse staat. Dat leverde de schatkist veel geld op, maar bracht ook armoede en soms hongersnood.',
  'Eduard Douwes Dekker was ambtenaar in Indië. In 1856 werd hij assistent-resident in Lebak op West-Java. Hij beschuldigde de plaatselijke regent van machtsmisbruik, maar kreeg geen steun van zijn superieuren en nam ontslag.'
 ],
 verloop: [
  'In 1859 schreef hij in Brussel in korte tijd een roman over zijn ervaringen. Hij koos de schrijversnaam Multatuli, Latijn voor ik heb veel gedragen. Schrijver Jacob van Lennep zorgde in 1860 voor de uitgave, maar paste de tekst op een aantal plaatsen aan.',
  'Het boek is opvallend opgebouwd. Het begint bij de saaie Amsterdamse makelaar Batavus Droogstoppel en wisselt dan van verteller. Het verhaal van Saïdjah en Adinda laat de gevolgen van uitbuiting voor gewone Javanen zien.',
  'Max Havelaar maakte veel los en droeg bij aan het debat over het koloniale beleid. Het cultuurstelsel werd daarna stap voor stap afgebouwd. Het boek wordt gezien als een van de belangrijkste werken van de Nederlandse literatuur.'
 ],
 cijfers: [['Cultuurstelsel','vanaf 1830'],['Assistent-resident in Lebak','1856'],['Geschreven in Brussel','1859'],['Verschenen','1860']],
 figuren: [['Multatuli (Eduard Douwes Dekker)','schrijver, oud-ambtenaar in Indië'],['Jacob van Lennep','schrijver, bezorgde de eerste uitgave'],['Everdine van Wijnbergen','echtgenote, in het boek Tine']],
 bronnen: [CANON,['Wikipedia: Max Havelaar',W('Max Havelaar boek')],['DBNL','https://www.dbnl.org/']]
},

'Afschaffing van de slavernij': {
 aanloop: [
  'Nederlanders waren sinds de 17e eeuw betrokken bij de trans-Atlantische slavenhandel. In Suriname en op de Antillen werkten tot slaaf gemaakten op plantages onder harde omstandigheden. De slavenhandel was in 1814 verboden, maar de slavernij zelf bleef bestaan.',
  'Groot-Brittannië schafte de slavernij in 1834 af en Frankrijk in 1848. In Nederland duurde het debat lang, vooral over de vraag hoe de eigenaren schadeloos gesteld moesten worden. Mensen als Wolter Robert van Hoëvell pleitten voor afschaffing.'
 ],
 verloop: [
  'In 1862 nam het parlement de Emancipatiewet aan. Op 1 juli 1863 werden in Suriname en op de Antillen samen ruim 40.000 mensen formeel vrij. De eigenaren kregen per persoon een vergoeding van de staat. De vrijgemaakten kregen niets.',
  'In Suriname moesten de vrijgemaakten nog tien jaar onder staatstoezicht verplicht werken, vaak op dezelfde plantages. Pas in 1873 waren ze echt vrij. Daarna haalden planters contractarbeiders uit Brits-Indië en later uit Java.',
  'Op 1 juli wordt Keti Koti gevierd, Surinaams voor de verbroken ketenen. In december 2022 bood premier Rutte namens de regering excuses aan voor het slavernijverleden. Koning Willem-Alexander deed dat op 1 juli 2023.'
 ],
 cijfers: [['Emancipatiewet','1862'],['Afschaffing','1 juli 1863'],['Einde staatstoezicht','1873'],['Excuses van de koning','1 juli 2023']],
 figuren: [['Wolter Robert van Hoëvell','predikant en politicus, pleitte voor afschaffing'],['Mark Rutte','premier, excuses in 2022'],['Koning Willem-Alexander','excuses in 2023']],
 bronnen: [CANON,['Wikipedia: Keti Koti',W('Keti Koti')],['NiNsee','https://www.ninsee.nl/']]
},

'Limburg geheel Nederlands': {
 aanloop: [
  'Na de splitsing van 1839 was Nederlands Limburg een vreemde eend in de bijt. Het was een Nederlandse provincie, maar als hertogdom ook lid van de Duitse Bond. Limburg stuurde afgevaardigden naar de Bondsvergadering in Frankfurt.',
  'In 1848 wilde een deel van de Limburgers zelfs uit Nederland treden en alleen bij Duitsland horen. Dat lukte niet. In 1866 viel de Duitse Bond uiteen na de oorlog tussen Pruisen en Oostenrijk.'
 ],
 verloop: [
  'In 1867 ontstond een crisis rond Luxemburg. De Franse keizer Napoleon III wilde het groothertogdom kopen van koning Willem III, maar Pruisen was fel tegen. Om oorlog te voorkomen kwamen de grote mogendheden in Londen bijeen.',
  'Bij het Verdrag van Londen van 11 mei 1867 werd Luxemburg neutraal verklaard. In hetzelfde verdrag werd vastgelegd dat Limburg volledig bij Nederland hoorde. De band met Duitsland was daarmee voorbij.',
  'Het woord hertogdom bleef nog lang in officiële stukken staan. Een herinnering aan die bijzondere geschiedenis is dat de commissaris van de Koning in Limburg nog altijd gouverneur wordt genoemd.'
 ],
 cijfers: [['Lid van de Duitse Bond','1839 – 1866'],['Einde Duitse Bond','1866'],['Verdrag van Londen','11 mei 1867'],['Titel commissaris','gouverneur']],
 figuren: [['Koning Willem III','koning der Nederlanden en groothertog van Luxemburg'],['Napoleon III','Franse keizer, wilde Luxemburg kopen'],['Otto von Bismarck','Pruisisch minister-president']],
 bronnen: [['Wikipedia: Hertogdom Limburg',W('Hertogdom Limburg 1839-1867')],['Wikipedia: Verdrag van Londen 1867',W('Verdrag van Londen 1867')]]
},

'Aletta Jacobs': {
 aanloop: [
  'In de 19e eeuw hadden meisjes weinig kansen op hoger onderwijs. Universiteiten waren alleen voor jongens. Aletta Jacobs werd in 1854 geboren in Sappemeer als dochter van een arts en wilde net als haar vader dokter worden.',
  'Ze haalde in 1870 het examen voor assistent-apotheker. Daarna schreef ze een brief aan minister-president Thorbecke met de vraag of ze colleges mocht volgen aan de universiteit.'
 ],
 verloop: [
  'In 1871 kreeg ze toestemming en begon ze aan de Rijksuniversiteit Groningen. Ze werd de eerste vrouwelijke student aan een Nederlandse universiteit. In 1878 werd ze de eerste vrouwelijke arts van Nederland en in 1879 promoveerde ze.',
  'In Amsterdam hield ze gratis spreekuren voor arme vrouwen en kinderen. Ze gaf voorlichting over hygiëne en anticonceptie, wat toen zeer omstreden was. In 1883 probeerde ze zich als kiezer te laten inschrijven, maar dat werd geweigerd.',
  'Van 1903 tot 1919 was ze voorzitter van de Vereeniging voor Vrouwenkiesrecht. Ze reisde de wereld rond voor de vrouwenbeweging en de vrede. Ze maakte in 1919 mee dat vrouwen kiesrecht kregen en stierf in 1929.'
 ],
 cijfers: [['Toestemming om te studeren','1871'],['Eerste vrouwelijke arts','1878'],['Voorzitter Vrouwenkiesrecht','1903 – 1919'],['Overleden','1929']],
 figuren: [['Aletta Jacobs','arts en feministe'],['Johan Rudolph Thorbecke','minister-president, gaf toestemming'],['Carel Victor Gerritsen','haar echtgenoot, politicus']],
 bronnen: [CANON,['Wikipedia: Aletta Jacobs',W('Aletta Jacobs')],['Atria','https://www.atria.nl/']]
},

'Het Kinderwetje': {
 aanloop: [
  'In de 19e eeuw werkten veel kinderen, op het land maar ook in fabrieken en werkplaatsen. Ze maakten lange dagen in stof en lawaai, soms al vanaf zeer jonge leeftijd. Hun loon was nodig voor het gezin.',
  'Onderzoeken en artikelen lieten zien hoe slecht de omstandigheden waren. Toch vonden veel politici dat de staat zich niet met de economie of het gezin moest bemoeien.'
 ],
 verloop: [
  'Het liberale Tweede Kamerlid Samuel van Houten diende een eigen wetsvoorstel in. In 1874 werd de wet aangenomen. Kinderen onder de twaalf jaar mochten niet meer in fabrieken en werkplaatsen werken. Werk op het land en in het huishouden bleef toegestaan.',
  'De wet had grote gaten en er was weinig controle. Toch was het een doorbraak. Voor het eerst greep de overheid in om werknemers te beschermen. Het Kinderwetje geldt als de eerste sociale wet van Nederland.',
  'Er volgden meer maatregelen. De Arbeidswet van 1889 beperkte de werktijden van jongeren en vrouwen. Met de Leerplichtwet, die in 1901 inging, moesten kinderen van zes tot twaalf jaar naar school.'
 ],
 cijfers: [['Aangenomen','1874'],['Leeftijdsgrens','12 jaar'],['Arbeidswet','1889'],['Leerplicht ingevoerd','1901']],
 figuren: [['Samuel van Houten','liberaal Kamerlid, diende de wet in'],['Hendrik Goeman Borgesius','minister, bracht de Leerplichtwet tot stand']],
 bronnen: [CANON,['Wikipedia: Kinderwetje van Van Houten',W('Kinderwetje van Van Houten')],['Parlement.com','https://www.parlement.com/']]
},

'De Aardappeleters': {
 aanloop: [
  'Vincent van Gogh werd in 1853 geboren in Zundert. Hij werkte in de kunsthandel en probeerde predikant te worden. Pas rond zijn 27e besloot hij kunstenaar te worden. Zijn broer Theo steunde hem met geld en brieven.',
  'Van 1883 tot 1885 woonde hij in Nuenen, waar zijn vader dominee was. Hij tekende en schilderde wevers en boeren. Hij wilde het harde leven van gewone mensen eerlijk laten zien.'
 ],
 verloop: [
  'In het voorjaar van 1885 schilderde hij De Aardappeleters. Een boerenfamilie zit bij lamplicht aan tafel en eet aardappelen. De kleuren zijn donker en de gezichten grof. Van Gogh wilde laten zien dat deze mensen hun eten met hun eigen handen hadden verdiend.',
  'Hij beschouwde het schilderij als zijn eerste grote werk, maar kreeg er weinig waardering voor. Kort daarna vertrok hij naar Antwerpen en in 1886 naar Parijs. Daar en later in Arles kreeg zijn werk felle kleuren en een losse toets.',
  'Van Gogh verkocht tijdens zijn leven weinig. Hij stierf in 1890. Dankzij Theo’s weduwe Jo van Gogh-Bonger werd zijn werk bekend. Nu is hij een van de beroemdste schilders ter wereld.'
 ],
 cijfers: [['Geschilderd','voorjaar 1885'],['Periode in Nuenen','1883 – 1885'],['Overleden','1890'],['Te zien in','Van Gogh Museum, Amsterdam']],
 figuren: [['Vincent van Gogh','schilder'],['Theo van Gogh','broer en kunsthandelaar'],['Jo van Gogh-Bonger','schoonzus, maakte zijn werk bekend']],
 bronnen: [CANON,['Wikipedia: De aardappeleters',W('De aardappeleters')],['Van Gogh Museum','https://www.vangoghmuseum.nl/']]
},

'Steenkoolmijnen in Parkstad': {
 aanloop: [
  'In Zuid-Limburg werd al eeuwenlang op kleine schaal steenkool gewonnen, onder meer door de monniken van Rolduc bij Kerkrade. Rond 1900 groeide de vraag naar kolen sterk door industrie, spoorwegen en verwarming.',
  'Nederland haalde veel kolen uit Duitsland en België. Daarom wilden ondernemers en de overheid de eigen voorraden onder Zuid-Limburg beter benutten.'
 ],
 verloop: [
  'In 1899 begon de Oranje-Nassaumijn in Heerlen met de winning van steenkool. In 1902 richtte de staat de Staatsmijnen op. Zo ontstonden onder meer de mijnen Wilhelmina, Emma, Hendrik en Maurits. Particuliere en staatsmijnen samen veranderden de streek ingrijpend.',
  'Rustige dorpen groeiden uit tot mijnsteden met eigen mijnwerkerskoloniën. Er kwamen mijnwerkers uit de rest van Nederland en uit landen als Polen, Slovenië, Duitsland en Italië. De katholieke kerk speelde een grote rol in het sociale leven, onder meer via priester Henri Poels.',
  'Na 1960 werden olie en aardgas goedkoper dan kolen. In december 1965 kondigde minister Joop den Uyl in Heerlen de sluiting van de mijnen aan. In 1974 sloot de laatste mijn. De streek moest een zware omschakeling maken.'
 ],
 cijfers: [['Start Oranje-Nassaumijn','1899'],['Oprichting Staatsmijnen','1902'],['Aankondiging sluiting','december 1965'],['Laatste mijn dicht','1974']],
 figuren: [['Henri Poels','priester, voorman van het katholieke sociale leven in de mijnstreek'],['Joop den Uyl','minister van Economische Zaken, kondigde de sluiting aan']],
 bronnen: [['Wikipedia: Oranje-Nassau Mijnen',W('Oranje-Nassau Mijnen')],['Wikipedia: Staatsmijnen',W('Staatsmijnen')]]
}

});
})();
