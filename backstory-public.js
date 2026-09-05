// Spoiler-safe character background and relationship layer.
// This file contains only material suitable for the whole party archive.
window.GREYWAKE_DATA=window.GREYWAKE_DATA||{};
window.GREYWAKE_EDGES=window.GREYWAKE_EDGES||[];
window.GREYWAKE_CATEGORIES=window.GREYWAKE_CATEGORIES||{};
window.GREYWAKE_RELATION_NOTES=window.GREYWAKE_RELATION_NOTES||{};

const publicPairKey=(a,b)=>a<b?`${a}|||${b}`:`${b}|||${a}`;
function publicCategory(name,category){
  if(!window.GREYWAKE_CATEGORIES[category])window.GREYWAKE_CATEGORIES[category]=[];
  if(!window.GREYWAKE_CATEGORIES[category].includes(name))window.GREYWAKE_CATEGORIES[category].push(name);
}
function publicLink(a,b,note=''){
  if(!window.GREYWAKE_EDGES.some(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a)))window.GREYWAKE_EDGES.push([a,b]);
  if(note)window.GREYWAKE_RELATION_NOTES[publicPairKey(a,b)]=note;
}

// Public PC background: richer than the short launch summaries, but with private hooks removed.
if(window.GREYWAKE_DATA.Clay){
  window.GREYWAKE_DATA.Clay.html=`
  <p>Clay is a Ridgeborne Ranger, Great-Shell handler, caravan scout and practical judge of desert risk. His family livelihood is tied to the Great-Shells that keep Greywake's caravans and heavy transport moving.</p>
  <p>He works around Caravan Syndicate routes, contracts, crews and Great-Shell logistics, but he is valued for the working side of that system rather than its inner politics. Clay's question is rarely just whether a group can reach somewhere. He judges whether the people, beasts, load and water can still make the return journey.</p>
  <h2>What Clay is known for</h2>
  <ul><li>Reading tracks, terrain, weather and predator signs.</li><li>Recognising when a Great-Shell is tired, frightened, injured or overloaded.</li><li>Spotting bad loads, bad shelter and routes that are becoming a bad bargain.</li><li>Saying when turning back is still possible.</li></ul>
  <p>Hopkins, his giant kangaroo-rat companion, is part of how Clay scouts and notices danger outside the walls.</p>`;
}

if(window.GREYWAKE_DATA.Velmira){
  window.GREYWAKE_DATA.Velmira.html=`
  <p>Velmira is a Wanderborne Human Wizard and trader of useful things. She deals in practical goods, small comforts, route rumours and favours rather than luxury wares.</p>
  <p>People come to Velmira because she listens, knows who might have what they need, and can make a difficult situation feel manageable. She is well connected around Greywake without being an insider to every faction.</p>
  <h2>What Velmira notices</h2>
  <ul><li>Which goods are becoming scarce and who is anxious about it.</li><li>When a rumour is spreading too neatly.</li><li>When public explanations sound designed to calm people rather than inform them.</li><li>Changes in the public behaviour of groups such as the Tower Watch or the Faithful.</li><li>When someone wants help but cannot ask openly.</li></ul>
  <p>Velmira reads people well. That does not mean she automatically knows the truth behind what they are hiding.</p>`;
}

if(window.GREYWAKE_DATA.Odie){
  window.GREYWAKE_DATA.Odie.html=`
  <p>Odie is an Underborne fixer, repairman and scavenger who keeps broken things working because most people in Greywake cannot afford to replace them.</p>
  <p>He lost an arm several years ago and later built and maintains his own crude salvage prosthetic. It is practical rather than elegant: another example of Odie making something useful from what Greywake has available.</p>
  <p>Odie is mainly a fixer, but when repairs need parts he works the same ground as the Diggers: scrap, fittings, ceramic, metal, tools and anything else that can buy a broken cart, roof, shelter or piece of gear another day of useful life.</p>
  <h2>What Odie is known for</h2>
  <ul><li>Spotting weak points and unsafe structures.</li><li>Making temporary repairs under pressure.</li><li>Using scrap creatively.</li><li>Knowing what can still be saved.</li><li>Taking awkward jobs other repairers may not want.</li></ul>`;
}

