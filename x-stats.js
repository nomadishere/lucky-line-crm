/* Lucky Line CRM: Stats & Training (Rich's idea, Nov 5 2026).
   A stock-ticker chip at the front of the urgency circles opens one page with:
   time saved vs time behind this week, an opt-in leaderboard, tips to improve, and the sales-training library. */
let statsAt=0;
function hm(min){min=Math.round(Math.abs(+min||0));const h=Math.floor(min/60),m=min%60;return h?h+'h'+(m?' '+m+'m':''):m+'m'}
async function loadStats(force){if(force||!cache.stats||Date.now()-statsAt>120000){cache.stats=await fn('crm.app_stats()');statsAt=Date.now()}return cache.stats}
function tickerHTML(s){if(!s)return '';const net=(+s.saved_min||0)-(+s.behind_min||0);
  return `<a class="tick" href="#stats" aria-label="Stats and training: ${hm(s.saved_min)} saved, ${hm(s.behind_min)} behind this week">
   <small class="tklbl">Stats &amp; tips</small><span class="tbox"><span class="tk up">▲ ${hm(s.saved_min)}<em>saved</em></span><span class="tk dn">▼ ${hm(s.behind_min)}<em>behind</em></span><span class="tk ${net>=0?'up':'dn'}">${net>=0?'+':'−'}${hm(net)}<em>net</em></span></span></a>`}
/* put the ticker in front of the urgency circles every time they are drawn */
const _drawOrbs=window.drawOrbs;
window.drawOrbs=function(d){_drawOrbs(d);const o=$('#orbs');if(!o)return;if(cache.stats)o.insertAdjacentHTML('afterbegin',tickerHTML(cache.stats));
  loadStats().then(s=>{contestInvite(s);const box=$('#orbs');if(!box)return;const old=box.querySelector('.tick');if(old)old.outerHTML=tickerHTML(s);else box.insertAdjacentHTML('afterbegin',tickerHTML(s))}).catch(()=>{})};

const PRIZE={title:'First prize: an all-expenses-paid trip to Little Deer Lodge, Montana',sub:'A healing getaway near Yellowstone. Pick your cabin:',links:[['Little Deer Lodge','https://littledeerlodge.com'],['Unicorn Cabin','https://www.airbnb.com/h/littledeerunicorncabin'],['Dragon Cabin','https://www.airbnb.com/h/littledeerdragoncabin'],['Livingston Paradise Retreat','https://www.airbnb.com/h/livingstonparadiseretreat']]};
function prizeHTML(){return `<div class="prize"><div class="k">🏆 Contest</div><div class="t">${esc(PRIZE.title)}</div><div class="s" style="margin-top:2px">${esc(PRIZE.sub)}</div><div class="plinks">${PRIZE.links.map(([n,u])=>`<a class="b sm keep" href="${u}" target="_blank" rel="noopener">${esc(n)}</a>`).join('')}</div></div>`}
/* first sign-in: invite everyone into the contest */
function contestInvite(s){try{if(!s||s.me_on_board||localStorage.getItem('llcrm.contestAsked'))return}catch(e){return}
  let d=$('#csheet');if(!d){d=document.createElement('div');d.id='csheet';document.body.appendChild(d)}
  d.innerHTML=`<div class="pn" role="dialog" aria-modal="true" aria-label="Join the contest"><div class="coach" style="background:none;border:0;padding:0"><img class="mascot" src="img/clvr.svg?v=matte1" alt="" width="84" height="98"><div class="bubble"><div class="k">Clvr says</div><div class="t">Want in on the contest?</div><div class="s" style="color:var(--text);margin-top:4px">Join the leaderboard and race the team: tasks done, proposals sent, and proposals out within 60 minutes.</div></div></div>${prizeHTML()}
   <div class="btns"><button class="b p f keep" onclick="contestAnswer(true)">Join the contest</button><button class="b f keep" onclick="contestAnswer(false)">Not now</button></div></div>`;
  d.classList.add('on')}
