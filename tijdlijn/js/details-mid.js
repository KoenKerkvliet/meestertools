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
 cijfers: [['Uitgevonden','ca. 1450, Mainz'],['Gutenbergbijbel','voltooid in 1455'],['Oplage handschrift','tientallen tot honderden'],['Oplage drukwerk','al snel duizenden']],
 figuren: [['Johannes Gutenberg','uitvinder van het drukken met losse letters in Europa'],['Laurens Janszoon Coster','Haarlemse koster uit de legende'],['Bì Shēng','Chinees die al in de 11e eeuw drukte met losse tekens']],
 bronnen: [['Wikipedia: Boekdrukkunst',W('Boekdrukkunst')],['Wikipedia: Johannes Gutenberg',W('Johannes Gutenberg')],['Wikipedia: Laurens Janszoon Coster',W('Laurens Janszoon Coster')]]
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
 cijfers: [['Geboren','1457, Brussel'],['Dood Karel de Stoute','5 januari 1477'],['Groot Privilege','februari 1477'],['Overleden','1482']],
 figuren: [['Maria van Bourgondië','hertogin'],['Karel de Stoute','vader, hertog van Bourgondië'],['Maximiliaan van Oostenrijk','echtgenoot'],['Lodewijk XI','Franse koning, tegenstander']],
 bronnen: [CANON,['Wikipedia: Maria van Bourgondië',W('Maria van Bourgondië')],['Wikipedia: Groot Privilege',W('Groot Privilege')]]
}

});
})();
