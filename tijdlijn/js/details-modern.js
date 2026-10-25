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

'De stoommachine': {
 aanloop: [
  'Rond 1700 liep er in mijnen steeds meer water vol. Wegpompen ging met spierkracht, paarden en watermolens, en dat was zwaar werk en niet genoeg. Daarom zochten uitvinders naar een machine die dat werk kon doen.',
  'Stoom bleek krachtig: kokend water zet enorm uit, en als stoom afkoelt, trekt hij weer samen. Thomas Savery en Denis Papin probeerden dat te gebruiken. Thomas Newcomen, een Engelse mijnbouwkundig ingenieur, maakte er omstreeks 1712 een bruikbare machine van.'
 ],
 verloop: [
  'De machine van Newcomen werkte met luchtdruk: stoom in een cilinder werd afgekoeld, waardoor de buitenlucht de zuiger omlaag duwde. Ze verbruikte veel steenkool, maar pompte mijnen leeg. In 1763 kreeg de Schot James Watt de opdracht zo’n machine te verbeteren. Zijn ontwerp verbruikte veel minder brandstof. In 1769 kreeg hij er octrooi op.',
  'Voortaan kon kracht overal worden gemaakt, niet alleen langs rivieren of waar de wind waaide. Stoom dreef fabrieken, schepen en locomotieven aan. Dat was het begin van de industriële revolutie.',
  'In Nederland kwam de eerste stoommachine op 9 maart 1776 in gebruik, in Rotterdam. Koning Willem I koos in 1837 voor stoom in plaats van windmolens om de Haarlemmermeer droog te maken. Het gemaal De Cruquius uit 1849 pompte daarvoor mee. Samen met twee andere gemalen sloeg het in drie jaar en drie maanden 800 miljoen kubieke meter water uit. Het geldt als de grootste stoommachine ter wereld.'
 ],
 perspectieven: [
  'Stoom bracht welvaart en vooruitgang, maar ook vuile lucht en zwaar werk in fabrieken. Ook kinderen werkten lange dagen. In Nederland kwam daarom later het Kinderwetje van 1874.'
 ],
 cijfers: [['Newcomen','ca. 1712'],['Watt','octrooi in 1769'],['Eerste in Nederland','9 maart 1776, Rotterdam'],['De Cruquius','1849, Haarlemmermeer']],
 figuren: [['Thomas Newcomen','bouwde de eerste bruikbare machine'],['James Watt','maakte haar zuinig en krachtig'],['Willem I','koos stoom om de Haarlemmermeer droog te malen']],
 bronnen: [['Wikipedia: Stoommachine',W('Stoommachine')],['Wikipedia: Gemaal De Cruquius',W('Gemaal De Cruquius')],['Wikipedia: James Watt',W('James Watt')]]
},

'De Leidse fles': {
 aanloop: [
  'In de 18e eeuw waren geleerden gefascineerd door elektriciteit. Met elektriseermachines wekten ze statische elektriciteit op en lieten ze vonken springen. Maar de lading verdween snel weg. Niemand kon haar bewaren.',
  'Pieter van Musschenbroek was hoogleraar natuurkunde in Leiden en deed proeven met elektriciteit.'
 ],
 verloop: [
  'In 1746 maakte hij in Leiden een wijde glazen fles, gevuld met water en aan de buitenkant bedekt met tinfolie. Aan de bovenkant zat een metalen bol. Met een elektriseermachine kon hij de fles opladen. De lading bleef erin zitten. Wie de bol aanraakte, kreeg een flinke schok.',
  'Een jaar eerder had de Duitser Ewald von Kleist iets vergelijkbaars bedacht. Maar Van Musschenbroek schreef erover, en daarom kreeg de uitvinding in heel Europa de naam Leidse fles. Het was de eerste condensator: een onderdeel dat elektrische lading opslaat, zoals ze tot op de dag van vandaag in elektronica zitten.',
  'Leidse flessen werden gebruikt voor proeven en voor shows. Soms kreeg het publiek bij het aanraken van een hele batterij flessen een schok. In 1752 gebruikte Benjamin Franklin een Leidse fles om te bewijzen dat bliksem elektriciteit is.'
 ],
 cijfers: [['Uitgevonden','1746, Leiden'],['Eerder idee','1745, Von Kleist'],['Soort apparaat','de eerste condensator'],['Franklin','bliksem is elektriciteit (1752)']],
 figuren: [['Pieter van Musschenbroek','hoogleraar natuurkunde in Leiden'],['Ewald von Kleist','Duitser, bedacht iets vergelijkbaars een jaar eerder'],['Benjamin Franklin','bewees dat bliksem elektriciteit is']],
 bronnen: [['Wikipedia: Leidse fles',W('Leidse fles')],['Wikipedia: Pieter van Musschenbroek',W('Pieter van Musschenbroek')]]
},