window.contestAnswer=async on=>{try{localStorage.setItem('llcrm.contestAsked','1')}catch(e){}const d=$('#csheet');if(d)d.classList.remove('on');if(on){try{await sql(`select crm.set_leaderboard(true) as ok`);cache.stats=null;status('You are in the contest ✓');if(location.hash==='#stats')Stats()}catch(e){status('Could not join: '+e.message)}}};
function tips(s){const t=[];const on=+s.on_time_week||0,sent=+s.proposals_week||0;
  if(+s.late_proposals>0)t.push({h:`${s.late_proposals} proposal${s.late_proposals>1?'s are':' is'} past the 60-minute clock`,b:'Alden closes about 80% because the proposal lands while he is still the freshest roofer in their head. Build it from the walk-around video before you leave the driveway, then hit Send.'});
  if(sent&&on<sent)t.push({h:`${on} of ${sent} proposals went out within 60 minutes this week`,b:'Record the walk-around with narration so the report and options write themselves. Most of the hour is typing, and the CRM can do that part.'});
  if(+s.late_tasks>0)t.push({h:`${s.late_tasks} call${s.late_tasks>1?'s':''} or task${s.late_tasks>1?'s':''} overdue`,b:'Knock out the reddest circles first. A two-minute call today beats a perfect call next week, and the circles shrink back to green as you go.'});
  if(!+s.reports_week)t.push({h:'No video inspections logged this week',b:'Every walk-around you record is a report, a priced estimate and a proposal draft for free. Tap Inspect on the job, or drop the video in the Lucky Line Inspections folder.'});
  if(!t.length)t.push({h:'Clean week. Nothing is late.',b:'Use the extra time on the people who went quiet: open Pipe, sort by days quiet, and call the top three.'});
  return t}
function canEdit(){return !document.body.classList.contains('ro')}
const Stats=guard(async()=>{status('Crunching…');const s=await loadStats(true);status('Stats · this week');
  const net=(+s.saved_min||0)-(+s.behind_min||0),mins=s.minutes||{};const board=(s.board||[]).map(b=>({...b,score:(+b.done||0)+3*(+b.sent||0)+5*(+b.ontime||0)})).sort((a,b)=>b.score-a.score);
  const lib=Array.isArray(s.training)?s.training:[];
  const T=tips(s);window._tips=T;window._tipI=0;const feat=lib.find(x=>x.featured)||lib.find(x=>/video/i.test(x.kind||''));
  V.innerHTML=`${cloverBtnHTML()}<div class="card coach"><img class="mascot" src="img/clvr.svg?v=matte1" alt="Clvr, the four-leaf clover sales coach" width="96" height="112">
   <div class="bubble"><div class="k">Clvr says</div><div class="t" id="tipH">${esc(T[0].h)}</div><div class="s" id="tipB" style="color:var(--text);margin-top:4px">${esc(T[0].b)}</div>
   ${T.length>1?`<button class="b sm keep" style="margin-top:8px" onclick="nextTip()">Next tip ›</button>`:''}</div></div>
  ${feat?`<a class="card feat" href="${esc(feat.url)}" target="_blank" rel="noopener"><span class="play" aria-hidden="true">▶</span><div class="grow"><div class="k">Start here</div><div class="t">${esc(feat.title)}</div><div class="s">${esc(feat.kind||'Video')} · opens in Google Drive</div></div></a>`:''}
  <div class="card" style="margin-top:8px"><div class="k">This week</div>
   <div class="stk"><div><b class="up">▲ ${hm(s.saved_min)}</b><span>saved by the CRM</span></div><div><b class="dn">▼ ${hm(s.behind_min)}</b><span>behind on proposals</span></div><div><b class="${net>=0?'up':'dn'}">${net>=0?'+':'−'}${hm(net)}</b><span>net</span></div></div>
   <div class="s" style="margin-top:8px">Saved = ${s.proposals_week} proposals × ${mins.proposal||45}m + ${s.reports_week} video reports × ${mins.report||60}m + ${s.auto_tasks_week} automatic follow-ups × ${mins.auto_task||5}m + ${s.tasks_done_week} tasks done × ${mins.task_done||3}m. Behind = how far past the 60-minute clock the open proposals are (max 24h each). These are estimates.</div></div>

  <h2>All tips <span class="n">${T.length}</span></h2>
  <div class="stack">${T.map(x=>`<div class="card"><div class="t">${esc(x.h)}</div><div class="s cl3" data-label="${esc(x.h)}" style="color:var(--text);margin-top:4px">${esc(x.b)}</div></div>`).join('')}</div>

  <h2>Leaderboard <span class="n">opt-in</span></h2>
  <div class="card">${prizeHTML()}${board.length?board.map((b,i)=>`<div class="lbr"><span class="rk">${i+1}</span><span class="grow t">${esc(b.name)}</span><span class="s">${b.done} done · ${b.sent} sent · ${b.ontime} on time</span><b class="sc">${b.score}</b></div>`).join(''):'<div class="s">Nobody has joined yet. Contests and the leaderboard only show people who opt in.</div>'}
   <div class="btns"><button class="b f keep" onclick="optBoard(${!s.me_on_board})">${s.me_on_board?'Leave the leaderboard':'Join the leaderboard'}</button></div>
   <div class="s" style="margin-top:6px">Score = tasks done + 3 per proposal sent + 5 per proposal sent within 60 minutes.</div></div>

  <h2>Sales training <span class="n">${lib.length}</span></h2>
  <div class="stack">${lib.map((x,i)=>`<div class="card row"><div class="grow"><div class="t">${esc(x.title)}</div><div class="s">${esc(x.kind||'Link')}</div></div><a class="b sm keep" href="${esc(x.url)}" target="_blank" rel="noopener">Open</a>${canEdit()?`<button class="b sm ic" aria-label="Remove" onclick="delTraining(${i})">✕</button>`:''}</div>`).join('')||'<div class="card empty">No training added yet.</div>'}</div>
  ${canEdit()?`<div class="card" style="margin-top:8px"><label class="f" style="margin-top:0">Add a training doc or video</label><input type="text" id="trt" placeholder="Title, e.g. Closing on the first visit"><div class="grid2"><div><input type="url" id="tru" placeholder="https://…" style="margin-top:6px"></div><div><select id="trk" style="margin-top:6px"><option>Video</option><option>Doc</option><option>Script</option><option>Course</option></select></div></div><div class="btns"><button class="b p f" onclick="addTraining()">Add to training</button></div></div>`:''}`});
