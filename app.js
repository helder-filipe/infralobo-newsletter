'use strict';
const $=id=>document.getElementById(id), KEY='infralobo_newsletter_v1', ARCHIVE_KEY='infralobo_newsletter_editions_v1';
const editionId=()=>('edition-'+Date.now()+'-'+Math.random().toString(36).slice(2,8));
let archive;try{archive=JSON.parse(localStorage.getItem(ARCHIVE_KEY)||'[]');if(!Array.isArray(archive))archive=[]}catch{archive=[]}
function persistArchive(){try{localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archive))}catch{notify('Armazenamento cheio; exporte as edições em JSON.')}}
const starter=()=>({month:'Novembro de 2026',number:'01',title:'O que nos liga',intro:'Pessoas, ideias e projetos que fazem parte do nosso dia a dia. Uma pausa para conhecer o que acontece na Infralobo.',featured:{title:'Pessoas, território e futuro',category:'Em destaque',text:'Esta é uma edição de exemplo para começar. Substitua esta notícia pelo principal acontecimento do mês e acrescente uma imagem relevante. Este espaço permite dar protagonismo às histórias da Infralobo.',image:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400',link:''},articles:[{title:'Pequenos gestos, mais cuidado com a água',category:'Água e saneamento',text:'Uma ideia simples para a próxima edição: partilhar um gesto concreto que ajude a evitar o desperdício de água no local de trabalho.',image:'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=900',link:''},{title:'Por detrás de cada espaço verde',category:'Espaços verdes',text:'Dar a conhecer o trabalho das equipas e também valorizar os detalhes que muitas vezes passam despercebidos.',image:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900',link:''},{title:'Conhecer melhor quem trabalha connosco',category:'Pessoas e equipas',text:'Uma oportunidade para aproximar colegas, projetos e equipas através de pequenas histórias do quotidiano.',image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900',link:''}]})
let state;try{state={...starter(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=starter()}
state.featured={...starter().featured,...(state.featured||{})};state.articles=Array.isArray(state.articles)?state.articles.slice(0,10):[];state.layout=['classic','odd','magazine','list'].includes(state.layout)?state.layout:'classic';state.editionId=state.editionId||editionId();
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validURL=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return''}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notify('Limite de armazenamento do navegador atingido. Exporte o JSON.') }renderPreview()};
function saveCurrentToArchive(){const copy=JSON.parse(JSON.stringify(state)),ix=archive.findIndex(a=>a.editionId===state.editionId);if(ix>=0)archive[ix]=copy;else archive.unshift(copy);persistArchive();renderEditionList()}
function renderEditionList(){const el=$('editionList');if(!el)return;el.innerHTML=archive.map((a,i)=>'<div class="edition-row"><button class="edition-load" data-load="'+i+'">'+escapeHTML(a.month||'Sem mês')+' · '+escapeHTML(a.number||'—')+'</button><button class="edition-delete" data-delete-edition="'+i+'" aria-label="Eliminar edição">✕</button></div>').join('')||'<p class="mini muted">Ainda não existem edições anteriores.</p>'}
function newEdition(){if(!confirm('Guardar a edição atual e criar uma nova?'))return;saveCurrentToArchive();const previous=state;state={...starter(),month:'',number:String((Number(previous.number)||0)+1).padStart(2,'0'),layout:previous.layout,editionId:editionId()};editUI();save();renderEditionList();notify('Edição anterior guardada.')}
function notify(message){const el=$('toast');el.textContent=message;el.style.display='block';clearTimeout(notify.t);notify.t=setTimeout(()=>el.style.display='none',3500)}

function baseRich(t){return '<p>'+escapeHTML(t||'').replace(/\r\n?/g,'\n').replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>')+'</p>'}
function safeRich(html){
 const doc=new DOMParser().parseFromString('<main>'+String(html||'')+'</main>','text/html');
 const ok=new Set(['P','DIV','BR','B','STRONG','I','EM','U','S','UL','OL','LI','BLOCKQUOTE','SPAN']);
 function visit(n){
  if(n.nodeType===3)return escapeHTML(n.textContent);
  if(n.nodeType!==1)return '';
  let inside=[...n.childNodes].map(visit).join(''),tag=n.tagName;
  if(!ok.has(tag))return inside;
  if(tag==='BR')return '<br>';
  let name={DIV:'p',B:'strong',I:'em'}[tag]||tag.toLowerCase(),styles=[];
  let st=n.style;
  if(['P','DIV','LI','BLOCKQUOTE'].includes(tag)){
   if(['left','right','center','justify'].includes(st.textAlign))styles.push('text-align:'+st.textAlign);
   if(['1','1.15','1.3','1.5','1.75','2'].includes(st.lineHeight))styles.push('line-height:'+st.lineHeight);
   if(/^(0|4|8|12|16|20|24|32)px$/.test(st.marginBottom))styles.push('margin-bottom:'+st.marginBottom);
  }
  if(tag==='SPAN'){
   if(st.fontWeight==='bold'||Number(st.fontWeight)>=600)styles.push('font-weight:bold');
   if(st.fontStyle==='italic')styles.push('font-style:italic');
   if(st.textDecoration.includes('underline'))styles.push('text-decoration:underline');
  }
  return '<'+name+(styles.length?' style="'+styles.join(';')+'"':'')+'>'+inside+'</'+name+'>';
 }
 return [...doc.body.firstElementChild.childNodes].map(visit).join('');
}
function articleHTML(a){return safeRich(a.html||baseRich(a.text))}
function richField(a){
 return '<div class="rich-wrap"><div class="rich-tools" role="toolbar" aria-label="Ferramentas de formatação">'+
 '<button type="button" data-command="bold" title="Negrito"><b>N</b></button><button type="button" data-command="italic" title="Itálico"><i>I</i></button><button type="button" data-command="underline" title="Sublinhado"><u>S</u></button>'+
 '<button type="button" data-command="insertUnorderedList" title="Lista com marcas">• Lista</button>'+
 '<button type="button" data-command="insertOrderedList" title="Lista numerada">1. Lista</button>'+
 '<button type="button" data-command="justifyLeft" title="Esquerda">⇤</button><button type="button" data-command="justifyCenter" title="Centrar">≡</button><button type="button" data-command="justifyRight" title="Direita">⇥</button><button type="button" data-command="justifyFull" title="Justificar">▤</button>'+
 '<label>Entrelinhas <select data-style="line"><option value="1">1,0</option><option value="1.15">1,15</option><option value="1.3">1,3</option><option value="1.5" selected>1,5</option><option value="1.75">1,75</option><option value="2">2,0</option></select></label>'+
 '<label>Espaço após <select data-style="space"><option value="0">0 px</option><option value="8">8 px</option><option value="12" selected>12 px</option><option value="16">16 px</option><option value="24">24 px</option><option value="32">32 px</option></select></label>'+
 '<button type="button" data-command="removeFormat" title="Limpar formatação">Limpar</button></div>'+
 '<div class="rich-input" contenteditable="true" data-rich="1" role="textbox" aria-label="Texto completo" aria-multiline="true">'+articleHTML(a)+'</div>'+
 '<small class="muted">Selecione o texto para formatar. O alinhamento e os espaçamentos aplicam-se aos parágrafos.</small></div>';
}
function storeRich(el){
 const article=el.closest('[data-article]');if(!article)return;
 const a=article.dataset.article==='featured'?state.featured:state.articles[Number(article.dataset.article)];
 if(!a)return;
 a.html=safeRich(el.innerHTML);a.text=el.innerText||el.textContent||'';save();
}
function richSelectionParagraphs(edit){
 const selection=window.getSelection();if(!selection||!selection.rangeCount||!edit.contains(selection.anchorNode))return [];
 const range=selection.getRangeAt(0);
 const nodes=[...edit.querySelectorAll('p,li,blockquote')].filter(n=>range.intersectsNode(n));
 if(nodes.length)return nodes;
 let p=selection.anchorNode?.parentElement?.closest('p,li,blockquote');
 return p&&edit.contains(p)?[p]:[];
}
function onRichClick(e){
 const b=e.target.closest('[data-command]');if(!b)return;
 const edit=b.closest('.rich-wrap').querySelector('[data-rich]');
 edit.focus();document.execCommand(b.dataset.command,false,null);storeRich(edit);
}
function onRichChange(e){
 const sel=e.target.closest('[data-style]');if(!sel)return;
 const edit=sel.closest('.rich-wrap').querySelector('[data-rich]');
 const nodes=richSelectionParagraphs(edit);
 if(!nodes.length){notify('Selecione um parágrafo antes de escolher o espaçamento.');return}
 for(const p of nodes){if(sel.dataset.style==='line')p.style.lineHeight=sel.value;else p.style.marginBottom=sel.value+'px'}
 storeRich(edit);
}

const field=(label,value,kind='input',key='')=>'<label class="field">'+label+(kind==='textarea'?'<textarea data-prop="'+key+'">'+escapeHTML(value)+'</textarea>':'<input data-prop="'+key+'" value="'+escapeHTML(value)+'">')+'</label>';
const editor=(data,idx)=>'<div class="fields">'+field('Categoria',data.category,'input','category')+field('Título',data.title,'input','title')+'<label class="field">Texto completo</label>'+richField(data)+field('URL da imagem (HTTPS público)',data.image,'input','image')+field('Ligação para mais informação (opcional)',data.link,'input','link')+(idx===null?'':'<button class="danger" data-remove="'+idx+'">Eliminar notícia</button>')+'</div>';
function editUI(){
$('month').value=state.month;$('number').value=state.number;$('title').value=state.title;$('intro').value=state.intro;
$('featuredFields').innerHTML='<div class="article-edit" data-article="featured">'+editor(state.featured,null)+'</div>';
$('articleFields').innerHTML=state.articles.map((a,i)=>'<details class="article-edit" data-article="'+i+'" '+(i===state.articles.length-1?'open':'')+'><summary>'+(i+1)+'. '+escapeHTML(a.title||'Nova notícia')+'</summary>'+editor(a,i)+'</details>').join('');
$('count').textContent='('+state.articles.length+'/10)';$('add').disabled=state.articles.length>=10;
}
function picture(url,cls=''){const safe=validURL(url);return safe?'<img class="'+cls+'" src="'+escapeHTML(safe)+'" alt="Imagem da notícia" loading="lazy">':'<div class="placeholder">INFRALOBO · Notícias</div>'}
function readLink(a){const u=validURL(a.link);return u?'<p><a href="'+escapeHTML(u)+'" target="_blank" rel="noopener noreferrer" style="color:#386641;font-weight:700">Saber mais ↗</a></p>':''}
function articleMarkup(a,i,full=false){return '<article class="article">'+picture(a.image)+'<div><span class="eyebrow">'+escapeHTML(a.category||'Notícia')+'</span><h3>'+escapeHTML(a.title)+'</h3><div class="body-copy '+(full?'':'clamp')+'" id="body-'+i+'">'+articleHTML(a)+'</div>'+(full?'':'<button class="read-more" aria-expanded="false" data-more="'+i+'">Ver mais</button>')+readLink(a)+'</div></article>'}
function template(full=false){
const highlight=state.featured;
return '<div class="newsletter"><div class="newsletter-header"><div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap"><img class="header-logo" src="./logo-infralobo.png" alt="Infralobo Empresa Municipal"><div style="text-align:right"><div class="eyebrow" style="margin:0 0 6px">NEWSLETTER INTERNA</div><small class="issue">'+escapeHTML(state.month)+' · Edição '+escapeHTML(state.number)+'</small></div></div><h1>'+escapeHTML(state.title)+'</h1><p class="intro">'+escapeHTML(state.intro)+'</p></div><div class="content"><div class="eyebrow" style="margin-bottom:15px">☆ &nbsp; EM DESTAQUE</div><div class="featured">'+picture(highlight.image)+'<div class="copy"><span class="eyebrow">'+escapeHTML(highlight.category)+'</span><h2>'+escapeHTML(highlight.title)+'</h2><div class="body-copy '+(full?'':'clamp')+'" id="body-featured">'+articleHTML(highlight)+'</div>'+(full?'':'<button class="read-more" data-more="featured" aria-expanded="false">Ver mais →</button>')+readLink(highlight)+'</div></div>'+(state.articles.length?'<h2 class="section-title">Também nesta edição <span class="mini muted">'+state.articles.length+' notícias</span></h2><div class="news-grid layout-'+escapeHTML(state.layout)+'">'+state.articles.map((a,i)=>articleMarkup(a,i,full)).join('')+'</div>':'')+'</div><div class="footer"><strong>INFRALOBO · Empresa Municipal</strong><div>Comunicação interna · '+escapeHTML(state.month)+'</div><div>Esta comunicação destina-se aos colaboradores da Infralobo.</div><div><a href="https://www.infralobo.pt">www.infralobo.pt</a></div></div></div>'
}
function renderPreview(){$('preview').innerHTML=template(false);$('editionName').textContent=state.month;$('editionMeta').textContent='Edição '+state.number;$('editionCount').textContent=(1+state.articles.length)+' / 10 notícias';$('sideEdition').textContent='●  '+state.month+' · '+state.number;$('layoutSelect').value=state.layout}
function updateFromEditor(e){const el=e.target;if(!el.dataset.prop && !['month','number','title','intro'].includes(el.id))return;const target=el.closest('[data-article]');if(target){const ob=target.dataset.article==='featured'?state.featured:state.articles[Number(target.dataset.article)];ob[el.dataset.prop]=el.value}else state[el.id]=el.value;save()}
['month','number','title','intro'].forEach(id=>$(id).addEventListener('input',updateFromEditor));
$('featuredFields').addEventListener('input',updateFromEditor);
for(const id of ['featuredFields','articleFields']){const el=$(id);el.addEventListener('input',e=>{if(e.target.matches('[data-rich]'))storeRich(e.target)});el.addEventListener('mousedown',e=>{if(e.target.closest('[data-command]'))e.preventDefault()});el.addEventListener('click',onRichClick);el.addEventListener('change',onRichChange)}
$('articleFields').addEventListener('input',updateFromEditor);
$('articleFields').addEventListener('click',e=>{const btn=e.target.closest('[data-remove]');if(!btn)return;if(!confirm('Eliminar esta notícia?'))return;state.articles.splice(Number(btn.dataset.remove),1);editUI();save();notify('Notícia eliminada.')});
$('add').addEventListener('click',()=>{if(state.articles.length>=10)return notify('Máximo de 10 notícias.');state.articles.push({title:'Nova notícia',category:'Atualidade',text:'',image:'',link:''});editUI();save()});
$('preview').addEventListener('click',e=>{const btn=e.target.closest('[data-more]');if(!btn)return;const block=$('body-'+btn.dataset.more),open=btn.getAttribute('aria-expanded')==='true';block.classList.toggle('clamp',open);btn.textContent=open?'Ver mais →':'Ver menos ↑';btn.setAttribute('aria-expanded',String(!open))});
$('reset').addEventListener('click',newEdition);
$('layoutSelect').addEventListener('change',e=>{state.layout=e.target.value;save()});
$('editionList').addEventListener('click',e=>{const del=e.target.closest('[data-delete-edition]');if(del){const i=Number(del.dataset.deleteEdition),a=archive[i];if(!a||!confirm('Eliminar definitivamente a edição '+(a.month||'')+' · '+(a.number||'')+'?'))return;archive.splice(i,1);persistArchive();renderEditionList();notify('Edição eliminada.');return}const load=e.target.closest('[data-load]');if(load){const a=archive[Number(load.dataset.load)];if(!a||!confirm('Abrir esta edição? A edição atual será guardada.'))return;saveCurrentToArchive();archive=archive.filter(v=>v.editionId!==a.editionId);persistArchive();state=JSON.parse(JSON.stringify(a));state.layout=['classic','odd','magazine','list'].includes(state.layout)?state.layout:'classic';editUI();save();renderEditionList();notify('Edição aberta.')}});
function download(name,text,type){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function filename(ext){return 'infralobo-newsletter-'+String(state.month).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]+/gi,'-').toLowerCase()+'.'+ext}
$('exportJson').addEventListener('click',()=>download(filename('json'),JSON.stringify(state,null,2),'application/json'));
$('importJson').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!v||typeof v!=='object'||!Array.isArray(v.articles))throw Error();saveCurrentToArchive();state={...starter(),...v,featured:{...starter().featured,...v.featured},articles:v.articles.slice(0,10),editionId:editionId(),layout:['classic','odd','magazine','list'].includes(v.layout)?v.layout:'classic'};editUI();save();renderEditionList();notify('Edição importada.')}catch{notify('Ficheiro JSON inválido.')}e.target.value=''});
const cssEmail='body{margin:0;background:#f5f8f3;font-family:Arial,sans-serif;color:#24312a}.wrap{max-width:700px;margin:auto;background:#fff}.head{padding:32px;border-bottom:6px solid #A7C957}h1{color:#386641}.section{padding:25px 32px;border-bottom:1px solid #dce6dc}.section img{max-width:100%;height:auto;border-radius:8px}.section h2{color:#386641}.section p{white-space:pre-line;line-height:1.65}.foot{padding:25px 32px;background:#386641;color:white}a{color:#386641}';
function emailBody(){const section=(a,lead)=>'<div class="section">'+(lead?'<b style="color:#6A994E">EM DESTAQUE</b>':'')+(validURL(a.image)?'<p><img src="'+escapeHTML(validURL(a.image))+'" alt="Imagem da notícia" width="636"></p>':'')+'<h2>'+escapeHTML(a.title)+'</h2><div>'+articleHTML(a)+'</div>'+(validURL(a.link)?'<p><a href="'+escapeHTML(validURL(a.link))+'">Saber mais</a></p>':'')+'</div>';return '<div class="wrap"><div class="head"><p><img src="https://infralobo-newsletter.vercel.app/logo-infralobo.png" alt="Infralobo Empresa Municipal" width="260" style="display:block;width:260px;max-width:100%;height:auto"></p><div>NEWSLETTER INTERNA</div><h2>'+escapeHTML(state.title)+'</h2><p>'+escapeHTML(state.intro)+'</p><small>'+escapeHTML(state.month)+' · Edição '+escapeHTML(state.number)+'</small></div>'+section(state.featured,true)+state.articles.map(a=>section(a,false)).join('')+'<div class="foot">INFRALOBO · Empresa Municipal · Comunicação interna</div></div>'}
function emailHTML(){return '<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Newsletter Infralobo</title><style>'+cssEmail+'</style></head><body>'+emailBody()+'</body></html>'}
$('htmlExport').addEventListener('click',()=>download(filename('html'),emailHTML(),'text/html;charset=utf-8'));
$('downloadEmail').addEventListener('click',()=>{const boundary='infralobo-newsletter';const subject='Newsletter Infralobo · '+state.month;const eml=['From: Infralobo <newsletter@infralobo.pt>','To:','Subject: =?UTF-8?B?'+utf8b64(subject)+'?=','MIME-Version: 1.0','Content-Type: multipart/alternative; boundary="'+boundary+'"','','--'+boundary,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',utf8b64([state.title,state.intro,state.featured.title,state.featured.text,...state.articles.flatMap(a=>[a.title,a.text])].join('\n\n')),'--'+boundary,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',utf8b64(emailHTML()),'--'+boundary+'--',''].join('\r\n');download(filename('eml'),eml,'message/rfc822');notify('E-mail exportado. Abra o .eml no Outlook e confirme o remetente antes de enviar.')});
function utf8b64(str){return btoa(Array.from(new TextEncoder().encode(str),b=>String.fromCharCode(b)).join(''))}
$('print').addEventListener('click',()=>window.print());
function setView(preview){document.body.classList.toggle('view-preview',preview);$('tabPreview').classList.toggle('active',preview);$('tabEdit').classList.toggle('active',!preview)}
$('tabEdit').addEventListener('click',()=>setView(false));$('tabPreview').addEventListener('click',()=>setView(true));
$('tabAdd').addEventListener('click',()=>{setView(false);$('add').click()});
$('sideNew').addEventListener('click',()=>$('reset').click());

editUI();renderEditionList();renderPreview();setView(true);
