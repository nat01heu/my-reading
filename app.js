const $=id=>document.getElementById(id);
const BOOK_FIELDS=['Titel','Autor','Reihe','Band','Seiten','Genre','Subgenre','Spannend %','Gruselig %','Traurig %','Herzerwärmend %','Aufwühlend %','Witzig %','Romantisch %','Erotisch %','Nachdenklich %','Informativ %','Langsam %','Moderat % (Tempo)','Schnell %','Wechselhaft %','Einfach % (Schreibstil)','Moderat % (Schreibstil)','Anspruchsvoll % (Schreibstil)','Tropes','Lesestatus','Zuletzt ausgewählt','Auswahlanzahl','Aktuelle Lesestimmung','Match Score','Empfehlungsrang','Stimmungs-Match','Tempo-Match','Schreibstil-Match','Empfehlbar'];
const PERCENT_FIELDS=new Set(BOOK_FIELDS.filter(x=>x.includes('%')));
const initialBooks=(window.INITIAL_BOOKS||[]).map(x=>({...x}));
const defaultState={books:initialBooks,currentBookId:null,bookProgress:{},readingByDate:{},totalNewPages:0,matcherPrefs:{}};
let S=load();
function load(){try{const saved=JSON.parse(localStorage.getItem('readingAppV1')||'{}');return{...structuredClone(defaultState),...saved,books:Array.isArray(saved.books)&&saved.books.length?saved.books:initialBooks}}catch{return structuredClone(defaultState)}}
function save(){localStorage.setItem('readingAppV1',JSON.stringify(S));renderAll()}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function today(){return new Date().toISOString().slice(0,10)}
function getId(b){return b._id||`${b.Titel}|${b.Autor}|${b.Reihe}|${b.Band}`}
function currentBook(){return S.books.find(b=>getId(b)===S.currentBookId)}
function currentPage(){return Number(S.bookProgress[S.currentBookId]||0)}
function setCurrentPage(v){if(S.currentBookId)S.bookProgress[S.currentBookId]=Math.max(0,Number(v)||0)}
function isRead(b){return String(b.Lesestatus||'').trim().toLowerCase()==='gelesen'}

function navigate(id){
 document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id===id));
 document.querySelectorAll('.nav[data-nav]').forEach(x=>x.classList.toggle('active',x.dataset.nav===id));
 window.scrollTo({top:0,behavior:'smooth'})
}
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>navigate(b.dataset.nav));

function renderAll(){
 renderCurrent();renderLibrary();renderStats();populateSubgenres()
}
function renderCurrent(){
 const b=currentBook(),page=currentPage(),max=Number(b?.Seiten||0),pct=max?Math.min(100,page/max*100):0;
 $('currentTitle').textContent=b?b.Titel:'Noch kein Buch ausgewählt';
 $('currentMeta').textContent=b?`${b.Autor||''}${b.Reihe?' · '+b.Reihe+(b.Band?' Band '+b.Band:''):''}${max?' · '+max+' Seiten':''}`:'Wähle ein Buch aus deiner Bibliothek.';
 $('currentPage').textContent=page;$('progressBar').style.width=pct+'%';$('todayTotal').textContent=Number(S.readingByDate[today()]||0);
 $('finishBook').disabled=!b||isRead(b)
}
$('addTodayPages').onclick=()=>{
 const b=currentBook();if(!b){$('todayMessage').textContent='Wähle zuerst ein Buch aus.';return}
 const n=Math.floor(Number($('todayPages').value));if(!Number.isFinite(n)||n<=0){$('todayMessage').textContent='Bitte gib eine gültige Seitenzahl ein.';return}
 const max=Number(b.Seiten||0),before=currentPage(),remaining=max?Math.max(0,max-before):n,added=Math.min(n,remaining);
 if(added<=0){$('todayMessage').textContent='Du bist bereits am Ende des Buches.';return}
 setCurrentPage(before+added);S.totalNewPages=Number(S.totalNewPages||0)+added;S.readingByDate[today()]=Number(S.readingByDate[today()]||0)+added;
 $('todayPages').value='';$('todayMessage').textContent=added===n?`${added} Seiten eingetragen.`:`${added} Seiten eingetragen – damit bist du am Buchende.`;save()
};
$('setBaseline').onclick=()=>{
 const b=currentBook();if(!b){$('baselineMessage').textContent='Wähle zuerst ein Buch aus.';return}
 let n=Math.floor(Number($('baselinePages').value));if(!Number.isFinite(n)||n<0){$('baselineMessage').textContent='Bitte gib einen gültigen Seitenstand ein.';return}
 const max=Number(b.Seiten||0);if(max)n=Math.min(n,max);setCurrentPage(n);$('baselinePages').value='';$('baselineMessage').textContent=`Seitenstand auf ${n} gesetzt.`;save()
};
$('finishBook').onclick=()=>{
 const b=currentBook();if(!b)return;b.Lesestatus='gelesen';if(Number(b.Seiten||0))setCurrentPage(Number(b.Seiten));save()
};