window.nextTip=()=>{const T=window._tips||[];if(!T.length)return;window._tipI=(window._tipI+1)%T.length;const x=T[window._tipI];$('#tipH').textContent=x.h;$('#tipB').textContent=x.b;const m=document.querySelector('.mascot');if(m){m.classList.remove('hop');void m.offsetWidth;m.classList.add('hop')}};
window.optBoard=async on=>{try{await sql(`select crm.set_leaderboard(${on?'true':'false'}) as ok`);cache.stats=null;Stats()}catch(e){status('Could not update: '+e.message)}};
async function saveTraining(list){await sql(`insert into crm.settings(key,value) values ('training',${q(JSON.stringify(list))}) on conflict (key) do update set value=excluded.value, updated_at=now(); select 1`);cache.stats=null;Stats()}
window.addTraining=async()=>{const t=$('#trt').value.trim(),u=$('#tru').value.trim(),k=$('#trk').value;if(!t||!/^https?:\/\//.test(u)){status('Add a title and a link that starts with https://');return}const s=await loadStats(true);await saveTraining([...(s.training||[]),{title:t,url:u,kind:k}])};
window.delTraining=async i=>{const s=await loadStats(true);const l=[...(s.training||[])];l.splice(i,1);await saveTraining(l)};
Object.assign(window.XROUTES,{stats:Stats});Object.assign(window.XTITLES||(window.XTITLES={}),{stats:'Stats & tips'});

/* ---------- Talk to Clover: nickel-sized mascot button → chat (Nov 5 2026) ----------
   Inside Claude: answers with Claude, using live CRM stats + the training library + Justin's Juicy AI brain
   (notes, voice memos, Drive files only; never texts or contacts). On the website: built-in coaching answers
   from the same live stats, no AI cost. */
const CLV_Q=['How can I close more deals?','Help me manage my time better','What should I do first today?','How do I handle "I need to think about it"?','How do I get proposals out within 60 minutes?'];
let clvLog=[];
function cloverBtnHTML(){return `<button class="clvbtn keep" onclick="openClover()" aria-label="Click to talk to Clover"><span class="clvcoin"><img src="img/clvr.svg?v=matte1" alt="" width="56" height="65"></span><span class="clvtx"><b>Click to talk to Clover</b><small>Your sales coach. Ask anything.</small></span></button>`}
window.openClover=()=>{let d=$('#clsheet');if(!d){d=document.createElement('div');d.id='clsheet';document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d)closeClover()})}
  d.innerHTML=`<div class="pn" role="dialog" aria-modal="true" aria-label="Chat with Clover"><div class="clvhd"><img src="img/clvr.svg?v=matte1" alt="" width="40" height="47"><div class="grow"><div class="t">Clover</div><div class="s">Lucky Line sales coach</div></div><button class="b sm keep" onclick="closeClover()">Close</button></div>
   <div id="clvmsgs" class="clvmsgs" aria-live="polite"></div>
   <div class="clvchips" id="clvchips">${CLV_Q.map((x,i)=>`<button class="b sm keep" onclick="askClover(CLV_Q[${i}])">${esc(x)}</button>`).join('')}</div>
   <form class="clvin" onsubmit="event.preventDefault();askClover($('#clvq').value)"><input type="text" id="clvq" class="grow" placeholder="Ask Clover…" autocomplete="off" enterkeyhint="send"><button class="b p keep" type="submit">Send</button></form></div>`;
  d.classList.add('on');renderClv();if(!clvLog.length)addClv('c','Hey, I\'m Clover 🍀 Tap a question below or type your own. I can see your live numbers, so my answers are about your week, not generic advice.')};
