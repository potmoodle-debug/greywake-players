import fs from 'node:fs';

const bridge=fs.readFileSync('tools/greywake-live-bridge.user.js','utf8');

for(const marker of [
  "@version      0.4.2",
  "RESULT_HEADINGS=['WHAT WAS UPDATED','WHAT COULD NOT BE UPDATED','DECISIONS QUEUED FOR CHRIS LATER']",
  "RESULT_STABLE_MS=6000",
  "transientResult",
  "validFinalResult",
  "['thinking','working','working on it','processing','generating','responding']",
  "messages.filter(m=>m.role==='assistant'&&m.index>handoff.index).slice(-1)[0]",
  "if(!validFinalResult(finalText))",
  "t-Number(item.resultCandidateAt||t)<RESULT_STABLE_MS",
  "item.resultText=finalText"
]){
  if(!bridge.includes(marker)) throw new Error(`Missing live bridge final-result safeguard: ${marker}`);
}

if(bridge.includes("t-Number(item.resultCandidateAt||t)<2500")) throw new Error('Old 2.5 second completion window must not return.');
if(bridge.includes("messages.find(m=>m.role==='assistant'&&m.index>handoff.index)")) throw new Error('Bridge must not capture the first transient assistant node.');

console.log('Live bridge final-result detection checks passed.');