function renderLibrary(){
 const q=$('bookSearch').value.trim().toLowerCase(),status=$('bookStatus').value;
 let list=S.books.filter(b=>(!status||String(b.Lesestatus||'').toLowerCase()===status)&&(!q||[b.Titel,b.Autor,b.Reihe,b.Tropes,b.Genre,b.Subgenre].some(v=>String(v||'').toLowerCase().includes(q))));
 $('libraryCount').textContent=list.length;$('libraryList').innerHTML='';
 list.forEach(b=>{
   const c=document.createElement('article');c.className='book-card';
   c.innerHTML=`<strong>${esc(b.Titel)}</strong><small>${esc(b.Autor||'')}</small><small>${esc(b.Genre||'')}${b.Subgenre?' · '+esc(b.Subgenre):''}</small><small>${b.Reihe?esc(b.Reihe)+(b.Band?' · Band '+esc(b.Band):''):'Einzelband'} · ${esc(b.Lesestatus||'')}</small>`;
   const actions=document.createElement('div');actions.className='book-actions';
   const read=document.createElement('button');read.className='primary';read.textContent=S.currentBookId===getId(b)?'Aktuell':'Jetzt lesen';read.onclick=()=>{S.currentBookId=getId(b);save();navigate('home')};
   const toggle=document.createElement('button');toggle.className='secondary';toggle.textContent=isRead(b)?'Ungelesen':'Gelesen';toggle.onclick=()=>{b.Lesestatus=isRead(b)?'ungelesen':'gelesen';save()};
   actions.append(read,toggle);c.appendChild(actions);$('libraryList').appendChild(c)
 })
}
$('bookSearch').oninput=renderLibrary;$('bookStatus').onchange=renderLibrary;

function getPrefs(){
 const p={genre:{},mood:{},tempo:{},style:{}};
 document.querySelectorAll('[data-pref]').forEach(el=>p[el.dataset.pref][el.dataset.key]=Number(el.value));
 return p
}
function groupScore(book,fields){
 const diffs=Object.entries(fields).map(([f,w])=>Math.abs(Number(book[f]||0)-w*20));
 return diffs.length?Math.max(0,100-diffs.reduce((a,b)=>a+b,0)/diffs.length):50
}
function seriesEligible(book){
 if(!$('respectSeries').checked)return true;
 const series=String(book.Reihe||'').trim(),band=Number(book.Band);if(!series||!band||band<=1)return true;
 const earlier=S.books.filter(x=>String(x.Reihe||'').trim()===series&&Number(x.Band)<band);
 return earlier.every(isRead)
}
$('runMatcher').onclick=()=>{
 const p=getPrefs(),sub=$('filterSubgenre').value,trope=$('filterTrope').value.trim().toLowerCase(),count=Number($('recommendationCount').value||10),onlyUnread=$('onlyUnread').checked;
 S.matcherPrefs={...p,sub,trope,count,onlyUnread,respectSeries:$('respectSeries').checked};localStorage.setItem('readingAppV1',JSON.stringify(S));
 let arr=S.books.filter(b=>(!onlyUnread||!isRead(b))&&seriesEligible(b)&&(!sub||b.Subgenre===sub));
 if(trope)arr=arr.filter(b=>String(b.Tropes||'').toLowerCase().includes(trope));
 arr=arr.map(b=>{const mood=groupScore(b,p.mood),tempo=groupScore(b,p.tempo),style=groupScore(b,p.style),genre=Number(p.genre[String(b.Genre||'')]??3)*20,score=(mood*.65+tempo*.20+style*.15)*.90+genre*.10;return{b,mood,tempo,style,genre,score}}).sort((a,b)=>b.score-a.score).slice(0,count);
 $('matcherResults').innerHTML=arr.map((x,i)=>`<article class="match-card"><div class="match-top"><div><strong>${i+1}. ${esc(x.b.Titel)}</strong><p class="muted small">${esc(x.b.Autor||'')} · ${esc(x.b.Genre||'')}${x.b.Subgenre?' · '+esc(x.b.Subgenre):''}</p></div><div class="score">${Math.round(x.score)} %</div></div><div class="breakdown"><span>Stimmung ${Math.round(x.mood)} %</span><span>Tempo ${Math.round(x.tempo)} %</span><span>Schreibstil ${Math.round(x.style)} %</span><span>Genre ${Math.round(x.genre)} %</span></div><button class="secondary full use-book" data-id="${esc(getId(x.b))}" style="margin-top:10px">Als aktuelles Buch wählen</button></article>`).join('')||'<article class="match-card">Keine passenden Bücher gefunden.</article>';
 document.querySelectorAll('.use-book').forEach(btn=>btn.onclick=()=>{S.currentBookId=btn.dataset.id;save();navigate('home')})
};
document.querySelectorAll('[data-pref]').forEach(el=>el.oninput=()=>{el.parentElement.querySelector('b').textContent=el.value});
function populateSubgenres(){
 const s=$('filterSubgenre'),cur=s.value,vals=[...new Set(S.books.map(b=>b.Subgenre).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'de'));
 s.innerHTML='<option value="">egal</option>'+vals.map(v=>`<option>${esc(v)}</option>`).join('');if(vals.includes(cur))s.value=cur
}
function restorePrefs(){
 const p=S.matcherPrefs;if(!p||!Object.keys(p).length)return;
 document.querySelectorAll('[data-pref]').forEach(el=>{const g=el.dataset.pref,k=el.dataset.key;if(p[g]?.[k]!==undefined){el.value=p[g][k];el.parentElement.querySelector('b').textContent=el.value}});
 $('filterTrope').value=p.trope||'';$('recommendationCount').value=String(p.count||10);$('onlyUnread').checked=p.onlyUnread!==false;$('respectSeries').checked=p.respectSeries!==false
}