window.closeClover=()=>{const d=$('#clsheet');if(d)d.classList.remove('on');const c=clvConv;clvConv=null;if(c){try{c.endSession()}catch(e){}}};
function addClv(who,text){clvLog.push({who,text});renderClv()}
function renderClv(){const m=$('#clvmsgs');if(!m)return;m.innerHTML=clvLog.map(x=>`<div class="clvm ${x.who==='u'?'u':'c'}">${esc(x.text)}</div>`).join('');m.scrollTop=m.scrollHeight}
/* Juicy AI brain (memory palace from every project + notes, voice memos, Drive; never texts or contacts) */
async function juicyBrain(qq){if(hosted)return [];const w=(qq.toLowerCase().match(/[a-z0-9]{3,}/g)||[]).filter(x=>!/^(what|when|where|which|with|that|this|have|help|should|could|would|about|more|better|first|today|need|think|from|your|they|them|does|make|into|how|can|the|and|for|are|you|get|our|out)$/.test(x)).slice(0,8);
  if(!w.length)return [];try{const r=await sql(`select title, snippet as content from public.brain_search(${q(w.join(' or '))}, null, 25) where kind='palace' or wing in ('note','voice_memo','drive_file') limit 8`);return r||[]}catch(e){return []}}
/* Website: Clover is a text-only ElevenLabs agent (like Skye) that searches the Juicy AI brain itself */
const CLV_AGENT='agent_9001m6pcy3yjfjc9ah71qxsq931p';let clvConv=null,clvWait=null,clvStarting=null;
function clvLib(){return window.ElevenLabsClient?Promise.resolve():new Promise((ok,no)=>{const sc=document.createElement('script');sc.src='vendor/elevenlabs/client-1.32.1.js';sc.onload=ok;sc.onerror=no;document.head.appendChild(sc)})}
function clvStatsText(s){if(!s)return '';return `Live CRM numbers for this rep this week: ${+s.late_proposals||0} proposals past the 60-minute clock, ${+s.late_tasks||0} overdue tasks, ${+s.proposals_week||0} proposals sent (${+s.on_time_week||0} within 60 minutes), ${+s.reports_week||0} video reports, ${+s.tasks_done_week||0} tasks done, about ${Math.round(+s.saved_min||0)} minutes saved by the CRM. Training library: ${(s.training||[]).map(x=>x.title).join('; ')||'none yet'}. Signed in as ${(typeof session!=='undefined'&&session&&session.email)||'a team member'}.`}
async function clvStart(s){if(clvConv)return clvConv;if(clvStarting)return clvStarting;
  clvStarting=(async()=>{await clvLib();const {Conversation}=window.ElevenLabsClient;
    const c=await Conversation.startSession({agentId:CLV_AGENT,textOnly:true,connectionType:'websocket',
      onMessage:m=>{if((m.role||m.source)==='user')return;const t=String(m.message||'').trim();if(!t)return;if(clvWait){const w=clvWait;clvWait=null;w(t)}else{addClv('c',t)}},
      onDisconnect:()=>{clvConv=null},onError:()=>{}});
    clvConv=c;try{const t=clvStatsText(s);if(t)c.sendContextualUpdate(t)}catch(e){}return c})();
  try{return await clvStarting}finally{clvStarting=null}}