'Johann Sebastian Bach': {
 aanloop: [
  'Bach werd op 21 maart 1685 geboren in Eisenach, in een familie met een lange muziektraditie: over zeven generaties waren er al muzikanten.',
  'Hij werd organist, klavecinist, violist en leraar. Al op jonge leeftijd werkte hij als muzikant aan de hoven en in de kerken van Duitse steden.'
 ],
 verloop: [
  'Bachs muziek omvat vrijwel alle vormen die in zijn tijd gangbaar waren, met uitzondering van opera. Zijn werk hoort bij de barok, net als dat van Bernini. Hij overleed op 28 juli 1750 in Leipzig.',
  'In de 19e eeuw werd zijn muziek herontdekt. Bij de opening van het Concertgebouw in Amsterdam, in 1888, klonk ook muziek van Bach.'
 ],
 cijfers: [['Geboren','21 maart 1685, Eisenach'],['Muzikale familie','7 generaties'],['Soort muziek','barok, bijna alles behalve opera'],['Overleden','28 juli 1750, Leipzig']],
 figuren: [['Johann Sebastian Bach','componist en organist'],['Johann Ambrosius Bach','zijn vader, ook muzikant']],
 bronnen: [['Wikipedia: Johann Sebastian Bach',W('Johann Sebastian Bach')]]
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
 gevolgen: [
  "Na de inlijving bij Frankrijk in 1810 werd Nederland drie jaar een deel van het Franse keizerrijk. Jonge mannen moesten in het Franse leger dienen, en duizenden Nederlanders gingen mee op de veldtocht naar Rusland in 1812, waarvan velen niet terugkeerden.",
  "Lodewijk liet blijvende instellingen achter. Het Koninklijk Instituut werd later de Koninklijke Nederlandse Akademie van Wetenschappen. Het Koninklijk Museum werd het Rijksmuseum. En het stadhuis op de Dam bleef een koninklijk paleis."
 ],
 perspectieven: [
  "Voor Napoleon was zijn broer te slap: hij liet de smokkel met Engeland oogluikend toe en weigerde Nederlandse jongens als soldaat te leveren. Voor veel Nederlanders werd Lodewijk juist een geliefde koning, omdat hij betrokken was bij het land, bijvoorbeeld bij de buskruitramp in Leiden in 1807 en bij overstromingen, waar hij zelf hulp bood."
 ],
 misverstanden: [
  ["“Mensen kozen in 1811 expres rare achternamen om de Fransen te pesten.”","Dat is een hardnekkig verhaal, maar meestal klopt het niet. Namen als Naaktgeboren of Poepjes bestonden vaak al langer als bijnaam, of hadden toen een andere betekenis. De meeste mensen kozen een gewone naam, naar hun vader, beroep of woonplaats."],
  ["“Lodewijk Napoleon was een Fransman die Nederland niet begreep.”","Hij deed juist zijn best om een Nederlandse koning te zijn, leerde de taal en kwam op voor Nederlandse belangen. Dat was zelfs de reden dat Napoleon hem afzette."]
 ],
 hoeWeten: [
  "De archieven van het Koninkrijk Holland, met besluiten en brieven, zijn bewaard in het Nationaal Archief. Lodewijk schreef later zelf herinneringen. De registers van de burgerlijke stand uit 1811, waarin mensen hun achternaam opgaven, zijn voor iedereen te raadplegen."
 ],
 nu: [
  "Het Koninklijk Paleis op de Dam is nog steeds een paleis van het koningshuis en wordt gebruikt voor staatsbezoeken. Via genealogiesites kun je in de registers van 1811 opzoeken welke achternaam je voorouders kozen."
 ],
 vertellen: "Lodewijk probeerde zijn onderdanen in het Nederlands toe te spreken. Volgens een bekend verhaal zei hij “Ik ben uw konijn” in plaats van “Ik ben uw koning”. Of het echt zo gebeurde, is niet zeker, maar zijn bijnaam “Konijn van ’Olland” bleef hangen.",
 verbanden: [["Napoleon Bonaparte","zijn broer, de keizer"],["Het Rijksmuseum","Lodewijk bracht het museum naar Amsterdam"],["Koning Willem I","na de Franse tijd kwam het huis van Oranje terug"]],
 onderwijs: {"ka":["De democratische revoluties in westerse landen met als gevolg discussies over grondwetten, grondrechten en staatsburgerschap. (tijdvak 7)"],"venster":"27. Napoleon Bonaparte"},
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
 gevolgen: [
  "Willem I bouwde het land op met kanalen, wegen en banken, en kreeg de bijnaam kanalenkoning. Hij steunde ook het cultuurstelsel in Nederlands-Indië vanaf 1830, dat de schatkist veel geld opleverde, maar de Javaanse boeren zwaar belastte.",
  "Na de Belgische Opstand kostte zijn weigering om België te erkennen veel geld. Toen hij in 1840 ook nog wilde trouwen met de katholieke Belgische gravin Henriëtte d’Oultremont, verloor hij veel steun. Hij trad af en vertrok naar Berlijn, waar hij in 1843 overleed."
 ],
 perspectieven: [
  "Voor de noordelijke provincies was Willem I een energieke koning die de economie op gang bracht. In het zuiden vonden veel mensen dat hij te eigenmachtig regeerde en het noorden bevoordeelde, bijvoorbeeld met zijn taalbesluit dat het Nederlands verplicht maakte in bestuur en rechtspraak in de Vlaamse provincies. Voor de Javanen betekende zijn cultuurstelsel armoede."
 ],
 misverstanden: [
  ["“Willem I was de eerste Oranje die Nederland bestuurde.”","De Oranjes waren al eeuwen stadhouder, te beginnen met Willem van Oranje. Willem I was wel de eerste die koning werd."],
  ["“Het Koninkrijk der Nederlanden bestond meteen uit het huidige Nederland.”","Van 1815 tot 1830 hoorde ook het huidige België erbij. En de koning was tegelijk groothertog van Luxemburg."]
 ],
 hoeWeten: [
  "De archieven van Willem I en zijn regering zijn bewaard in het Nationaal Archief en het Koninklijk Huisarchief. Daaruit blijkt hoeveel hij zelf besliste. Kaarten van zijn kanalen en de verslagen van de Staten-Generaal laten zien hoe het land onder hem veranderde."
 ],
 nu: [
  "Kanalen als het Noordhollandsch Kanaal en de Zuid-Willemsvaart, en het kanaal Gent-Terneuzen, worden nog gebruikt. De Nederlandsche Handel-Maatschappij die hij oprichtte, is via fusies opgegaan in de bank ABN AMRO. Willem-Alexander is een directe nazaat."
 ],
 vertellen: "Op 30 november 1813 kwam de prins bij Scheveningen aan land, na achttien jaar ballingschap. Het was nog onzeker of de Fransen echt zouden vertrekken. Een paar dagen later werd hij in Amsterdam uitgeroepen tot soeverein vorst, en anderhalf jaar later tot koning.",
 verbanden: [["Het Congres van Wenen","Europa gaf hem een koninkrijk"],["Belgische Opstand","het zuiden scheidde zich af"],["Max Havelaar","de gevolgen van het cultuurstelsel"],["Koning Willem-Alexander","een van zijn nazaten"]],
 onderwijs: {"venster":"28. Koning Willem I"},
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
 gevolgen: [
  "België werd een onafhankelijk koninkrijk met een liberale grondwet, die in Europa als modern gold. Leopold I werd de eerste koning. Nederland moest het verlies jarenlang verwerken; het leger bleef tot 1839 gemobiliseerd, wat veel geld kostte.",
  "De Citadel van Antwerpen bleef nog tot december 1832 in Nederlandse handen, totdat een Frans leger hem innam. Pas met het Verdrag van Londen in 1839 werd de scheiding definitief en werden ook Limburg en Luxemburg verdeeld."
 ],
 perspectieven: [
  "Voor Belgen is 1830 het begin van hun eigen land; de opstand wordt gezien als een strijd voor vrijheid. In Nederland werd het lang beleefd als verraad en verlies. Binnen België zelf waren er al vroeg spanningen tussen het Franstalige bestuur en de Nederlandstalige Vlamingen, die een rol bleven spelen in de Belgische geschiedenis."
 ],
 misverstanden: [
  ["“België was al een eigen land dat Nederland had ingepikt.”","Het gebied hoorde eeuwenlang bij Spanje en Oostenrijk, en daarna bij Frankrijk. België als zelfstandige staat ontstond pas na 1830."],
  ["“De opstand ging vooral over taal.”","Taal speelde mee, maar ook godsdienst, belastingen, de verdeling van functies tussen noord en zuid en de eigenmachtige stijl van Willem I."]
 ],
 hoeWeten: [
  "Er zijn verslagen van het voorlopig bewind, brieven van Willem I en zijn ministers, en kranten uit Brussel en Den Haag. Schilderijen en prenten laten de gevechten in Brussel zien, vaak vanuit Belgisch perspectief. De diplomatieke stukken van de Londense conferentie zijn bewaard."
 ],
 nu: [
  "België viert op 21 juli zijn nationale feestdag, de dag waarop Leopold I in 1831 de eed aflegde. Het Belgische volkslied, de Brabançonne, ontstond in 1830. Nederland en België zijn nu nauwe partners, onder meer in de Benelux en de Europese Unie."
 ],
 vertellen: "De opstand begon na een operavoorstelling. Op 25 augustus 1830 werd in de Muntschouwburg in Brussel De Stomme van Portici opgevoerd, een opera over een volksopstand. Toen het publiek naar buiten kwam, liep het onrustig uit op rellen in de stad.",
 verbanden: [["Koning Willem I","zijn koninkrijk viel uiteen"],["Limburg gesplitst","de gevolgen voor Limburg"],["Het Congres van Wenen","waar het verenigde koninkrijk was bedacht"]],
 onderwijs: {"ka":["De opkomst van politiek-maatschappelijke stromingen: liberalisme, nationalisme, socialisme, confessionalisme en feminisme."]},
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
 gevolgen: [
  "Na Amsterdam–Haarlem groeide het spoornet snel, vooral na 1860, toen de staat zelf spoorlijnen ging aanleggen. Het breedspoor van de eerste lijnen, 1945 millimeter, werd tot 1866 omgebouwd naar het normale spoor, zodat treinen ook naar Duitsland en België konden rijden.",
  "De trein maakte het mogelijk om in één dag naar een andere stad te reizen. Goederen als steenkool, landbouwproducten en fabrieksgoederen konden goedkoop worden vervoerd. Steden groeiden rond hun station, en er ontstonden nieuwe woonwijken voor forensen."
 ],
 perspectieven: [
  "Voorstanders zagen de trein als vooruitgang. Tegenstanders, zoals de schippers van de trekschuiten, zagen hun werk verdwijnen. Sommige artsen waarschuwden dat de hoge snelheid ongezond zou zijn. En op het platteland waren boeren bang dat de trein hun vee zou laten schrikken of hun land zou doorsnijden."
 ],
 misverstanden: [
  ["“Nederland had de eerste trein van Europa.”","Groot-Brittannië en België waren eerder. In België reed de eerste trein al in 1835, tussen Brussel en Mechelen."],
  ["“De locomotief De Arend staat nog in het museum.”","Van het originele materieel is niets bewaard gebleven. In het Spoorwegmuseum in Utrecht staat een replica die in 1938 werd gebouwd voor het honderdjarig bestaan van de spoorwegen."]
 ],
 hoeWeten: [
  "De archieven van de Hollandsche IJzeren Spoorweg-Maatschappij, met bouwtekeningen en dienstregelingen, zijn bewaard. Kranten berichtten over de feestelijke eerste rit. Prenten en schilderijen laten zien hoe de trein en het station eruitzagen."
 ],
 nu: [
  "Nederland heeft een van de drukste spoornetten van Europa. Het traject Amsterdam–Haarlem wordt nog steeds gebruikt. In het Spoorwegmuseum in Utrecht kun je de replica van De Arend zien en meer leren over de geschiedenis van de trein."
 ],
 vertellen: "De eerste rit van Amsterdam naar Haarlem op 20 september 1839 duurde ongeveer een halfuur. Langs de lijn stonden duizenden mensen te kijken. Voor velen was het de eerste keer dat ze iets zo snel zagen bewegen zonder paard ervoor.",
 verbanden: [["Koning Willem I","hij stimuleerde nieuwe verbindingen"],["De eerste auto","de volgende stap in het vervoer"],["Steenkoolmijnen in Parkstad","de trein vervoerde steenkool"]],
 onderwijs: {"ka":["De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld."],"venster":"29. De eerste spoorlijn"},
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
 gevolgen: [
  "Nederlands Limburg bleef tot 1866 tegelijk Nederlandse provincie en hertogdom van de Duitse Bond, behalve de vestingsteden Maastricht en Venlo. Limburgers stuurden zelfs afgevaardigden naar het Duitse parlement in Frankfurt. Pas in 1867 werd die band verbroken.",
  "Belgisch Limburg en Nederlands Limburg groeiden daarna uit elkaar, met eigen hoofdsteden: Hasselt en Maastricht. Toch bleven familiebanden, dialecten en tradities zoals carnaval aan beide kanten van de grens bestaan."
 ],
 perspectieven: [
  "Voor Den Haag was Limburg een verre provincie die vooral strategisch belangrijk was. Veel Limburgers voelden zich in die tijd meer verbonden met België of met de Duitse buren dan met Holland. Er waren zelfs groepen die wilden dat Limburg bij België of bij Duitsland zou horen. Pas in de loop van de 19e en 20e eeuw groeide een Nederlands-Limburgs gevoel."
 ],
 misverstanden: [
  ["“Limburg hoorde altijd bij Nederland.”","Het gebied was eeuwenlang verdeeld over verschillende heren, zoals Spanje, Oostenrijk, Pruisen en het prinsbisdom Luik. Pas in 1839 ontstond het huidige Nederlands Limburg, en pas in 1867 was het volledig Nederlands."],
  ["“De grens volgt precies de Maas.”","Op veel plaatsen ligt de grens langs de Maas, maar Maastricht en een strook met onder meer Weert liggen ten westen ervan en horen toch bij Nederland."]
 ],
 hoeWeten: [
  "Het Verdrag van Londen met de grensbeschrijving en de kaarten zijn bewaard. Archieven in Maastricht en Hasselt laten zien hoe de splitsing in de praktijk werd geregeld, bijvoorbeeld voor parochies en gemeenten. Ook grenspalen uit die tijd staan op sommige plaatsen nog in het landschap."
 ],
 nu: [
  "Er zijn twee provincies Limburg, een in Nederland en een in België. In het grensgebied werken mensen, winkelen en gaan naar school aan beide kanten. De Limburgse dialecten worden aan beide kanten van de grens gesproken."
 ],
 vertellen: "Bij de splitsing van 1839 werden niet alleen landen, maar ook parochies en families gescheiden. Mensen die naar hun kerk of familie liepen, moesten ineens een landsgrens over, met douane en grenspalen.",
 verbanden: [["Belgische Opstand","de aanleiding voor de splitsing"],["Limburg geheel Nederlands","het einde van de band met de Duitse Bond"],["Verdrag van Maastricht","eeuwen later een Europese hoofdrol voor Limburg"]],
 onderwijs: {"ka":["De opkomst van politiek-maatschappelijke stromingen: liberalisme, nationalisme, socialisme, confessionalisme en feminisme."]},
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
 gevolgen: [
  "Thorbecke werd in 1849 minister en voerde in de jaren daarna belangrijke wetten in, zoals de Gemeentewet en de Provinciewet, die het lokale bestuur regelden. De koning bleef staatshoofd, maar de echte macht verschoof naar de ministers en het parlement.",
  "Het kiesrecht werd stap voor stap uitgebreid: in 1887 en 1896 mochten meer mannen stemmen, in 1917 alle mannen en in 1919 ook vrouwen. De vrijheid van onderwijs leidde tot de schoolstrijd, die pas in 1917 werd opgelost."
 ],
 perspectieven: [
  "Liberalen zagen de Grondwet als de vervulling van hun idealen. Conservatieven vonden dat de koning te veel macht verloor. Katholieken waren blij met de vrijheid van godsdienst, waardoor in 1853 de bisschoppen terugkwamen. Gewone arbeiders merkten er in het begin weinig van: zij mochten nog lang niet stemmen."
 ],
 misverstanden: [
  ["“In 1848 werd Nederland een democratie waarin iedereen stemde.”","Alleen mannen die genoeg belasting betaalden mochten stemmen, ongeveer één op de tien volwassen mannen. Algemeen kiesrecht kwam pas in 1917 en 1919."],
  ["“De Grondwet bestond pas sinds 1848.”","Nederland had al een grondwet sinds 1814 en 1815. In 1848 werd die grondig herzien, met ministeriële verantwoordelijkheid en een rechtstreeks gekozen Tweede Kamer."]
 ],
 hoeWeten: [
  "De tekst van de Grondwet en de verslagen van de debatten zijn bewaard. Brieven van Willem II en Thorbecke laten zien hoe snel de koning van gedachten veranderde. Kranten uit 1848 berichtten over de revoluties in Europa en over de onrust in Nederland."
 ],
 nu: [
  "De Grondwet van nu gaat nog steeds uit van de principes van 1848: de koning is onschendbaar, de ministers zijn verantwoordelijk. In 1983 werd de Grondwet opnieuw herzien en kwam er een nieuw eerste artikel tegen discriminatie. In Amsterdam staat op het Thorbeckeplein een standbeeld van Thorbecke."
 ],
 vertellen: "Koning Willem II zei later dat hij in maart 1848 “in één nacht van zeer conservatief zeer liberaal” was geworden. Uit angst voor een revolutie zoals in Parijs en Berlijn gaf hij Thorbecke de opdracht voor een nieuwe grondwet, zonder eerst zijn ministers te raadplegen.",
 verbanden: [["Koning Willem I","de koning met veel persoonlijke macht"],["Vrouwenkiesrecht","de uitbreiding van het kiesrecht"],["Koning Willem-Alexander","de rol van de koning nu"]],
 onderwijs: {"ka":["Voortschrijdende democratisering; steeds meer mannen en vrouwen nemen deel aan de politiek.","De opkomst van politiek-maatschappelijke stromingen: liberalisme, nationalisme, socialisme, confessionalisme en feminisme."],"venster":"30. De Grondwet"},
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
 gevolgen: [
  "Het boek zette het koloniale beleid op de politieke agenda. Liberalen gebruikten het om kritiek te leveren op het cultuurstelsel, dat vanaf 1870 stap voor stap werd afgeschaft. Daarna kwamen particuliere ondernemingen in de plaats, wat voor de Javaanse bevolking niet altijd beter was.",
  "Rond 1900 groeide in Nederland het idee van een “ereschuld” aan Indië, wat leidde tot de ethische politiek: meer onderwijs, irrigatie en gezondheidszorg in de kolonie. Ook voor Indonesische nationalisten werd het boek later belangrijk."
 ],
 perspectieven: [
  "Voor veel Nederlandse lezers was het boek een aanklacht tegen misbruik. Critici wijzen erop dat Multatuli niet tegen het kolonialisme zelf was, maar tegen slecht bestuur: hij wilde een eerlijker koloniaal gezag. In Indonesië wordt het boek veel gelezen, en de Indonesische schrijver Pramoedya Ananta Toer noemde het “het boek dat het kolonialisme doodde”."
 ],
 misverstanden: [
  ["“Het boek schafte het cultuurstelsel af.”","Het boek maakte veel los, maar het cultuurstelsel werd pas vanaf 1870 afgebouwd, ook om economische redenen en onder druk van liberalen die vrij ondernemerschap wilden."],
  ["“Max Havelaar is een waargebeurd verhaal.”","Het boek is gebaseerd op Douwes Dekkers eigen ervaringen in Lebak, maar het is een roman, met verzonnen personages zoals Droogstoppel en Saïdjah en Adinda."]
 ],
 hoeWeten: [
  "Het handschrift van Douwes Dekker en de aangepaste uitgave van Van Lennep zijn bewaard, zodat te zien is wat er veranderd is. Ook de ambtelijke stukken over het conflict in Lebak liggen in archieven. Historici hebben die vergeleken met het boek."
 ],
 nu: [
  "Het boek is in meer dan veertig talen verschenen. Het keurmerk voor eerlijke handel, opgericht in 1988, heette naar het boek “Max Havelaar”; sinds 2021 heet het Fairtrade Nederland. In Amsterdam is het Multatuli Museum, in het huis waar hij geboren werd."
 ],
 vertellen: "Het boek begint niet met het verhaal over Java, maar met de saaie Amsterdamse koffiemakelaar Batavus Droogstoppel, die vindt dat romans leugens zijn. Multatuli maakte zo van de lezer een getuige: wie het boek uitleest, kan niet meer zeggen dat hij het niet wist.",
 verbanden: [["VOC","het begin van de koloniale handel"],["Koning Willem I","hij voerde het cultuurstelsel in"],["Indonesië","de latere onafhankelijkheidsstrijd"],["Afschaffing van de slavernij","nog een kritiek op koloniale uitbuiting"]],
 onderwijs: {"ka":["Het modern imperialisme dat verband hield met de industrialisatie."],"venster":"31. Max Havelaar"},
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
 gevolgen: [
  "Na 1873 vertrokken veel vrijgemaakten van de plantages naar Paramaribo of trokken naar het binnenland. Om toch arbeiders te hebben, haalde Nederland contractarbeiders naar Suriname: vanaf 1873 uit Brits-Indië, de voorouders van de Hindoestaanse Surinamers, en vanaf 1890 uit Java. Zo werd Suriname het veelkleurige land dat het nu is.",
  "De gevolgen van eeuwen slavernij werkten lang door, in armoede, achterstelling en racisme. Daarover wordt in Nederland pas de laatste decennia breed gesproken. In 2002 werd in het Oosterpark in Amsterdam het Nationaal Monument Slavernijverleden onthuld."
 ],
 perspectieven: [
  "Lang werd de afschaffing in Nederland verteld als een daad van Nederlandse beschaving. Historici en nazaten wijzen erop dat de slavernij hier later werd afgeschaft dan in veel andere landen, dat de eigenaren werden betaald en de vrijgemaakten niets kregen, en dat tot slaaf gemaakten zich zelf altijd hebben verzet: door te vluchten, opstanden en dagelijks verzet. De Marrons in Suriname stichtten zelfs eigen gemeenschappen in het binnenland."
 ],
 misverstanden: [
  ["“Nederlandse slavernij bestond alleen in Suriname en op de Antillen.”","Ook in Azië en Zuid-Afrika, in de gebieden van de VOC, werden mensen tot slaaf gemaakt. Daar werden zelfs meer mensen verhandeld dan in de gebieden van de WIC."],
  ["“Op 1 juli 1863 waren alle tot slaaf gemaakten vrij.”","Formeel wel, maar in Suriname moesten ze nog tien jaar onder staatstoezicht verplicht doorwerken, vaak op dezelfde plantage. Daarom wordt ook 1873 genoemd als het echte einde."]
 ],
 hoeWeten: [
  "Er zijn plantage-archieven, slavenregisters en de stukken van de WIC en de overheid. Daarin staan de tot slaaf gemaakten vaak alleen als bezit vermeld. Hun eigen stem is moeilijker te vinden, maar komt naar voren in rechtszaken, verhalen die mondeling zijn doorgegeven en de geschiedenis van de Marrons. De registers van 1863 zijn online te doorzoeken."
 ],
 nu: [
  "Op 1 juli wordt Keti Koti gevierd en herdacht, met een nationale herdenking in Amsterdam. In december 2022 bood premier Rutte excuses aan namens de regering, en op 1 juli 2023 deed koning Willem-Alexander dat ook. Steeds meer musea, steden en bedrijven onderzoeken hun eigen betrokkenheid bij het slavernijverleden."
 ],
 vertellen: "Bij de afschaffing in 1863 kregen de eigenaren van de plantages een vergoeding van de Nederlandse staat voor ieder vrijgemaakt mens. De vrijgemaakten zelf kregen niets, en moesten nog tien jaar verplicht doorwerken.",
 verbanden: [["Slavernij","de geschiedenis die voorafging"],["Anton de Kom","hij schreef de geschiedenis vanuit de tot slaaf gemaakten"],["Suriname onafhankelijk","de latere geschiedenis van Suriname"],["Max Havelaar","nog een aanklacht tegen koloniale uitbuiting"]],
 onderwijs: {"ka":["Uitbouw van de Europese overheersing, met name in de vorm van plantagekoloniën en de daarmee verbonden trans-Atlantische slavenhandel, en de opkomst van het abolitionisme. (tijdvak 7)","Het modern imperialisme dat verband hield met de industrialisatie."],"venster":"23. Slavernij"},
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
 gevolgen: [
  "Vanaf 1867 was Limburg een gewone Nederlandse provincie. De provincie werd stap voor stap sterker aan de rest van het land verbonden, onder meer door spoorlijnen, zoals de lijn van Maastricht naar het noorden, en later door de mijnen, die werkers uit heel Nederland aantrokken.",
  "De Luxemburgse kwestie liet zien dat het Nederlandse koningshuis ook buitenlandse bezittingen had die tot conflicten konden leiden. Toen Willem III in 1890 overleed zonder zoon, ging Luxemburg naar een andere tak van de familie Nassau, omdat daar alleen mannen de troon mochten erven."
 ],
 perspectieven: [
  "In Den Haag zag men Limburg vaak als een verre, katholieke provincie die anders was dan Holland. Veel Limburgers voelden zich op hun beurt niet altijd begrepen door het noorden. Dat gevoel van “wij hier beneden” en “zij daar boven” is in Limburg nog steeds herkenbaar, al voelen Limburgers zich ook volop Nederlander."
 ],
 misverstanden: [
  ["“Limburg was tot 1867 een Duitse provincie.”","Limburg was ook vóór 1867 een Nederlandse provincie. Het was daarnaast als hertogdom lid van de Duitse Bond, een los samenwerkingsverband van Duitse staten. Maastricht en Venlo vielen daar overigens buiten."],
  ["“De gouverneur van Limburg heeft meer macht dan andere commissarissen.”","De titel gouverneur is een herinnering aan de geschiedenis, maar de functie is gelijk aan die van de commissaris van de Koning in andere provincies."]
 ],
 hoeWeten: [
  "De tekst van het Verdrag van Londen van 1867 en de diplomatieke correspondentie over de Luxemburgse kwestie zijn bewaard. Ook de verslagen van het Nederlandse parlement laten zien hoe er toen over Limburg en Luxemburg werd gedacht. Kranten uit Maastricht en Den Haag tonen de verschillende standpunten."
 ],
 nu: [
  "De commissaris van de Koning in Limburg heet nog steeds gouverneur. Limburg heeft een eigen volkslied, een eigen vlag en een sterke eigen identiteit, met carnaval, schutterijen en het Limburgs, dat als streektaal erkend is."
 ],
 vertellen: "In 1867 wilde koning Willem III het groothertogdom Luxemburg verkopen aan de Franse keizer Napoleon III. Pruisen was woedend, en er dreigde een oorlog. Op een conferentie in Londen werd de kwestie opgelost, en terloops werd daar ook geregeld dat Limburg voortaan helemaal bij Nederland hoorde.",
 verbanden: [["Limburg gesplitst","het begin van Nederlands Limburg"],["Steenkoolmijnen in Parkstad","de mijnen verbonden Limburg met de rest van het land"],["Het Congres van Wenen","waar Luxemburg aan de Oranjes werd gegeven"]],
 onderwijs: {"ka":["De opkomst van politiek-maatschappelijke stromingen: liberalisme, nationalisme, socialisme, confessionalisme en feminisme."]},
 cijfers: [['Lid van de Duitse Bond','1839 – 1866'],['Einde Duitse Bond','1866'],['Verdrag van Londen','11 mei 1867'],['Titel commissaris','gouverneur']],
 figuren: [['Koning Willem III','koning der Nederlanden en groothertog van Luxemburg'],['Napoleon III','Franse keizer, wilde Luxemburg kopen'],['Otto von Bismarck','Pruisisch minister-president']],
 bronnen: [['Wikipedia: Hertogdom Limburg',W('Hertogdom Limburg 1839-1867')],['Wikipedia: Verdrag van Londen 1867',W('Verdrag van Londen 1867')]]
},