function renderStats(){
 const read=S.books.filter(isRead).length,unread=S.books.length-read,todayPages=Number(S.readingByDate[today()]||0);
 $('statBooks').textContent=S.books.length;$('statUnread').textContent=unread;$('statRead').textContent=read;$('statPages').textContent=S.totalNewPages||0;
 $('statsPages').textContent=S.totalNewPages||0;$('statsToday').textContent=todayPages;$('statsFinished').textContent=read;$('statsUnfinished').textContent=unread;
 const entries=Object.entries(S.readingByDate).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,14);
 $('dailyHistory').innerHTML=entries.length?entries.map(([d,n])=>`<div class="history-row"><span>${new Date(d+'T12:00:00').toLocaleDateString('de-DE')}</span><strong>${n} Seiten</strong></div>`).join(''):'<div class="history-row"><span>Noch keine neuen Seiten erfasst.</span></div>'
}

const modal=$('bookModal');
function openModal(){modal.hidden=false;buildBookForm()}
function closeModal(){modal.hidden=true}
$('openAddBook').onclick=openModal;$('homeAddBook').onclick=openModal;$('libraryAddBook').onclick=openModal;$('navAdd').onclick=openModal;$('closeBookModal').onclick=closeModal;
modal.onclick=e=>{if(e.target===modal)closeModal()};
function fieldInput(name){
 const numeric=['Band','Seiten','Auswahlanzahl','Empfehlungsrang'].includes(name)||PERCENT_FIELDS.has(name);
 const boolean=name==='Empfehlbar';
 if(boolean)return `<select name="${name}"><option value="">–</option><option value="true">ja</option><option value="false">nein</option></select>`;
 if(name==='Lesestatus')return `<select name="${name}"><option value="ungelesen">ungelesen</option><option value="gelesen">gelesen</option></select>`;
 return `<input name="${name}" ${numeric?'type="number" step="any"':''} placeholder="${esc(name)}">`
}
function buildBookForm(){
 const groups=[
  ['Basis',['Titel','Autor','Reihe','Band','Seiten','Genre','Subgenre','Tropes','Lesestatus']],
  ['Stimmung & Inhalt',['Spannend %','Gruselig %','Traurig %','Herzerwärmend %','Aufwühlend %','Witzig %','Romantisch %','Erotisch %','Nachdenklich %','Informativ %']],
  ['Handlungstempo',['Langsam %','Moderat % (Tempo)','Schnell %','Wechselhaft %']],
  ['Schreibstil',['Einfach % (Schreibstil)','Moderat % (Schreibstil)','Anspruchsvoll % (Schreibstil)']],
  ['Matcher / Historie',['Zuletzt ausgewählt','Auswahlanzahl','Aktuelle Lesestimmung','Match Score','Empfehlungsrang','Stimmungs-Match','Tempo-Match','Schreibstil-Match','Empfehlbar']]
 ];
 $('bookForm').innerHTML=groups.map(([title,fields])=>`<section class="field-group"><h3>${title}</h3><div class="fields">${fields.map(f=>`<label class="field"><span>${esc(f)}</span>${fieldInput(f)}</label>`).join('')}</div></section>`).join('')+'<button class="primary full" type="submit">Buch speichern</button>';
 $('bookForm').onsubmit=e=>{e.preventDefault();const fd=new FormData(e.target),b={_id:'manual-'+Date.now()};BOOK_FIELDS.forEach(f=>{let v=fd.get(f);if(v==='')v=null;else if(PERCENT_FIELDS.has(f)||['Band','Seiten','Auswahlanzahl','Empfehlungsrang'].includes(f))v=Number(v);else if(f==='Empfehlbar')v=v==='true'?true:v==='false'?false:null;b[f]=v});if(!b.Titel){alert('Bitte einen Titel eintragen.');return}S.books.push(b);save();closeModal();navigate('library')}
}

if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
populateSubgenres();restorePrefs();renderAll();
