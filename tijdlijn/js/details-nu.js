// Uitgebreide achtergrond per gebeurtenis — 21e eeuw. Sleutel = titel van de gebeurtenis.
window.DETAILS = window.DETAILS || {};
(function(){
const W = t => 'https://nl.wikipedia.org/w/index.php?search=' + encodeURIComponent(t);
const CANON = ['Canon van Nederland', 'https://www.canonvannederland.nl/'];
Object.assign(window.DETAILS, {

'Openstelling huwelijk': {
 aanloop: [
  'Lange tijd was homoseksualiteit in Nederland een taboe. Vanaf de jaren zeventig werd de samenleving opener en voerde onder meer het COC actie voor gelijke rechten. Paren van gelijk geslacht konden wel samenwonen, maar hadden niet dezelfde rechten als getrouwde stellen, bijvoorbeeld bij erfenissen en ouderschap.',
  'In de jaren negentig groeide de politieke steun voor gelijke behandeling. Vanaf 1998 konden paren van gelijk geslacht een geregistreerd partnerschap aangaan. Voorstanders vonden dat niet genoeg en wilden een volwaardig huwelijk.'
 ],
 verloop: [
  'Het paarse kabinet-Kok II diende een wetsvoorstel in om het huwelijk open te stellen. In september 2000 stemde de Tweede Kamer in, in december volgde de Eerste Kamer. De wet ging in op 1 april 2001.',
  'Kort na middernacht trouwden in Amsterdam vier paren, in het bijzijn van burgemeester Job Cohen. Als staatssecretaris van Justitie had hij de wet eerder zelf door het parlement geloodsd.',
  'Nederland was daarmee het eerste land ter wereld met een huwelijk voor paren van gelijk geslacht. Daarna volgden België in 2003 en later vele andere landen. Adoptie door paren van gelijk geslacht werd in dezelfde periode wettelijk mogelijk.'
 ],
 cijfers: [['Geregistreerd partnerschap','1998'],['Wet aangenomen','december 2000'],['In werking','1 april 2001'],['Eerste huwelijken','4 paren in Amsterdam']],
 figuren: [['Job Cohen','staatssecretaris, daarna burgemeester van Amsterdam'],['Boris Dittrich','D66-Kamerlid, pleitte al jaren voor de openstelling'],['COC','belangenorganisatie die actie voerde']],
 bronnen: [['Wikipedia: Homohuwelijk in Nederland',W('Homohuwelijk Nederland')],['Wikipedia: Job Cohen',W('Job Cohen')]]
},

'De euro': {
 aanloop: [
  'Na de oprichting van de EEG werkten Europese landen steeds nauwer samen. Met het Verdrag van Maastricht van 1992 spraken ze af een gezamenlijke munt in te voeren. Landen moesten daarvoor aan strenge eisen voldoen, onder meer voor de overheidsschuld en de inflatie.',
  'Op 1 januari 1999 werd de euro ingevoerd voor het girale betalingsverkeer. De wisselkoers werd vastgezet op 2,20371 gulden voor één euro. In de winkel betaalden mensen nog met guldens.'
 ],
 verloop: [
  'Op 1 januari 2002 kwamen de eurobiljetten en -munten in omloop in twaalf landen. Banken en winkels hadden maandenlang voorbereid. Tot eind januari kon nog met guldens worden betaald.',
  'Veel Nederlanders moesten wennen. Ze rekenden nog lang om naar guldens en hadden het gevoel dat alles duurder was geworden. Onderzoek liet zien dat sommige prijzen, zoals in de horeca, inderdaad stegen. Toch maakte de euro reizen en handel binnen Europa eenvoudiger, omdat geld wisselen niet meer nodig was.',
  'De Europese Centrale Bank in Frankfurt bepaalt sindsdien het geldbeleid. De eerste president was de Nederlander Wim Duisenberg. Tijdens de eurocrisis rond 2010 bleek hoe sterk de landen van elkaar afhankelijk waren.'
 ],
 cijfers: [['Giraal ingevoerd','1 januari 1999'],['Munten en biljetten','1 januari 2002'],['Wisselkoers','€1 = ƒ2,20371'],['Landen in 2002','12']],
 figuren: [['Wim Duisenberg','eerste president van de Europese Centrale Bank'],['Gerrit Zalm','minister van Financiën'],['De Nederlandsche Bank','regelde de omwisseling in Nederland']],
 bronnen: [['De Nederlandsche Bank','https://www.dnb.nl/'],['Wikipedia: Euro',W('Euro munteenheid')],['Wikipedia: Nederlandse gulden',W('Nederlandse gulden')]]
},

'Nieuw Koninkrijk': {
 aanloop: [
  'Sinds het Statuut voor het Koninkrijk van 1954 bestond het Koninkrijk uit Nederland, Suriname en de Nederlandse Antillen. Na de onafhankelijkheid van Suriname in 1975 bleven de zes eilanden over. Aruba kreeg in 1986 een eigen status als land binnen het Koninkrijk.',
  'De overige eilanden waren ontevreden over het bestuur vanuit Willemstad. Tussen 2000 en 2005 hielden ze referenda. Curaçao en Sint Maarten kozen voor een eigen status als land. Bonaire en Saba kozen voor een directe band met Nederland. Sint Eustatius stemde eerst voor behoud van de Antillen, maar volgde later dezelfde weg.'
 ],
 verloop: [
  'Op 10 oktober 2010 hielden de Nederlandse Antillen op te bestaan. Curaçao en Sint Maarten werden zelfstandige landen binnen het Koninkrijk, net als Aruba. Nederland nam als onderdeel van de afspraken een groot deel van hun schulden over.',
  'Bonaire, Sint Eustatius en Saba werden openbare lichamen van Nederland, ook wel bijzondere gemeenten genoemd. Samen heten ze Caribisch Nederland. Sinds 2011 is de Amerikaanse dollar er de munt.',
  'Het Koninkrijk bestaat sindsdien uit vier landen: Nederland, Aruba, Curaçao en Sint Maarten. De verhoudingen blijven een punt van discussie, bijvoorbeeld over financieel toezicht en de verschillen in voorzieningen tussen Europees en Caribisch Nederland.'
 ],
 cijfers: [['Statuut voor het Koninkrijk','1954'],['Status aparte Aruba','1986'],['Opheffing Nederlandse Antillen','10 oktober 2010'],['Landen in het Koninkrijk','4']],
 figuren: [['Emily de Jongh-Elhage','laatste premier van de Nederlandse Antillen'],['Gerrit Schotte','eerste premier van Curaçao'],['Sarah Wescot-Williams','eerste premier van Sint Maarten']],
 bronnen: [CANON,['Wikipedia: Staatkundige hervorming Nederlandse Antillen',W('Staatkundige hervorming Nederlandse Antillen')],['Wikipedia: Caribisch Nederland',W('Caribisch Nederland')]]
},

'Koning Willem-Alexander': {
 aanloop: [
  'Nederland werd sinds 1890 geregeerd door vrouwen: Emma als regentes, daarna Wilhelmina, Juliana en Beatrix. Beatrix werd koningin in 1980 en volgde haar moeder Juliana op, die net als Wilhelmina afstand had gedaan van de troon.',
  'Willem-Alexander werd in 1967 geboren als oudste zoon van Beatrix en prins Claus. Hij studeerde geschiedenis in Leiden en hield zich als prins onder meer bezig met waterbeheer. In 2002 trouwde hij met de Argentijnse Máxima Zorreguieta.'
 ],
 verloop: [
  'Op 28 januari 2013 maakte Beatrix in een televisietoespraak bekend dat ze afstand zou doen van de troon. Ze was toen bijna 75 jaar en ruim 32 jaar koningin. Ze zei dat de verantwoordelijkheid voor het land nu in handen hoorde van een nieuwe generatie.',
  'Op 30 april 2013 tekende Beatrix in het Koninklijk Paleis op de Dam de akte van abdicatie. Daarna werd Willem-Alexander in de Nieuwe Kerk in Amsterdam ingehuldigd. Hij was de eerste koning sinds de dood van Willem III in 1890.',
  'Koninginnedag werd Koningsdag, sinds 2014 gevierd op 27 april, de verjaardag van de koning. Zijn oudste dochter Amalia werd prinses van Oranje en is de troonopvolger.'
 ],
 cijfers: [['Aankondiging abdicatie','28 januari 2013'],['Inhuldiging','30 april 2013'],['Vorige koning','Willem III (overleden 1890)'],['Koningsdag','27 april (sinds 2014)']],
 figuren: [['Willem-Alexander','koning der Nederlanden'],['Beatrix','koningin 1980–2013'],['Koningin Máxima','echtgenote van de koning'],['Prinses Amalia','prinses van Oranje, troonopvolger']],
 bronnen: [['Koninklijk Huis','https://www.koninklijkhuis.nl/'],['Wikipedia: Willem-Alexander der Nederlanden',W('Willem-Alexander der Nederlanden')],['Wikipedia: Inhuldiging 2013',W('Inhuldiging Willem-Alexander 2013')]]
},

'Coronapandemie': {
 aanloop: [
  'Eind 2019 werden in de Chinese stad Wuhan de eerste besmettingen met een nieuw coronavirus vastgesteld. Het virus, later SARS-CoV-2 genoemd, verspreidde zich snel via reizigers. De ziekte die het veroorzaakt kreeg de naam COVID-19.',
  'Op 27 februari 2020 werd de eerste besmetting in Nederland bevestigd, bij een man uit Noord-Brabant. Na de carnavalsdagen nam het aantal besmettingen in het zuiden snel toe. Op 11 maart 2020 riep de Wereldgezondheidsorganisatie een pandemie uit.'
 ],
 verloop: [
  'Half maart 2020 sloten scholen, horeca en sportclubs. Het kabinet sprak van een intelligente lockdown: mensen moesten zoveel mogelijk thuisblijven en afstand houden. Ziekenhuizen raakten overvol en patiënten werden verspreid over het land en soms naar Duitsland gebracht.',
  'In januari 2021 begon de vaccinatie. Kort daarna ging een avondklok in, voor het eerst sinds de Tweede Wereldoorlog. Op verschillende plaatsen leidde dat tot rellen. Maatregelen werden steeds weer aangescherpt en versoepeld, wat leidde tot veel discussie en protesten.',
  'Begin 2022 werden de meeste maatregelen geschrapt. Volgens het CBS overleden in de jaren 2020 tot en met 2022 ongeveer 48.000 mensen in Nederland aan COVID-19. De crisis had ook grote gevolgen voor onderwijs, economie en mentale gezondheid.'
 ],
 cijfers: [['Eerste besmetting in Nederland','27 februari 2020'],['Start vaccinatie','januari 2021'],['Avondklok','23 januari – 28 april 2021'],['Doden aan COVID-19 (CBS, 2020–2022)','ca. 48.000']],
 figuren: [['Mark Rutte','minister-president'],['Hugo de Jonge','minister van Volksgezondheid'],['Jaap van Dissel','directeur infectieziektebestrijding RIVM, voorzitter OMT']],
 bronnen: [['RIVM','https://www.rivm.nl/'],['CBS','https://www.cbs.nl/'],['Wikipedia: COVID-19-pandemie in Nederland',W('COVID-19-pandemie in Nederland')]]
},

'Overstromingen in Zuid-Limburg': {
 aanloop: [
  'Half juli 2021 bleef een lagedrukgebied lang boven West-Duitsland, België en Zuid-Nederland hangen. Daardoor viel in korte tijd extreem veel regen. Op 14 juli gaf het KNMI code rood af voor Limburg.',
  'De Geul ontspringt in België en stroomt door een smal dal via Valkenburg naar de Maas. Ook in de Ardennen en de Eifel viel enorm veel regen. Daardoor stegen de Geul, de Roer en de Maas tot recordhoogte.'
 ],
 verloop: [
  'In de nacht van 14 op 15 juli stroomde de Geul door het centrum van Valkenburg. Straten veranderden in rivieren en een brug stortte in. Ook Meerssen, Gulpen en andere dorpen langs de Geul kregen water te verwerken. In Valkenburg werden onder meer zorginstellingen ontruimd.',
  'Daarna steeg de Maas tot het hoogste zomerpeil in meer dan honderd jaar. Op 16 juli werden in en rond Venlo ruim tienduizend mensen geëvacueerd, en ook het ziekenhuis VieCuri. Militairen en vrijwilligers versterkten dijken met zandzakken. De grote Maasdijken hielden stand. In Nederland vielen geen doden, in Duitsland en België wel honderden.',
  'Het kabinet verklaarde de overstroming tot ramp, zodat gedupeerden aanspraak konden maken op een tegemoetkoming. Onderzoekers schatten de schade in Limburg op honderden miljoenen euro’s. Klimaatwetenschappers concludeerden dat zulke extreme regenval door klimaatverandering waarschijnlijker is geworden.'
 ],
 cijfers: [['Code rood KNMI','14 juli 2021'],['Getroffen woningen Valkenburg','ca. 2.300'],['Geëvacueerd rond Venlo','ruim 10.000 mensen'],['Geschatte schade Limburg','€350–600 miljoen']],
 figuren: [['Daan Prevoo','burgemeester van Valkenburg aan de Geul'],['Waterschap Limburg','beheerde dijken en beken'],['Koning Willem-Alexander','bezocht Valkenburg op 15 juli']],
 bronnen: [['Wikipedia: Overstromingen in Europa juli 2021',W('Overstromingen juli 2021 Limburg')],['Waterschap Limburg','https://www.waterschaplimburg.nl/'],['KNMI','https://www.knmi.nl/']]
},

'Gaskraan Groningen dicht': {
 aanloop: [
  'Na de vondst van het Groningenveld in 1959 werd Nederland een gasland. Bijna alle huishoudens kookten en stookten op aardgas en de staat verdiende er volgens de parlementaire enquête ongeveer 360 miljard euro aan. De winning lag in handen van de NAM, van Shell en ExxonMobil.',
  'Vanaf de jaren negentig werden in Groningen aardbevingen gemeten die door de gaswinning kwamen. Lange tijd werden de risico’s klein genoemd. Na de beving bij Huizinge op 16 augustus 2012, met een kracht van 3,6, nam de schade aan huizen sterk toe.'
 ],
 verloop: [
  'Na veel protest en onderzoek besloot het kabinet in maart 2018 de gaswinning af te bouwen. Het oorspronkelijke doel was 2030, later werd het vervroegd. De afhandeling van schade en het versterken van huizen verliep traag en leidde tot veel frustratie bij bewoners.',
  'In februari 2023 concludeerde een parlementaire enquêtecommissie dat de belangen van Groningers jarenlang structureel waren genegeerd. Ze sprak van een ereschuld van de staat. Op 1 oktober 2023 ging de gaswinning naar nul. Daarna werd het einde ook wettelijk vastgelegd.',
  'Met het sluiten van de gaskraan eindigde een periode van ruim zestig jaar. Nederland importeert sindsdien meer gas en zet in op duurzame energie, zoals wind en zon.'
 ],
 cijfers: [['Ontdekking gasveld','1959'],['Beving Huizinge','16 augustus 2012, kracht 3,6'],['Gasbaten voor de staat','ca. 360 miljard euro'],['Winning naar nul','1 oktober 2023']],
 figuren: [['NAM','exploitant van het gasveld'],['Tom van der Lee','voorzitter van de parlementaire enquêtecommissie'],['Hans Vijlbrief','staatssecretaris Mijnbouw'],['Bewoners van Groningen','droegen de gevolgen van de winning']],
 bronnen: [CANON,['Rijksoverheid','https://www.rijksoverheid.nl/'],['Wikipedia: Parlementaire enquête aardgaswinning Groningen',W('Parlementaire enquête aardgaswinning Groningen')]]
}

});
})();