'De telefoon': {
 aanloop: [
  'Rond 1870 kon je al berichten over draden versturen met de telegraaf, maar alleen in morsecode: stipjes en streepjes. Uitvinders probeerden daarom stemmen door een draad te sturen.',
  'Alexander Graham Bell, geboren in Edinburgh, werkte in de Verenigde Staten. Hij onderzocht geluid en werkte samen met zijn assistent Thomas Watson.'
 ],
 verloop: [
  'Op 14 februari 1876 diende Bell zijn octrooiaanvraag voor de telefoon in. Het octrooi werd op 7 maart toegekend. Drie dagen later sprak hij de beroemde woorden tegen zijn assistent in een andere kamer: “Mr. Watson, come here.” Watson kwam direct.',
  'Het telegraafbedrijf Western Union wilde de uitvinding niet kopen. Daarom richtte Bell in 1877 samen met zijn financier Hubbard zelf de Bell Telephone Company op. Die groeide uit tot een van de grootste bedrijven ter wereld.',
  'In Nederland nam het telefoneren snel toe. In 1915 waren er 75.000 abonnees. In 1925 kwam in Haarlem de eerste automatische centrale: je kon zelf een nummer kiezen. In 1962 was heel Nederland geautomatiseerd, als tweede land ter wereld na Zwitserland.'
 ],
 perspectieven: [
  'Bell wordt vaak genoemd als uitvinder van de telefoon, maar het was een gedeelde uitvinding. Ook Antonio Meucci, Elisha Gray en Philipp Reis leverden een bijdrage. Over wie het octrooi toekwam, volgden jarenlang rechtszaken.'
 ],
 gevolgen: [
  "De telefoon veranderde het zakenleven: handelaren, banken en kranten konden direct met elkaar praten in plaats van brieven of telegrammen te sturen. Later kwamen er telefooncellen op straat en kregen steeds meer gezinnen een eigen toestel.",
  "Telefonistes, bijna allemaal jonge vrouwen, verbonden gesprekken met de hand in de telefooncentrales. Het was een van de eerste kantoorberoepen voor vrouwen. Met de automatische centrales verdween dat werk weer."
 ],
 misverstanden: [
  ["“Bell vond de telefoon in zijn eentje uit.”","Meerdere uitvinders werkten tegelijk aan het idee. Elisha Gray diende op dezelfde dag als Bell een aanvraag in, en Antonio Meucci en Philipp Reis hadden eerder vergelijkbare toestellen gemaakt. Bell kreeg het octrooi."],
  ["“De eerste telefoons hadden een kiesschijf.”","Bij de eerste telefoons kon je geen nummer kiezen. Je draaide aan een slinger of nam de hoorn op, en een telefoniste in de centrale verbond je met de persoon die je wilde spreken."]
 ],
 hoeWeten: [
  "De octrooiaanvragen, de notitieboekjes van Bell en de verslagen van de rechtszaken zijn bewaard. Ook de reclame en telefoonboeken van vroeger laten zien hoe de telefoon zich verspreidde. Oude toestellen en centrales staan in musea."
 ],
 nu: [
  "Bijna iedereen heeft een smartphone, die veel meer kan dan bellen: het is ook camera, computer en kaart in één. Vaste telefoonlijnen worden steeds minder gebruikt. Het internet ging in de beginjaren via de telefoonlijn."
 ],
 vertellen: "De eerste woorden die Bell door de telefoon sprak, waren geen plechtige zin, maar een verzoek: “Mr. Watson, come here, I want to see you.” Volgens het verhaal had hij net zuur op zijn kleding gemorst.",
 verbanden: [["De gloeilamp","nog een uitvinding van elektriciteit"],["Internet en het world wide web","de opvolger van de telefoonlijn"],["De televisie","nog een manier om op afstand te communiceren"]],
 onderwijs: {"ka":["De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld."]},
 cijfers: [['Octrooiaanvraag','14 februari 1876'],['Eerste woorden','10 maart 1876'],['Bell Telephone Company','1877'],['Automatisch in Nederland','vanaf 1925, Haarlem']],
 figuren: [['Alexander Graham Bell','Schots-Amerikaans uitvinder'],['Thomas Watson','Bells assistent, hoorde de eerste woorden'],['Antonio Meucci','werkte ook aan een telefoon']],
 bronnen: [['Wikipedia: Alexander Graham Bell',W('Alexander Graham Bell')],['Wikipedia: Telefonie',W('Telefonie')]]
},

