Popis projektu
==============

Cílem projektu je vytvoření aplikace umožňující vylepšené vyhledávání ve
fotografiích uložených na serveru Flickr. Flickr poskytuje aplikační
rozhraní umožňující simulovat klasické webové rozhraní. Nicméně na
fotografiích vyhledaných klasickým způsobem lze po jejich stažení
aplikovat libovolné doplňující operace. Cílem projektu je tedy aplikace,
která umožní vyhledávání na Flickru založené na klíčových slovech,
stejně jako je tomu na Flickru nyní, ale navíc bude možné zadat
sekundární přetřídění dat podle vzdálenosti k barvě zadané uživatelem.

Vstup
-----

Klíčové slovo, barva a počet výsledků (omezení velikosti výstupu).

Výstup
------

Fotky, jejichž popis odpovídá klíčovému slovu. Fotky budou setříděné
podle vzdálenosti ke zvolené barvě.

Způsob řešení
=============

Kromě řady technických úkonů, bylo nutné vyřešit stěžejní problém práce,
čímž je počítání vzdálenosti barvy a bitmapové fotografie.

Konverze struktur
-----------------

Protože se jedná o dvě různé struktury, je nutné je přenést na stejnou
reprezentaci pro počítání vzdálenosti. Intuitivně se nabízejí dva
postupy

1.  Barva bude převedena na bitmapu (jednobarevný), budu porovnánvat dvě
    bitmapy

2.  Obrázek bude převeden na barvu, budu porovnávat barvy

První přístup je zřejmě obtížnější na implementaci i samotný výpočet a
navíc zbytečně přidává redundanci. Dával by smysl, kdyby bylo dostupné
hotové řešení na porovnání obrázků – například protože by bylo třeba
navíc hledání podle barev s *query by example*.

Pro potřeby práce je tedy vhodnější přístup druhý.

Extrakce barvy z obrázku
------------------------

Nejen že není snadné extrakci jediné barvy z obrázku, která by jej
reprezentovala implementovat, ale není snadné ani definovat, co by
taková barva měla být.

Postupně jsem odkrýval různé metody řešení.

### Naivní postup

První naivní přístup je implementovat průměr barev. Pokud fotografie
obsahuje pouze jednu hlavní barvu a její odstíny (fotografie trávníku)
pak budou výsledky zřejmě uspokojivé. Pokud ale dostaneme fotografii,
například Polské vlajky (červený a bílý pruh), dostaneme jako výsledek
růžovou. Což je barva která na obrázku vůbec není a není tam ani žádná
jí není podobná.

### Vylepšený postup

Je téměř jisté, že k průměrování nebo *zaokrouhlování* barev někdy bude
muset dojít, protože málo která fotografie bude obsahovat dostatečný
počet zcela identických pixelů a by bylo možné vzít prostou majoritu.
Nabízí se tedy řešení vylepšit naivní postup tak, že by byl obrázek
nejdříve rozdělen do jakýchsi sektorů, ze kterých by následovně byl brán
průměr. Poté by se jednotlivé sektory skládaly zpět – podobné (podobné
barvy reprezentující sektory) by se například zprůměrovaly a u
nepodobných by větší pohltil menší.

Tento neformální postup se již blíží algoritmu, který se pro podobné
problémy skutečně používá a to je *median cut algorithm*, resp. jeho
specializace pro práci s barvami.

Samotný *median cut algorithm* je použit právě na rozdělení barev do
shluků, se kterými je možné na dále pracovat.

### Median cut algorithm

Barvy přečtené z obrázků budou typicky ve formátu RGB, tedy v klasické
reprezentaci jako vektor $\{0,1,\dots,255\}^3$. Algoritmus pracuje nad
obecnou kolekcí vektorů stejné (ale obecné) dimenze.

Jeho cílem je rozdělit kolekci na shluky podobných kolekcí.

V každém kroku najde dimenzi s nevyšší rozmanitostí (největší rozsah
hodnot), vektory podle dané dimenze setřídí a rozdělí kolekci v mediánu
na dva shluky. Rekurzivně opakuje na dva shluky.

\[ht\]

``` {.python}
def median_cut(collection, depth, clusters):
    if(depth == 0):
        clusters.add(collection)
        return
    dim = find_richest_dimension(collection)
    collection = sort_by_dim(collection, dim)
    median_index = collection.index(median(collection))
    median_cut(collection[:median_index], depth - 1, clusters)
    median_cut(collection[median_index:], depth - 1, clusters)
```

Algoritmus tedy vytvoří $2^d$ shluků při hloubce rekurze $d$.

### Použitý postup

Výchozí situace algoritmu je jednoduší než v předchozím případě. Pozice
barev vlastně není vůbec důležitá, proto není nutné dělit obrázek do
sektorů – není nutné již vůbec pracovat s obrázkem, ale s kolekcí barev
z jednotlivých pixelů obrázku.