window.GREYWAKE_DATA.Marek={
  title:'Marek',
  category:'Player Characters',
  html:`
  <p>Marek is a Greywake Druid who specialises in fauna, anatomy and biological adaptation.</p>
  <p>He works as an <strong>animal assessor and field gatherer</strong> for Greywake's Druids and other specialists. He evaluates unfamiliar creatures for behaviour, threat and potential usefulness, then retrieves specific biological materials when commissioned: bones, glands, membranes, venom, organs or other samples.</p>
  <h2>What Marek is known for</h2>
  <ul><li>Finding and understanding the right creature for a commission.</li><li>Reading creature behaviour and signs of danger.</li><li>Identifying the requested biological material.</li><li>Recovering samples safely and in a condition useful to the specialist who requested them.</li></ul>
  <p>Marek is not automatically the person who turns those materials into medicines or other products. Processing, formulation and final application may belong to specialists such as Meren.</p>`
};
publicCategory('Marek','Player Characters');

// Public relationship history between the PCs.
publicLink('Clay','Velmira','Longstanding trust mixed with a running ledger of petty grudges, favours and harmless arguments.');
publicLink('Velmira','Odie','Velmira helped keep Odie alive after the injury that cost him his arm; Odie survived and later rebuilt for himself.');
publicLink('Marek','Player Brain','Marek is an active Greywake PC whose public record includes his fauna work and field-gathering occupation.');
publicLink('Marek','Velmira','Velmira helps Marek interpret social intent and subtext; he is better at reading bodies than what people mean.');
publicLink('Marek','Odie','Marek finds Odie unusually difficult to read because the prosthetic changes his weight distribution and movement patterns.');

// Clay's everyday place in Greywake.
publicLink('Clay','Caravan Syndicate','Clay works around Syndicate routes, crews, contracts and Great-Shell logistics without being part of its inner leadership.');
publicLink('Clay','Great-Shell Pens','Clay and his family are part of the working Great-Shell world centred on the pens in Greater Greywake.');
publicLink('Clay','Great-Shell','Great-Shell handling is central to Clay’s work, family livelihood and judgement of caravan risk.');
publicLink('Clay','Hopkins','Hopkins is Clay’s working scout companion rather than simply a pet.');
publicLink('Clay','The Wastes','Clay is a practical route judge who reads survival pressure before it becomes disaster.');
publicLink('Clay','Split Rock Shade','A known point marking the furthest Clay had personally travelled before the campaign began.');

// Odie's everyday place in Greywake.
publicLink('Odie','The Diggers','Odie is primarily a fixer, but he digs and salvages when a repair needs parts.');
publicLink('Odie','Digger Yards','The yards are part of the salvage economy that feeds Odie’s repair work.');
publicLink('Odie','Repair & Salvage','Repair, reuse and scavenged parts are the centre of Odie’s working life.');
publicLink('Odie','Greater Greywake','Odie’s search for useful parts naturally takes him into the older working and salvage ground beyond Inner Greywake.');

// Velmira's public social/trade network.
publicLink('Velmira','Mara Vell','Velmira knows the Dust Broker as a public source of rumours, warnings, names and information for a price.');
publicLink('Velmira','Valve Court','Trade, ration queues and public pressure make Valve Court one of the places where Velmira notices what Greywake needs and fears.');
publicLink('Velmira','Tower Watch','Velmira is familiar with the Watch’s public behaviour and notices when its routines or explanations change.');
publicLink('Velmira','The Faithful','Velmira knows their public rituals, language and the way frightened people can be drawn toward them.');
publicLink('Velmira','Caravan Syndicate','As a trader of practical goods and information, Velmira has ordinary working contact with the caravan economy.');
publicLink('Velmira','Sister Elowen','Sister Elowen is a public voice among the Faithful whom Velmira knows through Greywake’s social life.');

// Public Tower Watch figure.
window.GREYWAKE_DATA['Brannic Hale']={
  title:'Brannic Hale',
  category:'People',
  html:`<p>Brannic Hale is the commander of the Tower Watch and a public figure in Greywake.</p><p>He is known by reputation, sight and public behaviour rather than because ordinary people have access to the Watch's private records. Brannic represents the Watch's guarded approach: observe, record and contain uncertainty without claiming to possess a final explanation of the White Tower.</p>`
};
publicCategory('Brannic Hale','People');
publicLink('Brannic Hale','Tower Watch','Brannic Hale commands the Tower Watch.');
publicLink('Brannic Hale','White Tower','His public role centres on the Watch that observes and protects the Tower precinct.');
publicLink('Brannic Hale','Greywake','Brannic is a recognised public authority figure within the settlement.');
publicLink('Brannic Hale','Known People','Brannic Hale is safe for the whole party to know as commander of the Tower Watch.');
publicLink('Brannic Hale','Velmira','Velmira knows Brannic by reputation, sight or ordinary public interactions.');