'De gloeilamp': {
 aanloop: [
  'Vóór de gloeilamp verlichtten mensen hun huizen met kaarsen, olielampen en gaslicht. Er bestonden al booglampen die heel veel licht gaven, maar die waren niet geschikt voor in een kamer.',
  'Meerdere uitvinders werkten aan een lamp met een gloeidraad: een draad die door elektriciteit zo heet wordt dat hij licht geeft. Henry Woodward en Mathew Evans uit Canada kregen daarvoor in 1874 octrooi. Ook de Brit Joseph Swan en de Rus Alexander Lodygin werkten eraan.'
 ],
 verloop: [
  'Thomas Edison en zijn medewerkers in de Verenigde Staten maakten er een lamp van die echt bruikbaar was. In oktober 1879 brandde hun lamp met een verkoolde katoendraad ruim veertien uur. Ze ontwikkelden ook een heel systeem voor elektrisch licht, zodat mensen het daadwerkelijk konden gebruiken.',
  'In Nederland begonnen in 1891 Frederik Philips en zijn zoon Gerard Philips in Eindhoven een fabriek voor gloeilampen, in een leegstaande fabriek. Gerard had de kooldraad ontwikkeld, nadat hij in Engeland had gezien hoe je die maakte. In 1895 kwam zijn jongere broer Anton in het bedrijf, die de verkoop opzette.',
  'Philips groeide uit tot een wereldwijd bekend bedrijf. De oudste fabriek in Eindhoven is nu een museum.'
 ],
 perspectieven: [
  'Edison wordt vaak “de uitvinder van de gloeilamp” genoemd, maar hij bouwde voort op het werk van anderen. Zijn verdienste was dat hij een lamp en een systeem maakte dat in de praktijk werkte.'
 ],
 gevolgen: [
  "Met elektrisch licht werd de nacht korter. Fabrieken konden langer doorwerken, straten werden veiliger en mensen konden ’s avonds lezen zonder roet en brandgevaar van olie- en gaslampen. Om lampen te laten branden, werden elektriciteitscentrales en stroomnetten aangelegd.",
  "Philips groeide van een kleine gloeilampenfabriek uit tot een wereldwijd bedrijf dat ook radio’s, televisies en medische apparatuur maakte. Eindhoven groeide mee: van een klein stadje tot een grote stad met duizenden werknemers en een eigen voetbalclub, PSV."
 ],
 misverstanden: [
  ["“Edison heeft de gloeilamp in zijn eentje uitgevonden.”","Edison bouwde voort op het werk van anderen, zoals Joseph Swan in Engeland. Zijn bijdrage was dat hij een lamp maakte die lang genoeg brandde, en een heel systeem om elektriciteit naar huizen te brengen."],
  ["“Philips was vanaf het begin een groot bedrijf.”","Philips begon in 1891 in een leegstaande fabriek in Eindhoven en had het de eerste jaren moeilijk. Pas toen Anton Philips de verkoop ging doen, groeide het bedrijf snel."]
 ],
 hoeWeten: [
  "De notitieboekjes van Edison en zijn medewerkers zijn bewaard, net als de octrooien van de verschillende uitvinders. Het archief van Philips laat zien hoe het bedrijf begon. In het Philips Museum in Eindhoven staan oude lampen en machines."
 ],
 nu: [
  "De klassieke gloeilamp is in Europa grotendeels verdwenen, omdat hij veel energie verspilt. In de plaats kwamen spaarlampen en led-lampen. In Eindhoven herinneren de Lichttoren en het jaarlijkse lichtfestival GLOW aan de lichtstad."
 ],
 vertellen: "Edison en zijn medewerkers probeerden duizenden materialen uit voor de gloeidraad, van katoen tot bamboe. Edison zou gezegd hebben: “Ik heb niet gefaald. Ik heb alleen tienduizend manieren gevonden die niet werken.”",
 verbanden: [["De telefoon","nog een elektrische uitvinding"],["De televisie","Philips maakte later ook televisies"],["Aardgas in Slochteren","energie voor het moderne huishouden"]],
 onderwijs: {"ka":["De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld."]},
 cijfers: [['Woodward en Evans','octrooi in 1874'],['Edison','oktober 1879, ruim 14 uur'],['Philips opgericht','1891, Eindhoven'],['Anton Philips','in het bedrijf vanaf 1895']],
 figuren: [['Thomas Edison','bracht de gloeilamp op de markt'],['Joseph Swan','Britse uitvinder van een kooldraadlamp'],['Gerard Philips','richtte met zijn vader Philips op']],
 bronnen: [['Wikipedia: Gloeilamp',W('Gloeilamp')],['Wikipedia: Philips',W('Koninklijke Philips')]]
},

'De eerste auto': {
 aanloop: [
  'Vóór de auto reisden mensen te voet, te paard of met de koets. Na de stoommachine probeerden uitvinders ook voertuigen met een eigen motor te maken. Nodig was een motor die licht genoeg was en op benzine werkte.',
  'Carl Benz uit Mannheim werkte aan een motorwagen met een viertaktmotor.'
 ],
 verloop: [
  'Op 29 januari 1886 kreeg Benz octrooi op zijn uitvinding: de Benz Patent-Motorwagen, een driewielig voertuig met een benzinemotor. In de zomer van 1886 reed hij ermee door Mannheim. Het wordt gezien als de eerste echte auto.',
  'Op 5 augustus 1888 maakte Bertha Benz, de vrouw van Carl, de eerste lange rit met een auto, van Mannheim naar Pforzheim.',
  'In Nederland begonnen de smeden Hendrik-Jan en Jacobus Spijker in 1880 in Hilversum een rijtuigenfabriek, die in 1886 naar Amsterdam verhuisde. Ze bouwden onder meer de Gouden Koets, een geschenk aan koningin Wilhelmina (1897–1898). In 1898 kochten ze een auto van Benz en een jaar later mochten ze die in licentie bouwen. Zo ontstond het Nederlandse automerk Spyker, dat tot 1925 auto’s maakte.'
 ],
 gevolgen: [
  "In het begin was de auto een speeltje voor rijke mensen. Met de lopende band van Henry Ford in de Verenigde Staten, vanaf 1913, werd hij veel goedkoper. Vanaf de jaren zestig kregen ook in Nederland steeds meer gezinnen een auto.",
  "De auto veranderde steden en landschap. Er kwamen geasfalteerde wegen, verkeersregels, rijbewijzen, benzinestations en later snelwegen. Tegelijk bracht de auto verkeersongelukken, files en luchtvervuiling."
 ],
 perspectieven: [
  "Voor de eerste automobilisten was de auto een avontuur en een teken van vooruitgang. Voetgangers, fietsers en mensen met paard en wagen ervoeren de snelle, lawaaiige voertuigen als gevaarlijk. In de jaren zeventig kwamen in Nederland acties, zoals “Stop de Kindermoord”, tegen de vele verkeersdoden onder kinderen."
 ],
 misverstanden: [
  ["“Henry Ford heeft de auto uitgevonden.”","Carl Benz bouwde de eerste echte auto met een benzinemotor in 1886. Ford maakte de auto later goedkoop door massaproductie met de lopende band."],
  ["“De eerste auto had vier wielen.”","De Benz Patent-Motorwagen had drie wielen: één voorwiel en twee achterwielen."]
 ],
 hoeWeten: [
  "Het octrooi van Benz en zijn bouwtekeningen zijn bewaard. In het Mercedes-Benz Museum in Stuttgart staat een replica van de eerste auto. Kranten berichtten over de rit van Bertha Benz. In het Louwman Museum in Den Haag staan oude auto’s, ook van Spyker."
 ],
 nu: [
  "Er rijden in Nederland miljoenen auto’s. Steeds meer daarvan zijn elektrisch, waarmee de auto weer terugkeert naar een idee uit het begin: rond 1900 reden er ook al elektrische auto’s. Het logo van Spyker, een propeller in een spaakwiel, bestaat nog steeds."
 ],
 vertellen: "In 1888 nam Bertha Benz, zonder het haar man te vertellen, met haar twee zonen de auto mee voor een tocht van ruim honderd kilometer naar haar moeder. Onderweg kocht ze benzine bij een apotheek en repareerde ze zelf het voertuig. Zo bewees ze dat de auto echt bruikbaar was.",
 verbanden: [["De eerste spoorlijn","het vorige grote vervoermiddel"],["Het eerste vliegtuig","de motor bracht ook vliegen dichterbij"],["Aardgas in Slochteren","energie en brandstof in de 20e eeuw"]],
 onderwijs: {"ka":["De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld."]},
 cijfers: [['Benz-octrooi','29 januari 1886'],['Eerste lange rit','5 augustus 1888'],['Spijker in Amsterdam','vanaf 1886'],['Spyker-auto’s','1898 – 1925']],
 figuren: [['Carl Benz','bouwde de Motorwagen'],['Bertha Benz','maakte de eerste lange autorit'],['Jacobus en Hendrik-Jan Spijker','bouwden Spyker-auto’s in Amsterdam']],
 bronnen: [['Wikipedia: Carl Benz',W('Carl Benz')],['Wikipedia: Spyker',W('Spyker automerk')]]
},

'Wolfgang Amadeus Mozart': {
 aanloop: [
  'Mozart werd op 27 januari 1756 geboren in Salzburg, als zevende en laatste kind van Leopold en Anna Maria Mozart. Alleen zijn zus Nannerl bleef in leven; de andere vijf kinderen overleden jong.',
  'Zijn vader was componist en violist en leerde hem muziek.'
 ],
 verloop: [
  'Mozart schreef in vrijwel elke muziekvorm van zijn tijd, vooral opera’s, symfonieën, pianoconcerten en kamermuziek. Later woonde hij vooral in Wenen.',
  'Hij overleed op 5 december 1791 in Wenen, op 35-jarige leeftijd. Zijn muziek wordt nog steeds over de hele wereld gespeeld.'
 ],
 cijfers: [['Geboren','27 januari 1756, Salzburg'],['Soorten muziek','opera, symfonie, pianoconcert'],['Leeftijd','35 jaar'],['Overleden','5 december 1791, Wenen']],
 figuren: [['Wolfgang Amadeus Mozart','componist en pianist'],['Leopold Mozart','zijn vader, componist en violist'],['Nannerl Mozart','zijn zus']],
 bronnen: [['Wikipedia: Wolfgang Amadeus Mozart',W('Wolfgang Amadeus Mozart')]]
},

'Het Louvre': {
 aanloop: [
  'Het Louvre begon als middeleeuws kasteel, in 1190 gebouwd door koning Filips II. Later maakte koning Karel V het tot zijn paleis. In 1528 werd de oude donjon afgebroken om het in renaissancestijl te herbouwen.',
  'In de 17e eeuw besloot koning Lodewijk XIV zijn residentie naar het Paleis van Versailles te verplaatsen. Het Louvre werd daardoor steeds minder een woonplaats voor de koning.'
 ],
 verloop: [
  'Tijdens de Franse Revolutie was er geen koning meer. De nieuwe machthebbers zagen in dat de nationale kunstcollectie beschermd moest worden tegen de verwoestingen van de revolutie. Op 10 augustus 1793 werd het Louvre geopend als museum, een van de oudste ter wereld.',
  'Onder Napoleon heette het Musée Napoléon. Dominique Vivant Denon was de eerste directeur; een van de vleugels draagt nog zijn naam.',
  'In 1989 kwam er een glazen piramide bij als ingang, ontworpen door de architect I.M. Pei. In het museum hangt onder andere de Mona Lisa.'
 ],
 cijfers: [['Eerste kasteel','1190, Filips II'],['Geopend als museum','10 augustus 1793'],['Naam onder Napoleon','Musée Napoléon'],['Glazen piramide','1989']],
 figuren: [['Filips II','bouwde het eerste kasteel'],['Dominique Vivant Denon','eerste directeur onder Napoleon'],['Lodewijk XIV','verhuisde naar Versailles']],
 bronnen: [['Wikipedia: Louvre',W('Louvre')]]
},

'Het Rijksmuseum': {
 aanloop: [
  'De kunstverzameling van de stadhouders vormde de basis van het museum. Na hun val werd die verzameling nationaal bezit.',
  "In 1795 vielen Franse troepen het land binnen en vluchtte stadhouder Willem V naar Engeland. De nieuwe Bataafse Republiek wilde laten zien dat kunst en geschiedenis van het hele volk waren, niet van een vorst. Naar Frans voorbeeld, waar het Louvre in 1793 voor publiek was opengegaan, kwam er een nationaal museum."
 ],
 verloop: [
  'Op 31 mei 1800 opende de Nationale Konst-Gallery haar deuren in het Huis ten Bosch bij Den Haag. In 1806 kreeg het de naam Koninklijk Museum, toen Lodewijk Napoleon koning van Holland werd.',
  'In 1808 verhuisde het museum naar Amsterdam, naar het Paleis op de Dam. Daar kwam ook De Nachtwacht te hangen.',
  'In 1885 was het huidige gebouw klaar, ontworpen door Pierre Cuypers. Tussen 2003 en 2013 werd het gerestaureerd en verbouwd. In het museum hangen onder meer De Nachtwacht van Rembrandt, Het melkmeisje van Vermeer en De vrolijke drinker van Frans Hals.'
 ],
 gevolgen: [
  "Het museum werd een plek waar het verhaal van Nederland werd verteld, vooral dat van de Gouden Eeuw. Het gebouw van Pierre Cuypers uit 1885 was zelf een uiting van trots op het verleden, met afbeeldingen van Nederlandse kunstenaars en helden op de gevels.",
  "Tussen 2003 en 2013 was het hoofdgebouw gesloten voor een grote verbouwing van 375 miljoen euro. In die tijd waren de topstukken te zien in de Philipsvleugel. Op 13 april 2013 heropende koningin Beatrix het museum."
 ],
 perspectieven: [
  "Niet iedereen was blij met het gebouw van Cuypers. Protestanten vonden het met zijn torens en gotische vormen te veel op een katholieke kerk lijken. Tegenwoordig kijkt het museum ook kritisch naar zijn eigen verhaal: in tentoonstellingen over slavernij en koloniale geschiedenis komen ook de schaduwkanten van de Gouden Eeuw aan bod."
 ],
 misverstanden: [
  ["“Het Rijksmuseum begon in Amsterdam.”","Het eerste nationale museum opende in 1800 in Huis ten Bosch bij Den Haag. Pas in 1808 verhuisde het naar Amsterdam, en pas in 1885 naar het huidige gebouw."],
  ["“Het Rijksmuseum heeft alleen schilderijen.”","Het museum heeft ook beelden, meubels, poppenhuizen, wapens, scheepsmodellen, kostuums en foto’s: in totaal honderdduizenden voorwerpen, waarvan maar een klein deel tegelijk te zien is."]
 ],
 hoeWeten: [
  "De archieven van het museum, met aankopen, inventarissen en bouwtekeningen, zijn bewaard. Oude catalogi laten zien welke werken er hingen. Ook kranten en prenten uit 1800 en 1885 tonen hoe het publiek op het museum reageerde."
 ],
 nu: [
  "Het Rijksmuseum is een van de bekendste musea ter wereld en trekt miljoenen bezoekers per jaar. Via Rijksstudio zijn honderdduizenden werken gratis online te bekijken en te downloaden, handig voor in de les. Onder het gebouw loopt een fietstunnel, die na de verbouwing open bleef."
 ],
 vertellen: "Dwars onder het Rijksmuseum loopt een tunnel waar fietsers doorheen rijden. Bij de grote verbouwing wilden de architecten er een entreehal van maken, maar Amsterdamse fietsers voerden jarenlang actie, en kregen hun zin: de fietstunnel bleef.",
 verbanden: [["Rembrandt van Rijn","zijn Nachtwacht is het bekendste schilderij van het museum"],["Lodewijk Napoleon koning","hij bracht het museum naar Amsterdam"],["Het Concertgebouw","nog een groot gebouw aan het Museumplein"]],
 onderwijs: {},
 cijfers: [['Geopend','31 mei 1800, bij Den Haag'],['Naar Amsterdam','1808'],['Huidig gebouw','1885, Pierre Cuypers'],['Verbouwd','2003 – 2013']],
 figuren: [['Pierre Cuypers','architect van het gebouw'],['Lodewijk Napoleon','liet het museum naar Amsterdam verhuizen'],['Rembrandt','schilder van De Nachtwacht']],
 bronnen: [['Wikipedia: Rijksmuseum Amsterdam',W('Rijksmuseum Amsterdam')],['Rijksmuseum','https://www.rijksmuseum.nl/']]
},

