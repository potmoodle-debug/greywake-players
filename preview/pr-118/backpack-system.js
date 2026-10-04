(() => {
  const CODES={marek:'MAREK',velmira:'VELMIRA',odie:'ODIE'};
  const FILTERS=[['all','All'],['weapon','Weapons'],['armor','Armor'],['consumable','Consumables'],['gear','Gear'],['story','Story Items']];
  const COMMON_GEAR={
    marek:['Torch','50 ft Rope','Basic Supplies','Small Bag of Rocks and Bones','Pale Thread Membrane Sample'],
    velmira:['Torch','50 ft Rope','Basic Supplies','Nomadic Pack','Book being translated','Leather Satchel'],
    odie:['Torch','50 ft Rope','Basic Supplies','Grappling Hook','Salvage-built Prosthetic Arm','Oldwork Finger · separate and unfitted']
  };
  const LIBRARY_GEAR={
    marek:['Torch','50 ft Rope','Basic Supplies'],
    velmira:['Torch','50 ft Rope','Basic Supplies'],
    odie:['Torch','50 ft Rope','Basic Supplies']
  };
  const ITEM_VISUALS=window.GREYWAKE_ITEM_VISUALS||{};

  function itemArtwork(kind){
    const bg='<defs><linearGradient id="gwArtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b89562"/><stop offset=".58" stop-color="#655039"/><stop offset="1" stop-color="#262119"/></linearGradient><linearGradient id="gwArtMetal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d3c18e"/><stop offset=".45" stop-color="#77694a"/><stop offset="1" stop-color="#342f25"/></linearGradient><linearGradient id="gwArtLeather" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#815637"/><stop offset=".55" stop-color="#4b3123"/><stop offset="1" stop-color="#231a14"/></linearGradient><filter id="gwArtShadow"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity=".55"/></filter></defs><rect width="320" height="150" fill="url(#gwArtSky)"/><path d="M0 108 55 82 94 100 152 70 207 96 260 76 320 98V150H0Z" fill="#29241c" opacity=".9"/><path d="M0 119 48 106 104 115 170 101 232 115 320 105V150H0Z" fill="#171510"/>';
    const wrap=shape=>'<div class="p7-pack-art has-illustration" aria-hidden="true"><svg viewBox="0 0 320 150" focusable="false">'+bg+'<g filter="url(#gwArtShadow)">'+shape+'</g></svg></div>';
    const wood='#6f4a2f',rope='#b29a69',cloth='#b9aa87',dark='#201b16',metal='url(#gwArtMetal)',leather='url(#gwArtLeather)';
    const art={
      staff:`<g transform="rotate(-18 160 78)"><rect x="56" y="72" width="210" height="16" rx="8" fill="${wood}"/><path d="M85 69v22m35-25v28m93-27v27" stroke="${rope}" stroke-width="6"/></g>`,
      greatstaff:`<g transform="rotate(-17 160 76)"><rect x="42" y="69" width="236" height="17" rx="8" fill="${wood}"/><path d="M58 64l25 10-23 12M245 61l22 16-22 15" fill="none" stroke="${metal}" stroke-width="7"/><circle cx="260" cy="76" r="12" fill="#b99043"/><path d="M92 67v22m84-24v25" stroke="${rope}" stroke-width="6"/></g>`,
      shield:`<ellipse cx="161" cy="80" rx="72" ry="55" fill="#714c30" stroke="${metal}" stroke-width="8"/><path d="M112 44v72M160 26v108M208 44v72" stroke="#9c744c" stroke-width="5" opacity=".7"/><circle cx="161" cy="80" r="18" fill="${metal}"/><path d="M161 39v82M121 80h80" stroke="#d4c18b" stroke-width="3" opacity=".65"/>`,
      gambeson:`<path d="M115 36 145 26h31l29 10 25 35-20 18-14-15v57H119V74l-14 15-20-18Z" fill="#b7ab8e" stroke="#5f5645" stroke-width="5"/><path d="M130 43v83m19-94v97m19-97v97m18-86v83" stroke="#786e59" stroke-width="3"/><path d="M124 58h71M122 84h75M121 109h76" stroke="#867b64" stroke-width="2"/>`,
      leather:`<path d="M112 35 143 24h36l30 11 21 36-19 15-16-17v62H121V69l-16 17-19-15Z" fill="${leather}" stroke="#271c17" stroke-width="5"/><path d="M139 29v97m41-97v97M124 59h72M123 88h74M123 113h74" stroke="#a87c4f" stroke-width="3"/><rect x="146" y="54" width="27" height="8" rx="3" fill="${metal}"/><rect x="146" y="83" width="27" height="8" rx="3" fill="${metal}"/>`,
      whip:`<path d="M79 102c76-70 190-62 165-10-20 41-118 19-89-14 19-22 88-12 111 31" fill="none" stroke="#3f281e" stroke-width="11" stroke-linecap="round"/><path d="M68 107 111 83" stroke="#7f5839" stroke-width="16" stroke-linecap="round"/><path d="M78 102 108 86" stroke="${rope}" stroke-width="4"/>`,
      spear:`<g transform="rotate(-14 160 78)"><rect x="58" y="73" width="212" height="12" rx="6" fill="${wood}"/><path d="M267 61 304 79 267 96Z" fill="${metal}" stroke="#27231c" stroke-width="4"/><path d="M88 70v18m34-20v22" stroke="${rope}" stroke-width="5"/></g>`,
      dagger:`<g transform="rotate(-10 160 78)"><path d="M111 76 210 60 226 75 211 89Z" fill="${metal}" stroke="#312b22" stroke-width="4"/><rect x="70" y="69" width="50" height="15" rx="7" fill="${wood}"/><rect x="112" y="64" width="10" height="26" rx="4" fill="#9a7c50"/><path d="M78 68v18m14-20v20" stroke="${rope}" stroke-width="4"/></g>`,
      torch:`<g transform="rotate(-20 154 85)"><rect x="73" y="82" width="178" height="16" rx="8" fill="${wood}"/><path d="M72 74h42l9 16-14 20H67l-11-19Z" fill="#33241a"/><path d="M70 82c-9-25 18-39 11-62 28 16 31 38 19 61-8-11-11-22-5-35-18 13-13 24-25 36Z" fill="#d77b2a"/><path d="M77 78c-2-15 11-24 10-36 13 10 15 22 8 35Z" fill="#f3c45f"/></g>`,
      rope:`<g fill="none" stroke="${rope}" stroke-width="9"><ellipse cx="160" cy="78" rx="80" ry="42"/><ellipse cx="160" cy="78" rx="62" ry="31"/><ellipse cx="160" cy="78" rx="44" ry="21"/><path d="M215 102c26 7 42 19 55 32"/></g>`,
      supplies:`<path d="M92 48h62l12 17v61H78V66Z" fill="#b7aa89" stroke="#4f4535" stroke-width="4"/><path d="M104 46c3-17 32-17 36 0" fill="none" stroke="${rope}" stroke-width="6"/><rect x="175" y="61" width="55" height="67" rx="8" fill="${leather}"/><ellipse cx="248" cy="111" rx="35" ry="16" fill="#7a5434"/><circle cx="238" cy="106" r="6" fill="#9f5d36"/><circle cx="252" cy="111" r="5" fill="#bd7642"/><circle cx="263" cy="105" r="5" fill="#825238"/>`,
      satchel:`<rect x="87" y="49" width="148" height="80" rx="10" fill="${leather}" stroke="#2b2018" stroke-width="5"/><path d="M91 68h140l-16 34H107Z" fill="#6f472e"/><path d="M118 48c4-35 81-35 86 0" fill="none" stroke="#6a452f" stroke-width="9"/><rect x="153" y="84" width="17" height="18" rx="3" fill="${metal}"/>`,
      hook:`<path d="M155 42v71m0-22c-33 0-51 19-54 45m54-45c33 0 51 19 54 45m-54-42c-16 7-24 23-24 39m24-39c16 7 24 23 24 39" fill="none" stroke="${metal}" stroke-width="12" stroke-linecap="round"/><path d="M155 114c0 0 21 4 39 20" stroke="${rope}" stroke-width="8" fill="none"/>`,
      'health-potion':`<path d="M139 39h42v18l12 18v49H127V75l12-18Z" fill="#7a1f1f" stroke="#d3bd8b" stroke-width="5"/><rect x="139" y="31" width="42" height="13" rx="4" fill="#765635"/><path d="M136 88h48" stroke="#f1d59b" stroke-width="3"/><path d="m160 72 8 14-8 14-8-14Z" fill="#e5bd65"/>`,
      'stamina-potion':`<path d="M139 39h42v18l12 18v49H127V75l12-18Z" fill="#8b5d26" stroke="#d3bd8b" stroke-width="5"/><rect x="139" y="31" width="42" height="13" rx="4" fill="#765635"/><circle cx="160" cy="88" r="14" fill="none" stroke="#f1d59b" stroke-width="3"/><path d="M160 67v42M139 88h42" stroke="#f1d59b" stroke-width="2"/>`,
      bones:`<path d="M93 111c0-47 15-76 38-76s38 29 38 76Z" fill="#5e3e2c"/><circle cx="186" cy="84" r="24" fill="#d3c6a5"/><circle cx="178" cy="79" r="5" fill="${dark}"/><circle cx="195" cy="79" r="5" fill="${dark}"/><path d="M186 90v17" stroke="#756b59" stroke-width="4"/><path d="M199 113 249 77m-49 1 49 36" stroke="#d7c9aa" stroke-width="8" stroke-linecap="round"/><circle cx="112" cy="105" r="14" fill="#6b6555"/><circle cx="139" cy="118" r="10" fill="#9e8c68"/>`,
      thread:`<path d="M72 111 104 43l55 30 49-35 43 73Z" fill="#e7e1ce" opacity=".42" stroke="#f0eadc" stroke-width="2"/><path d="M77 107 106 47l51 29 49-33 39 64M95 79l130 13M118 58l57 68M188 55l-47 70M84 103l154-48" stroke="#efeadd" stroke-width="2" opacity=".86"/><circle cx="160" cy="83" r="9" fill="#c8c1ad" opacity=".75"/>`,
      'nomadic-pack':`<rect x="105" y="56" width="111" height="73" rx="13" fill="${leather}" stroke="#2a2018" stroke-width="5"/><rect x="92" y="39" width="136" height="31" rx="14" fill="#786451" stroke="#34291f" stroke-width="4"/><path d="M116 63v64m88-64v64" stroke="#b58d55" stroke-width="6"/><path d="M132 40v30m57-30v30" stroke="${rope}" stroke-width="5"/><circle cx="222" cy="105" r="14" fill="${metal}"/>`,
      book:`<path d="M72 49c43-18 72-11 88 8v71c-25-16-54-18-88-6Zm176 0c-43-18-72-11-88 8v71c25-16 54-18 88-6Z" fill="#d8cba7" stroke="#4c3928" stroke-width="5"/><path d="M160 57v72M92 69h48m-48 16h48m-48 16h39m49-32h48m-48 16h48m-48 16h39" stroke="#72634d" stroke-width="3"/><circle cx="207" cy="99" r="15" fill="none" stroke="#8f6c38" stroke-width="3"/>`,
      prosthetic:`<path d="M79 82 131 56l84 36-22 40-86-30Z" fill="#746a59" stroke="#2a2722" stroke-width="5"/><rect x="104" y="63" width="75" height="25" rx="12" fill="#6b4b32"/><circle cx="203" cy="105" r="24" fill="${metal}"/><path d="M223 102 266 86m-39 25 45 1m-50 9 39 18" stroke="${metal}" stroke-width="8" stroke-linecap="round"/><path d="M118 64v42m26-51v61m27-50v59" stroke="#b39a6a" stroke-width="4"/>`,
      oldwork:`<g transform="rotate(-9 160 83)"><rect x="119" y="62" width="92" height="37" rx="18" fill="${metal}" stroke="#332b21" stroke-width="5"/><rect x="132" y="67" width="18" height="27" rx="8" fill="#977c4c"/><rect x="156" y="67" width="18" height="27" rx="8" fill="#a68a53"/><rect x="180" y="67" width="18" height="27" rx="8" fill="#816c47"/><circle cx="207" cy="81" r="10" fill="#c7ac69"/></g>`
    };
    return wrap(art[kind]||'<circle cx="160" cy="80" r="34" fill="#857552"/><path d="M144 80h32M160 64v32" stroke="#e0ce9b" stroke-width="5"/>');
  }

  let activeFilter='all',libraryOpen=false,customPanelOpen=false,lastStatus=null,actionInProgress=false;

  const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const characterKey=()=>{const k=String(window.GreywakePlayer?.character||document.body.dataset.character||'').toLowerCase();return CODES[k]?k:null;};
  const characterName=()=>window.GreywakePlayer?.character||document.body.dataset.character||'Character';
  const preview=()=>document.body.dataset.gmPreview==='true';
  const equipment=()=>window.GreywakeEquipment||null;
  const resources=()=>characterKey()==='marek'?window.GreywakeResources:window.GreywakeCompanion;
  const dialog=()=>document.getElementById('p7BackpackDialog');
  const storeKey=()=>`greywake:p7-utilities:${characterKey()||'unknown'}${preview()?':gmtest':''}`;
  const loadState=()=>{try{const raw=JSON.parse(localStorage.getItem(storeKey())||'null');return{items:Array.isArray(raw?.items)?raw.items.map(String).filter(Boolean):[],conditions:Array.isArray(raw?.conditions)?raw.conditions.map(String).filter(Boolean):[]};}catch(_){return{items:[],conditions:[]};}};
  const saveState=next=>{try{localStorage.setItem(storeKey(),JSON.stringify(next));}catch(_){}window.dispatchEvent(new CustomEvent('greywake:equipment-state-changed',{detail:{ok:true,reason:'Backpack update'}}));window.GreywakeP7?.renderUtilities?.();};

  const bagIcon=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 7V5.8A3.5 3.5 0 0 1 12 2.3a3.5 3.5 0 0 1 3.5 3.5V7M6.4 7h11.2c1.1 0 2 .9 2 2v10.2a2 2 0 0 1-2 2H6.4a2 2 0 0 1-2-2V9c0-1.1.9-2 2-2Zm2.1 0v3m7-3v3M8 13.2h8v5H8v-5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function ensureStyles(){
    if(document.getElementById('greywake-backpack-styles'))return;
    const s=document.createElement('style');s.id='greywake-backpack-styles';s.textContent=`
      .p7-backpack-entry{display:flex;justify-content:flex-end;margin:10px 0 14px}.p7-backpack-button{display:inline-flex;align-items:center;gap:10px;border:1px solid #8f7540;background:linear-gradient(180deg,#352a18,#211a10);color:#f2d78e;padding:10px 14px;cursor:pointer;font-weight:900;letter-spacing:.06em;text-transform:uppercase;box-shadow:0 8px 20px rgba(0,0,0,.22)}.p7-backpack-button svg{width:24px;height:24px}.p7-backpack-button small{display:block;color:#b6aa8a;font-size:8px;letter-spacing:.12em}.p7-backpack-button strong{display:block;font-size:11px;color:#f3dfaa}
      .p7-backpack-dialog{border:1px solid #7f6a3c;background:#11110d;color:#e8dec2;width:min(94vw,940px);max-height:88vh;padding:0;box-shadow:0 30px 90px rgba(0,0,0,.7)}.p7-backpack-dialog::backdrop{background:rgba(0,0,0,.74)}.p7-backpack-shell{display:grid;grid-template-rows:auto 1fr;max-height:88vh}.p7-backpack-head{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:18px 20px;border-bottom:1px solid rgba(202,179,111,.22);background:linear-gradient(180deg,#242016,#17150f)}.p7-backpack-head-title{display:flex;gap:12px;align-items:center}.p7-backpack-head-title svg{width:34px;height:34px;color:#d3b86c}.p7-backpack-head span{font-size:8px;letter-spacing:.16em;color:#a99c78;font-weight:900}.p7-backpack-head h2{margin:3px 0 0;font:26px Georgia,serif;color:#f1e5c5}.p7-backpack-close{border:0;background:transparent;color:#c8b98e;font-size:28px;cursor:pointer}.p7-backpack-body{overflow:auto;padding:18px 20px 24px}.p7-backpack-toolbar{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.p7-backpack-toolbar p{margin:0;color:#9e967f;font-size:11px}.p7-backpack-add{border:1px solid #9a7f43;background:#302616;color:#ffe097;padding:10px 13px;font-weight:900;cursor:pointer}
      .p7-backpack-filters{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:0 0 14px;padding:9px 10px;border:1px solid rgba(202,179,111,.2);background:#15140f}.p7-backpack-filters>span{font-size:8px;letter-spacing:.14em;color:#8e8774;font-weight:900;margin-right:3px}.p7-backpack-filter{display:inline-flex;align-items:center;gap:6px;border:1px solid #504a37;background:#1b1912;color:#b9ad8c;padding:7px 9px;cursor:pointer;font-size:9px;font-weight:800}.p7-backpack-filter:hover,.p7-backpack-filter:focus-visible{border-color:#8d7949;color:#e4d39e}.p7-backpack-filter[aria-pressed="true"]{border-color:#9a7f43;background:#302616;color:#ffe29b}.p7-backpack-filter b{display:inline-grid;place-items:center;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:rgba(0,0,0,.28);font-size:8px;color:inherit}
      .backpack-use-note{margin:0 0 12px;padding:10px 12px;border:1px solid rgba(205,187,121,.24);background:#17150f;color:#9f9782;font-size:10px;line-height:1.45}.backpack-use-note strong{color:#e6d39a}.backpack-status{margin:0 0 14px;padding:12px 14px;border:1px solid;font-size:11px;line-height:1.45;box-shadow:0 7px 20px rgba(0,0,0,.2)}.backpack-status[data-tone="success"]{border-color:rgba(121,185,105,.72);background:linear-gradient(180deg,#1b321c,#122414);color:#ddf5d5;box-shadow:inset 3px 0 0 #79b969,0 7px 20px rgba(0,0,0,.2)}.backpack-status[data-tone="error"]{border-color:rgba(194,105,88,.68);background:linear-gradient(180deg,#351d18,#271512);color:#ffd8cf;box-shadow:inset 3px 0 0 #c26958,0 7px 20px rgba(0,0,0,.2)}.backpack-status strong{display:block;margin-bottom:2px;font-size:9px;letter-spacing:.13em;text-transform:uppercase}
      .p7-backpack-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.p7-pack-card{position:relative;min-height:170px;border:1px solid #5b5239;background:linear-gradient(180deg,#29251b 0 36%,#171610 36% 100%);box-shadow:0 10px 26px rgba(0,0,0,.25);overflow:hidden}.p7-pack-card[hidden]{display:none!important}.p7-pack-card:before{content:"";position:absolute;inset:5px;border:1px solid rgba(210,187,117,.18);pointer-events:none}.p7-pack-art{height:70px;display:grid;place-items:center;background:radial-gradient(circle at 50% 20%,rgba(173,143,74,.3),rgba(21,20,15,.2) 60%),linear-gradient(135deg,#373023,#211e16);color:#c4ae6a}.p7-pack-art.has-image,.p7-pack-art.has-illustration{height:132px;display:block;overflow:hidden;background:#171610;position:relative}.p7-pack-art.has-illustration svg{display:block;width:100%;height:100%}.p7-pack-art.has-image img,.p7-pack-raster{display:block;width:100%;height:100%;object-fit:cover;object-position:center;filter:saturate(.78) contrast(1.03)}.p7-pack-raster{position:absolute;inset:0;z-index:1}.p7-pack-card[data-pack-kind="story"]{border-color:#79683f;background:linear-gradient(180deg,#2d281d 0 52%,#171610 52% 100%)}.p7-pack-card[data-pack-kind="story"] .p7-pack-type{color:#d4bb76}.p7-pack-card[data-pack-kind="story"]:after{content:"STORY";position:absolute;top:9px;right:9px;padding:4px 6px;background:#1b1810d9;border:1px solid #8d7848;color:#e3c982;font-size:7px;letter-spacing:.14em;font-weight:900}
      .p7-pack-content{position:relative;padding:12px 13px 13px}.p7-pack-type{font-size:7px;letter-spacing:.14em;color:#a99b76;font-weight:900}.p7-pack-card h3{margin:5px 0 7px;font:17px Georgia,serif;color:#f1e4c2}.p7-pack-card p{margin:0;color:#9d9580;font-size:10px;line-height:1.45}.p7-pack-filter-empty,.p7-pack-empty{grid-column:1/-1;border:1px dashed #504a37;padding:24px;text-align:center;color:#8f8874}
      .p9-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.p9-item-action,.backpack-gear-use{flex:1;border:1px solid #8e7640;background:#322716;color:#ffe29b;padding:8px 10px;font-weight:800;cursor:pointer}.p9-item-action:disabled,.backpack-gear-use:disabled{opacity:.5;cursor:default}.backpack-remove{border-color:#6d5e39;background:#201a11;color:#d9bf7c}.backpack-count{align-self:center;padding:7px 9px;border:1px solid rgba(205,187,121,.25);color:#d8c582;font-weight:900;font-size:10px}
      .p7-add-panel{display:none;margin:0 0 16px;border:1px solid rgba(202,179,111,.26);background:#18160f;padding:14px}.p7-add-panel.open{display:block}.p7-add-panel label{display:block;font-size:9px;letter-spacing:.12em;color:#b7a873;font-weight:900;margin-bottom:6px}.p7-add-row-new{display:flex;gap:8px}.p7-add-row-new input{flex:1;min-width:0;background:#0f0f0c;border:1px solid #665b3d;color:#eee1bd;padding:11px}.p7-add-row-new button{border:1px solid #8e7640;background:#322716;color:#ffe29b;padding:10px 13px;font-weight:900;cursor:pointer}.p7-backpack-note{margin-top:14px;color:#77705f;font-size:9px}
      .p9-library{margin:0 0 16px;padding:14px;border:1px solid rgba(205,187,121,.3);background:#15140f}.p9-library[hidden]{display:none}.p9-library-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-bottom:12px}.p9-library-head strong{display:block;font:20px Georgia,serif;color:#f0e2bd}.p9-library-head small{color:#9e967f}.p9-library-search{width:100%;box-sizing:border-box;background:#0e0e0b;border:1px solid #62583b;color:#eee1bd;padding:10px 11px;margin-bottom:10px}.p9-library-filters{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}.p9-library-filters button{border:1px solid #5b5239;background:#1b1912;color:#b9ad8c;padding:7px 9px;cursor:pointer}.p9-library-filters button.active{border-color:#9a7f43;color:#ffe29b;background:#302616}.p9-library-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.p9-library-item{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 11px;border:1px solid #4f4935;background:#1b1912}.p9-library-item span{display:block;font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:#b8a66f}.p9-library-item strong{display:block;margin:3px 0;color:#eee1bd}.p9-library-item small{display:block;color:#938c79;line-height:1.35}.p9-library-item button{border:1px solid #8e7640;background:#322716;color:#ffe29b;padding:8px 10px;font-weight:800;cursor:pointer}.p9-library-item button:disabled{opacity:.45;cursor:default}.p9-library-note{margin:10px 0 0;color:#817a68;font-size:9px}.p9-library-status{margin-top:9px;color:#d8c582;font-size:10px;line-height:1.4}
      .p7-utility-card[data-p7-kind="items"]{display:none!important}
      @media(max-width:820px){.p7-backpack-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:620px){.p9-library-grid{grid-template-columns:1fr}.p9-library-head{display:block}}@media(max-width:560px){.p7-backpack-entry{justify-content:stretch}.p7-backpack-button{width:100%;justify-content:center}.p7-backpack-grid{grid-template-columns:1fr}.p7-backpack-toolbar{align-items:flex-start}.p7-backpack-filters{align-items:stretch}.p7-backpack-filter{flex:1;justify-content:center;min-width:92px}.p7-add-row-new{display:grid;grid-template-columns:1fr}.p7-backpack-dialog{width:96vw}.p7-backpack-head{padding:15px}.p7-backpack-body{padding:14px}}
    `;document.head.appendChild(s);
  }

  function categoryIcon(kind){return({weapon:'⚔',armor:'⬡',consumable:'✦',gear:'⌁',story:'✧',custom:'◇'})[kind]||'◇';}
  function weaponMeta(w){return `${w.trait} · ${w.range} · ${w.damage} ${w.damageType}${w.feature&&w.feature!=='—'?` · ${w.feature}`:''}`;}
  function armorMeta(a){return `${Number.isFinite(Number(a.major))?`Thresholds ${a.major}/${a.severe} · `:''}Armor Score ${a.score}${a.feature&&a.feature!=='—'?` · ${a.feature}`:''}`;}
  function removed(kind,id){return Boolean(equipment()?.isItemRemoved?.(kind,id));}

  function mechanicalMaps(){
    const api=equipment(),weapons=new Map(),armors=new Map(),consumables=new Map();
    (api?.catalog?.()||[]).forEach(w=>weapons.set(w.id,w));
    (api?.armorCatalog?.()||[]).forEach(a=>armors.set(a.id,a));
    Object.entries(api?.consumables?.()||{}).forEach(([id,c])=>consumables.set(id,{id,...c}));
    return{weapons,armors,consumables};
  }

  function carriedItems(){
    const api=equipment(),state=api?.getState?.()||{},maps=mechanicalMaps(),items=[],seen=new Set();
    const add=item=>{const key=`${item.kind}:${item.id||item.title}`;if(seen.has(key))return;seen.add(key);items.push(item);};
    [state.activePrimary,state.activeSecondary].filter(Boolean).forEach(id=>{const w=maps.weapons.get(id);if(w&&!removed('weapons',id))add({kind:'weapon',id,title:w.name,meta:weaponMeta(w),active:true,image:w.image||ITEM_VISUALS[w.name]?.asset||'',art:ITEM_VISUALS[w.name]?.fallbackArt||'',greywake:Boolean(w.greywake),trait:w.trait,range:w.range,damage:w.damage,damageType:w.damageType,feature:w.feature,burden:w.burden});});
    (state.inventoryWeapons||[]).forEach(id=>{const w=maps.weapons.get(id);if(w&&!removed('weapons',id))add({kind:'weapon',id,title:w.name,meta:weaponMeta(w),active:false,image:w.image||ITEM_VISUALS[w.name]?.asset||'',art:ITEM_VISUALS[w.name]?.fallbackArt||'',greywake:Boolean(w.greywake),trait:w.trait,range:w.range,damage:w.damage,damageType:w.damageType,feature:w.feature,burden:w.burden});});
    const activeArmor=state.activeArmor;
    if(activeArmor&&!removed('armor',activeArmor)){
      const a=maps.armors.get(activeArmor)||api?.armor?.(activeArmor);if(a)add({kind:'armor',id:activeArmor,title:a.name,meta:armorMeta(a),active:true,image:ITEM_VISUALS[a.name]?.asset||'',art:ITEM_VISUALS[a.name]?.fallbackArt||''});
    }
    (state.ownedArmor||[]).filter(id=>id&&id!==activeArmor).forEach(id=>{const a=maps.armors.get(id)||api?.armor?.(id);if(a&&!removed('armor',id))add({kind:'armor',id,title:a.name,meta:armorMeta(a),active:false,stored:true,image:ITEM_VISUALS[a.name]?.asset||'',art:ITEM_VISUALS[a.name]?.fallbackArt||''});});
    maps.consumables.forEach((c,id)=>{const count=Number(state.consumables?.[id]||0);if(count>0)add({kind:'consumable',id,title:c.name,meta:`${c.effect} · ${count}/5 carried.`,count,image:c.image||ITEM_VISUALS[c.name]?.asset||'',art:ITEM_VISUALS[c.name]?.fallbackArt||'',greywake:Boolean(c.greywake),effect:c.effect,description:c.description||''});});
    (COMMON_GEAR[characterKey()]||[]).forEach(title=>{if(!removed('gear',title)){const visual=ITEM_VISUALS[title]||{};add({kind:'gear',id:title,title,meta:visual.meta||'',active:false,image:visual.asset||'',art:visual.fallbackArt||'',story:Boolean(visual.story)});}});
    loadState().items.forEach((title,index)=>add({kind:'custom',id:`custom:${index}`,title,meta:'Player-added carried item',custom:true,index}));
    return items;
  }

  function actionMarkup(item){
    if(preview())return'';
    if(item.kind==='weapon')return `<div class="p9-card-actions">${item.active?`<button class="p9-item-action" type="button" data-backpack-use-weapon="${esc(item.id)}">Use</button>`:`<button class="p9-item-action" type="button" data-backpack-equip-weapon="${esc(item.id)}">Equip</button><button class="p9-item-action backpack-remove" type="button" data-backpack-remove-weapon="${esc(item.id)}">Remove</button>`}</div>`;
    if(item.kind==='armor')return `<div class="p9-card-actions">${item.active?'<button class="p9-item-action" type="button" disabled>Equipped</button>':`<button class="p9-item-action" type="button" data-backpack-equip-armor="${esc(item.id)}">Equip</button><button class="p9-item-action backpack-remove" type="button" data-backpack-remove-armor="${esc(item.id)}">Remove</button>`}</div>`;
    if(item.kind==='consumable')return `<div class="p9-card-actions"><button class="p9-item-action" type="button" data-backpack-use-consumable="${esc(item.id)}">Use · ${item.count} left</button><span class="backpack-count">${item.count}/5</span><button class="p9-item-action" type="button" data-backpack-consumable-add="${esc(item.id)}" ${item.count>=5?'disabled':''}>Add one</button><button class="p9-item-action backpack-remove" type="button" data-backpack-consumable-remove="${esc(item.id)}">Remove one</button></div>`;
    if(item.kind==='gear')return `<div class="p9-card-actions"><button class="backpack-gear-use" type="button" data-backpack-use-gear="${esc(item.title)}">${item.title==='Nomadic Pack'?'Use Nomadic Pack':'Use in scene'}</button><button class="p9-item-action backpack-remove" type="button" data-backpack-remove-gear="${esc(item.title)}">Remove</button></div>`;
    if(item.kind==='custom')return `<div class="p9-card-actions"><button class="backpack-gear-use" type="button" data-backpack-use-gear="${esc(item.title)}">Use in scene</button><button class="p9-item-action backpack-remove" type="button" data-backpack-remove-custom="${item.index}">Remove</button></div>`;
    return'';
  }

  function renderCard(item){
    const viewKind=item.story?'story':item.kind==='custom'?'gear':item.kind;
    if(item.kind==='weapon'&&item.greywake){
      const feature=String(item.feature||'—'),parts=feature.split(': '),featureName=parts.length>1?parts.shift():'Weapon feature',featureBody=parts.length?parts.join(': '):feature;
      const stateLabel=item.active?'READY':'IN PACK';
      const buttons=preview()?'':item.active
        ? `<button class="gw-card-main" type="button" data-backpack-use-weapon="${esc(item.id)}">Use weapon</button>`
        : `<button class="gw-card-main" type="button" data-backpack-equip-weapon="${esc(item.id)}">Ready weapon</button><button class="gw-card-remove" type="button" data-backpack-remove-weapon="${esc(item.id)}" aria-label="Remove ${esc(item.title)}">Remove</button>`;
      return `<article class="p7-pack-card greywake-weapon-card cinematic" data-pack-kind="weapon">
        <div class="gw-card-image"><img src="${esc(item.image)}" alt="" loading="lazy" decoding="async"><span class="gw-card-state">${stateLabel}</span><div class="gw-card-title"><small>GREYWAKE WEAPON</small><h3>${esc(item.title)}</h3></div></div>
        <div class="gw-card-body">
          <div class="gw-card-stats">
            <span><small>TRAIT</small><b>${esc(item.trait||'—')}</b></span>
            <span><small>RANGE</small><b>${esc(item.range||'—')}</b></span>
            <span><small>DAMAGE</small><b>${esc(item.damage||'—')}</b></span>
            <span><small>HANDS</small><b>${Number(item.burden)===2?'Two':'One'}</b></span>
          </div>
          <div class="gw-card-feature"><small>${esc(featureName)}</small><p>${esc(featureBody)}</p></div>
          <div class="gw-card-actions">${buttons}</div>
        </div>
      </article>`;
    }
    if(item.kind==='consumable'&&item.greywake){
      const buttons=preview()?'':`<button class="gw-card-main" type="button" data-backpack-use-consumable="${esc(item.id)}">Use potion · ${item.count} left</button><button class="gw-card-remove" type="button" data-backpack-consumable-remove="${esc(item.id)}" aria-label="Remove one ${esc(item.title)}">Remove one</button>`;
      return `<article class="p7-pack-card greywake-consumable-card cinematic" data-pack-kind="consumable">
        <div class="gw-card-image"><img src="${esc(item.image)}" alt="" loading="lazy" decoding="async"><span class="gw-card-state">${item.count}/5 CARRIED</span><div class="gw-card-title"><small>GREYWAKE TONIC</small><h3>${esc(item.title)}</h3></div></div>
        <div class="gw-card-body">
          <div class="gw-card-stats">
            <span><small>TYPE</small><b>Consumable</b></span>
            <span><small>EFFECT</small><b>1d4 Stress</b></span>
            <span><small>FORM</small><b>Tonic</b></span>
            <span><small>COUNT</small><b>${item.count}/5</b></span>
          </div>
          <div class="gw-card-feature"><small>WHAT IT IS</small><p>${esc(item.description||'A practical Greywake restorative carried in a reusable vial.')}</p></div>
          <div class="gw-card-actions">${buttons}</div>
        </div>
      </article>`;
    }
    const type=item.story?'STORY ITEM':item.custom?'BACKPACK ITEM':item.stored?'STORED ARMOR · NOT CARRIED':item.kind.toUpperCase();
    const fallback=item.art?itemArtwork(item.art):`<div class="p7-pack-art" aria-hidden="true"><span style="font-size:34px">${categoryIcon(item.kind)}</span></div>`;
    const art=item.image?fallback.replace('class="p7-pack-art has-illustration"','class="p7-pack-art has-illustration has-raster-candidate"').replace('</div>',`<img class="p7-pack-raster" src="${esc(item.image)}" alt="" loading="lazy" decoding="async" onerror="this.remove()"></div>`):fallback;
    return `<article class="p7-pack-card" data-pack-kind="${viewKind}">${art}<div class="p7-pack-content"><span class="p7-pack-type">${type}</span><h3>${esc(item.title)}</h3>${item.meta?`<p>${esc(item.meta)}</p>`:''}${actionMarkup(item)}</div></article>`;
  }

  function filterMarkup(){return `<div class="p7-backpack-filters" role="group" aria-label="Backpack view"><span>VIEW</span>${FILTERS.map(([kind,label])=>`<button type="button" class="p7-backpack-filter" data-pack-filter="${kind}" aria-pressed="${activeFilter===kind?'true':'false'}">${label}<b data-pack-count="${kind}">0</b></button>`).join('')}</div>`;}
  function statusMarkup(){if(!lastStatus)return'';return `<div class="backpack-status" data-tone="${lastStatus.tone||'success'}" role="status" aria-live="polite"><strong>${esc(lastStatus.label||'Action complete')}</strong>${esc(lastStatus.message||'')}</div>`;}

  function libraryItems(){
    const maps=mechanicalMaps(),items=[];
    maps.weapons.forEach((w,id)=>items.push({id,name:w.name,type:'weapon',effect:weaponMeta(w),automated:true}));
    maps.armors.forEach((a,id)=>items.push({id,name:a.name,type:'armor',effect:armorMeta(a),automated:true}));
    maps.consumables.forEach((c,id)=>items.push({id,name:c.name,type:'consumable',effect:c.effect,automated:true}));
    (LIBRARY_GEAR[characterKey()]||[]).forEach(name=>items.push({id:name,name,type:'gear',effect:'Ordinary carried gear'}));
    return items;
  }
  function visibleTitles(){return new Set(carriedItems().map(i=>i.title.toLowerCase()));}
  function libraryStatus(item){
    const api=equipment(),state=api?.getState?.()||{};
    if(item.type==='weapon')return api?.isOwned?.(item.id)?'owned':removed('weapons',item.id)?'removed':'missing';
    if(item.type==='armor'){if(api?.isArmorEquipped?.(item.id))return'equipped';if(api?.isArmorOwned?.(item.id))return'owned';return removed('armor',item.id)?'removed':'missing';}
    if(item.type==='consumable')return Number(state.consumables?.[item.id]||0)>0?'owned':'missing';
    if(removed('gear',item.name))return'removed';
    return visibleTitles().has(item.name.toLowerCase())?'owned':'missing';
  }
  function libraryTemplate(){return `<section class="p9-library" ${libraryOpen?'':'hidden'} data-filter="all"><div class="p9-library-head"><div><small>KNOWN EQUIPMENT</small><strong>Add from item library</strong></div><small>Tier 1 Daggerheart gear plus Greywake-specific weapons supported by the live sheet.</small></div><input class="p9-library-search" type="search" placeholder="Search known items…" aria-label="Search known official items"><div class="p9-library-filters"><button type="button" data-filter="all" class="active">All</button><button type="button" data-filter="weapon">Weapons</button><button type="button" data-filter="armor">Armor</button><button type="button" data-filter="consumable">Consumables</button><button type="button" data-filter="gear">Gear</button><button type="button" data-p9-custom-item>Other / custom item</button></div><div class="p9-library-grid"></div><p class="p9-library-note">Add records equipment the character has acquired. Armor is acquired first, then equipped separately when safe. Unequipped owned armor is stored rather than carried.</p></section>`;}

  function ensureDialog(){let d=dialog();if(d)return d;d=document.createElement('dialog');d.id='p7BackpackDialog';d.className='p7-backpack-dialog';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)d.close();});return d;}
  function applyFilter(d=ensureDialog(),filter=activeFilter){
    activeFilter=FILTERS.some(([kind])=>kind===filter)?filter:'all';const cards=[...d.querySelectorAll('.p7-pack-card')],counts={all:cards.length,weapon:0,armor:0,consumable:0,gear:0};
    cards.forEach(card=>{const kind=card.dataset.packKind||'gear';if(Object.prototype.hasOwnProperty.call(counts,kind))counts[kind]+=1;card.hidden=activeFilter!=='all'&&kind!==activeFilter;});
    d.querySelectorAll('[data-pack-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.packFilter===activeFilter)));d.querySelectorAll('[data-pack-count]').forEach(n=>n.textContent=String(counts[n.dataset.packCount]??0));
    let empty=d.querySelector('[data-pack-filter-empty]');if(!empty){empty=document.createElement('div');empty.className='p7-pack-filter-empty';empty.dataset.packFilterEmpty='true';empty.textContent='Nothing is currently recorded in this view.';d.querySelector('.p7-backpack-grid')?.appendChild(empty);}empty.hidden=cards.length===0||activeFilter==='all'||cards.some(card=>!card.hidden);
  }

  function setStatus(message,tone='success',label='Action complete'){lastStatus={message:String(message||''),tone,label};}
  function clearStatus(){lastStatus=null;}
  function refreshOpen(){const d=dialog();if(d?.open)renderDialog();hideDuplicateGearView();rerouteReadyGear();}
  function resultAndRender(result,successMessage,label='Inventory updated'){
    if(result?.ok===false)setStatus(result.message||'That action could not be completed.','error','Action not completed');else setStatus(result?.message||successMessage,'success',label);renderDialog();
  }

  function resourceKindForConsumable(id){const item=equipment()?.consumables?.()?.[id];return item?.kind||null;}
  function useConsumable(id){
    const api=equipment(),res=resources(),kind=resourceKindForConsumable(id),beforeR=res?.getState?.()||{},beforeE=api?.getState?.()||{},beforeMarked=Number(beforeR?.[kind]||0),beforeCount=Number(beforeE.consumables?.[id]||0),name=api?.consumables?.()?.[id]?.name||'Consumable';
    actionInProgress=true;const result=api?.useConsumable?.(id)||{ok:false,message:'Consumable unavailable.'};actionInProgress=false;
    const afterR=res?.getState?.()||{},afterE=api?.getState?.()||{},afterMarked=Number(afterR?.[kind]||0),afterCount=Number(afterE.consumables?.[id]??Math.max(0,beforeCount-1)),cleared=Math.max(0,beforeMarked-afterMarked),label=kind==='hp'?'HP':'Stress';
    if(result?.ok===false)setStatus(result.message||`${name} could not be used.`,'error','Action not completed');else setStatus(`${name} used — cleared ${cleared} ${label}. ${afterCount} ${afterCount===1?'potion':'potions'} remaining.`,'success','Action complete');renderDialog();
  }

  function useGear(title){
    if(title==='Nomadic Pack'&&window.GreywakeNomadicPack?.open){dialog()?.close?.();setTimeout(()=>window.GreywakeNomadicPack.open(),20);return;}
    setStatus(`${title} is being used. Describe how you are using it; if the outcome is uncertain, resolve it with the normal Daggerheart action roll.`,'success','Item in use');renderDialog();window.dispatchEvent(new CustomEvent('greywake:item-used',{detail:{item:title,source:'backpack'}}));
  }

  function addKnown(item){
    if(preview())return;const api=equipment();let result={ok:false,message:'Could not add that item.'};
    actionInProgress=true;
    if(item.type==='weapon')result=removed('weapons',item.id)?api?.addWeapon?.(item.id):api?.addWeapon?.(item.id);
    else if(item.type==='armor'){
      const status=libraryStatus(item);if(status==='owned'){actionInProgress=false;api?.openArmorEquip?.(item.id);return;}if(status==='equipped'){actionInProgress=false;return;}result=api?.addArmor?.(item.id)||result;
    }else if(item.type==='consumable')result=api?.adjustConsumable?.(item.id,1)||result;
    else if(item.type==='gear')result=removed('gear',item.name)?api?.restoreGear?.(item.name):{ok:false,message:`${item.name} is already carried.`};
    actionInProgress=false;resultAndRender(result,`${item.name} added.`);
  }

  function renderLibrary(panel){
    if(!panel)return;const q=String(panel.querySelector('.p9-library-search')?.value||'').trim().toLowerCase(),filter=panel.dataset.filter||'all',state=equipment()?.getState?.()||{};
    const filtered=libraryItems().filter(i=>(filter==='all'||i.type===filter)&&(!q||`${i.name} ${i.type} ${i.effect}`.toLowerCase().includes(q)));
    const grid=panel.querySelector('.p9-library-grid');if(!grid)return;
    grid.innerHTML=filtered.map(i=>{const status=libraryStatus(i);let label='Add',disabled=false,extra='';if(i.type==='armor'){if(status==='equipped'){label='Equipped';disabled=true;extra=' · active';}else if(status==='owned'){label='Equip';extra=' · stored';}else if(status==='removed')label='Add back';}else if(i.type==='consumable'){const count=Number(state.consumables?.[i.id]||0);label=count>=5?`Max · ${count}/5`:count?`Add one · ${count}/5`:'Add';disabled=count>=5;}else if(status==='owned'){label='Carried';disabled=true;}else if(status==='removed')label='Add back';return `<div class="p9-library-item"><div><span>${esc(i.type)}${i.automated?' · live':''}${extra}</span><strong>${esc(i.name)}</strong><small>${esc(i.effect)}</small></div><button type="button" data-backpack-library-add="${esc(i.type)}:${esc(i.id)}" ${disabled?'disabled':''}>${label}</button></div>`;}).join('')||'<div class="p9-library-note">No known items match that search.</div>';
    grid.querySelectorAll('[data-backpack-library-add]').forEach(b=>b.addEventListener('click',()=>{const [type,id]=b.dataset.backpackLibraryAdd.split(':');const item=libraryItems().find(i=>i.type===type&&String(i.id)===id);if(item)addKnown(item);}));
    setTimeout(()=>window.GreywakeP9Mechanics?.enhance?.(),0);
  }

  function bindLibrary(d){
    const panel=d.querySelector('.p9-library');if(!panel)return;
    panel.querySelector('.p9-library-search')?.addEventListener('input',()=>{renderLibrary(panel);});
    panel.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{panel.dataset.filter=b.dataset.filter;panel.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderLibrary(panel);}));
    panel.querySelector('[data-p9-custom-item]')?.addEventListener('click',()=>{customPanelOpen=true;const custom=d.querySelector('[data-pack-add-panel]');custom?.classList.add('open');custom?.querySelector('input')?.focus();});
    if(libraryOpen)renderLibrary(panel);
  }

  function bindActions(d){
    d.querySelectorAll('[data-pack-filter]').forEach(b=>b.addEventListener('click',()=>applyFilter(d,b.dataset.packFilter)));
    d.querySelector('[data-pack-close]')?.addEventListener('click',()=>d.close());
    d.querySelector('[data-pack-add-open]')?.addEventListener('click',()=>{libraryOpen=!libraryOpen;customPanelOpen=false;clearStatus();renderDialog();});
    d.querySelector('[data-pack-save]')?.addEventListener('click',()=>{const input=d.querySelector('[data-pack-add-panel] input'),value=String(input?.value||'').trim();if(!value)return;const next=loadState();if(!next.items.some(v=>v.toLowerCase()===value.toLowerCase()))next.items.push(value);actionInProgress=true;saveState(next);actionInProgress=false;customPanelOpen=false;setStatus(`${value} added to the backpack.`,'success','Inventory updated');renderDialog();});
    d.querySelector('[data-pack-add-panel] input')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();d.querySelector('[data-pack-save]')?.click();}});
    d.querySelectorAll('[data-backpack-use-weapon]').forEach(b=>b.addEventListener('click',()=>equipment()?.openWeaponUse?.(b.dataset.backpackUseWeapon)));
    d.querySelectorAll('[data-backpack-equip-weapon]').forEach(b=>b.addEventListener('click',()=>equipment()?.openEquip?.(b.dataset.backpackEquipWeapon)));
    d.querySelectorAll('[data-backpack-remove-weapon]').forEach(b=>b.addEventListener('click',()=>{actionInProgress=true;const r=equipment()?.removeWeapon?.(b.dataset.backpackRemoveWeapon);actionInProgress=false;resultAndRender(r,'Weapon removed.');}));
    d.querySelectorAll('[data-backpack-equip-armor]').forEach(b=>b.addEventListener('click',()=>equipment()?.openArmorEquip?.(b.dataset.backpackEquipArmor)));
    d.querySelectorAll('[data-backpack-remove-armor]').forEach(b=>b.addEventListener('click',()=>{actionInProgress=true;const r=equipment()?.removeArmor?.(b.dataset.backpackRemoveArmor);actionInProgress=false;resultAndRender(r,'Armor removed.');}));
    d.querySelectorAll('[data-backpack-use-consumable]').forEach(b=>b.addEventListener('click',()=>useConsumable(b.dataset.backpackUseConsumable)));
    d.querySelectorAll('[data-backpack-consumable-add]').forEach(b=>b.addEventListener('click',()=>{actionInProgress=true;const id=b.dataset.backpackConsumableAdd,r=equipment()?.adjustConsumable?.(id,1);actionInProgress=false;resultAndRender(r,'Consumable added.');}));
    d.querySelectorAll('[data-backpack-consumable-remove]').forEach(b=>b.addEventListener('click',()=>{actionInProgress=true;const id=b.dataset.backpackConsumableRemove,r=equipment()?.adjustConsumable?.(id,-1);actionInProgress=false;resultAndRender(r,'Consumable removed.');}));
    d.querySelectorAll('[data-backpack-use-gear]').forEach(b=>b.addEventListener('click',()=>useGear(b.dataset.backpackUseGear)));
    d.querySelectorAll('[data-backpack-remove-gear]').forEach(b=>b.addEventListener('click',()=>{actionInProgress=true;const title=b.dataset.backpackRemoveGear,r=equipment()?.removeGear?.(title);actionInProgress=false;resultAndRender(r,`${title} removed.`);}));
    d.querySelectorAll('[data-backpack-remove-custom]').forEach(b=>b.addEventListener('click',()=>{const next=loadState(),index=Number(b.dataset.backpackRemoveCustom),name=next.items[index]||'Item';next.items.splice(index,1);actionInProgress=true;saveState(next);actionInProgress=false;setStatus(`${name} removed from the backpack.`,'success','Inventory updated');renderDialog();}));
    bindLibrary(d);
  }

  function renderDialog(){
    ensureStyles();const d=ensureDialog(),items=carriedItems();
    d.innerHTML=`<div class="p7-backpack-shell"><header class="p7-backpack-head"><div class="p7-backpack-head-title">${bagIcon}<div><span>CARRIED INVENTORY</span><h2>${esc(characterName())}'s Backpack</h2></div></div><button class="p7-backpack-close" type="button" data-pack-close>×</button></header><div class="p7-backpack-body"><div class="p7-backpack-toolbar"><p>Everything currently carried. Equipped items are shown too, so this works as a quick "what have I got?" view.</p>${preview()?'':'<button class="p7-backpack-add" type="button" data-pack-add-open>+ Add item</button>'}</div>${filterMarkup()}<div class="backpack-use-note"><strong>Use items here.</strong> Weapons, armor, consumables and special gear use their live rules. Ordinary gear can be declared in use here and then resolved normally if a roll is needed.</div>${statusMarkup()}${preview()?'':libraryTemplate()}<div class="p7-add-panel ${customPanelOpen?'open':''}" data-pack-add-panel><label>ADD SOMETHING TO THE BACKPACK</label><div class="p7-add-row-new"><input type="text" maxlength="80" placeholder="What did you pick up?" aria-label="Item name"><button type="button" data-pack-save>Add to backpack</button></div></div><div class="p7-backpack-grid">${items.length?items.map(renderCard).join(''):'<div class="p7-pack-empty">Nothing is currently recorded in the backpack.</div>'}</div></div></div>`;
    bindActions(d);applyFilter(d);setTimeout(()=>window.GreywakeP9Mechanics?.enhance?.(),0);
  }

  function openBackpack(){clearStatus();renderDialog();const d=ensureDialog();if(typeof d.showModal==='function'&&!d.open)d.showModal();else d.setAttribute('open','');}
  function hideDuplicateGearView(){const gearTab=document.querySelector('[data-sheet-tab="gear"]');if(gearTab){gearTab.hidden=true;gearTab.setAttribute('aria-hidden','true');if(gearTab.getAttribute('aria-selected')==='true')document.querySelector('[data-sheet-tab="overview"]')?.click();}}
  function rerouteReadyGear(){const b=document.querySelector('#readyGearPanel [data-open-gear]');if(b){b.textContent='Open Backpack';b.setAttribute('aria-label','Open Backpack');}}
  function ensureEntry(){
    ensureStyles();hideDuplicateGearView();rerouteReadyGear();if((location.hash||'')!=='#/character')return;const body=document.querySelector('#characterSheet .character-sheet-body');if(!body)return;
    let entry=document.getElementById('p7BackpackEntry');if(!entry){entry=document.createElement('div');entry.id='p7BackpackEntry';entry.className='p7-backpack-entry';entry.innerHTML=`<button type="button" class="p7-backpack-button">${bagIcon}<span><small>WHAT AM I CARRYING?</small><strong>Open Backpack</strong></span></button>`;const tabs=document.getElementById('characterPageTabs');if(tabs)tabs.insertAdjacentElement('afterend',entry);else body.insertAdjacentElement('beforebegin',entry);entry.querySelector('button')?.addEventListener('click',openBackpack);}
  }
  function schedule(){setTimeout(ensureEntry,80);}

  window.GreywakeBackpack={open:openBackpack,render:renderDialog,refresh:refreshOpen,loadState,applyFilter:()=>applyFilter(ensureDialog())};
  window.GreywakeEquipmentLibrary={known:()=>libraryItems().map(x=>({...x})),enhance:()=>{const p=dialog()?.querySelector('.p9-library');if(p&&!p.hidden)renderLibrary(p);}};
  // Compatibility aliases while the remaining P9 mechanics layer is retired in a later pass.
  window.GreywakeInventoryConsolidation={refresh:refreshOpen};
  window.GreywakeBackpackUse={enhance:refreshOpen};

  window.addEventListener('hashchange',schedule);window.addEventListener('greywake:player-ready',schedule);window.addEventListener('greywake:sheet-enhanced',schedule);
  window.addEventListener('greywake:equipment-state-changed',()=>{if(actionInProgress)return;setTimeout(()=>{schedule();refreshOpen();},20);});
  document.addEventListener('DOMContentLoaded',schedule);schedule();
})();
