// Uitgebreide achtergrond per gebeurtenis — 21e eeuw. Sleutel = titel van de gebeurtenis.
// Met verdieping voor leerkrachten (gevolgen, misverstanden, bronnen, nu, om te vertellen, samenhang, in de les);
// zie js/verdieping.js voor de velden.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
// Kenmerkende aspecten van tijdvak 10, Tijd van televisie en computer.
const KA_EUROPA = 'De eenwording van Europa.';
const KA_WELVAART = 'De toenemende westerse welvaart vanaf de jaren zestig en het ontstaan van ingrijpende sociaal-culturele veranderingen.';
const KA_DEKOL = 'De dekolonisatie die een eind maakte aan de westerse macht in de wereld.';
Object.assign(window.DETAILS, {

'Openstelling huwelijk': {
 aanloop: [
  'Lange tijd was homoseksualiteit in Nederland een taboe. Vanaf de jaren zeventig werd de samenleving opener en voerde onder meer het COC actie voor gelijke rechten. Paren van gelijk geslacht konden wel samenwonen, maar hadden niet dezelfde rechten als getrouwde stellen, bijvoorbeeld bij erfenissen, pensioen en ouderschap.',
  'Als protest openden steeds meer gemeenten een symbolisch trouwregister voor paren van gelijk geslacht; in 1994 waren dat er al zo’n honderd. In de jaren negentig groeide ook de politieke steun voor gelijke behandeling. Vanaf 1998 konden paren van gelijk geslacht een geregistreerd partnerschap aangaan. Voorstanders vonden dat niet genoeg en wilden een volwaardig huwelijk.'
 ],
 verloop: [
  'Het paarse kabinet-Kok II, zonder christelijke partijen, diende een wetsvoorstel in om het huwelijk open te stellen. Staatssecretaris van Justitie Job Cohen loodste het door het parlement. In september 2000 stemde de Tweede Kamer in, in december volgde de Eerste Kamer. Daar stemden PvdA, VVD, D66, GroenLinks en SP voor, en CDA, SGP, RPF en GPV tegen. De wet ging in op 1 april 2001.',
  'Kort na middernacht trouwden in Amsterdam vier paren, in het bijzijn van Cohen, die inmiddels burgemeester van Amsterdam was. De camera’s van buitenlandse media stonden erbij: Nederland was het eerste land ter wereld waar twee mannen of twee vrouwen met elkaar konden trouwen.',
  'Juridisch is er sindsdien één huwelijk voor iedereen: man-vrouw, man-man en vrouw-vrouw. Paren van gelijk geslacht kregen ook het recht om samen een kind te adopteren.'
 ],
 gevolgen: [
  'België volgde in 2003, daarna vele andere landen in Europa, Amerika en elders. Het Nederlandse voorbeeld werd internationaal vaak aangehaald.',
  'In Nederland bleef één discussie lang bestaan: mochten trouwambtenaren weigeren om paren van gelijk geslacht te trouwen? Sinds 2014 is in de wet vastgelegd dat dat niet mag; iedere trouwambtenaar moet ieder paar kunnen trouwen.',
  'Binnen het Koninkrijk is het nog steeds niet overal gelijk. Op Aruba, Curaçao en Sint Maarten kunnen paren van gelijk geslacht niet trouwen, omdat zij hun eigen burgerlijk recht hebben. Wel moeten zij een in Nederland gesloten huwelijk erkennen.'
 ],
 perspectieven: [
  'Voorstanders zagen de wet als een kwestie van gelijke rechten: als het huwelijk een burgerlijk contract is, waarom zou het geslacht van de partners dan uitmaken? Tegenstanders, vooral christelijke partijen en kerken, vonden dat het huwelijk naar zijn aard een verbintenis tussen man en vrouw is. Kerken zijn ook nu niet verplicht om paren van gelijk geslacht in te zegenen.'
 ],
 misverstanden: [
  ['“Paren van gelijk geslacht konden vóór 2001 niets wettelijk regelen.”', 'Vanaf 1998 bestond het geregistreerd partnerschap, dat veel rechten gaf. Het verschil zat onder meer in de naam, de symboliek en in regels rond ouderschap en erkenning in het buitenland.'],
  ['“Sinds 2001 moeten kerken ook paren van gelijk geslacht trouwen.”', 'De wet gaat alleen over het burgerlijk huwelijk op het gemeentehuis. Kerken bepalen zelf of ze een huwelijk inzegenen. In Nederland moet het burgerlijk huwelijk wel altijd vóór een kerkelijke inzegening plaatsvinden.']
 ],
 hoeWeten: [
  'De parlementaire stukken en de stemmingen in de Tweede en Eerste Kamer zijn openbaar en te vinden op de sites van het parlement. Kranten en de televisie legden de eerste huwelijken op 1 april 2001 vast; die beelden worden vaak herhaald. Het CBS houdt bij hoeveel huwelijken er per jaar gesloten worden, ook tussen partners van gelijk geslacht.'
 ],
 nu: [
  'Voor kinderen van nu is het vaak vanzelfsprekend dat twee vaders of twee moeders getrouwd kunnen zijn. Dat het pas sinds 2001 kan, en dat Nederland daarin het eerste land ter wereld was, is voor veel leerlingen een verrassing.'
 ],
 vertellen: 'In de nacht van 31 maart op 1 april 2001 stond burgemeester Job Cohen om middernacht klaar in het Amsterdamse stadhuis. Vier paren gaven elkaar daar het jawoord, terwijl journalisten uit de hele wereld toekeken: nergens anders was dit ooit gebeurd.',
 verbanden: [['Vrouwenkiesrecht', 'een eerdere stap naar gelijke rechten'], ['Universele Verklaring van de Rechten van de Mens', 'gelijke behandeling als mensenrecht'], ['Provo', 'de jaren zestig maakten de samenleving opener']],
 onderwijs: { ka: [KA_WELVAART] },
 cijfers: [['Geregistreerd partnerschap','1998'],['Wet aangenomen','december 2000'],['In werking','1 april 2001'],['Eerste huwelijken','4 paren in Amsterdam']],
 figuren: [['Job Cohen','staatssecretaris, daarna burgemeester van Amsterdam'],['Boris Dittrich','D66-Kamerlid, pleitte al jaren voor de openstelling'],['COC','belangenorganisatie die actie voerde']],
 bronnen: [['Wikipedia: Homohuwelijk in Nederland',W('Homohuwelijk Nederland')],['Wikipedia: Job Cohen',W('Job Cohen')]]
},

'De euro': {
 aanloop: [
  'Na de oprichting van de EEG werkten Europese landen steeds nauwer samen. Een gezamenlijke munt moest handel en reizen makkelijker maken en de landen nog sterker aan elkaar binden. Met het Verdrag van Maastricht van 1992 spraken ze af de euro in te voeren.',
  'Landen moesten daarvoor aan strenge eisen voldoen, onder meer voor de overheidsschuld, de inflatie, de rente en de wisselkoers. Op 1 januari 1999 werd de euro ingevoerd voor het girale betalingsverkeer, zoals overschrijvingen. De wisselkoers werd vastgezet op 2,20371 gulden voor één euro. In de winkel betaalden mensen nog met guldens.'
 ],
 verloop: [
  'Op 1 januari 2002 kwamen de eurobiljetten en -munten in omloop in twaalf landen. Banken en winkels hadden maandenlang voorbereid; iedereen kon vooraf een zakje met euromunten kopen om te wennen. Tot eind januari kon nog met guldens worden betaald.',
  'De biljetten zijn in alle eurolanden gelijk. De munten hebben één gezamenlijke kant en één nationale kant, met een eigen afbeelding per land. Op de Nederlandse munten stond eerst koningin Beatrix, sinds 2014 koning Willem-Alexander.',
  'Veel Nederlanders moesten wennen. Ze rekenden nog lang om naar guldens en hadden het gevoel dat alles duurder was geworden. De Europese Centrale Bank in Frankfurt bepaalt sindsdien het geldbeleid. De eerste president was de Nederlander Wim Duisenberg.'
 ],
 gevolgen: [
  'Reizen en handel binnen de eurozone werden eenvoudiger: geld wisselen is niet meer nodig en prijzen zijn makkelijk te vergelijken. Voor een handelsland als Nederland was dat een groot voordeel.',
  'Rond 2010 liet de eurocrisis zien hoe sterk de landen van elkaar afhankelijk waren. Toen Griekenland en andere landen hun schulden niet meer konden betalen, moesten de eurolanden samen noodfondsen opzetten. Daarover werd ook in Nederland fel gediscussieerd.',
  'De eurozone is gegroeid: sinds 1 januari 2026 betalen 21 landen van de Europese Unie met de euro.'
 ],
 perspectieven: [
  'Voorstanders zagen de euro als het logische vervolg op de Europese samenwerking. Critici vonden dat landen met heel verschillende economieën niet één munt en één rente konden delen, en dat Nederland te veel zeggenschap over zijn eigen geld opgaf. Dat debat is nooit helemaal verdwenen.'
 ],
 misverstanden: [
  ['“Door de euro werd alles veel duurder.”', 'Het gevoel was sterk, maar het ging vooral om bepaalde prijzen, zoals in de horeca, die bij het afronden omhoog gingen. De totale prijsstijging door de overstap was volgens metingen klein. Dat verschil tussen gevoel en cijfers heet ook wel gevoelsinflatie.'],
  ['“Alle landen van de EU betalen met de euro.”', 'Niet alle EU-landen doen mee. Denemarken heeft afgesproken dat het de euro niet hoeft in te voeren, en ook Zweden en een aantal andere landen gebruiken nog hun eigen munt.']
 ],
 hoeWeten: [
  'De Nederlandsche Bank en de Europese Centrale Bank houden precies bij hoeveel geld er in omloop is. Het CBS meet elke maand de prijsontwikkeling. Over de overstap in 2002 zijn veel krantenartikelen, tv-uitzendingen en voorlichtingsfolders bewaard, zoals die over het eurozakje.'
 ],
 nu: [
  'Iedereen in Nederland betaalt met de euro. Wie een oud guldenbiljet vindt, kan dat nog tot 1 januari 2032 bij De Nederlandsche Bank inwisselen. In de winkel wordt sinds 2004 vaak afgerond op 5 cent, waardoor munten van 1 en 2 cent bijna niet meer gebruikt worden.'
 ],
 vertellen: 'Begin december 2001 konden Nederlanders bij de bank en het postkantoor een startpakket kopen: een zakje met euromunten ter waarde van 3,88 euro, voor 8,55 gulden. Zo konden ze alvast aan de nieuwe munten wennen, al mochten ze er pas vanaf 1 januari mee betalen.',
 verbanden: [['Verdrag van Maastricht', 'hier werd de euro afgesproken'], ['Europa', 'het begin van de Europese samenwerking'], ['Het Marshallplan', 'samenwerking na de Tweede Wereldoorlog']],
 onderwijs: { ka: [KA_EUROPA], venster: '49. Europa' },
 cijfers: [['Giraal ingevoerd','1 januari 1999'],['Munten en biljetten','1 januari 2002'],['Wisselkoers','€1 = ƒ2,20371'],['Landen in 2002','12'],['Landen in 2026','21']],
 figuren: [['Wim Duisenberg','eerste president van de Europese Centrale Bank'],['Gerrit Zalm','minister van Financiën'],['De Nederlandsche Bank','regelde de omwisseling in Nederland']],
 bronnen: [['De Nederlandsche Bank','https://www.dnb.nl/'],['Wikipedia: Euro',W('Euro munteenheid')],['Wikipedia: Eurozone',W('Eurozone')],['Wikipedia: Nederlandse gulden',W('Nederlandse gulden')]]
},

'Nieuw Koninkrijk': {
 aanloop: [
  'Sinds het Statuut voor het Koninkrijk van 1954 bestond het Koninkrijk uit Nederland, Suriname en de Nederlandse Antillen, als gelijkwaardige delen. Na de onafhankelijkheid van Suriname in 1975 bleven de zes eilanden over. Aruba kreeg in 1986 een eigen status als land binnen het Koninkrijk.',
  'De overige eilanden waren ontevreden over het bestuur vanuit Willemstad op Curaçao, het grootste eiland. Tussen 2000 en 2005 hielden ze referenda. Curaçao en Sint Maarten kozen voor een eigen status als land. Bonaire en Saba kozen voor een directe band met Nederland. Sint Eustatius stemde eerst voor behoud van de Antillen, maar volgde later dezelfde weg.'
 ],
 verloop: [
  'Op 10 oktober 2010 hielden de Nederlandse Antillen op te bestaan. Curaçao en Sint Maarten werden zelfstandige landen binnen het Koninkrijk, net als Aruba. Nederland nam als onderdeel van de afspraken een groot deel van hun schulden over.',
  'Bonaire, Sint Eustatius en Saba werden openbare lichamen van Nederland, ook wel bijzondere gemeenten genoemd. Samen heten ze Caribisch Nederland en tellen ze ongeveer 32.000 inwoners. Sinds 2011 is de Amerikaanse dollar er de munt.',
  'Het Koninkrijk bestaat sindsdien uit vier landen: Nederland, Aruba, Curaçao en Sint Maarten. Ze hebben samen één koning, één nationaliteit en één buitenlands beleid en defensie, maar regelen veel andere zaken zelf.'
 ],
 gevolgen: [
  'De inwoners van Caribisch Nederland stemmen nu mee bij Nederlandse verkiezingen, zoals die voor de Tweede Kamer. Nederlandse wetten werden er stap voor stap ingevoerd, aangepast aan de situatie op de eilanden.',
  'Er bleven grote verschillen tussen Europees en Caribisch Nederland, bijvoorbeeld in inkomens, prijzen en voorzieningen. Daarover is veel discussie, net als over het financiële toezicht van Nederland op Curaçao en Sint Maarten. Na orkaan Irma in 2017, die Sint Maarten zwaar trof, werd zichtbaar hoe kwetsbaar de kleine eilanden zijn.'
 ],
 perspectieven: [
  'Op de eilanden kijken mensen verschillend naar de band met Nederland. Sommigen willen meer zelfstandigheid en ervaren Nederlandse bemoeienis als betutteling, een echo van de koloniale tijd. Anderen zijn juist blij met de steun en zekerheid die de band met Nederland geeft. In Nederland zelf weten veel mensen weinig van het Caribische deel van het Koninkrijk.'
 ],
 misverstanden: [
  ['“Bonaire, Sint Eustatius en Saba zijn aparte landen.”', 'Dat zijn ze niet: het zijn bijzondere gemeenten van Nederland. Aruba, Curaçao en Sint Maarten zijn wél eigen landen binnen het Koninkrijk.'],
  ['“De eilanden horen bij de Europese Unie.”', 'De Caribische delen van het Koninkrijk zijn geen grondgebied van de EU; ze hebben de status van Landen en Gebieden Overzee. De inwoners hebben wel de Nederlandse nationaliteit en daarmee de rechten van EU-burgers.']
 ],
 hoeWeten: [
  'De uitslagen van de referenda, de afspraken tussen de regeringen en het gewijzigde Statuut zijn openbare documenten. Het CBS maakt aparte cijfers voor Caribisch Nederland, bijvoorbeeld over inwoners en prijzen. Ook de verslagen van het parlement laten zien hoe er over de nieuwe verhoudingen is gesproken.'
 ],
 nu: [
  'Bij de verkiezingen voor de Eerste Kamer kiezen de inwoners van Caribisch Nederland een eigen kiescollege. Op Bonaire betaal je met dollars, maar het is gewoon Nederland. En wie het Koninkrijk op de kaart wil laten zien, moet ook de Cariben meenemen.'
 ],
 vertellen: 'Op Bonaire, Sint Eustatius en Saba betaal je met Amerikaanse dollars, rijd je in auto’s met Amerikaanse maten en hoor je vaak Papiaments of Engels. Toch ben je er in Nederland: het zijn gemeenten van ons land, net als Utrecht of Maastricht.',
 verbanden: [['Suriname onafhankelijk', 'in 1975 werd Suriname een eigen land'], ['Slavernij', 'het koloniale verleden van de eilanden'], ['Indonesië', 'een eerdere stap in de dekolonisatie']],
 onderwijs: { ka: [KA_DEKOL], venster: '47. Het Caribisch gebied' },
 cijfers: [['Statuut voor het Koninkrijk','1954'],['Status aparte Aruba','1986'],['Opheffing Nederlandse Antillen','10 oktober 2010'],['Landen in het Koninkrijk','4'],['Inwoners Caribisch Nederland','ca. 32.000']],
 figuren: [['Emily de Jongh-Elhage','laatste premier van de Nederlandse Antillen'],['Gerrit Schotte','eerste premier van Curaçao'],['Sarah Wescot-Williams','eerste premier van Sint Maarten']],
 bronnen: [CANON,['Wikipedia: Staatkundige hervorming Nederlandse Antillen',W('Staatkundige hervorming Nederlandse Antillen')],['Wikipedia: Caribisch Nederland',W('Caribisch Nederland')]]
},

'Koning Willem-Alexander': {
 aanloop: [
  'Nederland werd sinds 1890 geregeerd door vrouwen: Emma als regentes, daarna Wilhelmina, Juliana en Beatrix. Beatrix werd koningin in 1980 en volgde haar moeder Juliana op, die net als Wilhelmina afstand had gedaan van de troon.',
  'Willem-Alexander werd in 1967 geboren als oudste zoon van Beatrix en prins Claus. Hij studeerde geschiedenis in Leiden, vloog als vrijwilliger voor een medische hulporganisatie in Afrika en hield zich als prins vooral bezig met waterbeheer, op advies van zijn vader. In 2002 trouwde hij met de Argentijnse Máxima Zorreguieta.'
 ],
 verloop: [
  'Op 28 januari 2013 maakte Beatrix in een televisietoespraak bekend dat ze afstand zou doen van de troon. Ze was toen bijna 75 jaar en ruim 32 jaar koningin. Ze zei dat de verantwoordelijkheid voor het land nu in handen hoorde van een nieuwe generatie.',
  'Op 30 april 2013 tekende Beatrix in het Koninklijk Paleis op de Dam de akte van abdicatie. Daarna werd Willem-Alexander in de Nieuwe Kerk in Amsterdam ingehuldigd en legde hij de eed af op de Grondwet. Hij was de eerste koning sinds de dood van Willem III in 1890.',
  'Koninginnedag werd Koningsdag, sinds 2014 gevierd op 27 april, de verjaardag van de koning. Zijn oudste dochter Amalia werd prinses van Oranje en is de troonopvolger.'
 ],
 gevolgen: [
  'Er veranderde vooral veel in de symbolen: de naam en datum van de nationale feestdag, het portret op de euromunten en postzegels, en woorden als “Zijne Majesteit”. De macht van het staatshoofd veranderde niet.',
  'De rol van het koningshuis was al eerder kleiner geworden. Sinds 2012 benoemt de Tweede Kamer zelf de informateur bij een kabinetsformatie; daarvoor deed de koningin dat. Willem-Alexander is daardoor de eerste koning die bij het vormen van een kabinet geen hoofdrol meer speelt.'
 ],
 perspectieven: [
  'De meeste Nederlanders steunen de monarchie, maar er is ook kritiek. Tegenstanders vinden het niet democratisch dat iemand staatshoofd wordt door geboorte, en vragen zich af wat het koningshuis kost. Voorstanders vinden dat de koning het land verbindt en boven de partijen staat. Rond omstreden momenten, zoals een vakantie tijdens de coronamaatregelen, laaide die discussie steeds weer op.'
 ],
 misverstanden: [
  ['“De koning maakt de wetten en bepaalt wat de regering doet.”', 'De koning is onschendbaar, de ministers zijn verantwoordelijk. Hij ondertekent wetten wel, maar de inhoud wordt bepaald door regering en parlement. Ook de troonrede op Prinsjesdag wordt door het kabinet geschreven.'],
  ['“Willem-Alexander is gekroond.”', 'In Nederland wordt een vorst niet gekroond maar ingehuldigd. De kroon ligt tijdens de inhuldiging naast de koning op een tafel, de credenstafel, maar wordt niet opgezet.']
 ],
 hoeWeten: [
  'De abdicatie en inhuldiging werden live uitgezonden en zijn vastgelegd in foto’s, film en officiële documenten, zoals de akte van abdicatie. Het Koninklijk Huis publiceert zelf over de taken van de koning. De rol van de koning staat beschreven in de Grondwet.'
 ],
 nu: [
  'Elk jaar op 27 april is het Koningsdag, met vrijmarkten en oranje straten. De koning leest op Prinsjesdag de troonrede voor en ondertekent wetten. Prinses Amalia bereidt zich voor op het koningschap.'
 ],
 vertellen: 'In 1986 reed Willem-Alexander, toen nog een jonge prins, de Elfstedentocht uit onder een schuilnaam: W.A. van Buren. Tussen duizenden andere toerschaatsers viel hij nauwelijks op.',
 verbanden: [['Koning Willem I', 'de eerste koning van Nederland'], ['De Grondwet', 'sinds 1848 zijn de ministers verantwoordelijk'], ['Het Oranjegevoel', 'oranje als nationaal symbool']],
 onderwijs: {},
 cijfers: [['Aankondiging abdicatie','28 januari 2013'],['Inhuldiging','30 april 2013'],['Vorige koning','Willem III (overleden 1890)'],['Koningsdag','27 april (sinds 2014)']],
 figuren: [['Willem-Alexander','koning der Nederlanden'],['Beatrix','koningin 1980–2013'],['Koningin Máxima','echtgenote van de koning'],['Prinses Amalia','prinses van Oranje, troonopvolger']],
 bronnen: [['Koninklijk Huis','https://www.koninklijkhuis.nl/'],['Wikipedia: Willem-Alexander der Nederlanden',W('Willem-Alexander der Nederlanden')],['Wikipedia: Inhuldiging 2013',W('Inhuldiging Willem-Alexander 2013')]]
},

'Coronapandemie': {
 aanloop: [
  'Eind 2019 werden in de Chinese stad Wuhan de eerste besmettingen met een nieuw coronavirus vastgesteld. Het virus, later SARS-CoV-2 genoemd, verspreidde zich snel via reizigers. De ziekte die het veroorzaakt kreeg de naam COVID-19.',
  'Op 27 februari 2020 werd de eerste besmetting in Nederland bevestigd, bij een man uit Loon op Zand in Noord-Brabant die kort daarvoor in Noord-Italië was geweest. Na de carnavalsdagen nam het aantal besmettingen in het zuiden snel toe. Op 11 maart 2020 riep de Wereldgezondheidsorganisatie een pandemie uit.'
 ],
 verloop: [
  'Half maart 2020 sloten scholen, horeca en sportclubs. Op 16 maart sprak premier Rutte het land toe op televisie. Het kabinet sprak van een intelligente lockdown: mensen moesten zoveel mogelijk thuisblijven en 1,5 meter afstand houden. Ziekenhuizen raakten overvol en patiënten werden verspreid over het land en soms naar Duitsland gebracht.',
  'Leerlingen kregen weken thuisonderwijs via laptops en werkbladen. Ouderen in verpleeghuizen mochten maandenlang geen bezoek ontvangen. In januari 2021 begon de vaccinatie. Kort daarna ging een avondklok in, voor het eerst sinds de Tweede Wereldoorlog. Op verschillende plaatsen leidde dat tot rellen.',
  'Maatregelen werden steeds weer aangescherpt en versoepeld, wat leidde tot veel discussie en protesten. Begin 2022 werden de meeste maatregelen geschrapt. Volgens het CBS overleden in de jaren 2020 tot en met 2022 ongeveer 48.000 mensen in Nederland aan COVID-19.'
 ],
 gevolgen: [
  'Leerlingen liepen achterstanden op, vooral kinderen die thuis minder hulp kregen. Het kabinet trok daarom extra geld uit voor scholen om achterstanden in te halen. Ook de mentale gezondheid van jongeren kwam onder druk te staan.',
  'Thuiswerken en online vergaderen werden gewoon, en zijn dat voor veel mensen gebleven. Ondernemers kregen steun van de overheid om de lockdowns te overleven. Tegelijk groeide bij een deel van de bevolking het wantrouwen tegen de overheid en de wetenschap.'
 ],
 perspectieven: [
  'Niet iedereen ervoer de crisis hetzelfde. Zorgmedewerkers werkten maandenlang onder hoge druk. Ouderen in verpleeghuizen waren eenzaam. Jongeren misten school, sport en vrienden. Ondernemers in de horeca en cultuur zagen hun inkomsten verdwijnen. Over de juiste aanpak verschilden mensen sterk van mening: voor de een gingen de maatregelen te ver, voor de ander niet ver genoeg.'
 ],
 hoeWeten: [
  'Het RIVM hield dagelijks bij hoeveel mensen positief testten, in het ziekenhuis lagen en overleden. Het CBS berekende de oversterfte: hoeveel meer mensen er stierven dan normaal. De persconferenties van het kabinet zijn allemaal bewaard. De Onderzoeksraad voor Veiligheid onderzocht achteraf hoe de crisis is aangepakt.'
 ],
 nu: [
  'Woorden als “anderhalvemetersamenleving”, “lockdown” en “thuisonderwijs” kent iedereen nog. Op veel scholen zijn de laptops en online lesmethodes uit die tijd gebleven. Ook wordt er nagedacht over hoe Nederland zich op een volgende pandemie kan voorbereiden.'
 ],
 vertellen: 'Op 16 maart 2020 sprak premier Rutte het hele land toe via televisie, radio en internet. Zo’n toespraak van een premier aan het land was zeer uitzonderlijk; miljoenen mensen keken tegelijk.',
 verbanden: [['De pest', 'een eerdere pandemie die Europa trof'], ['Internet en het world wide web', 'maakte thuiswerken en thuisonderwijs mogelijk']],
 onderwijs: {},
 cijfers: [['Eerste besmetting in Nederland','27 februari 2020'],['Start vaccinatie','januari 2021'],['Avondklok','23 januari – 28 april 2021'],['Doden aan COVID-19 (CBS, 2020–2022)','ca. 48.000']],
 figuren: [['Mark Rutte','minister-president'],['Hugo de Jonge','minister van Volksgezondheid'],['Jaap van Dissel','directeur infectieziektebestrijding RIVM, voorzitter OMT']],
 bronnen: [['RIVM','https://www.rivm.nl/'],['CBS','https://www.cbs.nl/'],['Wikipedia: Coronacrisis in Nederland',W('Coronacrisis in Nederland')]]
},

'Overstromingen in Zuid-Limburg': {
 aanloop: [
  'Half juli 2021 bleef een lagedrukgebied dagenlang boven West-Duitsland, België en Zuid-Nederland hangen. Door de warme, vochtige lucht viel in korte tijd extreem veel regen. Op 14 juli gaf het KNMI code rood af voor Limburg.',
  'De Geul ontspringt in België en stroomt door een smal dal via Valkenburg naar de Maas. Ook in de Ardennen en de Eifel viel enorm veel regen. Daardoor stegen de Geul, de Roer en de Maas tot recordhoogte.'
 ],
 verloop: [
  'In de nacht van 14 op 15 juli stroomde de Geul door het centrum van Valkenburg. Straten veranderden in rivieren en een brug stortte in. Ook Meerssen, Gulpen en andere dorpen langs de Geul kregen water te verwerken. In Valkenburg werden onder meer zorginstellingen ontruimd.',
  'Daarna steeg de Maas tot het hoogste zomerpeil in meer dan honderd jaar. Op 16 juli werden in en rond Venlo ruim tienduizend mensen geëvacueerd, en ook het ziekenhuis VieCuri. Militairen en vrijwilligers versterkten dijken met zandzakken. De grote Maasdijken hielden stand.',
  'In Nederland vielen geen doden. In de buurlanden was dat anders: in heel Europa kwamen ongeveer 220 mensen om, van wie zeker 180 in Duitsland, vooral in het dal van de Ahr, en 39 in België.'
 ],
 gevolgen: [
  'Het kabinet verklaarde de overstroming tot ramp, zodat gedupeerden aanspraak konden maken op een tegemoetkoming. Onderzoekers schatten de schade in Limburg op honderden miljoenen euro’s. Veel ondernemers in Valkenburg moesten hun zaak maandenlang sluiten.',
  'Een commissie onder leiding van Johan Remkes onderzocht wat Nederland moet leren. Een belangrijke les: overstromingen zijn niet altijd te voorkomen, dus moet je ook zorgen dat de schade beperkt blijft. In Limburg wordt nu meer ruimte gemaakt om water vast te houden en te bergen, bijvoorbeeld met regenwaterbuffers in het heuvelland.'
 ],
 perspectieven: [
  'Klimaatwetenschappers concludeerden dat zulke extreme regenval door klimaatverandering waarschijnlijker is geworden. Bewoners keken vooral naar de waarschuwingen: veel mensen in het Geuldal werden verrast door hoe snel het water kwam. In Duitsland en België, waar veel meer mensen omkwamen, leidde de ramp tot felle kritiek op de waarschuwingssystemen.'
 ],
 misverstanden: [
  ['“De Maas zorgde voor de overstroming in Valkenburg.”', 'In Valkenburg was het de Geul, een kleine rivier die na de enorme regenval buiten haar oevers trad. De Maas steeg pas daarna, en bedreigde vooral Noord- en Midden-Limburg.'],
  ['“Overstromingen gebeuren alleen in de winter.”', 'Hoog water op de grote rivieren komt vaak in de winter, maar deze overstroming viel midden in de zomer. Juist in de zomer kan warme lucht veel vocht vasthouden en in korte tijd heel veel regen geven.']
 ],
 hoeWeten: [
  'Het KNMI heeft de regenval precies gemeten en Rijkswaterstaat en het Waterschap Limburg de waterstanden. Er zijn veel foto’s en filmpjes van bewoners, die laten zien hoe snel het water steeg. Onderzoekscommissies en wetenschappers schreven rapporten over de oorzaken en de lessen.'
 ],
 nu: [
  'Langs de Geul en in het heuvelland wordt gewerkt aan meer ruimte voor water, zoals regenwaterbuffers. De ramp wordt vaak genoemd als voorbeeld van wat klimaatverandering in Nederland kan betekenen: niet alleen hoog water uit zee, maar ook extreme regen.'
 ],
 vertellen: 'In de nacht van 14 op 15 juli 2021 werd de Geul, een riviertje dat je in Valkenburg normaal met een paar stappen over kunt, een kolkende stroom die door de straten raasde. De volgende ochtend stond het centrum van het toeristenstadje meters onder water.',
 verbanden: [['De Watersnood', 'de grote ramp van 1953 in Zeeland'], ['Allerheiligenvloed', 'een middeleeuwse overstroming']],
 onderwijs: {},
 cijfers: [['Code rood KNMI','14 juli 2021'],['Getroffen woningen Valkenburg','ca. 2.300'],['Geëvacueerd rond Venlo','ruim 10.000 mensen'],['Doden in Europa','ca. 220 (geen in Nederland)'],['Geschatte schade Limburg','€350–600 miljoen']],
 figuren: [['Daan Prevoo','burgemeester van Valkenburg aan de Geul'],['Waterschap Limburg','beheerde dijken en beken'],['Johan Remkes','leidde het onderzoek naar de lessen'],['Koning Willem-Alexander','bezocht Valkenburg op 15 juli']],
 bronnen: [['Wikipedia: Overstromingen in Europa juli 2021',W('Overstromingen in Europa in juli 2021')],['Waterschap Limburg','https://www.waterschaplimburg.nl/'],['KNMI','https://www.knmi.nl/']]
},

'Gaskraan Groningen dicht': {
 aanloop: [
  'Op 29 mei 1959 boorde de NAM bij Kolham, in de gemeente Slochteren, op het land van boer Kees Boon. Daar vond ze het Groningenveld, een van de grootste gasvelden ter wereld. Nederland werd een gasland: bijna alle huishoudens gingen koken en stoken op aardgas, en de staat verdiende er volgens de parlementaire enquête ongeveer 360 miljard euro aan. De winning lag in handen van de NAM, van Shell en ExxonMobil.',
  'Vanaf 1991 werden in Groningen aardbevingen gemeten. Pas in 1993 erkende de NAM een verband met de gaswinning. Lange tijd werden de risico’s klein genoemd. Na de beving bij Huizinge op 16 augustus 2012, met een kracht van 3,6, nam de schade aan huizen sterk toe.'
 ],
 verloop: [
  'Na veel protest en onderzoek besloot het kabinet in maart 2018 de gaswinning af te bouwen. Het oorspronkelijke doel was 2030, later werd het vervroegd. De afhandeling van schade en het versterken van huizen verliep traag en leidde tot veel frustratie en stress bij bewoners.',
  'Op 24 februari 2023 bood een parlementaire enquêtecommissie haar rapport aan in het Groningse dorp Zeerijp. Ze concludeerde dat de belangen van Groningers jarenlang structureel waren genegeerd en sprak van een ereschuld van de staat. Op 1 oktober 2023 ging de gaswinning naar nul. Daarna werd het einde ook wettelijk vastgelegd.',
  'Met het sluiten van de gaskraan eindigde een periode van ruim zestig jaar. Nederland importeert sindsdien meer gas en zet in op duurzame energie, zoals wind en zon.'
 ],
 gevolgen: [
  'Tienduizenden Groningse huizen moesten worden geïnspecteerd en vaak versterkt of herbouwd. Dat kost jaren en miljarden euro’s. Het kabinet beloofde extra geld en aandacht voor de regio, onder meer voor scholen, gezondheid en de economie.',
  'Het vertrouwen van veel Groningers in de overheid kreeg een flinke deuk. Uit onderzoek bleek dat de onzekerheid en de lange procedures bij veel bewoners tot gezondheidsklachten leidden.',
  'Het einde van het Groningse gas versnelde de overstap van aardgas naar andere energie, zoals warmtepompen, warmtenetten en elektriciteit uit wind en zon.'
 ],
 perspectieven: [
  'Voor Nederland als geheel bracht het gas jarenlang welvaart: het geld betaalde mee aan de verzorgingsstaat, wegen en scholen. Voor de Groningers zelf bracht het vooral schade en zorgen. Dat contrast, tussen wie profiteerde en wie de last droeg, staat centraal in het rapport van de enquêtecommissie.'
 ],
 misverstanden: [
  ['“De aardbevingen in Groningen zijn net zo zwaar als elders in de wereld.”', 'De bevingen zijn klein vergeleken met natuurlijke aardbevingen, zoals in Turkije of Japan. Maar ze ontstaan heel ondiep, onder huizen die daar niet op gebouwd zijn. Daardoor richten ook bevingen van 2 of 3 op de schaal van Richter schade aan.'],
  ['“Nederland gebruikt sinds 2023 geen aardgas meer.”', 'Nederland gebruikt nog steeds veel aardgas. Alleen de winning uit het Groningenveld is gestopt. Het gas komt nu uit kleinere velden, uit Noorwegen en als vloeibaar gas per schip.']
 ],
 hoeWeten: [
  'Het KNMI registreert elke aardbeving in Groningen. Het rapport van de parlementaire enquêtecommissie en de openbare verhoren uit 2022 laten zien wie wanneer wat wist. Ook de verhalen van bewoners, verzameld in kranten, documentaires en boeken, zijn een belangrijke bron.'
 ],
 nu: [
  'In Groningen zie je op veel plekken stutten tegen huizen, steigers en nieuwbouw ter vervanging van oude woningen. In heel Nederland wordt nagedacht over hoe huizen van het aardgas af kunnen. De gasrekening is voor veel gezinnen een belangrijk onderwerp geworden.'
 ],
 vertellen: 'Het gas werd in 1959 gevonden op het land van boer Kees Boon in Kolham. Bijna niemand besefte toen dat onder dat weiland zo veel gas zat dat het heel Nederland decennialang zou verwarmen, en dat de provincie er zestig jaar later nog steeds de prijs voor zou betalen.',
 verbanden: [['Aardgas in Slochteren', 'de vondst van het gas in 1959'], ['Sluiting van de mijnen', 'ook in Limburg eindigde een energietijdperk'], ['Steenkoolmijnen in Parkstad', 'de energie van vóór het aardgas']],
 onderwijs: { ka: [KA_WELVAART], venster: '46. Kolen en gas' },
 cijfers: [['Ontdekking gasveld','29 mei 1959'],['Eerste beving Groningenveld','4 december 1991'],['Beving Huizinge','16 augustus 2012, kracht 3,6'],['Gasbaten voor de staat','ca. 360 miljard euro'],['Winning naar nul','1 oktober 2023']],
 figuren: [['NAM','exploitant van het gasveld'],['Tom van der Lee','voorzitter van de parlementaire enquêtecommissie'],['Hans Vijlbrief','staatssecretaris Mijnbouw'],['Bewoners van Groningen','droegen de gevolgen van de winning']],
 bronnen: [CANON,['Rijksoverheid','https://www.rijksoverheid.nl/'],['Wikipedia: Parlementaire enquête aardgaswinning Groningen',W('Parlementaire enquête aardgaswinning Groningen')],['Wikipedia: Groningenveld',W('Groningenveld')]]
}

});
})();