'Ludwig van Beethoven': {
 aanloop: [
  'Beethoven werd in december 1770 geboren in Bonn. Zijn vader was hofzanger. Zijn grootvader Lodewijck van Beethoven kwam uit Mechelen, in het huidige België, en vestigde zich in Bonn. De naam “van Beethoven” wijst op die Zuid-Nederlandse afkomst.',
  'Als jongen kreeg hij les van hoforganist Christian Gottlob Neefe, die hem kennis liet maken met de muziek van Bach, Haydn en Mozart.'
 ],
 verloop: [
  'Beethoven vestigde zich in 1792 in Wenen. In zijn eerste periode lijkt zijn muziek op die van Mozart en Haydn. Later werd ze persoonlijker en krachtiger. Hij maakte het classicisme af en leidde de romantiek in.',
  'Beethoven werd steeds slechter horend en uiteindelijk doof. Toch bleef hij componeren. Zijn Negende Symfonie, met het koor “Ode aan de vreugde”, klonk in 1824 voor het eerst in Wenen. De melodie is nu het Europese volkslied.',
  'Beethoven overleed op 26 maart 1827 in Wenen. Bij de opening van het Concertgebouw in 1888 werd ook muziek van hem gespeeld.'
 ],
 gevolgen: [
  "Beethoven veranderde wat een componist kon zijn. Hij was niet langer een dienaar van een vorst of de kerk, maar een kunstenaar die zijn eigen gevoelens uitdrukte. Hij werd een voorbeeld voor latere componisten in de romantiek, zoals Schubert, Brahms en Wagner.",
  "Zijn symfonieën werden de basis van het concertleven in de 19e eeuw. Nieuwe concertzalen, zoals het Concertgebouw in Amsterdam, werden gebouwd voor orkesten die dit soort muziek speelden."
 ],
 perspectieven: [
  "Tijdgenoten vonden zijn latere muziek soms te vreemd en te heftig. Pas later werd ze als meesterwerk gezien. In de 19e eeuw groeide het beeld van Beethoven als eenzaam en worstelend genie; historici laten zien dat hij ook gewoon een beroepsmusicus was met uitgevers, leerlingen en geldzorgen."
 ],
 misverstanden: [
  ["“Beethoven was zijn hele leven doof.”","Hij werd rond zijn dertigste steeds slechter horend en was in zijn laatste levensjaren vrijwel doof. Veel van zijn bekendste werken schreef hij toen hij nog redelijk kon horen."],
  ["“Beethoven was een Nederlander.”","Beethoven werd in Bonn geboren en woonde het grootste deel van zijn leven in Wenen. Zijn grootvader kwam wel uit Mechelen, in het huidige België, en de “van” in zijn naam wijst daarop."]
 ],
 hoeWeten: [
  "Beethoven liet duizenden pagina’s schetsen, partituren en brieven na. Omdat hij later bijna niets meer hoorde, schreven bezoekers hun vragen op in gespreksschriften, waarvan veel bewaard zijn. Ook zijn hoortoestellen, grote koperen hoorns, zijn bewaard in het Beethoven-Haus in Bonn."
 ],
 nu: [
  "De melodie van de “Ode aan de vreugde” uit de Negende Symfonie is het volkslied van de Europese Unie. Zijn Vijfde Symfonie, met het beroemde begin “ta-ta-ta-taaa”, kent bijna iedereen. Zijn muziek klinkt in reclames, films en op talloze concerten."
 ],
 vertellen: "Bij de eerste uitvoering van de Negende Symfonie in 1824 stond Beethoven op het podium. Doordat hij doof was, hoorde hij het daverende applaus na afloop niet. Een zangeres draaide hem om, zodat hij de juichende zaal kon zien.",
 verbanden: [["Napoleon Bonaparte","de Eroica-symfonie"],["Wolfgang Amadeus Mozart","zijn grote voorbeeld"],["Het Concertgebouw","zijn muziek klonk bij de opening"]],
 onderwijs: {},
 cijfers: [['Geboren','december 1770, Bonn'],['Naar Wenen','1792'],['Negende Symfonie','1824'],['Overleden','26 maart 1827, Wenen']],
 figuren: [['Ludwig van Beethoven','componist en pianist'],['Christian Gottlob Neefe','zijn eerste orgelleraar in Bonn'],['Lodewijck van Beethoven','zijn grootvader uit Mechelen']],
 bronnen: [['Wikipedia: Ludwig van Beethoven',W('Ludwig van Beethoven')]]
},

'Monet en het impressionisme': {
 aanloop: [
  'Franse schilders zoals Claude Monet wilden niet meer alleen strakke, gladde schilderijen maken. Ze gingen naar buiten en schilderden het licht van het moment: een mistige haven, een rivier, een veld.',
  "De schilders konden buiten werken dankzij een nieuwe uitvinding: verf in tubes. Daardoor hoefden ze hun verf niet meer zelf te mengen in het atelier. Ook de fotografie speelde mee: een realistisch beeld kon nu door een camera worden gemaakt, dus zochten schilders naar wat een foto niet kon laten zien, zoals licht, kleur en sfeer."
 ],
 verloop: [
  'In 1872 schilderde Monet de haven van Le Havre op een mistige dag, met heel losse verftoetsen. Het schilderij heet Impression, soleil levant (Impressie, opkomende zon). Het onderwerp wordt eerder gesuggereerd dan precies getekend.',
  'Op 15 april 1874 hing het in de eerste tentoonstelling van deze schilders, in het oude atelier van de fotograaf Nadar in Parijs. De titel gaf de stroming haar naam: impressionisme. In het begin was de naam spottend bedoeld.',
  'Het schilderij hangt sinds 1940 in het Musée Marmottan Monet in Parijs.'
 ],
 gevolgen: [
  "Het impressionisme opende de deur voor de moderne kunst. Schilders als Van Gogh, Cézanne en Gauguin bouwden erop voort en gingen nog verder in het gebruik van kleur en vorm. Daarna volgden stromingen die steeds verder van het realisme af gingen, tot aan de abstracte kunst van Mondriaan.",
  "Monet bleef zijn hele leven het licht schilderen. In zijn tuin in Giverny maakte hij tientallen schilderijen van zijn vijver met waterlelies, vaak op enorme doeken."
 ],
 perspectieven: [
  "De officiële kunstwereld van Parijs, met de jaarlijkse Salon, vond het werk van de impressionisten slordig en onaf. Een criticus noemde het spottend het werk van een scholier die voor het eerst met verf kladde. Voor de schilders zelf was het juist een bevrijding van strenge regels. Pas later werden hun werken door verzamelaars en musea gewaardeerd."
 ],
 misverstanden: [
  ["“De impressionisten werden meteen bewonderd.”","In het begin werden ze uitgelachen. De naam impressionisme komt zelfs uit een spottende recensie van criticus Louis Leroy over de tentoonstelling van 1874."],
  ["“Impressionisten schilderden snel en zonder nadenken.”","Ze werkten snel om het wisselende licht te vangen, maar dachten goed na over kleur en compositie. Monet schilderde hetzelfde onderwerp vaak tientallen keren, op verschillende momenten van de dag."]
 ],
 hoeWeten: [
  "De schilderijen zelf zijn de belangrijkste bron. Daarnaast zijn er de catalogi van de tentoonstellingen, recensies uit kranten zoals die van Louis Leroy, en de brieven van de schilders aan elkaar en aan hun handelaren. Foto’s laten zien hoe Monet buiten werkte."
 ],
 nu: [
  "Impressionistische schilderijen behoren tot de populairste kunst ter wereld en zijn onbetaalbaar geworden. De tuin van Monet in Giverny is een trekpleister. In Nederlandse musea, zoals het Rijksmuseum en het Kröller-Müller Museum, hangt ook impressionistisch werk."
 ],
 vertellen: "Monet woonde in 1871 vier maanden in Zaandam, op de vlucht voor de Frans-Duitse oorlog. Hij schilderde er molens, grachten en houten huisjes. En het schilderij dat de stroming haar naam gaf, Impression, soleil levant, werd in 1985 uit het museum gestolen. Pas in 1990 werd het teruggevonden.",
 verbanden: [["Vincent van Gogh","hij leerde in Parijs van de impressionisten"],["Eiffeltoren","het Parijs van de late 19e eeuw"],["Mondriaan en De Stijl","een latere stap in de moderne kunst"]],
 onderwijs: {},
 cijfers: [['Schilderij','Impression, soleil levant, 1872'],['Eerste tentoonstelling','15 april 1874, Parijs'],['Nu te zien in','Musée Marmottan Monet'],['Stroming','impressionisme']],
 figuren: [['Claude Monet','Franse schilder'],['Nadar','fotograaf, in zijn atelier was de eerste tentoonstelling']],
 bronnen: [['Wikipedia: Impression, soleil levant',W('Impression, soleil levant')],['Wikipedia: Claude Monet',W('Claude Monet')]]
},

'Het Concertgebouw': {
 aanloop: [
  'In 1881 richtte Jerôme Alexander Sillem met vijf anderen een commissie op om een concertzaal te bouwen in Amsterdam. In 1882 volgde de oprichting van de naamloze vennootschap die het gebouw liet bouwen.'
 ],
 verloop: [
  'Het Concertgebouw werd geopend op 11 april 1888, met een inwijdingsconcert door 120 musici en een koor van 500 personen. Er klonk muziek van Wagner, Händel, Bach en Beethoven.',
  'Het gebouw staat aan de Van Baerlestraat, tegenover het Museumplein, en heeft vier zalen: de Grote Zaal, de Kleine Zaal, de Koorzaal en de Spiegelzaal.',
  'Tijdens de Tweede Wereldoorlog werd het verboden werken van Joodse componisten als Mahler en Mendelssohn uit te voeren. De zeventien Joodse leden van het orkest, bijna een vijfde van alle musici, moesten worden ontslagen.'
 ],
 gevolgen: [
  "In 1888 werd ook het Concertgebouworkest opgericht, dat onder dirigent Willem Mengelberg uitgroeide tot een van de beste orkesten ter wereld. Componisten als Gustav Mahler en Richard Strauss kwamen zelf naar Amsterdam om hun werk te dirigeren.",
  "Het Concertgebouw maakte Amsterdam tot een muziekstad. Rond het gebouw ontstond een nieuwe, rijke wijk, met het Rijksmuseum en later het Stedelijk Museum en het Van Gogh Museum aan het Museumplein."
 ],
 perspectieven: [
  "Het Concertgebouw werd gebouwd door rijke Amsterdammers, en klassieke muziek was lang vooral voor de gegoede burgerij. Arbeiders gingen er zelden naartoe. In de 20e eeuw kwamen er goedkopere concerten, zoals de gratis lunchconcerten, om ook ander publiek te trekken."
 ],
 misverstanden: [
  ["“Het Concertgebouw is altijd van de staat geweest.”","Het Concertgebouw werd opgericht en betaald door particuliere Amsterdammers, als naamloze vennootschap. Het predicaat Koninklijk kreeg het pas later."],
  ["“Het gebouw staat stevig op de grond.”","Het staat op 2186 houten heipalen in de slappe Amsterdamse bodem. Toen die gingen rotten, moest het gebouw in de jaren tachtig met een grote operatie op nieuwe palen worden gezet."]
 ],
 hoeWeten: [
  "Het archief van het Concertgebouw bewaart bouwtekeningen, programma’s en kaartverkoop sinds 1888. Opnames van het orkest uit de 20e eeuw laten horen hoe het klonk. Verslagen in kranten beschrijven de feestelijke opening."
 ],
 nu: [
  "De Grote Zaal geldt als een van de beste concertzalen ter wereld, vanwege de akoestiek. Elk jaar zijn er honderden concerten, en bekende tradities zoals het kerstmatineeconcert worden op radio en televisie uitgezonden."
 ],
 vertellen: "Het Concertgebouw werd in 1888 aan de rand van de stad gebouwd, midden in de weilanden. Toen de eerste concerten werden gegeven, moesten bezoekers nog over modderige wegen naar het gebouw komen.",
 verbanden: [["Ludwig van Beethoven","zijn muziek klonk bij de opening"],["Het Rijksmuseum","de buurman aan het Museumplein"],["Vincent van Gogh","het Van Gogh Museum staat aan hetzelfde plein"]],
 onderwijs: {},
 cijfers: [['Commissie','1881'],['Geopend','11 april 1888'],['Concertzalen','4'],['Orkest','Koninklijk Concertgebouworkest']],
 figuren: [['Jerôme Alexander Sillem','richtte de bouwcommissie op'],['Koninklijk Concertgebouworkest','vast orkest van de zaal']],
 bronnen: [['Wikipedia: Koninklijk Concertgebouw',W('Koninklijk Concertgebouw')]]
},