Pixely jsou rozděleny do shluků pomocí median cut algoritmu. Protože
mediány dělí prostor nerovnoměrně, jsou řezy RGB krychlí také
nerovnoměrné a algoritmus ji rozdělí na různě velké kvádry. Největší
kvádry je možné použít jako reprezentační barvy.

Porovnávání barev
-----------------

Pro projekt je potřebný nějaký aparát, který pro dvě barvy rozhodne o
jejich podobnosti nebo vzdálenosti, aby bylo možné podle této hodnoty
obrázky řadit, nyní když je již vyřešená otázka extrakce barvy.

Po krátkém průzkumu @so:color-compare jsem zjistil, že není doporučené
dělat jakékoli porovnání barev v reprezentaci RGB. Model RGB není tzv.
*perceptually uniform*, což znamená že malé změny v RGB modelu nemusí
mít za výsledek malé změny v barevném vjemu a obráceně – dvě vzdálené
barvy v RGB mohou vypadat velmi podobně. Obecně jsou pro porovnávání
doporučeny formáty, které extrahují složku světlosti. Jmenovitě jsou
doporučované YUV a Lab.

### $\Delta E_{76}$

Samotné vzdálenosti barev jsou navíc standardizovány. Nejznámější
metrikou je $\Delta E$@delta-e. Prvním standardem je CIE76, tuto metriku
jsem použil. Jedná se o metriku $L_2$ nad barvami v reprezentaci Lab.

$$\Delta E_{76}={\sqrt {(L_{2}-L_{1})^{2}+(a_{2}-a_{1})^{2}+(b_{2}-b_{1})^{2}}}$$

![E @delta-e](lab-space){width="50.00000%"}

### Převody barev

Samotné převody barev mezi barevnými prostory nejsou příliš zajímavé. Je
nutné si uvědomit, že různé barevné prostory nemusí mít stejné gamuty –
jedná se o aproximace a není tedy každý převod bezztrátově invertibilní.

Převod RGB do Lab se provádí přes prostor CIE XYZ@rgb-xyz@xyz-lab. A
vždy je možné jej implementovat jako násobení vektoru vhodnou maticí.

Implementace
============

Projekt jsem se rozhodl implementovat v javascriptu, jako single-page
aplikaci s webovým rozhraním.

Stavba aplikace
---------------

Hlavním nástrojem pro stavbu aplikace je použita knihovna React@react,
která se primárně stará o uživatelskké rozhraní, členění do komponent a
jejich asynchronní real-time vykreslování.

Flickr API
----------

Pro komunikaci s Flickr bylo využito vystavené REST API. Ukázka
požadavku na hledání obrázků je v ukázce kódu \[lst:req\] a odpověď v
\[lst:res\].

Z odpovědi je nutné poskládat url obrázku. To je možné získat
kosntruktem z ukázky kódu \[lst:img\].

\[ht\]

``` {.yaml}
# headers
server: api.flickr.com
method: GET
path: /services/rest/
# query
text: <query>
method: flickr.photos.search
sort: relevance
nojsoncallback: true
format: json
api_key: <api key>
```

\[ht\]

``` {.json}
{  
   "photos":{  
      "page":1,
      "pages":84091,
      "perpage":100,
      "total":"8409084",
      "photo":[  
          {  
            "id":"13545844805",
            "owner":"28596055@N02",
            "secret":"170ec3746b",
            "server":"3677",
            "farm":4,
            "title":"cat",
            "ispublic":1,
            "isfriend":0,
            "isfamily":0
         }
         //...
      ]
   },
   "stat":"ok"
}
```

\[ht\]

``` {.sh}
http://farm${image.farm}.staticflickr.com/
    ${image.server}/${image.id}_${image.secret}_q.jpg
```

Color-thief
-----------

Pro extrakci palety barev jsem použil knihovnu Color-Thief.

Ta je však závislá na balíčcích Node.js, které využívají knihovny
napsané v C++, takže není možné je použít na front-endu (celý React je
zkompilován do JS, který běží v browseru).

Bylo tedy nutné navíc implementovat Node.js server a vystavit jím
rozhraní pro extrakci palety barev.

Server přijme kolekci zdrojů obrázků a pro každý stáhne obsah URL a
pošle data buffer knihovně Color-thief. Návratovou hodnotou je tedy
kolekce barev seřízené podle velikosti shluků, která je pro každý
obrázek vrácena.

Semantic UI
-----------

Semantic UI @semantic je frontendový framework, podobně jako například
známější Twitter Bootstrap. Je použit pro vzhled a chování GUI.

Další nástroje
--------------

Pro konverzi barev mezi barevnými prostory byl využit balíček npm
color-convert@convert. Pro snazší práci zejména s kolekcemi objektů byl
využit balíček lodash@lodash.

Příklad výstupu
===============

Výchozí obrazovka na obrázku \[img:1\] obsahuje formulář. Zde je možné
zadat textový dotaz, vybrat barvu a limitovat počet obrázků. Pod
formulářem jsou připraveny dva sloupce, jeden pro výchozí řazení dle
relevance z Flikcr a druhý pro přeřazení podle barvy.

