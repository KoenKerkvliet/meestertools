// Uitgebreide achtergrond per gebeurtenis — vroege middeleeuwen tot Bourgondische tijd. Sleutel = titel van de gebeurtenis.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
Object.assign(window.DETAILS, {

'Friezen beheersen de kust': {
 aanloop: [
  'Na het vertrek van de Romeinen in de 5e eeuw raakte het kustgebied deels ontvolkt. Daarna vestigden zich opnieuw mensen in het waddengebied en langs de rivieren. Zij woonden op terpen: kunstmatige heuvels die hen droog hielden bij hoog water.',
  'De bewoners leefden van veeteelt, visserij en vooral handel. Via de Noordzee en de grote rivieren hadden ze contact met Engeland, Scandinavië en het Rijnland. Schrijvers uit die tijd noemden het hele kustgebied Frisia.'
 ],
 verloop: [
  'Rond de 7e eeuw strekte het Friese invloedsgebied zich uit van de Zeeuwse delta tot in Noord-Duitsland. Friese handelaren vervoerden laken, wijn, aardewerk en slaven. Ze sloegen ook eigen zilveren muntjes, die archeologen sceatta’s noemen.',
  'Ten zuiden van de Friezen lag het rijk van de Franken. De twee volken streden lang om de controle over de rivierhandel en om plaatsen als Utrecht en Dorestad. De Friezen hielden vast aan hun eigen goden, wat de strijd met de christelijke Franken nog scherper maakte.',
  'In de 8e eeuw werden de Friezen stap voor stap onderworpen en bekeerd. Hun naam leeft voort in de provincie Friesland en in de Friese taal.'
 ],
 cijfers: [['Friese bloeitijd','ca. 600 – 750'],['Dood van Radboud','719'],['Volledige Frankische verovering','ca. 785']],
 figuren: [['Aldgisl','Friese koning, ontving rond 678 de missionaris Wilfrid'],['Radboud','machtigste Friese koning, gestorven 719']],
 bronnen: [['Wikipedia: Friezen (Germaans volk)',W('Friezen Germaans volk')],['Wikipedia: Frisia',W('Magna Frisia')],['Wikipedia: Terp',W('Terp (heuvel)')]]
},

'Handelsstad Dorestad': {
 aanloop: [
  'Op de plek waar de Rijn zich splitste in de Kromme Rijn en de Lek, lag een ideale plaats voor handel. Schepen uit het Rijnland konden hier verder naar de Noordzee, Engeland en Scandinavië. Al in Romeinse tijd stond er in de buurt een fort.',
  'In de 7e eeuw groeide hier een nederzetting uit tot een belangrijke handelsplaats. Rond 630 werden er gouden muntjes geslagen door een muntmeester die Madelinus heette. Friezen en Franken streden om de controle over de plaats.'
 ],
 verloop: [
  'Rond 690 nam de Frankische hofmeier Pippijn II Dorestad in. Onder de Karolingen bloeide de stad op. Langs de rivieroever lagen kilometers aan houten steigers, waar schepen hun lading losten.',
  'In Dorestad werden graan, wijn uit het Rijnland in tonnen, aardewerk, maalstenen, metaal en ook slaven verhandeld. Er was een tol en een munt van de Frankische koningen. Daarmee hoorde Dorestad bij de grootste handelsplaatsen van Noordwest-Europa.',
  'In de 9e eeuw ging de stad snel achteruit door Vikingaanvallen en doordat de rivier verzandde. Opgravingen in de jaren 1967 tot 1977 lieten zien hoe groot de stad was geweest. In Wijk bij Duurstede is daar nu een museum over.'
 ],
 cijfers: [['Bloeiperiode','ca. 630 – 850'],['Frankische verovering','ca. 690'],['Grote opgravingen','1967 – 1977']],
 figuren: [['Madelinus','muntmeester, sloeg munten in Dorestad'],['Pippijn II','Frankische hofmeier, veroverde Dorestad'],['Wim van Es','archeoloog, leidde de opgravingen']],
 bronnen: [['Wikipedia: Dorestad',W('Dorestad')],['Wikipedia: Wijk bij Duurstede',W('Wijk bij Duurstede')]]
},

'Radboud, koning der Friezen': {
 aanloop: [
  'Aan het eind van de 7e eeuw beheersten de Friezen een groot deel van de kust en de rivierhandel. In het zuiden breidden de Franken onder de hofmeiers uit het huis van Pippijn hun macht uit. Een botsing was onvermijdelijk.',
  'Radboud werd rond 680 koning van de Friezen. Hij was een tegenstander van het christendom, dat hij zag als het geloof van de Franken. Missionarissen konden alleen werken waar de Frankische macht hen beschermde.'
 ],
 verloop: [
  'Rond 690 versloeg Pippijn II Radboud bij Dorestad. Utrecht en het rivierengebied kwamen in Frankische handen. Er volgde een periode van vrede, en in 711 trouwde Radbouds dochter Theudesinde met Pippijns zoon Grimoald.',
  'Na de dood van Pippijn in 714 sloeg Radboud terug. Hij heroverde gebied, verdreef de missionarissen en trok met zijn vloot de Rijn op. In 716 versloeg hij Karel Martel bij Keulen. In 719 stierf Radboud, waarna de Franken het zuidelijke Friese gebied weer innamen.',
  'Volgens een latere heiligenlevensbeschrijving stond Radboud al met één voet in het doopwater. Hij vroeg waar zijn voorouders waren. Toen het antwoord luidde dat zij in de hel waren, trok hij zijn voet terug. Of dit echt gebeurde, is onzeker.'
 ],
 cijfers: [['Koning','ca. 680 – 719'],['Nederlaag bij Dorestad','ca. 690'],['Overwinning bij Keulen','716'],['Overleden','719']],
 figuren: [['Radboud','koning der Friezen'],['Pippijn II','Frankische hofmeier, tegenstander'],['Karel Martel','zoon van Pippijn, verslagen in 716'],['Wulfram van Sens','missionaris uit de doop-legende']],
 bronnen: [['Wikipedia: Radboud (koning)',W('Radboud koning Friezen')],['Wikipedia: Friese Rijk',W('Friese Rijk')]]
},

'Willibrord': {
 aanloop: [
  'Willibrord werd rond 658 geboren in Northumbria, in Noord-Engeland. Hij groeide op in een klooster en studeerde later twaalf jaar in Ierland. Engelse en Ierse monniken wilden de Germaanse volken op het vasteland bekeren, met wie zij zich verwant voelden.',
  'De Friezen hielden vast aan hun eigen goden. Na de overwinning van de Franken op Radboud rond 690 was er in het rivierengebied ruimte voor missionarissen, onder bescherming van de Frankische hofmeier Pippijn II.'
 ],
 verloop: [
  'In 690 kwam Willibrord met elf metgezellen naar het vasteland. Met steun van Pippijn begon hij te preken onder de Friezen. In 695 wijdde paus Sergius I hem in Rome tot aartsbisschop van de Friezen. Hij kreeg daarbij de naam Clemens.',
  'Willibrord vestigde zijn zetel in Utrecht, waar hij kerken liet bouwen. In 698 stichtte hij een klooster in Echternach, in het huidige Luxemburg. Toen Radboud na 714 terugsloeg, moest hij Utrecht tijdelijk verlaten. Daarna hervatte hij zijn werk.',
  'Willibrord stierf in 739 in Echternach en werd daar begraven. Hij geldt als de grondlegger van het bisdom Utrecht en als de apostel van de Nederlanden. In Echternach wordt nog jaarlijks een springprocessie te zijner ere gehouden.'
 ],
 cijfers: [['Geboren','ca. 658'],['Aankomst op het vasteland','690'],['Wijding tot aartsbisschop','695'],['Overleden','739, Echternach']],
 figuren: [['Willibrord','missionaris, eerste bisschop van Utrecht'],['Pippijn II','Frankische hofmeier, beschermheer'],['Paus Sergius I','wijdde hem in Rome'],['Radboud','Friese koning, tegenstander']],
 bronnen: [CANON,['Wikipedia: Willibrord',W('Willibrord')]]
},

'Bonifatius vermoord': {
 aanloop: [
  'Bonifatius heette eigenlijk Winfried en werd rond 675 geboren in Wessex, in Zuid-Engeland. Na een loopbaan als monnik vertrok hij naar het vasteland om heidenen te bekeren. Een eerste poging bij de Friezen in 716 mislukte door de oorlog tussen Radboud en de Franken.',
  'Daarna werkte hij enkele jaren met Willibrord in Utrecht. Later bekeerde en organiseerde hij grote delen van Duitsland. Hij stichtte bisdommen en kloosters, waaronder Fulda, en werd aartsbisschop van Mainz.'
 ],
 verloop: [
  'Op hoge leeftijd keerde Bonifatius terug naar Friesland, waar het noordelijke deel nog niet bekeerd was. Hij trok met een groep metgezellen door het land en doopte veel mensen.',
  'Op 5 juni 754 wachtte hij bij Dokkum op nieuwe dopelingen. Een gewapende groep Friezen viel het kamp aan en doodde Bonifatius en ongeveer vijftig metgezellen. Volgens de overlevering probeerde hij zich met een boek te beschermen. In Fulda wordt een boek met snijsporen bewaard dat met dit verhaal wordt verbonden.',
  'Zijn lichaam werd naar Fulda gebracht en daar begraven. Bonifatius werd snel als martelaar vereerd. In Dokkum herinneren een kapel en een bron aan hem.'
 ],
 cijfers: [['Geboren','ca. 675'],['Gedood','5 juni 754, bij Dokkum'],['Gedode metgezellen','ca. 50'],['Begraven','Fulda']],
 figuren: [['Bonifatius','missionaris en aartsbisschop van Mainz'],['Willibrord','leermeester in Utrecht'],['Gregorius van Utrecht','leerling, leidde later de Utrechtse kerk']],
 bronnen: [['Wikipedia: Bonifatius',W('Bonifatius')],['Wikipedia: Dokkum',W('Dokkum')]]
},

'Karel de Grote': {
 aanloop: [
  'In de 8e eeuw groeide het Frankische rijk uit tot de grootste macht van West-Europa. De hofmeiers uit de familie van Pippijn hadden de echte macht. In 751 liet Pippijn de Korte zich tot koning kronen, met steun van de paus.',
  'Na Pippijns dood in 768 werden zijn zonen Karel en Karloman koning. Toen Karloman in 771 stierf, regeerde Karel alleen. De Friezen waren toen al grotendeels onderworpen, maar de Saksen in het oosten nog niet.'
 ],
 verloop: [
  'Karel voerde bijna zijn hele regering oorlog. Hij versloeg de Longobarden in Italië en voerde ruim dertig jaar strijd tegen de Saksen. Rond 785 was ook het laatste vrije Friese gebied onderworpen. Op eerste kerstdag van het jaar 800 kroonde paus Leo III hem in Rome tot keizer.',
  'Karel bestuurde zijn rijk met graven en met wetten die capitularia heetten. Hij liet de Friese wetten optekenen. Aan zijn hof in Aken verzamelde hij geleerden zoals Alcuinus. Zij zorgden voor beter onderwijs en nauwkeurig overgeschreven boeken.',
  'In Nijmegen had Karel een paleis op het Valkhof. Hij stierf in 814 in Aken. Zijn kleinzonen verdeelden het rijk in 843 bij het Verdrag van Verdun.'
 ],
 cijfers: [['Koning der Franken','768'],['Keizerskroning','25 december 800'],['Saksenoorlogen','772 – 804'],['Overleden','814, Aken']],
 figuren: [['Karel de Grote','koning en keizer'],['Pippijn de Korte','vader, eerste Karolingische koning'],['Paus Leo III','kroonde hem tot keizer'],['Alcuinus','geleerde aan zijn hof']],
 bronnen: [CANON,['Wikipedia: Karel de Grote',W('Karel de Grote')],['Wikipedia: Valkhof',W('Valkhof Nijmegen')]]
},

'Vikingen plunderen Dorestad': {
 aanloop: [
  'Dorestad was in het begin van de 9e eeuw een rijke handelsplaats met een tol en een munt. Er was veel zilver, en de stad lag aan open rivieren. Grote stadsmuren had ze niet.',
  'Na de dood van Karel de Grote in 814 raakte het Frankische rijk verdeeld door ruzies tussen zijn zoon Lodewijk de Vrome en diens zonen. De kustverdediging verzwakte. Tegelijk kwamen Scandinavische krijgers met snelle schepen steeds vaker naar het zuiden.'
 ],
 verloop: [
  'In 834 overvielen Vikingen Dorestad voor het eerst. Ze plunderden de stad, doodden inwoners en namen anderen mee als slaaf. In de jaren daarna kwamen ze bijna elk jaar terug.',
  'De Frankische heersers kozen vaak voor een andere aanpak. Ze gaven Deense leiders land in leen, zodat die de kust zouden verdedigen tegen andere Vikingen. Zo kreeg de Deen Rorik rond 850 Dorestad en Friesland in bestuur. Dat bracht geen blijvende rust.',
  'Na het midden van de 9e eeuw verdween Dorestad uit de bronnen. Naast de plunderingen speelde mee dat de rivier zijn loop veranderde. De handel verplaatste zich naar plaatsen als Tiel, Deventer en Utrecht.'
 ],
 cijfers: [['Eerste plundering','834'],['Herhaalde aanvallen','834 – 837 en later'],['Rorik krijgt bestuur','ca. 850']],
 figuren: [['Lodewijk de Vrome','Frankische keizer tijdens de eerste aanvallen'],['Lotharius I','keizer, gaf Rorik land in leen'],['Rorik','Deense Vikingleider in Dorestad']],
 bronnen: [['Wikipedia: Dorestad',W('Dorestad')],['Wikipedia: Vikingen in de Lage Landen',W('Vikingen Nederland')]]
},

'Vikingkamp bij Elsloo': {
 aanloop: [
  'In de tweede helft van de 9e eeuw trokken grote Vikinglegers door West-Europa. Na hun tijd in Engeland staken zij over naar het vasteland. Het Oostfrankische rijk was verdeeld en had moeite om zich te verdedigen.',
  'In 880 voer een groot leger onder leiders als Godfried en Siegfried de Maas op. De legers kozen een winterkamp aan het water, van waaruit ze het achterland konden plunderen.'
 ],
 verloop: [
  'In 881 sloeg het leger een kamp op bij een plaats die in de bronnen Ascloha heet. De meeste historici denken aan Elsloo, maar ook Asselt bij Roermond wordt genoemd. Vandaar plunderden de Vikingen onder meer Maastricht, Luik, Tongeren, Keulen en Aken.',
  'In Aken gebruikten ze volgens de kroniek de paltskapel van Karel de Grote als paardenstal. Ook kloosters in de omgeving werden aangevallen.',
  'In 882 belegerde keizer Karel de Dikke het kamp. In plaats van te vechten kocht hij de Vikingen af met een grote hoeveelheid zilver en goud. Godfried liet zich dopen en kreeg Friesland in leen. Een paar jaar later werd hij vermoord.'
 ],
 cijfers: [['Kamp aan de Maas','881'],['Beleg door de keizer','882'],['Godfried vermoord','885']],
 figuren: [['Godfried','Vikingleider, later leenman in Friesland'],['Siegfried','Vikingleider'],['Karel de Dikke','keizer, kocht de Vikingen af']],
 bronnen: [['Wikipedia: Elsloo',W('Elsloo Limburg')],['Wikipedia: Godfried de Noorman',W('Godfried de Noorman')]]
},

'Begin van het graafschap Holland': {
 aanloop: [
  'Na de verdeling van het Frankische rijk lag het kustgebied aan de rand van het rijk. De koningen gaven verdedigers land en rechten in ruil voor trouw. Zo ontstonden lokale machthebbers die steeds zelfstandiger werden.',
  'Na de Vikingtijd was het westelijk kustgebied grotendeels in handen van plaatselijke edelen. Een van hen was Dirk, die macht had in het gebied rond de monding van de Rijn.'
 ],
 verloop: [
  'In 922 schonk de Westfrankische koning Karel de Eenvoudige aan graaf Dirk de kerk van Egmond met de bijbehorende goederen. Deze oorkonde geldt als het begin van het graafschap dat later Holland ging heten. Dirk wordt daarom Dirk I genoemd. Egmond lag in Kennemerland, het kerngebied van de latere graven.',
  'Zijn nakomelingen breidden hun gebied stap voor stap uit. Dirk II maakte rond 950 van het klooster in Egmond een benedictijnenabdij, waar de graven werden begraven. De naam Holland werd pas rond 1100 gebruikt voor het hele graafschap.',
  'Het graafschap groeide uit tot het rijkste en machtigste gewest van de Noordelijke Nederlanden. De lijn van Dirk I regeerde tot 1299.'
 ],
 cijfers: [['Oorkonde voor Dirk I','922'],['Benedictijnenabdij Egmond','ca. 950'],['Naam Holland in gebruik','ca. 1100'],['Einde Hollandse huis','1299']],
 figuren: [['Dirk I','eerste graaf'],['Karel de Eenvoudige','Westfrankische koning'],['Dirk II','graaf, vestigde de abdij van Egmond']],
 bronnen: [['Wikipedia: Graafschap Holland',W('Graafschap Holland')],['Wikipedia: Dirk I van Holland',W('Dirk I van Holland')]]
},

'Bouw Sint-Servaasbasiliek': {
 aanloop: [
  'Sint-Servaas was in de 4e eeuw bisschop van Tongeren. Volgens de overlevering stierf hij in 384 in Maastricht en werd hij begraven langs de Romeinse weg bij de Maasbrug. Boven zijn graf kwam een kapel die een bedevaartsoord werd.',
  'Maastricht lag aan de Maas en op de weg naar Keulen. Daardoor kwamen er veel pelgrims, en de stad werd een belangrijk kerkelijk centrum. De houten en kleinere stenen kerken werden steeds te klein.'
 ],
 verloop: [
  'Rond het jaar 1000 begon de bouw van een grote romaanse kerk. In de 11e en 12e eeuw werd die steeds verder uitgebreid, met onder meer een machtig westwerk. De kerk was een kapittelkerk en had nauwe banden met de Duitse keizers.',
  'In de schatkamer liggen belangrijke stukken, zoals de Noodkist, een groot reliekschrijn uit de 12e eeuw. Eens in de zeven jaar trokken pelgrims naar Maastricht voor de Heiligdomsvaart, waarbij de relieken werden getoond.',
  'In latere eeuwen kwamen er gotische delen bij. In 1985 kreeg de kerk de titel basiliek. Ze geldt als een van de oudste en belangrijkste kerken van Nederland. Naast de basiliek staat de gotische Sint-Janskerk.'
 ],
 cijfers: [['Overlijden Sint-Servaas','384 (volgens de overlevering)'],['Begin romaanse kerk','ca. 1000'],['Heiligdomsvaart','eens in de 7 jaar'],['Titel basiliek','1985']],
 figuren: [['Sint-Servaas','bisschop van Tongeren, beschermheilige van Maastricht'],['Paus Johannes Paulus II','verleende de titel basiliek']],
 bronnen: [['Wikipedia: Sint-Servaasbasiliek',W('Sint-Servaasbasiliek')],['Wikipedia: Servatius',W('Servatius')]]
},

'Slag bij Vlaardingen': {
 aanloop: [
  'Rond 1000 was het rivierengebied een drukke handelsroute. Kooplieden uit Tiel voeren via de Maas en de Merwede naar Engeland. Zij stonden onder bescherming van de Duitse keizer en de bisschop van Utrecht. Tol heffen was een recht van de koning.',
  'Graaf Dirk III wilde zijn gebied uitbreiden naar het oosten. Hij bouwde een versterking bij Vlaardingen en begon tol te heffen op de schepen. De kooplieden en de bisschop klaagden bij keizer Hendrik II.'
 ],
 verloop: [
  'De keizer stuurde een leger onder hertog Godfried van Neder-Lotharingen. Op 29 juli 1018 viel dat leger de stelling van Dirk aan. De keizerlijke troepen raakten verstrikt in het drassige land tussen de kreken.',
  'De Friese en Hollandse mannen van Dirk kenden het terrein en wonnen. Volgens de kroniekschrijver Alpertus van Metz sneuvelden veel keizerlijke soldaten en werd de hertog gevangengenomen.',
  'Dirk mocht daarna de tol houden. De slag liet zien dat de keizer weinig greep had op het moerassige westen. De graven van Holland werden er machtiger door. Het rivierengebied rond Dordrecht kwam zo steeds meer onder hun invloed.'
 ],
 cijfers: [['Datum','29 juli 1018'],['Plaats','bij Vlaardingen, aan de Maas'],['Resultaat','tolrecht voor Dirk III']],
 figuren: [['Dirk III','graaf, overwinnaar'],['Godfried II van Neder-Lotharingen','hertog, leider keizerlijk leger'],['Hendrik II','Duitse keizer'],['Alpertus van Metz','kroniekschrijver']],
 bronnen: [['Wikipedia: Slag bij Vlaardingen',W('Slag bij Vlaardingen 1018')],['Wikipedia: Dirk III van Holland',W('Dirk III van Holland')]]
},

'Hebban olla vogala': {
 aanloop: [
  'In de middeleeuwen schreven geleerden vooral in het Latijn. De volkstaal werd zelden opgeschreven. Daardoor zijn er uit de vroege middeleeuwen maar weinig teksten in het Oudnederlands bewaard, zoals de Wachtendonckse Psalmen.',
  'In kloosters oefenden monniken soms hun pen op de laatste bladzijden van een handschrift. Zo’n pennenprobeersel kon een losse zin zijn, een gebed of een liedregel.'
 ],
 verloop: [
  'In een Latijns handschrift uit een Engels klooster, waarschijnlijk in Rochester, schreef een monnik een korte zin in de volkstaal. Daarin staat dat alle vogels met hun nesten zijn begonnen, behalve ik en jij, met de vraag waar we op wachten. Een Latijnse versie staat erbij.',
  'De tekst werd in 1932 ontdekt door de Engelse geleerde Kenneth Sisam in de Bodleian Library in Oxford. De taal wijst op een West-Vlaamse schrijver. Over de datering verschillen de meningen: de lijst houdt ca. 1075 aan, de Canon spreekt van ca. 1100.',
  'Het zinnetje is niet de oudste Nederlandse tekst, maar wel de bekendste. Het gaat waarschijnlijk over liefde, al zijn er ook andere uitleggingen. Het staat symbool voor het begin van de Nederlandse literatuur.'
 ],
 cijfers: [['Datering','laat 11e eeuw'],['Ontdekt','1932'],['Bewaard','Bodleian Library, Oxford'],['Dialect','West-Vlaams']],
 figuren: [['Onbekende Vlaamse monnik','schrijver van de zin'],['Kenneth Sisam','ontdekker van de tekst']],
 bronnen: [CANON,['Wikipedia: Hebban olla vogala',W('Hebban olla vogala')],['DBNL','https://www.dbnl.org/']]
},

'Abdij Rolduc gesticht': {
 aanloop: [
  'Rond 1100 ontstonden in heel Europa nieuwe kloosters. Veel geestelijken wilden een strenger en eenvoudiger leven leiden. Het gebied rond Kerkrade hoorde toen bij het Land van Rode. Dat kwam later bij het hertogdom Limburg.',
  'De priester Ailbertus kwam uit de omgeving van Doornik. Hij zocht een plek om met gelijkgezinden een religieuze gemeenschap te stichten.'
 ],
 verloop: [
  'In 1104 stichtte Ailbertus op een heuvel bij Kerkrade een klooster. Het kreeg de naam Kloosterrade. Later werd dat Rolduc. De bewoners werden koorheren die volgens de regel van Augustinus leefden.',
  'Al in 1108 werd de crypte ingewijd. In de 12e eeuw verrees een romaanse kerk, en de abdij kreeg grond en rechten in de omgeving. In de kroniek van het klooster, de Annales Rodenses, staat veel over de geschiedenis van de streek.',
  'Na de Franse inval aan het eind van de 18e eeuw werd de abdij opgeheven. Later werd het gebouw een seminarie en een school. Generaties priesters en leerlingen uit de streek kregen er onderwijs. Rolduc is een van de grootste abdijcomplexen van Nederland. Tegenwoordig is het ook een conferentiecentrum.'
 ],
 cijfers: [['Gesticht','1104'],['Crypte ingewijd','1108'],['Opheffing abdij','eind 18e eeuw']],
 figuren: [['Ailbertus van Antoing','priester, stichter'],['Koorheren van Augustinus','bewoners van de abdij']],
 bronnen: [['Wikipedia: Rolduc',W('Rolduc')],['Wikipedia: Annales Rodenses',W('Annales Rodenses')]]
},

'De Rijn wordt afgedamd': {
 aanloop: [
  'In de 11e en 12e eeuw groeide de bevolking snel. Boeren begonnen de grote veengebieden in Holland en Utrecht te ontginnen. Ze groeven sloten om het veen te ontwateren, waardoor de grond inklonk en lager kwam te liggen.',
  'Daardoor kreeg het land steeds meer last van rivierwater. Overstromingen kwamen vaker voor. De Kromme Rijn, die vanaf Wijk bij Duurstede naar Utrecht liep, voerde steeds minder water af en zorgde voor overlast.'
 ],
 verloop: [
  'In 1122 werd de Kromme Rijn bij Wijk bij Duurstede afgedamd. Het Rijnwater ging voortaan vooral via de Lek naar zee. Dat jaar kreeg Utrecht ook stadsrechten van keizer Hendrik V.',
  'Bewoners legden overal dijken en dammen aan. Ze werkten samen om die te onderhouden. Uit die samenwerking ontstonden later de waterschappen. De oude Rijnmonding bij Katwijk was al eerder verzand. Water uit het binnenland kon daar niet meer goed weg.',
  'Het afdammen van rivieren leidde soms tot ruzie. Wie stroomafwaarts woonde, profiteerde, maar anderen kregen juist meer water. Toch markeert deze tijd het begin van het grootschalige waterbeheer in Nederland.'
 ],
 cijfers: [['Dam bij Wijk bij Duurstede','1122'],['Stadsrechten Utrecht','1122'],['Grote veenontginningen','ca. 1000 – 1300']],
 figuren: [['Hendrik V','Duitse keizer, gaf Utrecht stadsrechten'],['Bisschoppen van Utrecht','landsheren van het Sticht']],
 bronnen: [['Wikipedia: Kromme Rijn',W('Kromme Rijn')],['Wikipedia: Veenontginning',W('Veenontginning')]]
},

'Allerheiligenvloed': {
 aanloop: [
  'In de middeleeuwen lag midden in Nederland een groot binnenmeer, het Almere. Het was via rivieren en kreken met de zee verbonden. Aan de noordkant beschermden duinen en veengebieden het land.',
  'Door ontginning en inklinking kwam het veen steeds lager te liggen. Daardoor kon zeewater bij een storm makkelijker het land in stromen. Dijken waren er nog weinig, en ze waren laag. Een zware storm kon daardoor grote schade aanrichten.'
 ],
 verloop: [
  'Op 1 november 1170, Allerheiligen, trof een zware stormvloed de kust. Volgens kronieken kwam het water tot aan Utrecht. Grote stukken veen in het noorden werden weggeslagen. Dorpen en akkers verdwenen onder water.',
  'Het Almere kreeg daardoor een bredere verbinding met de Waddenzee. In de eeuwen erna sloegen nieuwe stormvloeden steeds meer land weg. Zo groeide het binnenmeer uit tot de Zuiderzee.',
  'Hoeveel slachtoffers er vielen, is niet bekend. De Allerheiligenvloed van 1170 is een van de eerste stormvloeden waarvan de gevolgen voor het landschap goed zichtbaar zijn. Pas in de 20e eeuw werd de Zuiderzee met de Afsluitdijk afgesloten.'
 ],
 cijfers: [['Datum','1 november 1170'],['Vorming Zuiderzee','12e – 13e eeuw'],['Afsluiting Zuiderzee','1932']],
 figuren: [['Kroniekschrijvers','beschreven de vloed'],['Bewoners van het veengebied','verloren land aan de zee']],
 bronnen: [['Wikipedia: Allerheiligenvloed 1170',W('Allerheiligenvloed 1170')],['Wikipedia: Zuiderzee',W('Zuiderzee')]]
},

'Eerste vermelding Amsterdam': {
 aanloop: [
  'Rond 1200 woonden aan de monding van de Amstel in het IJ vissers en boeren. Om het land te beschermen werd een dam in de rivier gelegd. Bij die dam ontstond een kleine nederzetting.',
  'Het gebied lag tussen Holland en het Sticht Utrecht. Graaf Floris V van Holland wilde zijn greep op de streek versterken, onder meer tegen de heren van Amstel.'
 ],
 verloop: [
  'Op 27 oktober 1275 gaf Floris V de mensen die bij de Amsteldam woonden een tolprivilege. Zij hoefden geen tol meer te betalen in Holland. In deze oorkonde komt de naam Amstelledamme voor. Het is de oudste bekende vermelding van Amsterdam.',
  'Door de tolvrijheid konden de bewoners goedkoop handel drijven. De plaats groeide snel. Vooral de handel in bier uit Hamburg en in vis was belangrijk. Rond 1300 kreeg Amsterdam stadsrechten van de bisschop van Utrecht.',
  'In de eeuwen erna werd Amsterdam een belangrijke handelsstad. In de 17e eeuw was het een van de grootste havens ter wereld. Het originele tolprivilege wordt bewaard in het Amsterdamse Stadsarchief. In 2025 vierde de stad zijn 750e verjaardag.'
 ],
 cijfers: [['Tolprivilege','27 oktober 1275'],['Stadsrechten','ca. 1300'],['750 jaar Amsterdam','2025']],
 figuren: [['Floris V','graaf van Holland, gaf het privilege'],['Gijsbrecht van Amstel','heer van Amstel, tijdgenoot']],
 bronnen: [['Wikipedia: Geschiedenis van Amsterdam',W('Geschiedenis van Amsterdam')],['Wikipedia: Tolprivilege 1275',W('Tolprivilege 1275 Amsterdam')]]
},

'Sint-Servaasbrug': {
 aanloop: [
  'Al sinds Romeinse tijd stak een weg bij Maastricht de Maas over. Zo’n brug was belangrijk voor handel en pelgrims. Maastricht lag op de route tussen Keulen en Brabant.',
  'In de middeleeuwen stond er een houten brug. Volgens de overlevering stortte die in 1275 in tijdens een processie, waarbij veel mensen in de rivier verdronken.'
 ],
 verloop: [
  'Kort daarna begon de bouw van een stenen brug. Tussen ongeveer 1280 en 1298 werd die gebouwd van natuursteen. De brug verbond het centrum van Maastricht met de wijk Wyck op de oostoever.',
  'De brug werd vernoemd naar Sint-Servaas, de beschermheilige van de stad. Met haar lengte van ongeveer 160 meter was ze voor die tijd een groot bouwwerk. Brugtol leverde de stad inkomsten op. Wie de brug overstak, moest betalen.',
  'In de loop van de eeuwen werd de brug meerdere keren beschadigd en hersteld, onder meer in de Tweede Wereldoorlog. Delen werden aangepast voor de scheepvaart. Ze is de oudste brug van Nederland die nog in gebruik is. Fietsers en voetgangers steken er dagelijks de Maas over.'
 ],
 cijfers: [['Bouw','ca. 1280 – 1298'],['Lengte','ca. 160 m'],['Instorting houten brug','1275 (volgens de overlevering)']],
 figuren: [['Sint-Servaas','beschermheilige van Maastricht, naamgever'],['Maastrichtse stadsbestuur','beheerde brug en tol']],
 bronnen: [['Wikipedia: Sint-Servaasbrug',W('Sint-Servaasbrug')],['Wikipedia: Maastricht',W('Geschiedenis van Maastricht')]]
},

'Slag bij Woeringen': {
 aanloop: [
  'Het hertogdom Limburg lag rond de stad Limbourg, in het huidige België. Ook het Land van ’s-Hertogenrade rond Kerkrade hoorde erbij. In 1280 stierf de laatste hertog uit het oude geslacht. Zijn dochter Ermengarde was getrouwd met graaf Reinoud I van Gelre.',
  'Toen Ermengarde in 1283 kinderloos stierf, wilde Reinoud het hertogdom houden. Graaf Adolf van Berg had ook een claim. Hij verkocht die aan hertog Jan I van Brabant. Reinoud kreeg steun van de aartsbisschop van Keulen en de graaf van Luxemburg.'
 ],
 verloop: [
  'Op 5 juni 1288 troffen de legers elkaar bij Woeringen, tussen Keulen en Neuss. Aan Brabantse kant vochten ook de graaf van Berg en burgers uit Keulen, die zich wilden bevrijden van hun aartsbisschop.',
  'Het werd een van de grootste ridderslagen van die tijd. Jan I won. De graaf van Luxemburg sneuvelde, en de aartsbisschop en Reinoud van Gelre werden gevangengenomen.',
  'Limburg kwam daarna in handen van de hertog van Brabant. Keulen werd zo goed als onafhankelijk van zijn aartsbisschop. Jan I werd in liederen en kronieken bezongen als held.'
 ],
 cijfers: [['Datum','5 juni 1288'],['Plaats','Woeringen, bij Keulen'],['Gevolg','Limburg onder Brabant']],
 figuren: [['Jan I van Brabant','hertog, overwinnaar'],['Reinoud I van Gelre','graaf, verliezer'],['Siegfried van Westerburg','aartsbisschop van Keulen'],['Hendrik VI van Luxemburg','graaf, sneuvelde']],
 bronnen: [['Wikipedia: Slag bij Woeringen',W('Slag bij Woeringen')],['Wikipedia: Hertogdom Limburg',W('Hertogdom Limburg')]]
},

'Floris V vermoord': {
 aanloop: [
  'Floris V werd in 1254 geboren en was al als kind graaf van Holland. Zijn vader Willem II sneuvelde in 1256 in West-Friesland. Floris versterkte het gezag van de graaf en veroverde tussen 1282 en 1289 West-Friesland.',
  'Hij steunde steden en boeren, en gaf privileges zoals de tolvrijheid voor Amsterdam. Dat ging vaak ten koste van de edelen, die hem spottend de god der kerels noemden. In de internationale politiek wisselde hij in 1296 van Engeland naar Frankrijk, wat hem vijanden opleverde.'
 ],
 verloop: [
  'Een groep edelen, onder wie Gerard van Velsen, Herman van Woerden en Gijsbrecht van Amstel, smeedde een complot. Waarschijnlijk had de Engelse koning er de hand in. Op 23 juni 1296 werd Floris bij Utrecht ontvoerd en naar het Muiderslot gebracht.',
  'Toen boeren uit de omgeving hem probeerden te bevrijden, sloegen de ontvoerders op de vlucht. Op 27 juni 1296 werd Floris bij Muiderberg doodgestoken.',
  'De moord werd later een geliefd onderwerp. P.C. Hooft en Joost van den Vondel schreven er toneelstukken over. Na de dood van Floris’ zoon in 1299 eindigde het Hollandse gravenhuis.'
 ],
 cijfers: [['Geboren','1254'],['Ontvoering','23 juni 1296'],['Dood','27 juni 1296'],['Verovering West-Friesland','1282 – 1289']],
 figuren: [['Floris V','graaf van Holland'],['Gerard van Velsen','edelman, samenzweerder'],['Gijsbrecht van Amstel','edelman, samenzweerder'],['Edward I','Engelse koning, mogelijk betrokken']],
 bronnen: [['Wikipedia: Floris V',W('Floris V van Holland')],['Wikipedia: Muiderslot',W('Muiderslot')]]
},

'De pest': {
 aanloop: [
  'In het midden van de 14e eeuw bereikte een pestepidemie Europa vanuit Centraal-Azië. In 1347 kwam de ziekte via handelsschepen in Sicilië en andere havens aan. Daarna verspreidde ze zich snel langs handelsroutes, over land en over zee.',
  'De pest werd veroorzaakt door een bacterie die via vlooien en mogelijk ook van mens op mens werd overgebracht. Niemand wist toen hoe de ziekte ontstond. Velen zagen haar als straf van God. Anderen zochten de oorzaak in slechte lucht of in de stand van de sterren.'
 ],
 verloop: [
  'In 1349 en 1350 bereikte de Zwarte Dood de Lage Landen. Mensen kregen koorts en pijnlijke builen en stierven vaak binnen enkele dagen. In Europa stierf naar schatting een derde tot de helft van de bevolking.',
  'Voor de Lage Landen zijn de cijfers onzeker. Sommige plaatsen werden zwaar getroffen, andere minder. Er trokken boetelingen rond die zichzelf geselden. In het Rijnland en elders werden Joden ten onrechte beschuldigd en vervolgd.',
  'De pest keerde tot in de 17e eeuw steeds terug. Door het grote aantal doden werden arbeidskrachten schaars. Daardoor stegen in veel gebieden de lonen en veranderde de samenleving.'
 ],
 cijfers: [['Aankomst in Europa','1347'],['Lage Landen','1349 – 1350'],['Sterfte in Europa','naar schatting 30 – 50%']],
 figuren: [['Geselbroeders','boetelingen die rondtrokken'],['Artsen en geestelijken','zochten tevergeefs naar verklaringen']],
 bronnen: [['Wikipedia: Zwarte Dood',W('Zwarte Dood')],['Wikipedia: Pest (ziekte)',W('Pest ziekte')]]
},

'Hoeken en Kabeljauwen': {
 aanloop: [
  'In 1345 sneuvelde graaf Willem IV van Holland zonder zoon. Zijn zus Margaretha, getrouwd met de Duitse keizer Lodewijk van Beieren, werd gravin. Zij liet het bestuur deels over aan haar zoon Willem.',
  'Over de vraag wie de echte macht moest hebben, ontstond ruzie. Edelen en steden kozen partij, ook om hun eigen belangen te beschermen.'
 ],
 verloop: [
  'In 1350 ontstonden twee partijen. De Hoeken steunden Margaretha, de Kabeljauwen haar zoon Willem V. Waar de namen vandaan komen, is niet zeker. Een bekende uitleg is dat de kabeljauw groot wordt door kleine vissen te eten, en de hoek een vishaak is waarmee je hem vangt.',
  'In 1351 won Willem een zeeslag bij Zwartewaal tegen de vloot van zijn moeder. Margaretha deed afstand van Holland en Zeeland. Daarmee was de ruzie niet voorbij. De partijen bleven bestaan en botsten in de steden steeds opnieuw.',
  'De twisten laaiden steeds opnieuw op, bijvoorbeeld in de strijd van Jacoba van Beieren tegen de Bourgondiërs. Pas aan het eind van de 15e eeuw kwam er een einde aan.'
 ],
 cijfers: [['Begin','1350'],['Zeeslag bij Zwartewaal','1351'],['Einde van de twisten','eind 15e eeuw']],
 figuren: [['Margaretha van Beieren','gravin, gesteund door de Hoeken'],['Willem V','graaf, gesteund door de Kabeljauwen'],['Jacoba van Beieren','gravin, later gesteund door de Hoeken']],
 bronnen: [['Wikipedia: Hoekse en Kabeljauwse twisten',W('Hoekse en Kabeljauwse twisten')],['Wikipedia: Margaretha van Beieren',W('Margaretha van Beieren 1311')]]
},

'De Hanze': {
 aanloop: [
  'In de 12e en 13e eeuw groeide de handel tussen de Noordzee en de Oostzee. Duitse kooplieden sloten zich aaneen om elkaar te beschermen tegen piraten en om samen handelsrechten te krijgen in vreemde steden.',
  'Uit deze verbonden van kooplieden groeide een netwerk van steden, met Lübeck als belangrijkste stad. De IJssel was een belangrijke route van het Rijnland naar de Zuiderzee en verder.'
 ],
 verloop: [
  'In 1356 kwamen afgevaardigden voor het eerst bijeen op een Hanzedag in Lübeck. Daarna wordt meestal van een stedenverbond gesproken. Aan het verbond deden tientallen steden mee, onder meer Deventer, Kampen, Zwolle, Zutphen, Harderwijk en Groningen. Ook Roermond en Venlo rekenen zich tot de Hanzesteden.',
  'De Hanze had kantoren in Brugge, Londen, Bergen en Novgorod. Schepen zoals de kogge vervoerden graan, hout, bont, vis, zout, laken en wijn. De IJsselsteden werden er rijk van, wat nog te zien is aan hun kerken en koopmanshuizen.',
  'In de 15e eeuw nam de macht van de Hanze af. Hollandse steden als Amsterdam voeren zelf rechtstreeks naar de Oostzee en werden belangrijke concurrenten.'
 ],
 cijfers: [['Eerste Hanzedag','1356, Lübeck'],['Kantoren','Brugge, Londen, Bergen, Novgorod'],['Bloeitijd IJsselsteden','14e – 15e eeuw']],
 figuren: [['Kooplieden van Lübeck','leidende kracht van de Hanze'],['IJsselsteden','Deventer, Kampen en Zwolle']],
 bronnen: [CANON,['Wikipedia: Hanze',W('Hanze')],['Wikipedia: Hanzesteden',W('Lijst van hanzesteden')]]
},

'De Bourgondiërs nemen over': {
 aanloop: [
  'Aan het eind van de 14e eeuw verwierven de hertogen van Bourgondië via huwelijken Vlaanderen en Artesië. Hun doel was een groot rijk tussen Frankrijk en het Duitse Rijk. Filips de Goede, hertog vanaf 1419, zette die politiek voort.',
  'In 1417 stierf graaf Willem VI van Holland. Zijn enige dochter Jacoba van Beieren erfde Holland, Zeeland en Henegouwen. Haar oom Jan van Beieren betwistte haar rechten, en de Hoeken en Kabeljauwen kozen opnieuw partij.'
 ],
 verloop: [
  'Jacoba trouwde meerdere keren, onder meer met de hertog van Brabant en met een Engelse prins, in de hoop op steun. Filips de Goede, haar neef, greep in. Er volgden jaren van oorlog, met onder meer de slag bij Brouwershaven in 1426.',
  'In 1428 moest Jacoba de Zoen van Delft tekenen. Ze bleef gravin in naam, maar Filips werd ruwaard en erfgenaam. In 1433 deed ze definitief afstand van haar gebieden. Ze stierf in 1436.',
  'Filips verwierf ook Namen, Brabant en Limburg, en later Luxemburg. Zo kwamen de meeste Nederlanden onder één vorst. Dat legde de basis voor gezamenlijk bestuur, zoals de Staten-Generaal vanaf 1464.'
 ],
 gevolgen: [
  "Filips de Goede bracht de meeste Nederlandse gewesten bijeen onder één vorst, maar hij liet ze hun eigen rechten en Staten houden. Wel kwamen er gezamenlijke dingen: vanaf 1434 één munt voor meerdere gewesten, en vanaf 1464 de Staten-Generaal, waar afgevaardigden uit de gewesten samenkwamen.",
  "Het Bourgondische hof werd het rijkste van Europa. Filips stichtte in 1430 in Brugge de Orde van het Gulden Vlies, een gezelschap van de belangrijkste edelen. Kunstenaars als Jan van Eyck werkten voor hem. De steden van Vlaanderen, Brabant en later Holland bloeiden door handel en nijverheid."
 ],
 perspectieven: [
  "Voor Jacoba van Beieren was de komst van de Bourgondiërs het verlies van haar erfenis. Ze werd gevangengezet en moest afstand doen van haar landen. In de verhalen werd zij later een tragische heldin, en Filips de schurk.",
  "Ook buiten de Nederlanden speelde Filips een grote rol. In 1430 namen zijn troepen bij Compiègne Jeanne d’Arc gevangen. Hij leverde haar uit aan de Engelsen, zijn bondgenoten in de oorlog tegen Frankrijk. Zij werd een jaar later in Rouen verbrand."
 ],
 misverstanden: [
  ["“Jacoba deed afstand omdat ze in het geheim trouwde met Frank van Borssele.”","Dat verhaal is een legende. Jacoba deed met Pasen 1433 afstand van haar landen. Pas in november van dat jaar was er sprake van een huwelijk met Van Borssele, en het huwelijk werd in 1434 gesloten."],
  ["“Bourgondisch leven betekent gewoon lekker eten.”","Het woord “Bourgondisch” verwijst naar het weelderige hof van de hertogen, met grote feesten, prachtige kleding en kunst. Die pracht was ook politiek: de hertog liet zien hoe machtig en rijk hij was."]
 ],
 hoeWeten: [
  "Er zijn verdragen, oorkonden en rekeningen van het Bourgondische hof bewaard, waarin precies staat wat er werd uitgegeven aan feesten, kleding en kunst. Kroniekschrijvers aan het hof beschreven de gebeurtenissen, natuurlijk vanuit het standpunt van de hertog. Over Jacoba gingen al snel verhalen rond die meer legende dan geschiedenis zijn."
 ],
 nu: [
  "In de gracht van Slot Teylingen bij Voorhout werden in de 17e eeuw veel middeleeuwse kannetjes opgebaggerd. Ze heten nog altijd Jacobakannetjes. De Orde van het Gulden Vlies bestaat nog steeds. De Staten-Generaal, die in 1464 voor het eerst bijeenkwamen, is nu de naam van het Nederlandse parlement."
 ],
 vertellen: "In 1425 zat Jacoba gevangen in Gent. Ze zei dat ze niet gestoord wilde worden omdat ze een bad ging nemen. In die tijd trokken zij en haar kamenier mannenkleren aan en liepen zo, vermomd, het gebouw uit. Ze vluchtte naar Holland en zette de strijd tegen Filips voort.",
 verbanden: [["Hoeken en Kabeljauwen","de partijstrijd die Jacoba en Filips verdeelde"],["Maria van Bourgondië","de kleindochter van Filips en laatste Bourgondische erfgenaam"],["Karel V en het Verdrag van Venlo","de Habsburgers maakten de eenwording af"]],
 onderwijs: {"ka":["Het begin van staatsvorming en centralisatie."]},
 cijfers: [['Zoen van Delft','1428'],['Afstand Jacoba','1433'],['Brabant en Limburg Bourgondisch','1430'],['Eerste Staten-Generaal','1464']],
 figuren: [['Jacoba van Beieren','gravin van Holland, Zeeland en Henegouwen'],['Filips de Goede','hertog van Bourgondië'],['Jan van Beieren','oom van Jacoba, tegenstander']],
 bronnen: [['Wikipedia: Jacoba van Beieren',W('Jacoba van Beieren')],['Wikipedia: Filips de Goede',W('Filips de Goede')],['Wikipedia: Zoen van Delft',W('Zoen van Delft')]]
},

'Boekdrukkunst': {
 aanloop: [
  'Vóór de boekdrukkunst werden boeken met de hand overgeschreven. Dat kostte veel tijd, dus boeken waren zeldzaam en duur. Van een handgeschreven boek bestonden vaak maar enkele tientallen of honderden exemplaren.',
  'Vanaf ongeveer het jaar 1000 werd er in Europa ook gedrukt met houtblokken, waarin een hele bladzijde was uitgesneden. Dat was veel werk en het blok sleet snel. Voor een dik boek was het niet geschikt.'
 ],
 verloop: [
  'Rond 1450 vond Johannes Gutenberg uit Mainz een manier om te drukken met losse letters. Hij goot de letters in metaal, in grote aantallen en allemaal precies even hoog. Die letters konden steeds opnieuw worden gebruikt voor een andere tekst.',
  'Zijn bekendste werk is de bijbel die in 1455 klaar was, de Gutenbergbijbel. Een drukker kon nu al snel duizenden exemplaren van een boek maken. Boeken werden goedkoper, en kennis en nieuwe ideeën verspreidden zich veel sneller. Ook Erasmus liet zijn werk drukken.',
  'In Nederland leerden kinderen eeuwenlang dat de Haarlemmer Laurens Janszoon Coster het drukken met losse letters al rond 1423 had bedacht. Dat verhaal komt uit de 16e eeuw en is waarschijnlijk een legende. Of Coster echt zo heeft bestaan, weten we niet zeker. Zijn standbeeld staat op de Grote Markt in Haarlem.'
 ],
 perspectieven: [
  'Gutenberg was niet de eerste die met losse letters drukte. De Chinees Bì Shēng zou al in de 11e eeuw Chinese tekens hebben gedrukt. Er is geen bewijs dat Gutenberg van die uitvinding wist. Het Latijnse alfabet heeft maar enkele tientallen letters, wat drukken met losse letters in Europa makkelijker maakte.'
 ],
 gevolgen: [
  "De drukkunst verspreidde zich razendsnel. Boeken die vóór 1501 zijn gedrukt, heten wiegendrukken of incunabelen. Er zijn er ongeveer 29.000 verschillende bekend. In de Nederlanden waren al snel drukkers in Utrecht, Deventer, Gouda, Delft en Zwolle. In 1477 verscheen in Delft het eerste gedrukte boek in het Nederlands: de Delftse Bijbel.",
  "Doordat dezelfde tekst in veel exemplaren rondging, werden spelling en taal geleidelijk eenvormiger. Kennis kon makkelijker gecontroleerd en verbeterd worden. En nieuwe ideeën, zoals die van Luther, verspreidden zich in weken in plaats van jaren."
 ],
 misverstanden: [
  ["“Na de uitvinding kon iedereen boeken kopen en lezen.”","Boeken werden goedkoper, maar bleven voor de meeste mensen duur, en de meeste mensen konden niet lezen. Wel kwamen er goedkope pamfletten, almanakken en liedblaadjes, die veel meer mensen bereikten."],
  ["“De Gutenbergbijbel werd in grote aantallen gedrukt.”","Gutenberg drukte er waarschijnlijk zo’n 180, de meeste op papier en ongeveer dertig op perkament. Er zijn er nog 49 bekend. Het enige exemplaar in de Benelux ligt in de universiteitsbibliotheek van Bergen (Mons) in België."]
 ],
 hoeWeten: [
  "Er zijn duizenden wiegendrukken bewaard, waaraan je kunt zien hoe drukkers werkten: welke letters ze hadden, welke fouten ze maakten en hoe ze de bladzijden opmaakten. Ook rechtszaken over geld, waarin Gutenberg voorkomt, zijn bewaard. Daaruit weten we iets over zijn werkplaats, want over zijn leven is weinig bekend."
 ],
 nu: [
  "In Mainz staat het Gutenberg-Museum. De Koninklijke Bibliotheek in Den Haag heeft een grote verzameling Nederlandse wiegendrukken. In Haarlem staat het standbeeld van Laurens Janszoon Coster nog altijd op de Grote Markt, als herinnering aan een verhaal dat lang een bron van trots was."
 ],
 vertellen: "In een gedrukt boek zie je de letters niet zomaar staan: elke letter was een los metalen blokje, in spiegelbeeld. Een zetter pakte ze één voor één uit een bak en zette ze in een regel. De hoofdletters lagen in het bovenste deel van de letterkast, de kleine letters in het onderste. Daarom spreken drukkers nog altijd van “bovenkast” en “onderkast”.",
 verbanden: [["Erasmus","de eerste schrijver die echt beroemd werd door de drukpers"],["Luther en de Reformatie","zijn ideeën verspreidden zich via drukwerk"],["Statenbijbel","een gedrukte Bijbel die de Nederlandse taal beïnvloedde"]],
 onderwijs: {"ka":["Het veranderende mens- en wereldbeeld van de renaissance en het begin van een nieuwe wetenschappelijke belangstelling. (tijdvak 5)"]},
 cijfers: [['Uitgevonden','ca. 1450, Mainz'],['Gutenbergbijbel','voltooid in 1455'],['Oplage handschrift','tientallen tot honderden'],['Oplage drukwerk','al snel duizenden']],
 figuren: [['Johannes Gutenberg','uitvinder van het drukken met losse letters in Europa'],['Laurens Janszoon Coster','Haarlemse koster uit de legende'],['Bì Shēng','Chinees die al in de 11e eeuw drukte met losse tekens']],
 bronnen: [['Wikipedia: Boekdrukkunst',W('Boekdrukkunst')],['Wikipedia: Johannes Gutenberg',W('Johannes Gutenberg')],['Wikipedia: Laurens Janszoon Coster',W('Laurens Janszoon Coster')]]
},

'Jan van Eyck en het Lam Gods': {
 aanloop: [
  'Jan van Eyck werd rond 1390 geboren in Maaseik. Hij werkte vooral in Brugge, in de tijd van de Bourgondische hertogen.',
  'Hij stond al vroeg bekend als de “uitvinder” van de olieverfschilderkunst. Dat is een mythe, want olieverf bestond al. Maar zijn verfijnde techniek en zijn blik op de zichtbare werkelijkheid werden snel in heel Europa nagevolgd.'
 ],
 verloop: [
  'In 1432 was het veelluik Het Lam Gods klaar, voor de Sint-Baafskathedraal in Gent. Het werk wordt ook toegeschreven aan zijn broer Hubert. Als het luik openstaat, zie je veel panelen, met in het midden een weide waar mensen naar het lam toe lopen, dat voor Christus staat.',
  'Van Eyck schilderde zeer nauwkeurig: stoffen, juwelen, planten en glanzende oppervlakken. Hij signeerde en dateerde negen werken, soms op de lijst of verborgen in het schilderij zelf.',
  'Het Lam Gods hangt nog steeds in de kathedraal in Gent. Van Eyck overleed op 9 juli 1441 in Brugge.'
 ],
 gevolgen: [
  "Van Eyck liet zien hoe je met dunne, doorschijnende lagen olieverf licht, glans en diepte kon schilderen. Schilders in heel Europa, ook in Italië, bewonderden die techniek. Werk van Vlaamse schilders werd een gewild product voor rijke kopers.",
  "Hij schilderde ook portretten van gewone, rijke burgers, zoals het beroemde portret van het echtpaar Arnolfini uit 1434, nu in Londen. Op de achterwand schreef hij in het Latijn: “Jan van Eyck was hier”. In de spiegel achter het paar zijn twee kleine figuurtjes te zien, misschien de schilder zelf."
 ],
 perspectieven: [
  "Het Lam Gods werd niet besteld door een vorst of een bisschop, maar door de Gentse koopman en politicus Joos Vijd en zijn vrouw Lysbette Borluut. Op de buitenkant van de luiken zitten ze geknield in gebed. Zo lieten rijke burgers zien hoe vroom en hoe belangrijk ze waren.",
  "Van Eyck was ook hofschilder en diplomaat van Filips de Goede. In 1428 reisde hij naar Portugal om een portret te maken van prinses Isabella, met wie de hertog wilde trouwen."
 ],
 misverstanden: [
  ["“De Vlaamse Primitieven waren nog primitieve schilders.”","De naam “Vlaamse Primitieven” werd pas in de 19e eeuw bedacht. “Primitief” betekent hier “de eersten”: zij stonden aan het begin van een nieuwe manier van schilderen. Hun techniek was juist uiterst verfijnd."],
  ["“Van Eyck werd zeker in Maaseik geboren.”","Zijn naam wijst op Maaseik, en zijn dochter ging daar later in het klooster. Maar het is niet zeker. Ook andere plaatsen in het toenmalige bisdom Luik worden genoemd, waaronder Maastricht."]
 ],
 hoeWeten: [
  "Op de lijst van het Lam Gods staat een gedicht, een kwatrijn, dat zegt dat Hubert van Eyck het werk begon en zijn broer Jan het in 1432 afmaakte. Van Hubert is verder bijna niets bekend. Bij de restauratie die in 2012 begon, onderzochten specialisten het werk met röntgenfoto’s en scans. Ze ontdekten dat grote delen later waren overgeschilderd."
 ],
 nu: [
  "Het Lam Gods hangt in de Sint-Baafskathedraal in Gent. Bij de restauratie kwam onder de overschildering het oorspronkelijke lam tevoorschijn, met een opvallend menselijk gezicht en vooruitkijkende ogen. Dat leverde in 2020 veel verbaasde reacties op. Volgens onderzoekers is de vrucht in de hand van Eva geen appel, maar een zeldzame citrusvrucht."
 ],
 vertellen: "Het Lam Gods wordt wel het meest gestolen kunstwerk ter wereld genoemd. In 1566 werd het in de toren verstopt voor de beeldenstormers. Napoleon nam het mee naar Parijs, en de nazi’s verborgen het in een zoutmijn in Oostenrijk. In 1934 werden twee panelen gestolen. Een ervan, De Rechtvaardige Rechters, is nooit teruggevonden. In de kathedraal hangt nu een kopie.",
 verbanden: [["De Bourgondiërs nemen over","Van Eyck werkte voor Filips de Goede"],["Jeroen Bosch","een latere schilder uit de Nederlanden"],["Beeldenstorm","het altaarstuk werd toen in de toren verstopt"]],
 onderwijs: {"ka":["De opkomst van de stedelijke burgerij en de toenemende zelfstandigheid van steden.","Het veranderende mens- en wereldbeeld van de renaissance en het begin van een nieuwe wetenschappelijke belangstelling. (tijdvak 5)"]},
 cijfers: [['Geboren','ca. 1390, Maaseik'],['Lam Gods','1432, Gent'],['Gesigneerde werken','ca. 9'],['Overleden','9 juli 1441, Brugge']],
 figuren: [['Jan van Eyck','schilder in Brugge'],['Hubert van Eyck','zijn broer, volgens de overlevering medeschilder'],['Joris van der Paele','kanunnik op een ander beroemd schilderij van Van Eyck']],
 bronnen: [['Wikipedia: Jan van Eyck',W('Jan van Eyck')],['Wikipedia: Het Lam Gods',W('Lam Gods')]]
},

'Val van Constantinopel': {
 aanloop: [
  'Constantinopel, het huidige Istanbul, was eeuwenlang de hoofdstad van het Oost-Romeinse Rijk, dat later het Byzantijnse Rijk ging heten. In 1453 bestond dat rijk uit niet veel meer dan de stad zelf en een deel van de Peloponnesos.',
  'De stad was al eerder twee keer ingenomen: in 1204 door kruisvaarders van de Vierde Kruistocht, en in 1261 werd ze heroverd door Byzantijnse troepen.'
 ],
 verloop: [
  'Sultan Mehmet II van het Ottomaanse Rijk belegerde Constantinopel. Op pinksterzondag 29 mei 1453 viel de stad. Constantijn XI Paleologus, de laatste keizer, sneuvelde. Dat betekende het einde van het Oost-Romeinse Rijk.',
  'Voor de Ottomanen was het een belangrijke overwinning: ze konden hun macht uitbreiden in het oostelijke Middellandse Zeegebied en op de Balkan. Constantinopel werd hun hoofdstad.'
 ],
 perspectieven: [
  'Vaak wordt gezegd dat Europeanen na 1453 zeeroutes naar Azië gingen zoeken omdat de landroute geblokkeerd was. Historici vinden dat te simpel: de Portugezen waren al sinds de tijd van Hendrik de Zeevaarder bezig met ontdekkingsreizen langs de kust van Afrika.'
 ],
 gevolgen: [
  "Sultan Mehmet II, toen pas 21 jaar oud, maakte Constantinopel tot hoofdstad van zijn rijk. Hij liet de Hagia Sophia, eeuwenlang de grootste kerk van de christelijke wereld, veranderen in een moskee. Het Ottomaanse Rijk groeide uit tot een grote macht, die in 1529 zelfs tot Wenen doordrong.",
  "Veel Griekse geleerden vluchtten naar Italië en namen oude handschriften mee. Daardoor konden Italiaanse humanisten de Griekse klassieken in het origineel lezen. Dat gaf de renaissance een extra stimulans."
 ],
 misverstanden: [
  ["“Met de val van Constantinopel begon de renaissance.”","De renaissance was in Italië al eerder begonnen, en er waren al lang contacten met Griekse geleerden. De vluchtelingen van 1453 versnelden de belangstelling voor de Griekse oudheid, maar veroorzaakten haar niet."],
  ["“De stad werd ingenomen door verraad.”","Er gaan verhalen over een poortje, de Kerkoporta, dat open zou zijn blijven staan. Historici denken dat het hooguit over het hoofd werd gezien in de chaos. De stad viel vooral door de overmacht van het Ottomaanse leger en zijn kanonnen."]
 ],
 hoeWeten: [
  "Er zijn ooggetuigenverslagen van verdedigers, onder wie een Venetiaanse scheepsarts, en van Ottomaanse schrijvers. Ze spreken elkaar soms tegen, ook omdat Venetianen en Genuezen elkaar de schuld gaven. Van de stadsmuren zijn nog grote delen bewaard, met de sporen van de beschieting."
 ],
 nu: [
  "Constantinopel heet nu Istanbul, de grootste stad van Turkije. De Hagia Sophia werd in 1934 een museum en in 2020 weer een moskee. De verovering wordt in Turkije elk jaar op 29 mei herdacht. Voor veel Grieken is het nog altijd een zwarte dag."
 ],
 vertellen: "De Byzantijnen hadden de haven, de Gouden Hoorn, afgesloten met een grote ijzeren ketting. Mehmet bedacht een list: hij liet tientallen schepen over een weg van houten balken over land slepen, langs de stad heen, en ze aan de andere kant van de ketting weer te water laten. De verdedigers zagen de vijandelijke vloot ineens in hun eigen haven liggen.",
 verbanden: [["Erasmus","humanisten lazen de Griekse teksten die uit het oosten kwamen"],["Vasco da Gama naar Indië","Europeanen zochten een zeeroute naar Azië"],["Mona Lisa","de Italiaanse renaissance in volle bloei"]],
 onderwijs: {"ka":["De hernieuwde interesse op het erfgoed van de klassieke oudheid. (tijdvak 5)"]},
 cijfers: [['Datum','29 mei 1453 (pinksterzondag)'],['Sultan','Mehmet II'],['Laatste keizer','Constantijn XI Paleologus'],['Eerder ingenomen','1204 en 1261']],
 figuren: [['Mehmet II','sultan van het Ottomaanse Rijk'],['Constantijn XI Paleologus','laatste keizer van Byzantium']],
 bronnen: [['Wikipedia: Beleg en val van Constantinopel (1453)',W('Beleg en val van Constantinopel (1453)')]]
},

'Columbus en Amerika': {
 aanloop: [
  'Christoffel Columbus werd in 1451 geboren in Genua, als zoon van wevers. Hij wilde Indië bereiken door naar het westen te varen.',
  'De Portugezen zochten al een route rond Afrika om de specerijenhandel te bereiken. Columbus kreeg na jaren lobbyen steun van koningin Isabella van Castilië.'
 ],
 verloop: [
  'Op 3 augustus 1492 vertrokken drie schepen uit Palos: de Santa María, de Pinta en de Niña. Op 12 oktober 1492 kwam er land in zicht: een van de Bahama’s, ongeveer 6000 kilometer ten westen van de Canarische Eilanden. Columbus doopte het eiland San Salvador. De Taíno die er woonden, noemden het Guanahaní.',
  'Columbus dacht dat hij Indië had bereikt. Hij maakte vier reizen en bleef tot zijn dood in 1506 geloven dat hij Azië had gevonden.'
 ],
 perspectieven: [
  'Voor de mensen die er al woonden was Amerika geen “nieuwe wereld”. Op Hispaniola onderwierp Columbus de Taíno met geweld, en ziektes uit de Oude Wereld hadden een verwoestend effect op de inheemse bevolking. Met hem begon de Spaanse overheersing van de Nieuwe Wereld.'
 ],
 gevolgen: [
  "Spanje en Portugal verdeelden de nieuwe gebieden in 1494 met het Verdrag van Tordesillas: alles ten westen van een lijn in de Atlantische Oceaan was voor Spanje, alles ten oosten voor Portugal. Daardoor werd Brazilië later Portugees.",
  "Tussen Amerika en de rest van de wereld begon een grote uitwisseling. Aardappels, maïs, tomaten en cacao kwamen naar Europa. Paarden, koeien, tarwe en suikerriet gingen naar Amerika, en ook ziektes zoals pokken. Later werden miljoenen Afrikanen als slaaf naar Amerika gebracht om op plantages te werken."
 ],
 misverstanden: [
  ["“Columbus wilde bewijzen dat de aarde rond is.”","Geleerden wisten al lang dat de aarde rond is. De discussie ging over hoe groot ze was. Columbus schatte de aarde veel te klein, en daarom dacht hij dat Azië dichtbij lag. Zijn critici hadden gelijk: zonder Amerika ertussen was hij nooit in Azië aangekomen."],
  ["“Columbus was de eerste Europeaan in Amerika.”","Rond het jaar 1000 kwamen Vikingen uit Groenland al in Noord-Amerika, waar resten van een nederzetting zijn gevonden. Die contacten bleven zonder gevolgen. Na Columbus bleven de Europeanen wel."]
 ],
 hoeWeten: [
  "Er zijn een samenvatting van het scheepsjournaal van Columbus, zijn brieven en de verslagen van zijn zoon en van de Spaanse priester Bartolomé de las Casas, die de behandeling van de inheemse bevolking scherp veroordeelde. Over de Taíno zelf weten we veel minder, want zij lieten geen geschreven bronnen na. Archeologen onderzoeken hun dorpen en voorwerpen."
 ],
 nu: [
  "Amerika is niet naar Columbus genoemd, maar naar de Florentijn Amerigo Vespucci, die schreef dat het een nieuwe wereld was. Zijn naam stond in 1507 voor het eerst op een wereldkaart. In de Verenigde Staten wordt Columbus Day in veel staten vervangen of aangevuld door een dag voor de inheemse volken. Op verschillende plaatsen zijn standbeelden van Columbus weggehaald."
 ],
 vertellen: "Met kerstmis 1492 liep de Santa María, het grootste schip, bij Hispaniola op de klippen. Van het hout liet Columbus een fort bouwen, La Navidad (Kerstmis), en hij liet er 39 mannen achter. Toen hij een jaar later terugkwam, was het fort verwoest en leefde niemand van hen meer.",
 verbanden: [["Vasco da Gama naar Indië","de Portugese route naar Azië om Afrika heen"],["Magellaan rond de wereld","de eerste reis om de hele aarde"],["Slavernij","de slavenhandel naar Amerika die later volgde"]],
 onderwijs: {"ka":["Het begin van de Europese overzeese expansie. (tijdvak 5)"]},
 cijfers: [['Vertrek','3 augustus 1492, Palos'],['Land in zicht','12 oktober 1492'],['Schepen','Santa María, Pinta en Niña'],['Overleden','20 mei 1506, Valladolid']],
 figuren: [['Christoffel Columbus','ontdekkingsreiziger uit Genua'],['Isabella van Castilië','koningin van Spanje, steunde de reis'],['De Taíno','bewoners van de eilanden die Columbus bereikte']],
 bronnen: [['Wikipedia: Christoffel Columbus',W('Christoffel Columbus')]]
},

'Vasco da Gama naar Indië': {
 aanloop: [
  'Europeanen wilden graag kruiden zoals peper uit Azië. De Portugezen zochten al lang een zeeroute rond Afrika. In 1488 rondde Bartolomeus Diaz Kaap de Goede Hoop.',
  'Toen Christoffel Columbus in 1493 in Spaanse dienst terugkeerde van zijn reis, werd het voor Portugal nog dringender om zelf een route naar Indië te vinden.'
 ],
 verloop: [
  'Op 8 juli 1497 vertrok de vloot van Vasco da Gama uit Lissabon. In januari 1498 legden ze aan in Mozambique en op 14 april 1498 kwamen ze aan in Malindi. Daar troffen de Portugezen voor het eerst Indiërs aan.',
  'Vandaar voer de vloot naar Calicut aan de zuidwestkust van India. Zo vonden de Portugezen de zeeroute naar Azië, rond Afrika.',
  'Ruim honderd jaar later volgden de Nederlanders dezelfde route: de Eerste Schipvaart vertrok in 1595 en in 1602 werd de VOC opgericht.'
 ],
 gevolgen: [
  "De reis was zwaar. Van de ongeveer 170 opvarenden kwamen er maar zo’n 60 terug, de meesten bezweken aan scheurbuik. Toch was de lading specerijen zoveel waard dat de Portugese koning meteen een nieuwe, veel grotere vloot uitrustte. Een half jaar later vertrokken dertien schepen met 1500 man.",
  "Portugal bouwde in de jaren daarna een netwerk van forten en handelsposten langs de kusten van Afrika en Azië, met Goa in India als hoofdstad vanaf 1510. Zo beheerste het een eeuw lang de zeeroute naar Azië, tot de Nederlanders en Engelsen kwamen."
 ],
 perspectieven: [
  "Voor de handelaren in de Indische Oceaan waren de Portugezen arme nieuwkomers. De heerser van Calicut, de samorijn, was niet onder de indruk van de geschenken: een paar hoeden, wat koraal en suiker. Volgens het dagboek zei hij dat wie kwam om nieuwe landen te ontdekken, ook fatsoenlijke geschenken mee had moeten nemen.",
  "Bij zijn tweede reis, in 1502, trad Da Gama met groot geweld op. Hij viel islamitische schepen aan, waaronder de Mîrî, een schip met honderden pelgrims op weg terug van Mekka. Hij liet het schip in brand steken. Zo werd de handel in de Indische Oceaan met wapens afgedwongen."
 ],
 misverstanden: [
  ["“Vasco da Gama vond de weg naar India zelf.”","Langs de Afrikaanse kust vonden de Portugezen de weg door eerdere reizen, zoals die van Bartolomeus Diaz. Voor de oversteek naar India hadden ze een ervaren loods uit Malindi nodig, die de route over de Arabische Zee kende. Vaak wordt gezegd dat dat de beroemde Arabische zeevaarder Ibn Majid was, maar dat klopt waarschijnlijk niet."],
  ["“De Portugezen ontdekten de handel met India.”","Arabische, Indiase, Afrikaanse en Chinese handelaren dreven al eeuwen handel in de Indische Oceaan. De Portugezen sloten aan bij een netwerk dat al bestond, en probeerden het met geweld in handen te krijgen."]
 ],
 hoeWeten: [
  "Een anonieme opvarende hield een dagboek bij van de eerste reis. Dat is de belangrijkste bron. Daarnaast zijn er Portugese kronieken en brieven. Ook Indiase en Arabische bronnen beschrijven de komst van de Portugezen, vaak in veel minder vriendelijke woorden."
 ],
 nu: [
  "Vasco da Gama ligt begraven in het Jerónimosklooster in Lissabon, dat werd gebouwd met de winst van de specerijenhandel. De dichter Luís de Camões maakte zijn reis tot het onderwerp van het Portugese nationale epos, de Lusiaden (1572). Goa bleef tot 1961 Portugees."
 ],
 vertellen: "Toen de Portugezen in Calicut aan land gingen, werden ze aangesproken door twee handelaren uit Tunis, die Spaans en Italiaans spraken. De eerste woorden die ze te horen kregen waren volgens het dagboek ongeveer: “Wat doen jullie hier, wat duivel brengt jullie?” Het antwoord was: “Wij zoeken christenen en specerijen.”",
 verbanden: [["Columbus en Amerika","de Spaanse poging om Azië via het westen te bereiken"],["Eerste schipvaart naar Indië","de Nederlanders volgden ruim honderd jaar later deze route"],["Val van Constantinopel","Europeanen zochten een eigen weg naar de specerijen"]],
 onderwijs: {"ka":["Het begin van de Europese overzeese expansie. (tijdvak 5)"]},
 cijfers: [['Vertrek','8 juli 1497, Lissabon'],['In Malindi','14 april 1498'],['Bestemming','Calicut, India'],['Overleden','24 december 1524, Cochin']],
 figuren: [['Vasco da Gama','Portugese ontdekkingsreiziger'],['Bartolomeus Diaz','rondde in 1488 Kaap de Goede Hoop']],
 bronnen: [['Wikipedia: Vasco da Gama',W('Vasco da Gama')]]
},

'Jeroen Bosch': {
 aanloop: [
  'Jeroen Bosch heette eigenlijk Jheronimus van Aken. Hij werd rond 1450 geboren in ’s-Hertogenbosch, in een familie van schilders. Hij noemde zich later naar zijn stad. Den Bosch was toen een bloeiende stad in het hertogdom Brabant.',
  'Het was een tijd van diep geloof, maar ook van angst voor zonde, de duivel en het Laatste Oordeel. Preken en prenten waarschuwden mensen voor een slecht leven.'
 ],
 verloop: [
  'Bosch trouwde met de welgestelde Aleid van de Meervenne en was lid van de Illustre Lieve Vrouwe Broederschap. Hij kreeg opdrachten van rijke burgers en edelen, ook van buiten de stad.',
  'Zijn werk is vol vreemde wezens, half mens en half dier, en fantasierijke landschappen. Bekende werken zijn De tuin der lusten, De hooiwagen en De verzoeking van de heilige Antonius. Ze tonen de zonde en de straf die volgt. Er zijn maar enkele tientallen werken van zijn hand bewaard.',
  'Bosch stierf in 1516 in Den Bosch. Na zijn dood werd zijn werk veel nagevolgd. De Spaanse koning Filips II verzamelde zijn schilderijen. Daarom hangen veel ervan in het Prado in Madrid.'
 ],
 gevolgen: [
  "Bosch werd al tijdens zijn leven beroemd, ook bij vorsten. Filips de Schone, de vader van Karel V, bestelde een groot altaarstuk van het Laatste Oordeel. De tuin der lusten hing in het paleis van de graven van Nassau in Brussel, de familie van Willem van Oranje.",
  "Na zijn dood maakten veel schilders werk “in de trant van Bosch”, met duivels, monsters en wonderlijke wezens. Pieter Bruegel werd in zijn tijd zelfs “de nieuwe Jheronimus Bosch” genoemd. Eeuwen later lieten surrealisten als Salvador Dalí zich door hem inspireren."
 ],
 perspectieven: [
  "In Spanje werd Bosch eind 16e eeuw van ketterij verdacht, vanwege zijn vreemde duivelse taferelen. De bibliothecaris van het koninklijk paleis El Escorial nam het voor hem op: Bosch liet volgens hem juist zien hoe de mens tot zonde verleid wordt.",
  "Voor de Bosschenaren van zijn tijd was Bosch geen buitenstaander, maar een gerespecteerd burger. Hij woonde in een groot huis aan de Markt en was gezworen broeder van een voorname broederschap, waarvoor hij ook ontwerpen maakte."
 ],
 misverstanden: [
  ["“Bosch was lid van een geheime sekte.”","In 1947 beweerde een Duitse kunsthistoricus dat Bosch lid was van de adamieten, een sekte die vrije liefde predikte. Daar is geen bewijs voor. Die sekte was een eeuw eerder actief, en De tuin der lusten waarschuwt juist tegen een zondig leven."],
  ["“De beeldtaal van Bosch is helemaal verzonnen.”","Veel van zijn figuren komen uit de taal en de verhalen van zijn tijd: spreekwoorden, preken, volksverhalen en bekende symbolen. Wie die kent, kan veel van zijn schilderijen “lezen”."]
 ],
 hoeWeten: [
  "Bosch zelf schreef niets op, maar in de rekeningboeken van de Illustre Lieve Vrouwe Broederschap staat hij vermeld, tot aan zijn uitvaartmis in 1516. Met onderzoek naar het hout van de panelen kunnen kenners bepalen hoe oud een schilderij is. Een groot onderzoeksproject rond 2016 heeft opnieuw bekeken welke werken echt van zijn hand zijn."
 ],
 nu: [
  "In 2016, 500 jaar na zijn dood, was er in Het Noordbrabants Museum in Den Bosch een grote tentoonstelling met bijna al zijn werken, die honderdduizenden bezoekers trok. In Museum Boijmans Van Beuningen in Rotterdam hangen De marskramer en Sint-Christoffel. In de Sint-Jacobskerk in Den Bosch is het Jheronimus Bosch Art Center gevestigd."
 ],
 vertellen: "Op het middenpaneel van De tuin der lusten staan honderden kleine naakte figuurtjes tussen reusachtige vruchten, vogels en vreemde bouwsels. Op het rechterpaneel, de hel, zie je straffen die bij zonden passen: een muzikant is vastgebonden op een harp, een gulzigaard wordt opgegeten. Een prachtige zoekplaat, met wel veel naakt.",
 verbanden: [["Jan van Eyck en het Lam Gods","de Vlaamse schildertraditie waar Bosch uit voortkwam"],["Pieter Bruegel de Oude","werd “de nieuwe Jheronimus Bosch” genoemd"],["Moord op Willem van Oranje","De tuin der lusten was eigendom van zijn familie"]],
 onderwijs: {"ka":["Het veranderende mens- en wereldbeeld van de renaissance en het begin van een nieuwe wetenschappelijke belangstelling. (tijdvak 5)"],"venster":"8. Jeroen Bosch"},
 cijfers: [['Geboren','ca. 1450'],['Overleden','1516'],['Bewaarde schilderijen','ca. 20 – 25']],
 figuren: [['Jeroen Bosch','schilder'],['Aleid van de Meervenne','echtgenote'],['Filips II','Spaanse koning, verzamelaar van zijn werk']],
 bronnen: [CANON,['Wikipedia: Jeroen Bosch',W('Jeroen Bosch')],['Het Noordbrabants Museum','https://www.hetnoordbrabantsmuseum.nl/']]
},

'Erasmus': {
 aanloop: [
  'Erasmus werd in Rotterdam geboren. Het exacte jaar is onzeker, maar meestal wordt 1466 of 1469 genoemd. Hij was een buitenechtelijke zoon van een priester. Na de dood van zijn ouders ging hij naar het klooster Steyn bij Gouda.',
  'In die tijd verspreidde het humanisme zich vanuit Italië. Humanisten bestudeerden de klassieke teksten in het Latijn en Grieks en wilden terug naar de bronnen. Door de boekdrukkunst konden hun ideeën snel rondgaan.'
 ],
 verloop: [
  'Erasmus verliet het klooster en studeerde in Parijs. Hij reisde door Engeland, Italië, de Nederlanden en Zwitserland. Hij schreef in het Latijn en had vrienden in heel Europa, onder wie de Engelse Thomas More.',
  'In 1511 verscheen de Lof der Zotheid, een satire op misstanden in kerk en samenleving. In 1516 gaf hij het Nieuwe Testament in het Grieks uit, met een nieuwe Latijnse vertaling. Ook zijn verzameling spreekwoorden, de Adagia, werd veel gelezen.',
  'Erasmus wilde de kerk hervormen, maar niet breken. Hij kreeg daarover een conflict met Maarten Luther, onder meer over de vrije wil. Hij stierf in 1536 in Bazel. Hij staat bekend als pleitbezorger van verdraagzaamheid en vrede.'
 ],
 gevolgen: [
  "Zijn Griekse Nieuwe Testament van 1516 werd de basis voor nieuwe Bijbelvertalingen, onder meer die van Luther. Daarmee hielp Erasmus de Reformatie op weg, al wilde hij zelf geen breuk. Toen hem werd verweten dat hij “het ei had gelegd dat Luther had uitgebroed”, antwoordde hij dat hij liever iets anders had uitgebroed.",
  "Erasmus schreef ook over opvoeding en onderwijs. Zijn boekje over goede manieren voor kinderen uit 1530 vertelde hoe jongeren moesten lopen, eten, spreken en zwijgen. Het werd eeuwenlang gebruikt en in veel talen vertaald."
 ],
 perspectieven: [
  "Erasmus zat tussen twee vuren. Protestanten vonden hem te voorzichtig, omdat hij in de katholieke kerk bleef. Katholieken vonden hem gevaarlijk, omdat hij de kerk bekritiseerde. In 1559 kwamen al zijn boeken op de lijst van verboden boeken van de paus.",
  "Erasmus was een geleerde voor een kleine kring: hij schreef in het Latijn, dat alleen geletterden konden lezen. Toch werd hij door de drukpers de bekendste schrijver van zijn tijd."
 ],
 misverstanden: [
  ["“Erasmus heette eigenlijk Gerrit Gerritszoon.”","Die naam wordt vaak genoemd, maar is niet zeker. Zijn vader heette Gerard. Erasmus noemde zichzelf naar de heilige Erasmus, en voegde later zelf Desiderius en Roterodamus (uit Rotterdam) toe."],
  ["“Erasmus was een Rotterdammer.”","Hij werd in Rotterdam geboren, maar woonde er maar drie jaar. Hij ging naar school in Gouda en Deventer en woonde later in Parijs, Engeland, Leuven en Bazel. Hij noemde zichzelf een wereldburger."]
 ],
 hoeWeten: [
  "Er zijn ruim drieduizend brieven van en aan Erasmus bewaard, waarin hij schrijft over zijn werk, zijn vrienden en zijn ruzies. Zijn boeken verschenen in duizenden exemplaren. Hans Holbein schilderde portretten van hem. Over zijn jeugd hield hij zelf veel vaag, onder meer omdat hij een buitenechtelijk kind was."
 ],
 nu: [
  "Het Europese uitwisselingsprogramma voor studenten, sinds 1987, heet Erasmus, net als de universiteit en de brug in Rotterdam. Op het Grotekerkplein staat een bronzen standbeeld van hem uit 1622, het oudste bronzen standbeeld van Nederland. De Bibliotheek Rotterdam beheert een van de grootste Erasmus-verzamelingen ter wereld."
 ],
 vertellen: "Erasmus schreef de Lof der Zotheid in 1509, in het huis van zijn vriend Thomas More in Londen. In het boek spreekt Vrouwe Zotheid zelf, en zij prijst zichzelf. Zo kon Erasmus via haar spotten met geleerden, monniken, vorsten en zelfs de paus, zonder dat hij het zelf zei. De Latijnse titel, Moriae Encomium, is ook een woordgrap op de naam More.",
 verbanden: [["Boekdrukkunst","zonder drukpers was Erasmus niet zo beroemd geworden"],["Luther en de Reformatie","de hervormer met wie Erasmus van mening verschilde"],["Val van Constantinopel","de belangstelling voor het Grieks groeide"]],
 onderwijs: {"ka":["De hernieuwde interesse op het erfgoed van de klassieke oudheid. (tijdvak 5)","De protestantse reformatie en splitsing van de christelijke kerk in West-Europa. (tijdvak 5)"],"venster":"10. Erasmus"},
 cijfers: [['Geboren','1466 of 1469, Rotterdam'],['Lof der Zotheid','1511 (gedrukt)'],['Grieks Nieuwe Testament','1516'],['Overleden','1536, Bazel']],
 figuren: [['Desiderius Erasmus','humanist en geleerde'],['Thomas More','Engelse vriend en humanist'],['Maarten Luther','hervormer, tegenstander in debat'],['Johann Froben','drukker in Bazel']],
 bronnen: [CANON,['Wikipedia: Desiderius Erasmus',W('Desiderius Erasmus')]]
},

'Maria van Bourgondië': {
 aanloop: [
  'Maria werd in 1457 in Brussel geboren als enige kind van Karel de Stoute, hertog van Bourgondië. Karel wilde van zijn gebieden een koninkrijk maken. Hij voerde veel oorlogen en hief daarvoor hoge belastingen.',
  'Op 5 januari 1477 sneuvelde Karel bij Nancy. De negentienjarige Maria stond er plotseling alleen voor. De Franse koning Lodewijk XI viel Bourgondische gebieden binnen, en in de Nederlanden kwamen steden en gewesten in verzet tegen het strenge centrale bestuur.'
 ],
 verloop: [
  'Om steun te krijgen moest Maria in februari 1477 het Groot Privilege tekenen. Daarin kregen de Staten van de gewesten meer zeggenschap. Ze mochten zelf bijeenkomen, en de vorst mocht niet zonder hun toestemming belasting heffen of oorlog verklaren.',
  'In Gent werden twee van haar raadsheren onthoofd. Nog in 1477 trouwde Maria met Maximiliaan van Oostenrijk. Met zijn hulp kon ze een groot deel van haar Nederlandse gebieden behouden.',
  'In 1482 stierf Maria na een val van haar paard. Haar zoon Filips de Schone erfde de Nederlanden. Via hem kwamen de gewesten in handen van de Habsburgers.'
 ],
 gevolgen: [
  "Door het huwelijk met Maximiliaan kwamen de Nederlanden bij de Habsburgers. Hun kleinzoon Karel V werd later heer van de Nederlanden, koning van Spanje en keizer. Zo werden de Nederlanden onderdeel van een wereldrijk, met alle gevolgen van dien, tot en met de Opstand.",
  "Het Groot Privilege werd na Maria’s dood grotendeels teruggedraaid door Maximiliaan, die met de Vlaamse steden in oorlog raakte. Brugge zette hem in 1488 zelfs een paar maanden gevangen. Toch bleef het idee dat de vorst niet zonder de Staten mocht regeren, in de Nederlanden voortleven."
 ],
 perspectieven: [
  "Het Groot Privilege was een overwinning voor de steden en de gewesten, die zich door het strenge bestuur van Karel de Stoute vertrapt voelden. Maar de Franstalige gewesten protesteerden: de tekst was in het Nederlands opgesteld. Ook toen al speelde taal een rol in de verhoudingen.",
  "Voor de Franse koning Lodewijk XI was de dood van Karel de Stoute een kans. Hij nam het hertogdom Bourgondië in en wilde Maria laten trouwen met zijn jonge zoon. Daarmee zou het hele erfdeel bij Frankrijk zijn gekomen."
 ],
 misverstanden: [
  ["“Maria van Bourgondië was een machteloos meisje.”","Maria stond in 1477 onder grote druk, en moest veel toegeven. Maar ze koos zelf voor het huwelijk met Maximiliaan, tegen de wens van de Franse koning, en wist zo het grootste deel van haar erfdeel te behouden."],
  ["“Het Groot Privilege maakte de Nederlanden democratisch.”","Het gaf meer macht aan de Staten van de gewesten, waarin edelen, geestelijken en de rijke steden zaten. Gewone mensen hadden er niets over te zeggen."]
 ],
 hoeWeten: [
  "De tekst van het Groot Privilege is bewaard, net als brieven en oorkonden van Maria. Kronieken uit die tijd beschrijven haar huwelijk en haar dood. Haar prachtige getijdenboek, een gebedenboek vol miniaturen, ligt in de Oostenrijkse Nationale Bibliotheek in Wenen. Bij onderzoek van haar graf in de 20e eeuw werden haar resten teruggevonden."
 ],
 nu: [
  "Maria ligt begraven in de Onze-Lieve-Vrouwekerk in Brugge, naast het praalgraf van haar vader Karel de Stoute. Haar bronzen grafmonument is een van de mooiste uit die tijd. In 1793 werd haar graf door Franse revolutionairen geschonden."
 ],
 vertellen: "Maria hield van paardrijden en valkenjacht. Op 6 maart 1482 ging ze op reigerjacht bij het kasteel van Wijnendale, met haar valk op de hand. Bij het springen over een gracht struikelde haar paard. De buikriem brak, ze viel in de gracht en het paard kwam boven op haar terecht. Drie weken later stierf ze, pas 25 jaar oud.",
 verbanden: [["De Bourgondiërs nemen over","haar grootvader bracht de Nederlanden bijeen"],["Karel V en het Verdrag van Venlo","haar kleinzoon maakte de eenwording af"],["Begin Tachtigjarige Oorlog","de opstand tegen haar achterkleinzoon Filips II"]],
 onderwijs: {"ka":["Het begin van staatsvorming en centralisatie."],"venster":"9. Maria van Bourgondië"},
 cijfers: [['Geboren','1457, Brussel'],['Dood Karel de Stoute','5 januari 1477'],['Groot Privilege','februari 1477'],['Overleden','1482']],
 figuren: [['Maria van Bourgondië','hertogin'],['Karel de Stoute','vader, hertog van Bourgondië'],['Maximiliaan van Oostenrijk','echtgenoot'],['Lodewijk XI','Franse koning, tegenstander']],
 bronnen: [CANON,['Wikipedia: Maria van Bourgondië',W('Maria van Bourgondië')],['Wikipedia: Groot Privilege',W('Groot Privilege')]]
}

});
})();