'Vincent van Gogh': {
 aanloop: [
  'Vincent van Gogh werd op 30 maart 1853 geboren in Zundert in Noord-Brabant, in de pastorie. Als kind verzamelde hij insecten en liep hij graag door de natuur.',
  'In 1873 werkte hij korte tijd in Parijs en Londen, bij een kunsthandel. Pas later koos hij voor het schilderen.'
 ],
 verloop: [
  'Van Gogh schilderde in korte tijd honderden werken, met dikke verf en sterke kleuren. In 1885 maakte hij De Aardappeleters, nog donker en aards. Later, in Frankrijk, werden zijn kleuren veel helderder.',
  'In 1889 schilderde hij Sterrennacht, vanuit zijn kamer in Saint-Rémy. Hij had last van psychische problemen en werd daar behandeld.',
  'Op 29 juli 1890 overleed hij in Auvers-sur-Oise. Zijn broer Theo erfde zijn werk, daarna Theo’s weduwe Jo van Gogh-Bonger. Zij zorgde ervoor dat het werk bekend werd. Het Van Gogh Museum in Amsterdam opende op 2 juni 1973.'
 ],
 gevolgen: [
  "Na zijn dood zorgde Jo van Gogh-Bonger, de weduwe van Theo, ervoor dat zijn werk bekend werd. Ze organiseerde tentoonstellingen en gaf in 1914 zijn brieven aan Theo uit. Langzaam groeide zijn roem.",
  "Van Gogh werd een van de bekendste kunstenaars ter wereld. Zijn manier van schilderen, met felle kleuren en zichtbare penseelstreken, inspireerde later expressionisten. Helene Kröller-Müller verzamelde veel van zijn werk, dat nu in het Kröller-Müller Museum in Otterlo hangt."
 ],
 perspectieven: [
  "Er bestaat een romantisch beeld van Van Gogh als arm, miskend genie dat gek werd. Historici laten zien dat hij een bewust en hardwerkend kunstenaar was, die zich goed verdiepte in kunst en techniek. Zijn psychische problemen waren echt, maar zijn werk is niet alleen het product van “waanzin”."
 ],
 misverstanden: [
  ["“Van Gogh verkocht in zijn leven maar één schilderij.”","Dat wordt vaak gezegd, maar hij verkocht meer. Het bekendste voorbeeld is De rode wijngaard, in 1890 gekocht door Anna Boch. Ook enkele andere werken en tekeningen werden verkocht of geruild. Wel was het heel weinig."],
  ["“Van Gogh sneed zijn hele oor eraf.”","In december 1888, na een ruzie met de schilder Paul Gauguin in Arles, sneed hij een groot deel van zijn linkeroor af. Hoeveel precies, daarover zijn de bronnen het niet eens."]
 ],
 hoeWeten: [
  "Van Gogh schreef meer dan achthonderd brieven, vooral aan Theo, waarvan er honderden bewaard zijn. Ze geven een unieke blik in zijn gedachten en werk. Het Van Gogh Museum onderzoekt zijn schilderijen ook met röntgenfoto’s en verfanalyse, en vond zo soms een ander schilderij onder het zichtbare."
 ],
 nu: [
  "Het Van Gogh Museum in Amsterdam heeft de grootste verzameling van zijn werk ter wereld en trekt jaarlijks miljoenen bezoekers. In Zundert, Nuenen en Otterlo kun je zijn sporen volgen. Zijn schilderijen behoren tot de duurste ter wereld."
 ],
 vertellen: "Van Gogh schilderde in de laatste tien jaar van zijn leven meer dan achthonderd schilderijen. In zijn laatste maanden in Auvers-sur-Oise maakte hij er gemiddeld bijna één per dag.",
 verbanden: [["De Aardappeleters","zijn eerste grote werk"],["Monet en het impressionisme","zijn tijd in Parijs"],["Mondriaan en De Stijl","Mondriaan liet zich door hem inspireren"]],
 onderwijs: {"venster":"33. Vincent van Gogh"},
 cijfers: [['Geboren','30 maart 1853, Zundert'],['Verkocht bij leven','2 schilderijen'],['Overleden','29 juli 1890, Auvers-sur-Oise'],['Van Gogh Museum','geopend op 2 juni 1973']],
 figuren: [['Vincent van Gogh','schilder uit Zundert'],['Theo van Gogh','zijn broer, steunde hem'],['Jo van Gogh-Bonger','Theo’s weduwe, bewaarde het werk']],
 bronnen: [['Wikipedia: Vincent van Gogh',W('Vincent van Gogh')],['Wikipedia: Van Gogh Museum',W('Van Gogh Museum')]]
},

'Eiffeltoren': {
 aanloop: [
  'In 1889 was het honderd jaar geleden dat de Franse Revolutie begon. Parijs vierde dat met een wereldtentoonstelling, en daarvoor was een opvallend monument nodig als ingang.'
 ],
 verloop: [
  'De toren werd ontworpen door de ingenieurs Maurice Koechlin en Émile Nouguier, medewerkers van Gustave Eiffel, en werd tussen 1887 en 1889 gebouwd.',
  'Hij weegt 7300 ton (zonder fundering) en was na de bouw de hoogste toren ter wereld, ruim 300 meter. In Europa bleef hij, afgezien van televisietorens, 126 jaar lang de hoogste toren.',
  'Veel Parijzenaars vonden de toren eerst lelijk. Nu is hij het symbool van Parijs en een van de meest bezochte bezienswaardigheden van Frankrijk.'
 ],
 gevolgen: [
  "De toren was eigenlijk bedoeld om na twintig jaar weer af te breken. Hij werd gered doordat hij nuttig bleek als antenne voor de radio en het telegraafverkeer, ook voor het leger. Later kwamen er ook televisieantennes op.",
  "De Eiffeltoren liet zien wat er met ijzer en staal mogelijk was. Hij werd een voorbeeld voor latere bouwwerken in staal, zoals bruggen en wolkenkrabbers."
 ],
 perspectieven: [
  "Bij de bouw protesteerden ongeveer driehonderd bekende kunstenaars en schrijvers, onder wie Émile Zola en Guy de Maupassant, tegen de “nutteloze en monsterlijke” toren. Voor ingenieurs en het grote publiek was het juist een wonder van techniek. Inmiddels is de toren voor iedereen het symbool van Parijs."
 ],
 misverstanden: [
  ["“Gustave Eiffel heeft de toren zelf ontworpen.”","Het eerste ontwerp kwam van zijn ingenieurs Maurice Koechlin en Émile Nouguier. Eiffel kocht hun rechten, verbeterde het plan en liet de toren door zijn bedrijf bouwen."],
  ["“De toren was altijd bedoeld als blijvend monument.”","De vergunning gold in het begin voor twintig jaar. Daarna zou hij worden afgebroken, maar de radio redde hem."]
 ],
 hoeWeten: [
  "Er zijn duizenden bouwtekeningen en foto’s van de bouw, die laten zien hoe de toren stuk voor stuk werd opgebouwd. De petitie van de kunstenaars werd in een krant gepubliceerd. Ook de bezoekersaantallen sinds 1889 zijn bewaard."
 ],
 nu: [
  "De toren trekt elk jaar miljoenen bezoekers en is het meest bezochte monument ter wereld waar je een kaartje voor moet kopen. Hij wordt om de zoveel jaar opnieuw geschilderd om roest te voorkomen. ’s Avonds fonkelen er duizenden lampjes."
 ],
 vertellen: "Tijdens de wereldtentoonstelling van 1889 beklommen ongeveer twee miljoen mensen de toren. Daarna daalde de belangstelling snel: in 1899 kwamen er nog maar zo’n 150.000 bezoekers. Pas later werd de toren weer een publiekstrekker.",
 verbanden: [["De Franse Revolutie","de toren vierde honderd jaar revolutie"],["Monet en het impressionisme","het Parijs van dezelfde tijd"],["Het Concertgebouw","nog een groot bouwwerk uit 1888–1889"]],
 onderwijs: {"ka":["De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld."]},
 cijfers: [['Gebouwd','1887 – 1889'],['Gewicht','7300 ton (zonder fundering)'],['Hoogte in 1889','ruim 300 meter'],['Aanleiding','wereldtentoonstelling 1889']],
 figuren: [['Gustave Eiffel','ingenieur, naar wie de toren is genoemd'],['Maurice Koechlin','ontwierp de toren'],['Émile Nouguier','ontwierp de toren']],
 bronnen: [['Wikipedia: Eiffeltoren',W('Eiffeltoren')]]
},

'De Franse Revolutie': {
 aanloop: [
  'Frankrijk had een absolute monarchie: de koning had alle macht, naast de adel en de Kerk. Maar de staat zat diep in de schulden en belasting heffen lukte niet goed meer.',
  'In 1789 riep koning Lodewijk XVI de Staten-Generaal bijeen, in de hoop dat die een oplossing zouden vinden. Het volk verwachtte veel van die vergadering.'
 ],
 verloop: [
  'Op 9 juli 1789 noemde de vergadering zich Nationale Grondwetgevende Vergadering. Op 14 juli bestormden Parijzenaars de Bastille, een fort waar buskruit lag. Er zaten maar zeven gevangenen, maar de val van de Bastille werd het belangrijkste symbool van de revolutie.',
  'De revolutionairen schaften de absolute monarchie af en stichtten de Eerste Franse Republiek. In de plaats van het oude stelsel kwamen de beginselen vrijheid, gelijkheid en broederschap, en de vrijheid van drukpers. Maar de hervormingen leidden ook tot burgeroorlog, terreur en oorlog met andere landen.',
  'In 1799 greep generaal Napoleon Bonaparte de macht, waarmee de revolutie eindigde. Ook Nederland merkte het: in 1795 vielen Franse legers het land binnen en ontstond de Bataafse Republiek.'
 ],
 cijfers: [['Begin','1789'],['Bestorming van de Bastille','14 juli 1789'],['Leus','vrijheid, gelijkheid, broederschap'],['Einde','1799, Napoleon grijpt de macht']],
 figuren: [['Lodewijk XVI','koning van Frankrijk'],['Marie Antoinette','koningin van Frankrijk'],['Napoleon Bonaparte','generaal die in 1799 de macht greep']],
 bronnen: [['Wikipedia: Franse Revolutie',W('Franse Revolutie')]]
},