async function clvAgentAsk(qq,s){const c=await clvStart(s);return await new Promise((ok,no)=>{const to=setTimeout(()=>{clvWait=null;no(new Error('timeout'))},45000);clvWait=t=>{clearTimeout(to);ok(t)};try{c.sendUserMessage(qq)}catch(e){clearTimeout(to);clvWait=null;no(e)}})}
window.askClover=async qq=>{qq=(qq||'').trim();if(!qq)return;const i=$('#clvq');if(i)i.value='';addClv('u',qq);addClv('c','Thinking…');
  let s=cache.stats;try{s=(await loadStats())||s}catch(e){}
  let ans='';
  if(hosted){try{ans=await clvAgentAsk(qq,s)}catch(e){clvConv=null}}
  else{if(!sampler){try{sampler=await claude.use('sample')}catch(e){}}
    if(sampler){try{const brain=await juicyBrain(qq);const lib=(s&&s.training||[]).map(x=>x.title+' ('+(x.kind||'link')+'): '+x.url).join('\n');
      const hist=clvLog.slice(-9,-1).map(x=>(x.who==='u'?'Rep: ':'Clover: ')+x.text).join('\n');
      const r=await sampler(`You are Clover, the upbeat four-leaf-clover sales coach inside Lucky Line Roofing's CRM (Montana), built from Justin Walton's Juicy AI brain: his life's work, his projects, how he sells and communicates. Speak in his spirit: warm, direct, generous, a little playful. Answer in 2-6 short plain sentences or a short numbered list, concrete and specific to their numbers. No markdown. House rules: proposal out within 60 minutes of the inspection (Alden closes ~80% this way), 3 options, proposals are honest education not scare tactics, work the reddest urgency circle first, record the walk-around video, follow up day 5 and day 21.\nPrivacy: never reveal private details about Justin's family, health, money, relationships, or any private person; turn personal material into general wisdom.\n\nThis week's live CRM stats (JSON): ${JSON.stringify(s||{})}\n\nTraining library:\n${lib||'(none yet)'}\n\nFrom Justin's Juicy AI brain (use what helps, never mention where it came from):\n${brain.map(b=>'- '+(b.title||'')+': '+b.content).join('\n')||'(nothing matched)'}\n\nConversation so far:\n${hist}\n\nRep's question: ${qq}`,{modelTier:'default'});ans=(r&&r.text||'').trim()}catch(e){}}}
  if(!ans)ans=cloverLocal(qq,s||{});
  clvLog.pop();addClv('c',ans)};
function cloverLocal(qq,s){qq=qq.toLowerCase();const lt=+s.late_tasks||0,lp=+s.late_proposals||0,on=+s.on_time_week||0,sent=+s.proposals_week||0;
  const lib=(s.training||[]);const tr=lib.length?` Training to watch: "${lib[0].title}" in the library below.`:'';
  if(/close|deal|win|sell|more sales/.test(qq))return `1. Speed wins: get the proposal out within 60 minutes of the inspection. ${sent?`This week ${on} of ${sent} went out on time.`:'No proposals sent yet this week.'}\n2. Give 3 priced options (good, better, best). Most people pick the middle.\n3. Ask for the signature on the spot: "Want me to get you on the schedule?"\n4. Follow up on day 5 and day 21. Most deals close on a follow-up, not the first call.${lp?`\n5. Right now ${lp} proposal${lp>1?'s are':' is'} past the clock. Send those first.`:''}${tr}`;
  if(/time|busy|overwhelm|manage|organi/.test(qq))return `1. Start each day on Today and clear the reddest circle first.${lt?` You have ${lt} overdue task${lt>1?'s':''}.`:' Nothing overdue right now, nice.'}\n2. Batch calls: one 30-minute block morning and afternoon.\n3. Record the walk-around with narration. The CRM writes the report and options, which saves about an hour each.\n4. Use the mic button for tasks and notes instead of typing.\n5. Leave the last 15 minutes to book tomorrow's inspections on the Calendar.`;
  if(/first|today|start|priorit/.test(qq))return `${lp?`First: send the ${lp} late proposal${lp>1?'s':''}. Every hour late cuts the close rate.\n`:''}${lt?`Next: knock out the ${lt} overdue task${lt>1?'s':''}, reddest circle first.\n`:''}Then call anyone who opened a proposal but hasn't signed, and book inspections for new leads within the day. Open Pipeline and sort by days quiet to find who's slipping.`;
  if(/think about|objection|price|expensive|cost|cheaper|other bid|quote/.test(qq))return `1. Agree first: "Totally fair, it's a big decision."\n2. Find the real worry: "Is it the price, the timing, or whether we're the right roofer?"\n3. Price: walk them down to the good option, or offer financing so it's a monthly number.\n4. Other bids: compare scope line by line (underlayment, ice and water, ventilation, warranty), not just the total.\n5. Set a follow-up time before you leave, then let the day-5 follow-up do its job.`;
  if(/60|minute|fast|proposal|quick/.test(qq))return `1. Record the walk-around video with narration while you're on the roof.\n2. Tap Create Roofly report on the job before you leave the driveway. It builds the findings and priced options.\n3. Check the 3 options, then tap Send to client (text is fastest).\n4. The clock ring on the job shows the time left.${sent?` This week: ${on} of ${sent} on time.`:''}`;
  return `Good question. Here's the short version: proposals within 60 minutes, reddest circle first, 3 options every time, and follow up day 5 and 21.${tr} Ask me about closing, time, objections or proposals and I'll get specific with your numbers.`}