![Výchozí obrazovka \[img:1\]](1){width="\textwidth"}

Při změně formuláře jsou nataženy obrázky z Flickr. Aby bylo zřejmé, že
probíhá načítání, je dostupná indikace, jako je vidět na obrázku
\[img:2\].

![Indikace načítání \[img:2\]](2){width="\textwidth"}

Jakmile je vše hotovo, jsou k dispozici oba sloupce. Pravý je přeřazený
podle barvy v obrázku \[img:3\].

![Náhled výsledku \[img:3\]](3){width="\textwidth"}

Na více vzorcích jsou výsledky lépe vidět. Na obr. \[img:4\] je ukázka
červených aut pro 100 výsledků.

![Náhled výsledku \[img:4\]](4){width="\textwidth"}

Po kliknutí na obrázek je zobrazen v originální velikosti. Pod ním jsou
zobrazeny *dominantní barvy*, které jsou zohledňovány při řazení. Tento
náhled je zobrazen na obrázku \[img:5\].

![Detail obrázku s extrahovanými barvami
\[img:5\]](5){width="\textwidth"}

Experimentální sekce
====================

V rámci experimentů jsem měřil čas běhu v závislosti na počtu
fotografií. Graf naměřených hodnot je na obrázku \[img:time\].

Měřil jsem čas běhu z aplikace pro různé hodnoty počtu obrázků, zvláště
časy

-   návratu odpovědi z Flickr, od vyslání požadavku,

-   návratu odpovědi z lokálního serveru s barvami, od vyslání
    požadavku,

-   dokončení počtu vzdáleností a setřídění kolekce.

Naměřené časy jsou průměrem z opakovaných měření.

![Časy běhů \[img:time\]](time){width="\textwidth"}

Flickr API neumožňuje nastavit limit obrázků – výsledek je tedy oříznut
až v aplikaci, proto není patrný růst průběhu.

Dle očekávání, nejvíce času zabere extrakce barev z bitmap.

Téměř veškerý kód v aplikaci (jak na serveru, tak v prohlížeči) probíhá
asynchronně. Extrakce barvy z URL obrázku na serveru, probíhá ve dvou
fázích.

1.  Stažení data bufferu z dané url,

2.  iterace přes pixely a samotná extrakce palety barev.

Stažení data bufferu pro každý obrázek jistě představuje významnou
časovou zátěž, proto je právě zde důležité, že získávání dat probíhá
asynchronně. Pro samotné výpočty platí totéž, však Node.js pracuje pouze
na jednom vlákně, takže není schopen skutečně provádět paralelní
výpočty.

V případě nutnosti zvýšení rychlosti by bylo možné rozložit výpočty mezi
více serverů, nebo upravit konfigurace algoritmů. Klíčovým parametrem
je, jaké procento pixelů je zohledňováno pro odhad. Současné nastavení
je každý 10-tý pixel. Výpočet je také prováděn pouze na náhledu obrázku.

Alternativně by bylo možné prozkoumat zcela jiné implementace pro
extrakce barev.

Diskuze
=======

Navzdory očekávání, v dané implementaci nehrálo příliš velkou roli zda
byla metrika $L_2$ na barvami RGB nebo Lab modelu.

Je tomu tak patrně tím, že nikdy není v výsledku dostatečná rozmanitost
barev, aby byl rozdíl příliš patrný.

Nejdříve jsem se domníval, že bude stačit pouhé využití jediné funkce
pro extrakci barvy z knihovny ColorThief. Při experimentování s výsledky
jsem zjistil, že omezení na jedinou barvu je příliš limitující.

Šlo o podobné obrázky, jako byla zmíněná polská vlajka. Výsledek byla
pouze jedna dominantní barva – červená, nebo bílá. Pokud ale to byl
jediný obrázek v kolekci, který tyto barvy obsahoval, bylo by vhodné,
aby byl vyhodnocen jako vhodný pro oba dotazy.

Rozhodl jsem se tedy použít pro výpočet paletu barev (několik největších
shluků).

Vzdálenost byla brána jako minimální vzdálenost pro každou vybranou
barvu.

Při použití čtyřech a více, však naopak docházelo k tomu, že dominantní
barvy byly z příliš malých shluků. Proto jsem se rozhodl použít právě
tři barvy.

Kdyby bylo zpracováváno větší množství fotek a bylo by nutné přesnějších
metrik, bylo by možné místo prostého minima vzdáleností, brát vážený
průměr vzdáleností od vypočtených shluků.

Závěr
=====

Běhěm práce na projektu jsem prozkoumal různé metody extrakce palety
barev z bitmapových obrázků a seznámil jsem se blíže se základními
algoritmy na porovnávání barev.

Naimplementoval jsem aplikaci dle zadání s asynchronním zpracováním
všech hlavních výpočtů. Aplikace má dynamické uživatelské rozhraní a
komunikuje s taktéž vyvinutým serverem pro extrakci palety barev.

V experimentální sekci jsem porovnal časy běhů aplikace pro různé vstupy
a navrhl možnosti zlepšení výkonu.