'Napoleon Bonaparte': {
 aanloop: [
  'Napoleon werd op 15 augustus 1769 geboren in Ajaccio op Corsica. Tijdens en na de Franse Revolutie werd hij generaal.',
  'In 1799 pleegde hij een staatsgreep en installeerde zichzelf als eerste consul.'
 ],
 verloop: [
  'Op 2 december 1804 liet hij zich tot keizer van de Fransen kronen. Als Napoleon I was hij keizer tot 11 april 1814. Familieleden zette hij op de troon van andere landen, zoals zijn broer Lodewijk Napoleon in het koninkrijk Holland.',
  'Zijn nieuwe burgerlijk wetboek, de Code Napoléon, had een grote en blijvende invloed op het recht in veel landen, waaronder Nederland en België.',
  'De veldtocht naar Rusland in 1812 was het keerpunt. In 1814 trad hij af en werd verbannen naar het eiland Elba. In 1815 keerde hij terug, maar werd bij Waterloo verslagen. Daarna werd hij verbannen naar het eiland Sint-Helena, waar hij op 5 mei 1821 overleed.'
 ],
 gevolgen: [
  "In Nederland bleven veel vernieuwingen uit de Franse tijd bestaan: de burgerlijke stand, vaste achternamen, het kadaster en een centraal bestuur in plaats van zelfstandige provincies. Het Nederlandse Burgerlijk Wetboek van 1838 was sterk gebaseerd op de Code Napoléon.",
  "In heel Europa verspreidde Napoleon ideeën uit de Franse Revolutie, zoals gelijkheid voor de wet. Tegelijk wekten zijn veroveringen nationalisme op in de bezette landen, zoals in Duitsland en Spanje."
 ],
 perspectieven: [
  "In Frankrijk wordt Napoleon vaak gezien als een groot staatsman en wetgever. Anderen benadrukken dat hij een dictator was die miljoenen soldaten de dood in joeg, in 1802 de slavernij in Franse koloniën herstelde en kritiek onderdrukte. In de bezette landen, zoals Nederland, voelde zijn bewind voor veel mensen als een last: belastingen, dienstplicht en een verbod op handel met Engeland."
 ],
 misverstanden: [
  ["“Napoleon was heel klein.”","Napoleon was ongeveer 1,69 meter, gewoon voor een man in zijn tijd. Het idee dat hij klein was, komt onder meer van Britse spotprenten en van verwarring tussen Franse en Engelse maten."],
  ["“Napoleon veroverde Nederland.”","Nederland werd in 1795 al door de Franse revolutionaire legers bezet, toen Napoleon nog generaal was. Hij maakte er in 1806 een koninkrijk van en lijfde het in 1810 in bij Frankrijk."]
 ],
 hoeWeten: [
  "Er zijn duizenden brieven van Napoleon en zijn generaals, decreten, kaarten en verslagen van veldslagen. Schilders als Jacques-Louis David maakten propaganda-portretten. In Nederland laten archieven van de burgerlijke stand en het kadaster zien wat er uit de Franse tijd overbleef."
 ],
 nu: [
  "Elke geboorteakte, elk huwelijk en elke achternaam in Nederland gaat terug op regels uit de Franse tijd. In veel straten zie je nog huisnummers en een kadaster dat in die periode werd voorbereid. Napoleons graf in de Dôme des Invalides in Parijs wordt nog steeds druk bezocht."
 ],
 vertellen: "Beethoven was zo onder de indruk van Napoleon dat hij zijn Derde Symfonie aan hem wilde opdragen. Toen Napoleon zich in 1804 tot keizer kroonde, kraste Beethoven woedend de naam van het titelblad, zo hard dat er een gat in het papier kwam. Het stuk heet sindsdien de Eroica.",
 verbanden: [["De Franse Revolutie","zonder revolutie geen Napoleon"],["Lodewijk Napoleon koning","zijn broer werd koning van Holland"],["Ludwig van Beethoven","de Eroica-symfonie"],["Slag bij Waterloo","zijn definitieve nederlaag"]],
 onderwijs: {"ka":["De democratische revoluties in westerse landen met als gevolg discussies over grondwetten, grondrechten en staatsburgerschap. (tijdvak 7)"],"venster":"27. Napoleon Bonaparte"},
 cijfers: [['Geboren','15 augustus 1769, Ajaccio'],['Keizer','2 december 1804 – 11 april 1814'],['Waterloo','18 juni 1815'],['Overleden','5 mei 1821, Sint-Helena']],
 figuren: [['Napoleon Bonaparte','Frans generaal en keizer'],['Lodewijk Napoleon','zijn broer, koning van Holland'],['Wellington','Britse bevelhebber bij Waterloo']],
 bronnen: [['Wikipedia: Napoleon Bonaparte',W('Napoleon Bonaparte')]]
},

'Slag bij Waterloo': {
 aanloop: [
  'In 1814 was Napoleon verbannen naar Elba, maar in maart 1815 keerde hij terug naar Frankrijk. Engeland en Pruisen trokken grote legers samen in de zuidelijke Nederlanden. Napoleon besloot ze voor te zijn en trok op 14 juni de grens over bij Charleroi.'
 ],
 verloop: [
  'Op 16 juni werd zijn linkervleugel door de Nederlanders opgehouden bij Quatre-Bras. Zijn rechtervleugel versloeg dezelfde dag de Pruisen bij Ligny. Op zondag 18 juni 1815 kwam het bij Mont-Saint-Jean, vijf kilometer ten zuiden van Waterloo, tot de beslissende slag.',
  'Napoleon werd definitief verslagen door een coalitie van Britse, Nederlandse en Hannoverse eenheden onder Wellington en een Pruisisch leger onder maarschalk Blücher. De slag is genoemd naar Waterloo, waar Wellington zijn hoofdkwartier had.',
  'Napoleon gaf zich over aan de Britten en werd naar Sint-Helena verbannen. Jan Willem Pieneman schilderde de slag in 1824 voor het Rijksmuseum, met op het doek de gewonde Prins van Oranje.'
 ],
 gevolgen: [
  "Na Waterloo werd Napoleon verbannen naar Sint-Helena en was de Franse tijd in Europa voorbij. Het Congres van Wenen kon zijn werk afronden. Er volgde in West-Europa een lange periode zonder grote oorlogen tussen de grote mogendheden.",
  "Voor het jonge Koninkrijk der Nederlanden was de slag een bron van trots. Koning Willem I liet op de plek waar zijn zoon, de Prins van Oranje, gewond was geraakt, een kunstmatige heuvel met een grote leeuw bouwen: de Leeuw van Waterloo."
 ],
 perspectieven: [
  "Britten zagen Waterloo vooral als overwinning van Wellington. In Duitsland werd de beslissende rol van het Pruisische leger van Blücher benadrukt, dat in de middag aankwam. De bijdrage van de Nederlandse en Belgische troepen werd in Britse verslagen lang onderschat; Nederlandse historici hebben dat later rechtgezet."
 ],
 misverstanden: [
  ["“De slag werd in Waterloo zelf uitgevochten.”","De gevechten vonden plaats bij Mont-Saint-Jean, een paar kilometer ten zuiden van Waterloo. De slag is genoemd naar Waterloo omdat Wellington daar zijn hoofdkwartier had."],
  ["“Wellington won de slag alleen.”","Het was een coalitieleger met Britten, Nederlanders, Belgen en Duitsers, en de komst van de Pruisen onder Blücher was beslissend."]
 ],
 hoeWeten: [
  "Er zijn rapporten van de bevelhebbers, brieven en dagboeken van soldaten, en schilderijen zoals dat van Jan Willem Pieneman. Op het slagveld zijn bij opgravingen kogels, knopen en zelfs skeletten van soldaten gevonden. Doordat getuigen elkaar soms tegenspreken, is het verloop van de slag nog steeds onderwerp van onderzoek."
 ],
 nu: [
  "De Leeuw van Waterloo staat nog op zijn heuvel van 45 meter, met een museum aan de voet. Elk jaar spelen duizenden liefhebbers in uniform de slag na. Het woord “Waterloo” betekent in veel talen een definitieve nederlaag, en ABBA won er in 1974 het Eurovisie Songfestival mee."
 ],
 vertellen: "Koning Willem I gaf al veertig dagen na de slag opdracht voor een monument. Jarenlang werd aarde aangevoerd voor een kunstmatige heuvel van 45 meter hoog, met bovenop een gietijzeren leeuw: de Leeuw van Waterloo.",
 verbanden: [["Napoleon Bonaparte","zijn laatste veldslag"],["Koning Willem I","zijn zoon vocht mee"],["Het Congres van Wenen","de vredesregeling na de oorlog"]],
 onderwijs: {},
 cijfers: [['Datum','18 juni 1815'],['Plaats','Mont-Saint-Jean, bij Waterloo (nu België)'],['Legers','Wellington en Blücher tegen Napoleon'],['Daarvoor','Quatre-Bras en Ligny op 16 juni']],
 figuren: [['Napoleon Bonaparte','Frans keizer'],['Wellington','Brits bevelhebber'],['Gebhard Leberecht von Blücher','Pruisisch maarschalk'],['Prins van Oranje','Nederlands bevelhebber, raakte gewond']],
 bronnen: [['Wikipedia: Slag bij Waterloo',W('Slag bij Waterloo')]]
},

'Het Congres van Wenen': {
 aanloop: [
  'Na de Franse Revolutie en de napoleontische oorlogen was Europa veranderd. Het Heilige Roomse Rijk was opgedeeld en Frankrijk had onder meer de Oostenrijkse Nederlanden en de Republiek geannexeerd. Napoleon had veel kleine staten samengevoegd en het plaatselijke recht vereenvoudigd.'
 ],
 verloop: [
  'Het Congres van Wenen was een reeks bijeenkomsten van ruim 200 Europese regeringsleiders, diplomaten en andere betrokkenen. Het begon in september of oktober 1814 en eindigde in juni 1815. Ze besloten over de naoorlogse grenzen, over grondwetten en over het oprichten of opheffen van staten. Het doel was vrede in Europa.',
  'Veel leiders wilden de idealen van de Franse Revolutie niet overnemen, omdat ze hun oude rechten en privileges wilden behouden.',
  'Voor Nederland betekende het dat de Noordelijke en de Zuidelijke Nederlanden samen één koninkrijk werden, onder koning Willem I. Dat bleef niet duren: in 1830 volgde de Belgische Opstand.'
 ],
 gevolgen: [
  "De grote mogendheden, Groot-Brittannië, Oostenrijk, Pruisen, Rusland en later ook Frankrijk, spraken af elkaar op de hoogte te houden en samen te overleggen. Dat “Concert van Europa” hielp om lange tijd grote oorlogen te voorkomen.",
  "Voor Nederland was de uitkomst groot: de Noordelijke en Zuidelijke Nederlanden werden één koninkrijk, als buffer tegen Frankrijk. Luxemburg werd een groothertogdom met de Nederlandse koning als groothertog. Ook kwam er een eerste internationale verklaring tegen de slavenhandel."
 ],
 perspectieven: [
  "De vorsten en diplomaten wilden rust en het herstel van de oude orde. Voor liberalen en nationalisten, die geloofden in de idealen van de Franse Revolutie, was het juist een stap terug. Volken werden verdeeld zonder dat hun iets werd gevraagd, wat later tot opstanden leidde, zoals de Belgische Opstand van 1830."
 ],
 misverstanden: [
  ["“Het congres was één grote vergadering.”","Er was bijna nooit een volledige vergadering. De belangrijkste beslissingen werden genomen in kleine kring door de grote mogendheden, en veel werd geregeld tijdens diners en bals."],
  ["“België bestond al.”","België bestond nog niet als land. Het gebied werd in 1815 bij Nederland gevoegd en werd pas na de opstand van 1830 een zelfstandige staat."]
 ],
 hoeWeten: [
  "De slotakte van het congres en de verslagen van de onderhandelingen zijn bewaard. Diplomaten en hun gasten schreven brieven en dagboeken over de onderhandelingen en de feesten. De prent van Jean-Baptiste Isabey laat de belangrijkste deelnemers zien."
 ],
 nu: [
  "De grenzen van Nederland, België en Luxemburg gaan voor een deel terug op beslissingen van dit congres. Het idee dat landen samen overleggen om oorlog te voorkomen, kwam later terug in de Volkenbond en de Verenigde Naties. Ook de Zwitserse neutraliteit werd in Wenen erkend."
 ],
 vertellen: "Omdat er in Wenen zoveel bals en feesten waren, spotte de oude prins de Ligne: “Het congres danst, maar het komt niet vooruit.” Toch werd er achter de schermen hard onderhandeld, en de afspraken bepaalden decennialang de kaart van Europa.",
 verbanden: [["Koning Willem I","hij kreeg een koninkrijk"],["Belgische Opstand","de nieuwe grenzen hielden niet stand"],["Slag bij Waterloo","Napoleon onderbrak het congres"]],
 onderwijs: {"ka":["De democratische revoluties in westerse landen met als gevolg discussies over grondwetten, grondrechten en staatsburgerschap. (tijdvak 7)"]},
 cijfers: [['Begin','september of oktober 1814'],['Einde','juni 1815'],['Deelnemers','ruim 200 regeringsleiders en diplomaten'],['Plaats','Wenen']],
 figuren: [['Klemens von Metternich','Oostenrijks minister, belangrijkste figuur van het congres'],['Willem I','werd koning van het nieuwe Koninkrijk der Nederlanden']],
 bronnen: [['Wikipedia: Congres van Wenen',W('Congres van Wenen')]]
},

