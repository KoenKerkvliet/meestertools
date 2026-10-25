// Uitgebreide achtergrond per gebeurtenis — 20e eeuw. Sleutel = titel van de gebeurtenis.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
Object.assign(window.DETAILS, {

'De Eerste Wereldoorlog': {
 aanloop: [
  'Sinds de afscheiding van België in 1839 voerde Nederland een strikte neutraliteitspolitiek. Het land was klein, had een grote koloniale handel en wilde zich niet binden aan een van de Europese machtsblokken. Rond 1900 groeiden de spanningen tussen Duitsland, Frankrijk, Rusland en Groot-Brittannië, en er ontstond een wapenwedloop.',
  'Na de moord op de Oostenrijkse troonopvolger in Sarajevo in juni 1914 volgden de oorlogsverklaringen elkaar snel op. Nederland mobiliseerde eind juli 1914 zijn leger om te laten zien dat het zijn neutraliteit zou verdedigen.'
 ],
 verloop: [
  'Nederland bleef buiten de gevechten, maar de oorlog was overal voelbaar. Na de val van Antwerpen in oktober 1914 vluchtten ongeveer een miljoen Belgen over de grens. De meesten keerden snel terug, maar ruim honderdduizend bleven de hele oorlog. Ze werden opgevangen in kampen en bij gezinnen.',
  'Doordat de oorlogvoerende landen elkaars handel blokkeerden, werd voedsel schaars. Brood, aardappelen en kolen gingen op de bon en in 1917 braken in Amsterdam aardappeloproeren uit. De Duitsers zetten langs de Belgisch-Nederlandse grens een hoogspanningsdraad neer, de Dodendraad, waaraan honderden mensen omkwamen.',
  'Op 10 november 1918 stak de Duitse keizer Wilhelm II bij Eijsden in Zuid-Limburg de grens over. Nederland weigerde hem uit te leveren. Hij woonde tot zijn dood in 1941 in Huis Doorn.'
 ],
 cijfers: [['Mobilisatie','ca. 200.000 militairen'],['Belgische vluchtelingen','ca. 1 miljoen (1914)'],['Dodendraad','ca. 2000 volt, honderden doden'],['Wilhelm II in ballingschap','vanaf 10 nov 1918']],
 figuren: [['Koningin Wilhelmina','staatshoofd, steunde de neutraliteit'],['P.W.A. Cort van der Linden','minister-president 1913–1918'],['Generaal C.J. Snijders','opperbevelhebber van het leger'],['Keizer Wilhelm II','vluchtte via Eijsden naar Nederland']],
 bronnen: [CANON,['Wikipedia: Nederland in de Eerste Wereldoorlog',W('Nederland tijdens de Eerste Wereldoorlog')],['Wikipedia: Dodendraad',W('Dodendraad')]]
},

'Het eerste vliegtuig': {
 aanloop: [
  'Mensen droomden al eeuwenlang van vliegen. Orville en Wilbur Wright deden tussen 1900 en 1903 proeven met zweefvliegtuigen.',
  'Daarna bouwden ze een vliegtuig met een motor: de Wright Flyer, een dubbeldekker met de staart voorop.'
 ],
 verloop: [
  'Op 17 december 1903 maakten de broers bij Kitty Hawk in North Carolina de eerste geslaagde vlucht met een vliegtuig met motor. Die duurde twaalf seconden en ging over 36,6 meter. Later die dag vloog het toestel nog 260 meter, in 59 seconden.',
  'In Nederland bouwde Anthony Fokker in 1910 zijn eerste vliegtuigje, De Spin. Op 31 augustus 1911, Koninginnedag, vloog hij ermee boven Haarlem. In 1912 begon hij in Duitsland een eigen vliegtuigfabriek. Tijdens de Eerste Wereldoorlog bouwde hij vliegtuigen voor het Duitse leger, zoals de Fokker Eindecker met een mitrailleur die door de draaiende propeller heen kon schieten.'
 ],
 perspectieven: [
  'Het vliegtuig veranderde ook de oorlog. Al in de Eerste Wereldoorlog werden vliegtuigen gebruikt om te verkennen en om te vechten. Fokker bouwde zijn vliegtuigen voor Duitsland, terwijl Nederland neutraal bleef.'
 ],
 cijfers: [['Eerste vlucht','17 december 1903'],['Duur en afstand','12 seconden, 36,6 meter'],['De Spin van Fokker','1910'],['Vlucht in Haarlem','31 augustus 1911']],
 figuren: [['Orville en Wilbur Wright','bouwden en bestuurden de Wright Flyer'],['Anthony Fokker','Nederlandse vliegtuigbouwer'],['John T. Daniels','maakte de beroemde foto van de eerste vlucht']],
 bronnen: [['Wikipedia: Wright Flyer',W('Wright Flyer')],['Wikipedia: Anthony Fokker',W('Anthony Fokker')]]
},

'De maanlanding': {
 aanloop: [
  'In de jaren zestig streden de Verenigde Staten en de Sovjet-Unie om wie het eerst een mens de ruimte in zou sturen en daarna op de maan. Op 25 mei 1961 zei de Amerikaanse president John F. Kennedy dat zijn land vóór het einde van dat decennium een mens op de maan moest zetten en veilig terug moest brengen.'
 ],
 verloop: [
  'Op 16 juli 1969 vertrok de Saturnus V-raket met de astronauten Neil Armstrong, Buzz Aldrin en Michael Collins. De maanlander Eagle landde op 20 juli om 20:17 UTC op de maan. Collins bleef in het ruimteschip Columbia achter.',
  'Op 21 juli 1969 om 2:56 UTC zette Armstrong zijn linkervoet op de maan. Hij zei: “Dat is een kleine stap voor een mens, een reuzensprong voor de mensheid.” In Nederland was het midden in de nacht. Mensen over de hele wereld keken via de televisie mee.',
  'In 1985 vloog Wubbo Ockels uit Almelo als eerste Nederlander de ruimte in, op 30 oktober, tijdens de missie Spacelab D1.'
 ],
 cijfers: [['Lancering','16 juli 1969'],['Landing','20 juli 1969'],['Eerste stap','21 juli 1969, 2:56 UTC'],['Bemanning','3 astronauten']],
 figuren: [['Neil Armstrong','eerste mens op de maan'],['Buzz Aldrin','liep ook op de maan'],['Michael Collins','bleef in het ruimteschip Columbia'],['Wubbo Ockels','eerste Nederlandse ruimtevaarder']],
 bronnen: [['Wikipedia: Apollo 11',W('Apollo 11')],['Wikipedia: Wubbo Ockels',W('Wubbo Ockels')]]
},

'Mondriaan en De Stijl': {
 aanloop: [
  'Piet Mondriaan werd op 7 maart 1872 geboren in Amersfoort, als zoon van een onderwijzer. In 1908 werd hij lid van de Theosofische Vereniging. In 1912 vertrok hij naar Parijs en veranderde zijn naam in Mondrian.'
 ],
 verloop: [
  'In 1917 werd in Leiden het tijdschrift De Stijl opgericht, vooral door Theo van Doesburg. Kunstenaars en architecten gaven daar hun ideeën over een nieuwe, eenvoudige vormgeving: een minimum aan kleuren (de primaire kleuren rood, geel en blauw, met zwart, wit en grijs) en vooral rechte lijnen.',
  'Mondriaan schreef mee in het tijdschrift en noemde zijn eigen theorie neoplasticisme, “nieuwe beelding”. Zijn bekendste schilderijen bestaan uit horizontale en verticale zwarte lijnen met vlakken in primaire kleuren.',
  'Het tijdschrift werd nooit in meer dan 300 exemplaren verkocht, maar had grote invloed in Nederland en daarbuiten. Mondriaan overleed op 1 februari 1944 in New York.'
 ],
 cijfers: [['Mondriaan geboren','7 maart 1872, Amersfoort'],['Tijdschrift De Stijl','1917, Leiden'],['Kleuren','rood, geel, blauw, zwart, wit'],['Mondriaan overleden','1 februari 1944, New York']],
 figuren: [['Piet Mondriaan','schilder en kunsttheoreticus'],['Theo van Doesburg','oprichter van De Stijl'],['Gerrit Rietveld','meubelmaker en architect, lid van De Stijl']],
 bronnen: [['Wikipedia: Piet Mondriaan',W('Piet Mondriaan')],['Wikipedia: De Stijl',W('De Stijl')]]
},

'Rietveld Schröderhuis': {
 aanloop: [
  'Na de dood van haar man in 1923 wilde Truus Schröder-Schräder een nieuw huis voor zichzelf en haar drie kinderen. Ze vroeg Gerrit Rietveld om te helpen zoeken, maar ze vonden niets geschikt.',
  'Daarom ontwierpen ze samen een nieuw huis.'
 ],
 verloop: [
  'Het Rietveld Schröderhuis in Utrecht werd in 1923–1924 ontworpen in de beeldtaal van De Stijl: rechte lijnen, vlakken en primaire kleuren. Het was Rietvelds eerste volledig nieuwe woonhuis, inclusief de inrichting.',
  'Truus Schröder woonde er van januari 1925 tot haar dood in 1985. Sinds 2000 staat het huis op de Werelderfgoedlijst van UNESCO.'
 ],
 cijfers: [['Ontworpen','1923 – 1924'],['Bewoond','1925 – 1985'],['Stad','Utrecht'],['UNESCO-werelderfgoed','sinds 2000']],
 figuren: [['Gerrit Rietveld','architect en meubelontwerper'],['Truus Schröder-Schräder','opdrachtgever en bewoner'],['Theo van Doesburg','voorman van De Stijl']],
 bronnen: [['Wikipedia: Rietveld Schröderhuis',W('Rietveld Schröderhuis')]]
},

'Guernica van Picasso': {
 aanloop: [
  'Op 26 april 1937, tijdens de Spaanse Burgeroorlog, werd de stad Guernica in Spaans Baskenland gebombardeerd door het Duitse Condorlegioen en Italiaanse bommenwerpers. Over het aantal slachtoffers verschillen historici nog steeds van mening.'
 ],
 verloop: [
  'De Spaanse kunstenaar Pablo Picasso begon na het bombardement aan zijn schilderij Guernica. Het is 3,49 meter hoog en 7,76 meter breed en heeft geen kleur: alleen zwart, wit en grijs.',
  'Picasso wilde niet laten zien hoe het bombardement eruitzag, maar het gevoel overbrengen dat de gebeurtenis opriep. Daarom zijn mensen en dieren in scherpe, verwrongen vormen geschilderd.',
  'Guernica hangt in het Museo Reina Sofía in Madrid. Later in de oorlog volgden meer bombardementen op Europese steden, zoals Rotterdam, Coventry en Dresden.'
 ],
 cijfers: [['Bombardement','26 april 1937'],['Formaat','3,49 × 7,76 meter'],['Kleuren','zwart, wit en grijs'],['Hangt in','Museo Reina Sofía, Madrid']],
 figuren: [['Pablo Picasso','Spaanse schilder'],['Condorlegioen','Duitse eenheid die Guernica bombardeerde']],
 bronnen: [['Wikipedia: Guernica (schilderij)',W('Guernica (schilderij)')]]
},

'Cobra': {
 aanloop: [
  'Na de Tweede Wereldoorlog wilden sommige kunstenaars een nieuwe, vrije manier van schilderen.'
 ],
 verloop: [
  'Op 8 november 1948 werd de groep opgericht in Café Notre-Dame in Parijs. De naam CoBrA is een acroniem van Copenhague, Bruxelles en Amsterdam, de steden waar de oprichters vandaan kwamen.',
  'Ze werkten spontaan en lieten zich inspireren door tekeningen van kinderen en van geesteszieken, en door oosterse kalligrafie. Ze vonden dat kunst niet alleen voor iedereen was, maar ook door iedereen gemaakt kon worden.',
  'Karel Appel, Constant en Corneille uit Nederland werden internationaal beroemd, net als de Belg Pierre Alechinsky en de Deen Asger Jorn. De groep bestond van 1948 tot 1951, maar had daarna nog lang invloed.'
 ],
 cijfers: [['Opgericht','8 november 1948, Parijs'],['Actief','1948 – 1951'],['Naam','Copenhague, Bruxelles, Amsterdam'],['Nederlanders','Appel, Constant, Corneille']],
 figuren: [['Karel Appel','Nederlandse schilder'],['Constant Nieuwenhuijs','Nederlandse kunstenaar'],['Asger Jorn','Deense kunstenaar']],
 bronnen: [['Wikipedia: Cobra (kunst)',W('Cobra (kunst)')]]
},

'M.C. Escher': {
 aanloop: [
  'M.C. Escher werd op 17 juni 1898 geboren in Leeuwarden, in een pand dat nu het museum Princessehof is. Hij was goed in tekenen, maar geen goede leerling: hij bleef twee keer zitten.'
 ],
 verloop: [
  'Escher maakte houtsneden, houtgravures en lithografieën waarin hij vaak speelde met wiskundige principes. Bekende voorbeelden zijn Tekenen, waarin twee handen elkaar tekenen, en Lucht en water, waarin vissen overgaan in vogels.',
  'In 1941 verhuisde het gezin naar Baarn. Tijdens zijn wandelingen door de bossen ontstonden daar de ideeën voor werken als Drie Werelden.',
  'In de jaren zestig werd zijn werk, tot zijn verbazing, omarmd door hippies en popsterren. Escher overleed op 27 maart 1972 in Hilversum. In Den Haag is het museum Escher in Het Paleis.'
 ],
 cijfers: [['Geboren','17 juni 1898, Leeuwarden'],['Naar Baarn','1941'],['Overleden','27 maart 1972, Hilversum'],['Museum','Escher in Het Paleis, Den Haag']],
 figuren: [['M.C. Escher','graficus uit Leeuwarden']],
 bronnen: [['Wikipedia: M.C. Escher',W('Maurits Cornelis Escher')]]
},

'Nijntje': {
 aanloop: [
  'Dick Bruna werd op 23 augustus 1927 geboren in Utrecht, als oudste zoon van uitgever Abs Bruna. Hij begon als ontwerper van boekomslagen.',
  'In 1955 vertelde hij zijn zoontje van een jaar over een konijntje dat ze die dag in de duinen van Egmond aan Zee hadden gezien. Dat werd het eerste boekje over nijntje. Volgens andere bronnen was het gebaseerd op het pluchen konijn van zijn zoon.'
 ],
 verloop: [
  'Bruna tekende nijntje heel eenvoudig, met enkele lijnen en een beperkt aantal kleuren: gedempt rood, geel, blauw, groen en bruin, met dikke zwarte randen. De boekjes zijn klein van formaat, omdat Bruna wilde dat kinderen voelden dat ze voor hen waren gemaakt en niet voor hun ouders.',
  'In 2014 maakte Bruna bekend dat hij geen nieuwe boekjes meer zou maken. Hij overleed op 16 februari 2017 in Utrecht. In die stad staan het nijntje museum en een standbeeld van nijntje, gemaakt door Bruna’s zoon, de beeldhouwer Marc Bruna.'
 ],
 cijfers: [['Eerste boekje','1955'],['Bruna geboren','23 augustus 1927, Utrecht'],['Bruna overleden','16 februari 2017'],['Museum','nijntje museum, Utrecht']],
 figuren: [['Dick Bruna','tekenaar en schrijver uit Utrecht'],['Abs Bruna','zijn vader, uitgever'],['Marc Bruna','zijn zoon, maakte het standbeeld']],
 bronnen: [['Wikipedia: Nijntje',W('Nijntje')],['Wikipedia: Dick Bruna',W('Dick Bruna')]]
},

'Het Marshallplan': {
 aanloop: [
  'Na de Tweede Wereldoorlog lag een groot deel van Europa in puin. De betrekkingen tussen de Verenigde Staten en de Sovjet-Unie verslechterden snel. Een belangrijke drijfveer van de Amerikanen was een sterke buffer te vormen tegen de uitbreiding van het communisme.'
 ],
 verloop: [
  'Op 5 juni 1947 deed de Amerikaanse minister van Buitenlandse Zaken, George C. Marshall, het voorstel in een toespraak aan de Harvard-universiteit. Het European Recovery Program (ERP) was bedoeld voor de economische wederopbouw van de door de oorlog getroffen landen in Europa.',
  'Zestien Europese landen bespraken het plan in juli 1947 in Parijs. De Sovjet-Unie verzette zich en zag het als een bedreiging voor de soevereiniteit van kleine landen.',
  'Tussen 1948 en 1952 bestond de hulp uit geld, goederen, grondstoffen en levensmiddelen, deels als lening. Ook Nederland, dat de Hongerwinter achter de rug had, kreeg hulp.'
 ],
 cijfers: [['Toespraak van Marshall','5 juni 1947, Harvard'],['Uitvoering','1948 – 1952'],['Deelnemende landen','16 West-Europese landen'],['Naam van het plan','European Recovery Program']],
 figuren: [['George C. Marshall','Amerikaans minister van Buitenlandse Zaken'],['Molotov','Russisch minister, verzette zich tegen het plan']],
 bronnen: [['Wikipedia: Marshallplan',W('Marshallplan')]]
},

'Universele Verklaring van de Rechten van de Mens': {
 aanloop: [
  'Na de Tweede Wereldoorlog en de Holocaust wilden landen afspraken maken over rechten waar iedereen aanspraak op kan maken. Artikelen over huwelijk, werk, onderwijs en vrijheid van geloof zijn direct terug te voeren op bescherming tegen het soort discriminerende maatregelen dat de nazi’s tegen Joden namen.'
 ],
 verloop: [
  'Op 10 december 1948 werd de verklaring aangenomen door de Algemene Vergadering van de Verenigde Naties. Tot de grondleggers behoren de Amerikaanse presidentsweduwe Eleanor Roosevelt, de Canadese jurist John Peters Humphrey en de Franse jurist René Cassin. Acht landen onthielden zich van stemming, onder meer de Sovjet-Unie en Zuid-Afrika.',
  'Eleanor Roosevelt overtuigde de afgevaardigden om af te zien van een bindende tekst, omdat die niet genoeg steun zou krijgen. De verklaring is dus niet bindend. Toch had ze invloed op meer dan negentig grondwetten, waaronder die van nieuwe staten die na 1948 ontstonden.'
 ],
 cijfers: [['Aangenomen','10 december 1948'],['Door','Algemene Vergadering van de Verenigde Naties'],['Onthoudingen','8 landen'],['Invloed','meer dan 90 grondwetten']],
 figuren: [['Eleanor Roosevelt','een van de grondleggers'],['René Cassin','Franse jurist, een van de grondleggers'],['John Peters Humphrey','Canadese jurist, een van de grondleggers']],
 bronnen: [['Wikipedia: Universele Verklaring van de Rechten van de Mens',W('Universele Verklaring van de Rechten van de Mens')]]
},

'Spoetnik': {
 aanloop: [
  'Na de Tweede Wereldoorlog streden de Verenigde Staten en de Sovjet-Unie om de macht in de wereld, de Koude Oorlog. In 1954 keurden de Sovjets een plan goed om een satelliet in een baan om de aarde te brengen. De aanleiding was het Internationaal Geofysisch Jaar, van juli 1957 tot en met december 1958.'
 ],
 verloop: [
  'Spoetnik 1 (Spoetnik is Russisch voor “satelliet”) was de eerste kunstmatige satelliet in een baan om de aarde. Het toestel was klein en licht. De lancering wordt vaak gezien als het begin van de ruimtevaart.',
  'In de Verenigde Staten zorgde het voor schrik. De Sovjet-Unie bleek een raket te hebben die zo ver kon komen.',
  'Daarmee begon de ruimtewedloop. Die liep via de eerste mens in de ruimte naar de maanlanding van Apollo 11 in 1969. In 1985 vloog Wubbo Ockels als eerste Nederlander de ruimte in.'
 ],
 cijfers: [['Lancering','4 oktober 1957'],['Betekenis van de naam','satelliet'],['Land','Sovjet-Unie'],['Gevolg','begin van de ruimtewedloop']],
 figuren: [['Sergej Koroljov','hoofdontwerper van de Sovjet-raketten'],['Nikita Chroesjtsjov','leider van de Sovjet-Unie']],
 bronnen: [['Wikipedia: Spoetnik 1',W('Spoetnik 1')]]
},

'De Berlijnse Muur': {
 aanloop: [
  'Na 1945 werd Duitsland verdeeld in vier bezettingszones. In 1949 ontstonden West-Duitsland en Oost-Duitsland. Berlijn lag in Oost-Duitsland, maar werd zelf ook gedeeld: West-Berlijn was een eiland in Oost-Duitsland.',
  'Steeds meer Oost-Duitsers vluchtten naar het westen. In de jaren vijftig waren dat soms duizenden mensen per maand. Daarom begon Oost-Duitsland de grens af te sluiten.'
 ],
 verloop: [
  'Op 13 augustus 1961 begon Oost-Duitsland West-Berlijn volledig af te sluiten. De Muur was een tot 100 meter brede strook van opeenvolgende obstakels. De grens rond West-Berlijn was 167,8 kilometer lang, waarvan 45,1 kilometer echte muur.',
  'Op 15 augustus 1961 sprong de Oost-Duitse soldaat Conrad Schumann over het prikkeldraad naar het westen. De foto ging de wereld over.',
  'Bij pogingen om te vluchten kwamen minstens 138 mensen om het leven.'
 ],
 cijfers: [['Gebouwd','vanaf 13 augustus 1961'],['Grens rond West-Berlijn','167,8 km'],['Doden bij vluchtpogingen','minstens 138'],['Stond tot','9 november 1989']],
 figuren: [['Conrad Schumann','soldaat die over het prikkeldraad sprong'],['Oost-Duitse regering','liet de Muur bouwen']],
 bronnen: [['Wikipedia: Berlijnse Muur',W('Berlijnse Muur')]]
},

'De Cubacrisis': {
 aanloop: [
  'Op 1 januari 1959 kwam Fidel Castro aan de macht op Cuba. In 1961 probeerden Cubaanse ballingen met hulp van de CIA het eiland binnen te vallen, bij de Varkensbaai. Castro zocht steun bij de Sovjet-Unie.',
  'De Verenigde Staten hadden al kernraketten in Italië en Turkije, dicht bij de Sovjet-grens. De Sovjets antwoordden door kernraketten op Cuba te plaatsen.'
 ],
 verloop: [
  'Een Amerikaans U-2 verkenningsvliegtuig fotografeerde de raketbases. Op 22 oktober eiste president Kennedy in een felle rede dat de Sovjet-raketten werden weggehaald en kondigde hij een blokkade aan. Het Amerikaanse leger ging naar DEFCON-2.',
  'Op zaterdag 27 oktober kwam het, zoals tientallen jaren later duidelijk werd, bijna tot een kernoorlog. Op zondag 28 oktober maakte Radio Moskou bekend dat de Sovjet-Unie gevolg zou geven aan de eisen van de Verenigde Staten.',
  'Een gevolg was de “rode lijn”: in 1963 kwam er een directe telefoonverbinding, de hotline, tussen Washington en Moskou.'
 ],
 cijfers: [['Castro aan de macht','1 januari 1959'],['Kennedy kondigt blokkade aan','22 oktober 1962'],['Gevaarlijkste dag','27 oktober 1962'],['Sovjets geven toe','28 oktober 1962']],
 figuren: [['John F. Kennedy','Amerikaans president'],['Nikita Chroesjtsjov','leider van de Sovjet-Unie'],['Fidel Castro','leider van Cuba']],
 bronnen: [['Wikipedia: Cubacrisis',W('Cubacrisis')]]
},

'Provo': {
 aanloop: [
  'Provo was een anarchistische protestbeweging die op 25 mei 1965 werd opgericht in Nederland en na twee jaar werd opgeheven. Oprichters waren Roel van Duijn (filosoof), Rob Stolk (drukker) en Garmt Kroeze (onderwijzer).',
  'De naam komt van het proefschrift van Wouter Buikhuisen over nozemgedrag. Roel van Duijn gebruikte “provo” als geuzennaam.'
 ],
 verloop: [
  'In de zomer van 1965 sloten de provo’s zich aan bij de happenings van kunstenaar Robert Jasper Grootveld op het Spui in Amsterdam, rond het beeldje Het Lieverdje. Grootveld zag dat beeldje als symbool van de “verslaafde consument van morgen”.',
  'Provo bedacht “witte plannen”, zoals het witte fietsenplan: gratis fietsen die iedereen mocht gebruiken. Ook bedachten ze het witte kippenplan (politieagenten als sociaal werkers) en het witte schoorstenenplan (fabrieksschoorstenen zonder giftige uitstoot).',
  'Op 10 maart 1966, de dag van het huwelijk van prinses Beatrix en Claus von Amsberg, gooiden provo’s rookbommen. Daardoor werd Provo internationaal bekend. In 1969 kwam Roel van Duijn in de Amsterdamse gemeenteraad.'
 ],
 cijfers: [['Opgericht','25 mei 1965'],['Rookbommen bij het huwelijk','10 maart 1966'],['Opgeheven','na twee jaar, in 1967'],['Roel van Duijn','Amsterdamse gemeenteraad, 1969']],
 figuren: [['Roel van Duijn','filosoof en oprichter van Provo'],['Luud Schimmelpennink','uitvinder, betrokken bij Provo'],['Robert Jasper Grootveld','kunstenaar van de happenings op het Spui']],
 bronnen: [['Wikipedia: Provo',W('Provo')]]
},

'Internet en het world wide web': {
 aanloop: [
  'Het internet begon als ARPANET, een netwerk dat in 1969 in de Verenigde Staten werd opgezet. De term “internet” werd in 1974 voor het eerst gebruikt, door Vinton Cerf en Bob Kahn. Op 1 januari 1983 stapte ARPANET over op het protocol TCP/IP, en daarmee was het internet in zijn huidige technische vorm een feit.'
 ],
 verloop: [
  'Tim Berners-Lee, een Britse informaticus die bij het CERN in Zwitserland werkte, bouwde in 1990 samen met zijn manager Robert Cailliau de technologie voor het world wide web. Het doel was internetgebruik eenvoudiger te maken: met webpagina’s, hyperlinks en een browser. In 1991 begon het wereldwijde web-project.',
  'Internet en web zijn niet hetzelfde. Het internet is het netwerk van computers. Het web is een systeem van afspraken voor het aanbieden van pagina’s en toepassingen via dat netwerk.',
  'Het web groeide explosief en kwam ook in de klas en in huis. Zoals de televisie in 1951 in Nederland begon, werd het web in de jaren negentig voor veel mensen gewoon.'
 ],
 cijfers: [['ARPANET','1969'],['TCP/IP','1 januari 1983'],['Web gebouwd','1990, bij CERN'],['Wereldwijde web-project','1991']],
 figuren: [['Tim Berners-Lee','bedenker van het world wide web'],['Robert Cailliau','Belgische collega bij CERN'],['Vinton Cerf','mede-ontwikkelaar van TCP/IP']],
 bronnen: [['Wikipedia: Internet',W('Internet')],['Wikipedia: Tim Berners-Lee',W('Tim Berners-Lee')]]
},

'De val van de Berlijnse Muur': {
 aanloop: [
  'In de jaren tachtig verloor het communisme in Oost-Europa aan kracht. In 1989 vluchtten opnieuw veel Oost-Duitsers naar het westen en demonstreerden duizenden mensen in Oost-Duitse steden.'
 ],
 verloop: [
  'Op 9 november 1989 gingen de grensovergangen open en liepen mensen door. De Muur, die van 13 augustus 1961 tot 9 november 1989 West-Berlijn omringde, hield op te bestaan.',
  'Mensen klommen op de Muur, haalden er stukken uit en vierden feest, ook bij de Brandenburger Tor. Het was het begin van het einde van de Koude Oorlog.',
  'In 1990 werd Duitsland herenigd en in 1991 viel de Sovjet-Unie uiteen. In 1992 volgde het Verdrag van Maastricht en in 2002 kwam de euro.'
 ],
 cijfers: [['Muur open','9 november 1989'],['Muur stond','13 augustus 1961 – 9 november 1989'],['Duitsland herenigd','3 oktober 1990'],['Sovjet-Unie opgeheven','1991']],
 figuren: [['Oost-Duitse regering','liet de grenzen openen'],['Berlijners','klommen op de Muur en braken stukken af']],
 bronnen: [['Wikipedia: Berlijnse Muur',W('Berlijnse Muur')]]
},

'Vrouwenkiesrecht': {
 aanloop: [
  'In de 19e eeuw mochten alleen mannen met genoeg bezit of inkomen stemmen. In 1883 probeerde Aletta Jacobs zich als kiezer te laten inschrijven, omdat de wet nergens zei dat een kiezer een man moest zijn. Ze werd afgewezen, en daarna werd in de Grondwet expliciet vastgelegd dat alleen mannen kiesrecht hadden.',
  'In 1894 werd de Vereeniging voor Vrouwenkiesrecht opgericht. Met petities, optochten en lezingen voerden vrouwen jarenlang actie. Ondertussen woedde ook de strijd om algemeen kiesrecht voor alle mannen.'
 ],
 verloop: [
  'Bij de Pacificatie van 1917 kregen alle mannen kiesrecht en mochten vrouwen voortaan wel gekozen worden, maar nog niet zelf stemmen. In 1918 werd Suze Groeneweg de eerste vrouw in de Tweede Kamer.',
  'In 1919 diende Kamerlid Hendrik Marchant een kort wetsvoorstel in om ook vrouwen actief kiesrecht te geven. Het werd met grote meerderheid aangenomen en in september 1919 bekrachtigd. In 1922 stemden vrouwen voor het eerst bij landelijke verkiezingen.',
  'Met het vrouwenkiesrecht werd Nederland een democratie waarin alle volwassen burgers mee mochten beslissen. Toch duurde het nog decennia voordat vrouwen even vaak in politieke functies terechtkwamen als mannen.'
 ],
 cijfers: [['Poging Aletta Jacobs','1883'],['Vrouwen verkiesbaar','1917'],['Actief kiesrecht vrouwen','1919'],['Eerste stem van vrouwen','1922']],
 figuren: [['Aletta Jacobs','arts en voorvechter van vrouwenrechten'],['Wilhelmina Drucker','feministe, oprichter Vrije Vrouwenvereeniging'],['Hendrik Marchant','Kamerlid, diende de wet in'],['Suze Groeneweg','eerste vrouwelijke Kamerlid']],
 bronnen: [['Wikipedia: Vrouwenkiesrecht',W('Vrouwenkiesrecht Nederland')],['Wikipedia: Aletta Jacobs',W('Aletta Jacobs')],['Parlement.com',"https://www.parlement.com/"]]
},

'Afsluitdijk': {
 aanloop: [
  'De Zuiderzee was een onstuimige binnenzee waaraan steden als Kampen, Hoorn en Harderwijk lagen. Stormvloeden zetten het land rondom regelmatig onder water. Ingenieur Cornelis Lely bedacht al in 1891 een plan om de zee af te sluiten en delen ervan droog te leggen.',
  'Pas na de zware stormvloed van januari 1916 en de voedseltekorten tijdens de Eerste Wereldoorlog kwam er politieke steun. In 1918 nam het parlement de Zuiderzeewet aan. Een commissie onder natuurkundige Hendrik Lorentz rekende uit hoe de getijden en stormen zouden veranderen.'
 ],
 verloop: [
  'In 1927 begon de aanleg. Arbeiders bouwden met keileem, zand en basalt een dijk vanaf beide kanten naar elkaar toe. Op 28 mei 1932 werd het laatste gat gedicht. Wat achter de dijk lag, werd het IJsselmeer, dat langzaam zoet werd.',
  'In september 1933 werd de weg op de dijk geopend. Uit het IJsselmeer werden polders drooggemalen: de Wieringermeer, de Noordoostpolder en Flevoland. Zo ontstond nieuw land voor landbouw en later ook voor steden als Lelystad en Almere.',
  'De Afsluitdijk werd een symbool van de Nederlandse strijd tegen het water. Tegenwoordig wordt hij versterkt, omdat de zeespiegel stijgt.'
 ],
 cijfers: [['Lengte','ca. 32 km'],['Aanleg','1927 – 1932'],['Laatste gat gedicht','28 mei 1932'],['Nieuwe provincie','Flevoland (1986)']],
 figuren: [['Cornelis Lely','ingenieur en minister, bedenker van het plan'],['Hendrik Lorentz','Nobelprijswinnaar, leidde de rekencommissie']],
 bronnen: [['Wikipedia: Afsluitdijk',W('Afsluitdijk')],['Wikipedia: Zuiderzeewerken',W('Zuiderzeewerken')]]
},

'Anton de Kom': {
 aanloop: [
  'Anton de Kom werd in 1898 geboren in Paramaribo. Zijn vader was als tot slaaf gemaakte geboren, kort voor de afschaffing van de slavernij in 1863. De Kom groeide op in een kolonie waar Afro-Surinaamse en Hindoestaanse arbeiders arm bleven en weinig te zeggen hadden.',
  'Begin jaren twintig vertrok hij naar Nederland. In Den Haag kwam hij in aanraking met linkse en antikoloniale groepen en begon hij te schrijven over de geschiedenis van zijn land.'
 ],
 verloop: [
  'In 1933 keerde De Kom terug naar Suriname. Hij hield spreekuren voor arbeiders en kreeg enorme aanhang. Het koloniale bestuur zag hem als gevaar en arresteerde hem. Bij een demonstratie voor zijn vrijlating vielen doden. Hij werd zonder proces naar Nederland teruggestuurd.',
  'In 1934 verscheen zijn boek Wij slaven van Suriname, waarin hij de geschiedenis vertelt vanuit het perspectief van de onderdrukten. Het boek werd op veel plaatsen tegengewerkt en verscheen pas in latere drukken volledig.',
  'Tijdens de Tweede Wereldoorlog zat De Kom in het verzet. In 1944 werd hij opgepakt. Hij overleed in april 1945 in kamp Sandbostel. Sinds 1960 ligt hij op de Eerebegraafplaats in Bloemendaal.'
 ],
 cijfers: [['Geboren','22 februari 1898, Paramaribo'],['Wij slaven van Suriname','1934'],['Gearresteerd door bezetter','1944'],['Overleden','april 1945, Sandbostel']],
 figuren: [['Anton de Kom','schrijver, vakbondsman en verzetsstrijder'],['Petronella Borsboom','zijn vrouw, steunde hem in Nederland']],
 bronnen: [CANON,['Wikipedia: Anton de Kom',W('Anton de Kom')],['Wikipedia: Wij slaven van Suriname',W('Wij slaven van Suriname')]]
},

'De Tweede Wereldoorlog': {
 aanloop: [
  'Na de Eerste Wereldoorlog hoopte Nederland opnieuw neutraal te blijven. In de jaren dertig zorgde de economische crisis voor grote werkloosheid. In Duitsland kwam Adolf Hitler in 1933 aan de macht; in Nederland groeide de NSB van Anton Mussert.',
  'Toen in september 1939 de oorlog uitbrak, mobiliseerde Nederland opnieuw. Het leger was echter verouderd en de verdediging rustte vooral op de Hollandse Waterlinie.'
 ],
 verloop: [
  'Op 10 mei 1940 viel Duitsland aan. Na het bombardement op Rotterdam op 14 mei en de dreiging dat ook Utrecht zou volgen, capituleerde het leger. Koningin Wilhelmina en de regering waren naar Londen gevlucht.',
  'Onder de bezetting werden Joodse Nederlanders stap voor stap uitgesloten en weggevoerd via Westerbork naar vernietigingskampen. In februari 1941 legden Amsterdammers uit protest het werk neer: de Februaristaking. Anderen gingen in het verzet of hielpen onderduikers.',
  'Het zuiden werd in het najaar van 1944 bevrijd. In het westen volgde de Hongerwinter, waarin zo’n 20.000 mensen omkwamen. Op 5 mei 1945 werd de Duitse capitulatie in Wageningen bevestigd.'
 ],
 cijfers: [['Duur bezetting','10 mei 1940 – 5 mei 1945'],['Joodse slachtoffers','ruim 100.000 van ca. 140.000'],['Slachtoffers Hongerwinter','ca. 20.000'],['Bombardement Rotterdam','14 mei 1940']],
 figuren: [['Koningin Wilhelmina','sprak via Radio Oranje vanuit Londen'],['Arthur Seyss-Inquart','Duitse rijkscommissaris'],['Anton Mussert','leider van de NSB'],['Hannie Schaft','verzetsstrijder']],
 bronnen: [CANON,['NIOD Instituut voor Oorlogs-, Holocaust- en Genocidestudies','https://www.niod.nl/'],['Wikipedia: Hongerwinter',W('Hongerwinter')]]
},

'Anne Frank': {
 aanloop: [
  'Anne Frank werd in 1929 geboren in Frankfurt am Main. Toen de nazi’s in 1933 aan de macht kwamen, vertrok de Joodse familie Frank naar Amsterdam. Vader Otto had daar een bedrijf in geleermiddel voor jam.',
  'Na de Duitse inval in 1940 golden steeds strengere maatregelen voor Joden: ze moesten een Jodenster dragen en mochten niet meer naar gewone scholen. Toen Annes zus Margot in juli 1942 een oproep kreeg voor een werkkamp, dook het gezin onder.'
 ],
 verloop: [
  'Het gezin verborg zich in het achterhuis van het bedrijfspand aan de Prinsengracht 263, achter een draaibare boekenkast. Later kwamen de familie Van Pels en tandarts Fritz Pfeffer erbij. Medewerkers als Miep Gies zorgden voor eten en nieuws.',
  'Anne schreef in haar dagboek over het leven met acht mensen in een kleine ruimte, over haar ruzies, verliefdheid en dromen om schrijfster te worden. Op 4 augustus 1944 werden de onderduikers ontdekt en gearresteerd.',
  'Via Westerbork en Auschwitz kwam Anne in Bergen-Belsen terecht, waar zij en Margot begin 1945 aan tyfus stierven. Alleen Otto overleefde. Miep Gies had het dagboek bewaard; in 1947 verscheen het als Het Achterhuis. Het is in meer dan zeventig talen vertaald.'
 ],
 cijfers: [['Geboren','12 juni 1929'],['Ondergedoken','6 juli 1942 – 4 aug 1944'],['Onderduikers','8 personen'],['Het Achterhuis','1947']],
 figuren: [['Otto Frank','vader, enige overlevende'],['Margot Frank','zus van Anne'],['Miep Gies','helper, redde het dagboek'],['Fritz Pfeffer','medeonderduiker']],
 bronnen: [CANON,['Anne Frank Huis','https://www.annefrank.org/nl/'],['Wikipedia: Het Achterhuis',W('Het Achterhuis')]]
},

'Maastricht bevrijd': {
 aanloop: [
  'In juni 1944 landden de geallieerden in Normandië. Eind augustus was Parijs bevrijd en trokken Amerikaanse, Britse en Canadese legers snel door Frankrijk en België naar het noorden en oosten.',
  'Zuid-Limburg lag op de route van het Amerikaanse leger richting Aken en het Duitse Rijnland. De Duitse troepen trokken zich terug en bliezen de bruggen over de Maas op om de opmars te vertragen.'
 ],
 verloop: [
  'Op 12 september 1944 bereikten Amerikaanse soldaten het grensdorp Mesch bij Eijsden, het eerste bevrijde dorp van Nederland. Op 14 september trok de 30e Infanteriedivisie Maastricht binnen. Daarmee was Maastricht de eerste bevrijde stad van Nederland.',
  'In de dagen erna volgden Heerlen, Kerkrade en de dorpen van het huidige Landgraaf. Het front kwam vlak achter de grens te liggen. Duizenden Amerikaanse soldaten werden ingekwartierd bij Limburgse families.',
  'Terwijl het zuiden vrij was, mislukte de luchtlandingsoperatie Market Garden bij Arnhem. Het westen moest nog door de Hongerwinter heen. Bij Margraten werd een Amerikaanse militaire begraafplaats aangelegd. Inwoners adopteren daar tot op vandaag de graven.'
 ],
 cijfers: [['Eerste bevrijde dorp','Mesch, 12 sept 1944'],['Maastricht bevrijd','14 sept 1944'],['Graven in Margraten','ruim 8.000'],['Rest van Nederland','5 mei 1945']],
 figuren: [['30e Amerikaanse Infanteriedivisie','bevrijdde Maastricht'],['Inwoners van Margraten e.o.','adopteren de oorlogsgraven']],
 bronnen: [['Wikipedia: Amerikaanse begraafplaats Margraten',W('Amerikaanse Oorlogsbegraafplaats Margraten')],['Wikipedia: Mesch',W('Mesch')]]
},

'Indonesië': {
 aanloop: [
  'Indonesië was ruim drie eeuwen eerst handelsgebied van de VOC en daarna de kolonie Nederlands-Indië. De kolonie leverde Nederland veel geld op uit onder meer suiker, koffie, rubber en olie. In het begin van de 20e eeuw groeide een Indonesische nationalistische beweging.',
  'In maart 1942 bezette Japan de kolonie. Nederlanders en Indo’s kwamen in kampen terecht. Nationalisten als Soekarno werkten deels samen met de Japanners om onafhankelijkheid dichterbij te brengen.'
 ],
 verloop: [
  'Twee dagen na de Japanse capitulatie, op 17 augustus 1945, riepen Soekarno en Hatta de Republiek Indonesië uit. Nederland erkende dat niet. Er volgde een gewelddadige periode, de Bersiap, en daarna stuurde Nederland een groot leger.',
  'In 1947 en 1948 voerde Nederland twee grote militaire offensieven uit, destijds politionele acties genoemd. Onderzoek uit 2022 liet zien dat Nederlandse militairen daarbij structureel extreem geweld gebruikten. Onder internationale druk erkende Nederland op 27 december 1949 de soevereiniteit van Indonesië.',
  'Honderdduizenden Indische Nederlanders, Molukkers en anderen vertrokken naar Nederland. Nieuw-Guinea bleef nog tot 1962 Nederlands.'
 ],
 cijfers: [['Proclamatie','17 augustus 1945'],['Ingezette Nederlandse militairen','ca. 220.000'],['Soevereiniteitsoverdracht','27 december 1949'],['Nieuw-Guinea overgedragen','1962']],
 figuren: [['Soekarno','eerste president van Indonesië'],['Mohammad Hatta','vicepresident'],['Generaal Spoor','Nederlandse legercommandant'],['Raymond Westerling','commandant, berucht om geweld op Zuid-Celebes']],
 bronnen: [CANON,['NIOD','https://www.niod.nl/'],['Wikipedia: Indonesische Onafhankelijkheidsoorlog',W('Indonesische Onafhankelijkheidsoorlog')]]
},

'De televisie': {
 aanloop: [
  'Al in de jaren dertig deed Philips in Eindhoven proeven met het uitzenden van bewegend beeld. Na de oorlog zond Philips vanaf 1948 experimentele programma’s uit voor een klein publiek in de regio.',
  'Radio was toen het belangrijkste medium. De omroepen waren georganiseerd naar zuil: katholiek, protestants, socialistisch en algemeen. Die verdeling ging over naar de televisie.'
 ],
 verloop: [
  'Op 2 oktober 1951 volgde de eerste officiële uitzending vanuit een studio in Bussum. Er stonden toen maar een paar honderd toestellen in Nederland. Mensen keken vaak samen bij de buren, in cafés of voor de etalage van een winkel.',
  'In de jaren vijftig en zestig groeide het aantal toestellen snel. In 1956 begon het NOS Journaal, in 1964 kwam een tweede net en in 1967 de eerste reclame en kleurenuitzendingen.',
  'Televisie veranderde hoe Nederlanders nieuws, sport en amusement beleefden. Grote gebeurtenissen zoals de maanlanding en het WK van 1974 werden gedeelde ervaringen voor het hele land.'
 ],
 cijfers: [['Eerste officiële uitzending','2 oktober 1951'],['Start Journaal','1956'],['Tweede net','1964'],['Reclame en kleur','1967']],
 figuren: [['Philips','pionier van de televisietechniek'],['Publieke omroepen','KRO, NCRV, VARA, AVRO, VPRO']],
 bronnen: [CANON,['Beeld & Geluid','https://www.beeldengeluid.nl/'],['Wikipedia: Televisie in Nederland',W('Televisie in Nederland geschiedenis')]]
},

'Annie M.G. Schmidt': {
 aanloop: [
  'Anna Maria Geertruida Schmidt werd in 1911 geboren in Kapelle in Zeeland, als dochter van een dominee. Ze werkte eerst als bibliothecaresse. Na de oorlog ging ze naar Amsterdam en kreeg ze werk bij de krant Het Parool.',
  'Nederland was na 1945 een land van wederopbouw, met strenge gezinsregels en veel aandacht voor fatsoen. Kinderboeken waren vaak belerend.'
 ],
 verloop: [
  'Van 1952 tot 1957 schreef Annie M.G. Schmidt wekelijks een verhaaltje over Jip en Janneke in Het Parool, getekend door Fiep Westendorp. Haar versjes waren eigenwijs, grappig en soms ondeugend. Kinderen werden niet terechtgewezen, maar gingen op avontuur.',
  'Ze schreef boeken als Abeltje, Pluk van de Petteflet, Otje en Wiplala, en de liedjes en scripts voor tv-series en musicals zoals Ja zuster, nee zuster. Veel van haar zinnen zijn gewone uitdrukkingen geworden.',
  'In 1988 kreeg ze de Hans Christian Andersenprijs, de belangrijkste internationale prijs voor kinderliteratuur. Ze overleed in 1995 in Amsterdam.'
 ],
 cijfers: [['Geboren','20 mei 1911, Kapelle'],['Jip en Janneke','1952 – 1957'],['Hans Christian Andersenprijs','1988'],['Overleden','21 mei 1995']],
 figuren: [['Annie M.G. Schmidt','schrijfster'],['Fiep Westendorp','illustrator van Jip en Janneke'],['Harry Bannink','componist van veel van haar liedjes']],
 bronnen: [CANON,['Wikipedia: Annie M.G. Schmidt',W('Annie M.G. Schmidt')]]
},

'De Watersnood': {
 aanloop: [
  'Veel dijken in Zeeland en Zuid-Holland waren na de oorlog in slechte staat. Deskundigen hadden al gewaarschuwd dat ze niet hoog en sterk genoeg waren. Er was echter weinig geld en de wederopbouw had voorrang.',
  'In de nacht van 31 januari op 1 februari 1953 viel een zware noordwesterstorm samen met springtij. Het water werd hoger opgestuwd dan ooit gemeten.'
 ],
 verloop: [
  'Op tientallen plaatsen braken de dijken. Het water stroomde dorpen en polders in terwijl de meeste mensen sliepen. Er waren weinig telefoons en de radio zond ’s nachts niet uit, waardoor waarschuwingen niet aankwamen. 1836 mensen kwamen om.',
  'Bij Nieuwerkerk aan den IJssel werd een gat in de dijk gedicht door er een schip in te varen, De Twee Gebroeders. Daardoor bleef een groot deel van de Randstad droog.',
  'Na de ramp kwam de Deltacommissie met een plan om zeearmen af te sluiten en dijken te verhogen. De Deltawerken duurden tientallen jaren, met de Oosterscheldekering en de Maeslantkering als bekendste onderdelen.'
 ],
 cijfers: [['Datum','nacht van 31 jan op 1 feb 1953'],['Doden in Nederland','1836'],['Geëvacueerden','ca. 72.000'],['Overstroomd land','ca. 200.000 hectare']],
 figuren: [['Deltacommissie','ontwierp het Deltaplan'],['Schipper Arie Evegroen','voer De Twee Gebroeders in het dijkgat']],
 bronnen: [CANON,['Watersnoodmuseum','https://watersnoodmuseum.nl/'],['Wikipedia: Deltawerken',W('Deltawerken')]]
},

'Marga Klompé': {
 aanloop: [
  'Marga Klompé werd in 1912 in Arnhem geboren in een katholiek gezin. Ze studeerde scheikunde en promoveerde, wat voor vrouwen in die tijd uitzonderlijk was. Tijdens de oorlog was ze actief in het verzet.',
  'Na de oorlog ging ze voor de KVP de politiek in en werd ze lid van de Tweede Kamer. Nederland was druk bezig met de opbouw van een sociaal stelsel, onder leiding van premier Willem Drees.'
 ],
 verloop: [
  'In 1956 werd Klompé minister van Maatschappelijk Werk in het kabinet-Drees III. Ze was de eerste vrouwelijke minister van Nederland.',
  'Haar belangrijkste wet was de Algemene Bijstandswet, die in 1965 inging. Voor die tijd waren mensen zonder inkomen afhankelijk van liefdadigheid van kerken en armenzorg. Met de bijstand kregen ze een wettelijk recht op een minimuminkomen van de overheid.',
  'Klompé was ook minister van Cultuur, Recreatie en Maatschappelijk Werk. Ze zette zich in voor kunst, cultuur en internationale samenwerking. Ze overleed in 1986.'
 ],
 cijfers: [['Geboren','16 augustus 1912, Arnhem'],['Eerste vrouwelijke minister','1956'],['Algemene Bijstandswet','1965'],['Overleden','28 december 1986']],
 figuren: [['Marga Klompé','minister, KVP'],['Willem Drees','minister-president 1948–1958']],
 bronnen: [CANON,['Parlement.com','https://www.parlement.com/'],['Wikipedia: Algemene Bijstandswet',W('Algemene Bijstandswet')]]
},

'Europa': {
 aanloop: [
  'Na twee wereldoorlogen wilden Europese landen voorkomen dat ze opnieuw tegen elkaar zouden vechten. Economische samenwerking moest vrede en welvaart brengen.',
  'Nederland, België en Luxemburg werkten al samen in de Benelux. In 1951 richtten zes landen de Europese Gemeenschap voor Kolen en Staal op. Kolen en staal waren de grondstoffen voor oorlog; door ze samen te beheren, werd oorlog tussen de leden vrijwel onmogelijk.'
 ],
 verloop: [
  'De Nederlandse minister Johan Willem Beyen pleitte voor een gemeenschappelijke markt, waar goederen vrij konden worden verhandeld. Dat plan leidde tot de Verdragen van Rome, ondertekend op 25 maart 1957.',
  'Zo ontstond de Europese Economische Gemeenschap (EEG) met zes landen: België, Frankrijk, Italië, Luxemburg, Nederland en West-Duitsland. De Nederlander Sicco Mansholt werd verantwoordelijk voor het gezamenlijke landbouwbeleid.',
  'De EEG groeide uit tot de Europese Unie, die met het Verdrag van Maastricht in 1992 werd opgericht. Nederland is een van de landen die het meest verdienen aan de vrije Europese handel.'
 ],
 cijfers: [['EGKS','1951'],['Verdragen van Rome','25 maart 1957'],['Oprichtende landen','6'],['Europese Unie','1992 (Maastricht)']],
 figuren: [['Johan Willem Beyen','minister van Buitenlandse Zaken'],['Sicco Mansholt','Eurocommissaris voor landbouw'],['Robert Schuman','Franse minister, plan voor de EGKS']],
 bronnen: [CANON,['Europa Nu','https://www.europa-nu.nl/'],['Wikipedia: Verdragen van Rome',W('Verdragen van Rome')]]
},

'Aardgas in Slochteren': {
 aanloop: [
  'Nederland draaide in de eerste helft van de 20e eeuw vooral op steenkool, grotendeels uit de Limburgse mijnen. Huizen werden verwarmd met kolenkachels en in steden werd stadsgas gemaakt van kolen.',
  'Na de oorlog zocht de Nederlandse Aardolie Maatschappij (NAM), een samenwerking van Shell en Esso, naar olie en gas onder Nederlandse bodem.'
 ],
 verloop: [
  'In juli 1959 stuitte een boring bij Kolham in de gemeente Slochteren op gas. Pas later bleek hoe enorm het veld was: een van de grootste gasvelden ter wereld.',
  'In de jaren zestig werd in hoog tempo een gasnet aangelegd. Binnen ongeveer tien jaar kookten en stookten vrijwel alle Nederlanders op aardgas. De staat verdiende honderden miljarden euro’s aan de gasbaten.',
  'De gaswinning veroorzaakte bodemdaling en aardbevingen. Na de beving bij Huizinge in 2012 nam de schade sterk toe. Een parlementaire enquête concludeerde in 2023 dat de belangen van Groningers jarenlang waren genegeerd. In 2023 werd de gaswinning gestopt.'
 ],
 cijfers: [['Ontdekking','22 juli 1959, Kolham'],['Omvang veld (oorspronkelijk)','ca. 2.800 miljard m³'],['Beving Huizinge','2012, kracht 3,6'],['Einde winning','2023']],
 figuren: [['NAM','Shell en ExxonMobil (Esso)'],['Bewoners van Groningen','droegen de gevolgen van de winning']],
 bronnen: [CANON,['Wikipedia: Gasveld Groningen',W('Groningenveld')],['Wikipedia: Parlementaire enquête Fryslân/Groningen',W('Parlementaire enquête aardgaswinning Groningen')]]
},

'Gastarbeiders': {
 aanloop: [
  'Na de oorlog groeide de Nederlandse economie snel. In de jaren vijftig en zestig was er een groot tekort aan arbeiders in fabrieken, de textielindustrie, de scheepsbouw en de mijnen.',
  'Al kort na de oorlog kwamen Italiaanse mijnwerkers naar Limburg. Daarna sloot Nederland officiële wervingsakkoorden met landen rond de Middellandse Zee.'
 ],
 verloop: [
  'Er kwamen akkoorden met Italië (1960), Spanje (1961), Portugal (1963), Turkije (1964), Griekenland (1966), Marokko (1969), en Joegoslavië en Tunesië (1970). Bedrijven stuurden soms zelf wervers naar dorpen in die landen.',
  'De mannen kwamen meestal alleen en woonden in pensions. Zowel zij als de overheid dachten dat het tijdelijk zou zijn, vandaar het woord gastarbeider. Na de oliecrisis van 1973 stopte de werving.',
  'Veel arbeiders bleven toch en lieten hun gezin overkomen. Zo ontstonden grote Turkse en Marokkaanse gemeenschappen. Het veranderde Nederland in een land met veel culturen.'
 ],
 cijfers: [['Akkoord met Turkije','1964'],['Akkoord met Marokko','1969'],['Einde werving','na de oliecrisis van 1973']],
 figuren: [['Wervende bedrijven','zoals textiel- en metaalfabrieken'],['Eerste generatie','vooral jonge mannen']],
 bronnen: [CANON,['Wikipedia: Gastarbeider',W('Gastarbeider Nederland')]]
},

'Sluiting van de mijnen': {
 aanloop: [
  'Vanaf het eind van de 19e eeuw groeide Zuid-Limburg uit tot een mijnstreek. Particuliere mijnen en de Staatsmijnen trokken tienduizenden arbeiders aan, uit Limburg zelf en uit onder meer Polen, Italië en later Turkije. Er verrezen mijnkoloniën met eigen scholen, kerken en verenigingen.',
  'In de jaren vijftig kwam goedkope olie en Amerikaanse steenkool op de markt. Na de vondst van aardgas bij Slochteren in 1959 was Limburgse kolen niet meer rendabel.'
 ],
 verloop: [
  'Op 14 december 1965 kondigde minister Joop den Uyl in de schouwburg van Heerlen aan dat alle mijnen zouden sluiten. Hij beloofde dat er geen mijnwerker werkloos zou worden.',
  'In 1974 sloot de laatste mijn, de Oranje-Nassau I in Heerlen. Om werk te bieden, werden overheidsdiensten zoals het CBS en het ABP naar Parkstad verplaatst. De Staatsmijnen gingen verder als chemiebedrijf DSM.',
  'Toch verdwenen veel banen en kreeg de regio te maken met werkloosheid en krimp. Op mijnsteenberg de Wilhelminaberg in Landgraaf ligt nu SnowWorld.'
 ],
 cijfers: [['Aankondiging','14 december 1965'],['Laatste mijn gesloten','1974'],['Oudste mijn','Domaniale, Kerkrade']],
 figuren: [['Joop den Uyl','minister van Economische Zaken'],['Mijnwerkers en hun gezinnen','uit binnen- en buitenland']],
 bronnen: [CANON,['Nederlands Mijnmuseum','https://www.nederlandsmijnmuseum.nl/'],['Wikipedia: Mijnbouw in Limburg',W('Steenkolenmijnen Limburg')]]
},

'Pinkpop': {
 aanloop: [
  'Eind jaren zestig ontstond overal ter wereld een nieuwe jeugdcultuur met popmuziek, langer haar en protest tegen de gevestigde orde. Grote openluchtfestivals zoals Woodstock in 1969 maakten indruk.',
  'In Geleen wilde Jan Smeets zo’n festival naar Limburg halen, met hulp van gemeente en vrijwilligers.'
 ],
 verloop: [
  'Op Pinkstermaandag 1970 vond in Geleen het eerste Pinkpop plaats. De naam combineert Pinksteren en pop. Het festival trok meteen duizenden bezoekers.',
  'Pinkpop groeide uit tot een van de belangrijkste festivals van Europa. Na de jaren in Geleen en één editie in Baarlo verhuisde het in 1988 naar Megaland in Landgraaf, waar het nog steeds plaatsvindt.',
  'Wereldsterren van U2 tot Metallica en The Rolling Stones stonden op het podium. Pinkpop geldt als het oudste popfestival ter wereld dat elk jaar zonder onderbreking werd gehouden, op de coronajaren na.'
 ],
 cijfers: [['Eerste editie','Pinksteren 1970, Geleen'],['Naar Landgraaf','1988'],['Locatie nu','Megaland, Landgraaf']],
 figuren: [['Jan Smeets','oprichter en jarenlang directeur']],
 bronnen: [['Pinkpop','https://www.pinkpop.nl/'],['Wikipedia: Pinkpop',W('Pinkpop')]]
},

'Het Oranjegevoel': {
 aanloop: [
  'Nederland speelde lang een bescheiden rol in het internationale voetbal. Rond 1970 veranderde dat: Feyenoord won in 1970 de Europacup I en Ajax won hem daarna drie keer op rij.',
  'Trainer Rinus Michels ontwikkelde bij Ajax het totaalvoetbal: spelers wisselden voortdurend van positie en het hele elftal viel aan en verdedigde samen.'
 ],
 verloop: [
  'Op het WK van 1974 in West-Duitsland speelde het Nederlands elftal met Johan Cruijff, Johan Neeskens en Ruud Krol aanvallend en vernieuwend voetbal. Het team haalde de finale in München.',
  'Al in de tweede minuut scoorde Neeskens uit een strafschop, maar West-Duitsland won uiteindelijk met 2-1. Toch werd het elftal wereldwijd bewonderd.',
  'In heel Nederland kleurden straten oranje en keken families samen naar de wedstrijden. Dat oranjegevoel komt terug bij grote toernooien, Koningsdag en sportsuccessen.'
 ],
 cijfers: [['WK-finale','7 juli 1974, München'],['Uitslag','West-Duitsland – Nederland 2-1'],['Eerste prijs','EK 1988']],
 figuren: [['Rinus Michels','bondscoach, bedenker van totaalvoetbal'],['Johan Cruijff','aanvoerder en sterspeler'],['Johan Neeskens','scoorde in de finale']],
 bronnen: [CANON,['Wikipedia: WK 1974',W('Wereldkampioenschap voetbal 1974')]]
},

'Suriname onafhankelijk': {
 aanloop: [
  'Suriname was eeuwenlang een Nederlandse plantagekolonie, gebouwd op slavernij en daarna contractarbeid uit Azië. Met het Statuut voor het Koninkrijk van 1954 kregen Suriname en de Nederlandse Antillen zelfbestuur binnen het Koninkrijk.',
  'Begin jaren zeventig wilde zowel de Surinaamse regering van Henck Arron als de Nederlandse regering van Joop den Uyl de onafhankelijkheid. In Suriname was niet iedereen het daarmee eens.'
 ],
 verloop: [
  'Op 25 november 1975 werd Suriname een onafhankelijke republiek. Nederland beloofde miljarden guldens aan ontwikkelingshulp.',
  'Uit onzekerheid over de toekomst verhuisden in de jaren rond de onafhankelijkheid tienduizenden Surinamers naar Nederland. Ongeveer een derde van de bevolking woonde uiteindelijk in Nederland.',
  'In 1980 pleegde Desi Bouterse een staatsgreep. In 1982 werden vijftien tegenstanders vermoord: de Decembermoorden. Aruba, Curaçao en Sint Maarten bleven landen binnen het Koninkrijk.'
 ],
 cijfers: [['Statuut voor het Koninkrijk','1954'],['Onafhankelijkheid','25 november 1975'],['Staatsgreep','1980'],['Decembermoorden','1982']],
 figuren: [['Henck Arron','eerste premier van Suriname'],['Joop den Uyl','Nederlandse premier'],['Johan Ferrier','eerste president']],
 bronnen: [CANON,['Wikipedia: Onafhankelijkheid van Suriname',W('Onafhankelijkheid Suriname 1975')]]
},

'Verdrag van Maastricht': {
 aanloop: [
  'De Europese Gemeenschap was vooral een economisch samenwerkingsverband. Eind jaren tachtig veranderde Europa snel: de Berlijnse Muur viel in 1989 en Duitsland werd in 1990 herenigd.',
  'De lidstaten wilden nauwer samenwerken, ook op het gebied van buitenlands beleid, justitie en geld. Nederland was in de tweede helft van 1991 voorzitter van de Europese Gemeenschap.'
 ],
 verloop: [
  'In december 1991 bereikten de regeringsleiders in Maastricht een akkoord. Op 7 februari 1992 werd het verdrag ondertekend in het Gouvernement aan de Maas, het provinciehuis van Limburg.',
  'Het verdrag richtte de Europese Unie op, voerde het Europees burgerschap in en legde de basis voor een gezamenlijke munt. In Denemarken werd het verdrag eerst bij een referendum afgewezen. Op 1 november 1993 trad het in werking.',
  'In 2002 kregen burgers de euro in handen. Maastricht is sindsdien een begrip in de Europese politiek.'
 ],
 cijfers: [['Akkoord','december 1991'],['Ondertekend','7 februari 1992'],['In werking','1 november 1993'],['Euro in de portemonnee','2002']],
 figuren: [['Ruud Lubbers','minister-president'],['Hans van den Broek','minister van Buitenlandse Zaken'],['Wim Kok','minister van Financiën']],
 bronnen: [['Europa Nu','https://www.europa-nu.nl/'],['Wikipedia: Verdrag van Maastricht',W('Verdrag van Maastricht')]]
},

'Srebrenica': {
 aanloop: [
  'Na de val van het communisme viel Joegoslavië uiteen. In Bosnië-Herzegovina brak in 1992 een oorlog uit tussen Bosniakken, Serviërs en Kroaten, waarbij etnische zuivering werd gepleegd.',
  'In 1993 riepen de Verenigde Naties de stad Srebrenica uit tot veilig gebied voor tienduizenden Bosnische moslims. Vanaf 1994 moest een licht bewapend Nederlands VN-bataljon, Dutchbat, de enclave beschermen.'
 ],
 verloop: [
  'In juli 1995 viel het Bosnisch-Servische leger onder generaal Ratko Mladić de enclave aan. Luchtsteun bleef grotendeels uit. Op 11 juli nam het leger de stad in.',
  'De Bosnisch-Servische troepen scheidden mannen en jongens van vrouwen en kinderen en vermoordden in de dagen daarna ongeveer 8000 van hen. Het Joegoslaviëtribunaal oordeelde later dat dit genocide was.',
  'Het NIOD-rapport van 2002 leidde tot de val van het kabinet-Kok II. In 2019 oordeelde de Hoge Raad dat de Nederlandse staat gedeeltelijk aansprakelijk is voor de dood van ongeveer 350 mannen die uit de compound waren weggestuurd.'
 ],
 cijfers: [['Val van Srebrenica','11 juli 1995'],['Vermoorde mannen en jongens','ca. 8000'],['Val kabinet-Kok II','april 2002'],['Uitspraak Hoge Raad','2019']],
 figuren: [['Ratko Mladić','Bosnisch-Servische generaal, veroordeeld voor genocide'],['Thom Karremans','commandant van Dutchbat III'],['Wim Kok','premier, trad af in 2002']],
 bronnen: [CANON,['NIOD','https://www.niod.nl/'],['Wikipedia: Val van Srebrenica',W('Val van Srebrenica')]]
}

});
})();