'Aletta Jacobs': {
 aanloop: [
  'In de 19e eeuw hadden meisjes weinig kansen op hoger onderwijs. Universiteiten waren alleen voor jongens. Aletta Jacobs werd in 1854 geboren in Sappemeer als dochter van een arts en wilde net als haar vader dokter worden.',
  'Ze haalde in 1870 het examen voor assistent-apotheker. Daarna schreef ze een brief aan minister-president Thorbecke met de vraag of ze colleges mocht volgen aan de universiteit.'
 ],
 verloop: [
  'In 1871 kreeg ze toestemming en begon ze aan de Rijksuniversiteit Groningen. Ze werd de eerste vrouw die aan een Nederlandse universiteit een studie volledig afrondde. In 1878 werd ze de eerste vrouwelijke arts van Nederland en in 1879 promoveerde ze.',
  'In Amsterdam hield ze gratis spreekuren voor arme vrouwen en kinderen. Ze gaf voorlichting over hygiëne en anticonceptie, wat toen zeer omstreden was. In 1883 probeerde ze zich als kiezer te laten inschrijven, maar dat werd geweigerd.',
  'Van 1903 tot 1919 was ze voorzitter van de Vereeniging voor Vrouwenkiesrecht. Ze reisde de wereld rond voor de vrouwenbeweging en de vrede. Ze maakte in 1919 mee dat vrouwen kiesrecht kregen en stierf in 1929.'
 ],
 gevolgen: [
  "Na Aletta Jacobs gingen steeds meer vrouwen studeren. Rond 1900 waren vrouwelijke artsen, juristen en leraren nog uitzonderingen, maar het werd steeds gewoner. Haar voorlichting over anticonceptie, onder meer met het pessarium, gaf vrouwen meer controle over het aantal kinderen dat ze kregen.",
  "In 1915, midden in de Eerste Wereldoorlog, organiseerde ze in Den Haag een internationaal vrouwencongres voor vrede, met meer dan 1200 vrouwen uit twaalf landen. Daarna reisde ze naar de Verenigde Staten om haar voorstellen voor vrede aan president Wilson voor te leggen."
 ],
 perspectieven: [
  "Voor veel tijdgenoten was Aletta Jacobs een schandaal: een vrouw die studeerde, over voorbehoedmiddelen sprak en kiesrecht eiste. Kerken en artsen waren fel tegen haar anticonceptievoorlichting. Binnen de vrouwenbeweging zelf was er ook verschil van mening, bijvoorbeeld tussen vrouwen die vooral stemrecht wilden en vrouwen die meer nadruk legden op werk, onderwijs of het gezin."
 ],
 misverstanden: [
  ["“Aletta Jacobs was de eerste vrouw die ooit aan een Nederlandse universiteit studeerde.”","Al in de 17e eeuw volgde Anna Maria van Schurman colleges in Utrecht, verborgen achter een scherm. Aletta Jacobs was wel de eerste vrouw die een universitaire studie volledig afrondde en arts werd."],
  ["“Aletta Jacobs streed alleen voor het vrouwenkiesrecht.”","Ze zette zich in voor veel meer: gezondheidszorg voor arme vrouwen, anticonceptie, betere arbeidsomstandigheden voor winkelmeisjes en vrede tussen landen."]
 ],
 hoeWeten: [
  "Aletta Jacobs schreef haar herinneringen op en voerde een uitgebreide correspondentie, die bewaard is gebleven. Haar brief aan Thorbecke is een beroemde bron. Atria, het kennisinstituut voor emancipatie en vrouwengeschiedenis in Amsterdam, beheert veel archieven van de vrouwenbeweging."
 ],
 nu: [
  "In veel steden zijn scholen, straten en zorginstellingen naar haar genoemd. Meer dan de helft van de studenten aan Nederlandse universiteiten is nu vrouw, en de meeste nieuwe artsen zijn vrouw."
 ],
 vertellen: "Aletta Jacobs was zestien toen ze in 1870 een brief schreef aan minister-president Thorbecke, met de vraag of ze aan de universiteit mocht studeren. Thorbecke gaf haar toestemming, eerst voor een proefjaar. Ze bleek zo goed dat ze daarna gewoon verder mocht.",
 verbanden: [["Vrouwenkiesrecht","haar strijd voor het stemrecht"],["De Grondwet","het woord “mannelijke” werd na haar actie in de Grondwet gezet"],["De Eerste Wereldoorlog","het vrouwencongres voor vrede in 1915"]],
 onderwijs: {"ka":["De opkomst van emancipatiebewegingen.","De opkomst van politiek-maatschappelijke stromingen: liberalisme, nationalisme, socialisme, confessionalisme en feminisme."],"venster":"34. Aletta Jacobs"},
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
 gevolgen: [
  "In de praktijk ging kinderarbeid in fabrieken op veel plaatsen gewoon door, omdat er nauwelijks controle was. Werk op het land, in de huisindustrie en in winkels bleef bovendien toegestaan. Daardoor werkten kinderen nog jarenlang.",
  "De grootste verandering kwam met de Leerplichtwet van 1901. Daarbij werd wél streng gecontroleerd, door inspecteurs van het onderwijs. Kinderen die naar school moesten, konden niet tegelijk in de fabriek staan. Zo verdween de kinderarbeid in Nederland langzaam."
 ],
 perspectieven: [
  "Fabrikanten waarschuwden dat de wet hun bedrijven zou schaden. Veel arme ouders hadden het loon van hun kinderen hard nodig. Liberalen als Van Houten vonden dat de overheid zwakken mocht beschermen. Later in de 19e eeuw groeide ook de invloed van socialisten en confessionele partijen, die nog verdergaande sociale wetten wilden."
 ],
 misverstanden: [
  ["“Na 1874 werkten er geen kinderen meer.”","De wet verbood alleen werk in fabrieken en werkplaatsen voor kinderen onder de twaalf, en er was weinig controle. Op het land en thuis bleven kinderen werken. Pas met de leerplicht van 1901 nam kinderarbeid echt af."],
  ["“Het Kinderwetje was een wet van de regering.”","Het was een initiatiefwet: Kamerlid Samuel van Houten diende het voorstel zelf in, zonder dat de regering het had voorbereid."]
 ],
 hoeWeten: [
  "Er zijn rapporten en enquêtes uit de 19e eeuw waarin arbeiders, ook kinderen, vertelden over hun werk. De Arbeidsenquête van 1887 is een beroemde bron. Ook foto’s, kranten en de debatten in het parlement laten zien hoe het was."
 ],
 nu: [
  "In Nederland gaan alle kinderen naar school, en er gelden strenge regels voor werk van jongeren onder de achttien. Wereldwijd werken nog steeds miljoenen kinderen, onder meer in de landbouw en in mijnen. Het VN-Verdrag inzake de Rechten van het Kind beschermt kinderen tegen uitbuiting."
 ],
 vertellen: "Rond 1870 stonden in Nederlandse fabrieken kinderen van zes of zeven jaar aan de machines, soms twaalf uur per dag. Ze waren klein genoeg om onder machines te kruipen om draden te knopen of vuil weg te halen, wat levensgevaarlijk was.",
 verbanden: [["Marga Klompé","een latere sociale wet: de bijstand"],["De eerste spoorlijn","de industrialisatie van Nederland"],["Aletta Jacobs","ook zij streed voor betere omstandigheden"]],
 onderwijs: {"ka":["Discussies over de ‘sociale kwestie’.","De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld."],"venster":"32. Het Kinderwetje van Van Houten"},
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
 gevolgen: [
  "Van Gogh zag De Aardappeleters als zijn eerste echte meesterwerk, maar de reacties vielen tegen. Zijn vriend en collega-schilder Anthon van Rappard schreef hem een harde brief met kritiek op de figuren. Hun vriendschap ging daardoor kapot.",
  "Toch bleef het schilderij belangrijk in zijn werk. Het laat zien hoe Van Gogh begon: met donkere kleuren en aandacht voor het leven van arme mensen, in de traditie van de Haagse School. Daarna veranderde zijn stijl in Frankrijk volledig."
 ],
 perspectieven: [
  "Van Gogh wilde de boeren laten zien zoals ze waren, ruw en eerlijk, en niet mooier dan in werkelijkheid. Critici vonden de figuren lelijk en slecht getekend. Tegenwoordig wordt het schilderij juist gewaardeerd om die eerlijkheid en de sterke sfeer van het lamplicht in een donkere kamer."
 ],
 misverstanden: [
  ["“Er is maar één versie van De Aardappeleters.”","Van Gogh maakte eerst studies en een voorlopige versie, die nu in het Kröller-Müller Museum hangt, en daarna de definitieve versie in het Van Gogh Museum. Ook maakte hij een litho van de voorstelling."],
  ["“Van Gogh schilderde altijd met felle kleuren.”","In zijn Nederlandse periode schilderde hij vooral donker, in bruin, grijs en groen. De felle kleuren kwamen pas in Parijs en Arles."]
 ],
 hoeWeten: [
  "Van Gogh schreef honderden brieven aan zijn broer Theo, waarin hij uitlegt wat hij met De Aardappeleters wilde. Daarnaast zijn er de studies, schetsen en de litho. Met technisch onderzoek zien restauratoren hoe het schilderij in lagen is opgebouwd."
 ],
 nu: [
  "Het schilderij hangt in het Van Gogh Museum in Amsterdam. In Nuenen kun je de plekken bezoeken waar Van Gogh woonde en werkte, zoals de pastorie en de oude watermolen, en is een museum over zijn tijd daar."
 ],
 vertellen: "In 1991 werd De Aardappeleters samen met negentien andere werken uit het Van Gogh Museum gestolen. De dieven lieten hun buit al snel achter in een auto, en alle schilderijen werden teruggevonden, al waren sommige beschadigd.",
 verbanden: [["Vincent van Gogh","zijn hele leven en werk"],["Monet en het impressionisme","de kleuren die hij later in Parijs ontdekte"],["Het Kinderwetje","het harde leven van arbeiders in de 19e eeuw"]],
 onderwijs: {"ka":["Discussies over de ‘sociale kwestie’."],"venster":"33. Vincent van Gogh"},
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
 gevolgen: [
  "De mijnen veranderden Zuid-Limburg van een agrarisch gebied in een industriegebied. Heerlen, Kerkrade, Brunssum en Geleen groeiden snel. Rond 1930 werkte een derde van de mijnwerkers uit het buitenland. Bij de Staatsmijnen ontstond later een chemische industrie, die als DSM bleef bestaan.",
  "Priester Henri Poels zette vanaf 1910 katholieke organisaties op voor mijnwerkers, zoals vakbonden, verenigingen en woningbouw. Daarmee wilde hij de mijnwerkers helpen en tegelijk voorkomen dat ze socialist werden. De mijnstreek kreeg zo een sterk katholiek karakter."
 ],
 perspectieven: [
  "Voor de mijndirecties en de staat ging het om energie en winst. Voor de mijnwerkers was het zwaar en gevaarlijk werk, diep onder de grond, met kans op ongelukken en de ziekte stoflong. Tegelijk gaf het werk zekerheid en een sterk gevoel van saamhorigheid, dat oud-mijnwerkers nog altijd koesteren."
 ],
 misverstanden: [
  ["“De mijnwerkers kwamen allemaal uit Limburg.”","Er kwamen mijnwerkers uit heel Nederland en uit het buitenland, onder meer uit Polen, Slovenië, Duitsland, Italië en later Turkije en Marokko. Rond 1930 was een derde van de mijnwerkers buitenlander."],
  ["“Steenkool werd in Limburg pas rond 1900 ontdekt.”","De kloosterlingen van Rolduc groeven al in de middeleeuwen steenkool. Rond 1900 begon wel de grootschalige winning met moderne mijnen."]
 ],
 hoeWeten: [
  "De archieven van de Staatsmijnen en de particuliere mijnen, met personeelsregisters en kaarten van de mijngangen, zijn bewaard. Er zijn veel foto’s van het werk ondergronds. Oud-mijnwerkers hebben hun verhalen verteld, en mijnmusea houden die herinneringen levend."
 ],
 nu: [
  "In Parkstad staan nog schachtbokken, mijnwerkerswoningen en monumenten. De regio heeft door de geschiedenis nog altijd een eigen karakter, met veel Poolse, Italiaanse en andere familienamen. In het Discovery Museum in Kerkrade wordt het mijnverleden verteld."
 ],
 vertellen: "Mijnwerkers zakten elke dag honderden meters de diepte in, met een liftkooi. Beneden werkten ze in donkere, warme en stoffige gangen. Bij het naar boven komen waren ze zwart van het kolenstof. Daarom kregen veel mijnwerkerswijken eigen badhuizen.",
 verbanden: [["Sluiting van de mijnen","het einde van de mijnen"],["Gastarbeiders","veel mijnwerkers kwamen uit het buitenland"],["Limburg geheel Nederlands","Limburg werd een Nederlandse provincie"]],
 onderwijs: {"ka":["De industriële revolutie en het ontstaan van een industriële samenleving in de westerse wereld.","Discussies over de ‘sociale kwestie’."]},
 cijfers: [['Start Oranje-Nassaumijn','1899'],['Oprichting Staatsmijnen','1902'],['Aankondiging sluiting','december 1965'],['Laatste mijn dicht','1974']],
 figuren: [['Henri Poels','priester, voorman van het katholieke sociale leven in de mijnstreek'],['Joop den Uyl','minister van Economische Zaken, kondigde de sluiting aan']],
 bronnen: [['Wikipedia: Oranje-Nassau Mijnen',W('Oranje-Nassau Mijnen')],['Wikipedia: Staatsmijnen',W('Staatsmijnen')]]
}

});
})();
