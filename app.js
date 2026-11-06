'use strict';
const $=id=>document.getElementById(id), KEY='infralobo_newsletter_v1', ARCHIVE_KEY='infralobo_newsletter_editions_v1';
const editionId=()=>('edition-'+Date.now()+'-'+Math.random().toString(36).slice(2,8));
let archive;try{archive=JSON.parse(localStorage.getItem(ARCHIVE_KEY)||'[]');if(!Array.isArray(archive))archive=[]}catch{archive=[]}
function persistArchive(){try{localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archive))}catch{notify('Armazenamento cheio; exporte as edições em JSON.')}}
const starter=()=>({month:'Novembro de 2026',number:'01',title:'O que nos liga',intro:'Pessoas, ideias e projetos que fazem parte do nosso dia a dia. Uma pausa para conhecer o que acontece na Infralobo.',featured:{title:'Pessoas, território e futuro',category:'Em destaque',text:'Esta é uma edição de exemplo para começar. Substitua esta notícia pelo principal acontecimento do mês e acrescente uma imagem relevante. Este espaço permite dar protagonismo às histórias da Infralobo.',image:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400',link:''},articles:[{title:'Pequenos gestos, mais cuidado com a água',category:'Água e saneamento',text:'Uma ideia simples para a próxima edição: partilhar um gesto concreto que ajude a evitar o desperdício de água no local de trabalho.',image:'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=900',link:''},{title:'Por detrás de cada espaço verde',category:'Espaços verdes',text:'Dar a conhecer o trabalho das equipas e também valorizar os detalhes que muitas vezes passam despercebidos.',image:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900',link:''},{title:'Conhecer melhor quem trabalha connosco',category:'Pessoas e equipas',text:'Uma oportunidade para aproximar colegas, projetos e equipas através de pequenas histórias do quotidiano.',image:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900',link:''}]})
let state;try{state={...starter(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{state=starter()}
state.featured={...starter().featured,...(state.featured||{})};state.articles=Array.isArray(state.articles)?state.articles.slice(0,10):[];state.layout=['classic','odd','magazine','list','mosaic','alternating','minimal'].includes(state.layout)?state.layout:'classic';state.editionId=state.editionId||editionId();
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validURL=s=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return''}};
function imageURL(value){const raw=validURL(value);if(!raw)return '';try{const url=new URL(raw);if(url.hostname==='drive.google.com'||url.hostname==='www.drive.google.com'){const match=url.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)||url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/);const id=match?.[1]||url.searchParams.get('id');if(id&&/^[a-zA-Z0-9_-]+$/.test(id))return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600'}return raw}catch{return ''}}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch{notify('Limite de armazenamento do navegador atingido. Exporte o JSON.') }renderPreview()};
function saveCurrentToArchive(){const copy=JSON.parse(JSON.stringify(state)),ix=archive.findIndex(a=>a.editionId===state.editionId);if(ix>=0)archive[ix]=copy;else archive.unshift(copy);persistArchive();renderEditionList()}
function renderEditionList(){const el=$('editionList');if(!el)return;el.innerHTML=archive.map((a,i)=>'<div class="edition-row"><button class="edition-load" data-load="'+i+'">'+escapeHTML(a.month||'Sem mês')+' · '+escapeHTML(a.number||'—')+'</button><button class="edition-delete" data-delete-edition="'+i+'" aria-label="Eliminar edição">✕</button></div>').join('')||'<p class="mini muted">Ainda não existem edições anteriores.</p>'}
function newEdition(){if(!confirm('Guardar a edição atual e criar uma nova?'))return;saveCurrentToArchive();const previous=state;state={...starter(),month:'',number:String((Number(previous.number)||0)+1).padStart(2,'0'),layout:previous.layout,editionId:editionId()};editUI();save();renderEditionList();notify('Edição anterior guardada.')}
function notify(message){const el=$('toast');el.textContent=message;el.style.display='block';clearTimeout(notify.t);notify.t=setTimeout(()=>el.style.display='none',3500)}

function baseRich(t){return '<p>'+escapeHTML(t||'').replace(/\r\n?/g,'\n').replace(/\n\n+/g,'</p><p>').replace(/\n/g,'<br>')+'</p>'}
function safeRich(html){
 const doc=new DOMParser().parseFromString('<main>'+String(html||'')+'</main>','text/html');
 const ok=new Set(['P','DIV','BR','B','STRONG','I','EM','U','S','UL','OL','LI','BLOCKQUOTE','SPAN','A']);
 const urlPattern=/(?:https?:\/\/|www\.)[^\s<>"']+|[a-zA-Z0-9.!#$%&'*+/=?^_\x60{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+/gi;
 function linkText(raw){
  const value=String(raw||'');let out='',last=0;urlPattern.lastIndex=0;
  for(const match of value.matchAll(urlPattern)){
   const index=match.index;const token=match[0];
   out+=escapeHTML(value.slice(last,index));
   const trimmed=token.replace(/[.,;:!?]+$/,'').replace(/\)+$/,m=>m.slice(0,Math.max(0,(token.match(/\(/g)||[]).length-(token.match(/\)/g)||[]).length+m.length)));
   const tail=token.slice(trimmed.length);
   const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
   const candidate=email?'mailto:'+trimmed:(/^www\./i.test(trimmed)?'https://'+trimmed:trimmed);
   let href='';
   try{const u=new URL(candidate);if(['https:','http:','mailto:'].includes(u.protocol))href=u.href}catch{}
   out+=href?'<a href="'+escapeHTML(href)+'"'+(email?'':' target="_blank" rel="noopener noreferrer"')+'>'+escapeHTML(trimmed)+'</a>':escapeHTML(trimmed);
   out+=escapeHTML(tail);last=index+token.length;
  }
  return out+escapeHTML(value.slice(last));
 }
 function visit(n,inLink=false){
  if(n.nodeType===3)return inLink?escapeHTML(n.textContent):linkText(n.textContent);
  if(n.nodeType!==1)return '';
  const tag=n.tagName;
  const href=tag==='A'?String(n.getAttribute('href')||''):'';
  const validHref=(()=>{try{const u=new URL(href,location.href);return ['https:','http:','mailto:'].includes(u.protocol)&&/^(https?:|mailto:)/i.test(href)?u.href:''}catch{return''}})();
  const inside=[...n.childNodes].map(child=>visit(child,inLink||(tag==='A'&&!!validHref))).join('');
  if(!ok.has(tag))return inside;
  if(tag==='BR')return '<br>';
  if(tag==='A')return validHref?'<a href="'+escapeHTML(validHref)+'"'+(validHref.startsWith('mailto:')?'':' target="_blank" rel="noopener noreferrer"')+'>'+inside+'</a>':inside;
  const name={B:'strong',I:'em'}[tag]||tag.toLowerCase(),styles=[];
  const st=n.style;
  if(['P','DIV','LI','BLOCKQUOTE'].includes(tag)){
   const align=st.textAlign||n.getAttribute('align');if(['left','right','center','justify'].includes(align))styles.push('text-align:'+align);
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
 return [...doc.body.firstElementChild.childNodes].map(node=>visit(node)).join('');
}
function articleHTML(a){return safeRich(a.html||baseRich(a.text))}
function richField(a){
 return '<div class="rich-wrap"><div class="rich-tools" role="toolbar" aria-label="Ferramentas de formatação">'+
 '<button type="button" data-command="bold" title="Negrito"><b>N</b></button><button type="button" data-command="italic" title="Itálico"><i>I</i></button><button type="button" data-command="underline" title="Sublinhado"><u>S</u></button>'+
 '<button type="button" data-command="insertUnorderedList" title="Lista com marcas">• Lista</button>'+
 '<button type="button" data-command="insertOrderedList" title="Lista numerada">1. Lista</button>'+
 '<button type="button" data-command="justifyLeft" title="Alinhar à esquerda" aria-label="Alinhar à esquerda">Esquerda</button><button type="button" data-command="justifyCenter" title="Centrar" aria-label="Centrar texto">Centro</button><button type="button" data-command="justifyRight" title="Alinhar à direita" aria-label="Alinhar à direita">Direita</button><button type="button" data-command="justifyFull" title="Justificar" aria-label="Justificar texto">Justificar</button>'+
 '<label>Entrelinhas <select data-style="line"><option value="1">1,0</option><option value="1.15">1,15</option><option value="1.3">1,3</option><option value="1.5" selected>1,5</option><option value="1.75">1,75</option><option value="2">2,0</option></select></label>'+
 '<label>Espaço após <select data-style="space"><option value="0">0 px</option><option value="8">8 px</option><option value="12" selected>12 px</option><option value="16">16 px</option><option value="24">24 px</option><option value="32">32 px</option></select></label>'+
 '<button type="button" data-command="removeFormat" title="Limpar formatação">Limpar</button></div>'+
 '<div class="rich-input" contenteditable="true" data-rich="1" role="textbox" aria-label="Texto completo" aria-multiline="true">'+articleHTML(a)+'</div>'+
 '<small class="muted">Selecione o texto para formatar. O alinhamento e os espaçamentos aplicam-se aos parágrafos.</small></div>';
}
function storeRich(el){
 const editorial=el.closest('[data-editorial]');if(editorial){state.introHtml=safeRich(el.innerHTML);state.intro=el.innerText||el.textContent||'';save();return}
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
const editor=(data,idx)=>'<div class="fields">'+field('Categoria',data.category,'input','category')+field('Título',data.title,'input','title')+'<label class="field">Texto completo</label>'+richField(data)+field('URL da imagem (HTTPS público ou Google Drive partilhado)',data.image,'input','image')+'<div class="image-options"><label class="field">Enquadramento da imagem<select data-prop="imageFit"><option value="cover" '+((data.imageFit||'cover')==='cover'?'selected':'')+'>Preencher bloco (recorte automático)</option><option value="contain" '+(data.imageFit==='contain'?'selected':'')+'>Mostrar imagem completa (sem recorte)</option></select></label><label class="field">Posição da imagem<select data-prop="imagePosition"><option value="center" '+((data.imagePosition||'center')==='center'?'selected':'')+'>Centro</option><option value="top" '+(data.imagePosition==='top'?'selected':'')+'>Topo</option><option value="bottom" '+(data.imagePosition==='bottom'?'selected':'')+'>Base</option><option value="left" '+(data.imagePosition==='left'?'selected':'')+'>Esquerda</option><option value="right" '+(data.imagePosition==='right'?'selected':'')+'>Direita</option></select></label></div><div class="mini muted">A imagem adapta-se à janela sem deformações. Para manter todos os detalhes, escolha «Mostrar imagem completa».</div>'+field('Ligação para mais informação (opcional)',data.link,'input','link')+(idx===null?'':'<button type="button" class="secondary" data-promote="'+idx+'" style="margin-right:7px">★ Tornar destaque</button><button class="danger" data-remove="'+idx+'">Eliminar notícia</button>')+'</div>';
function editUI(){
$('month').value=state.month;$('number').value=state.number;$('title').value=state.title;$('editorialFields').innerHTML=richField({text:state.intro,html:state.introHtml});
$('featuredFields').innerHTML='<div class="article-edit" data-article="featured">'+editor(state.featured,null)+'</div>'+(state.articles.length?'<div class="featured-switch"><label class="field">Trocar a notícia de destaque<select id="featuredSwapSelect"><option value="">Selecionar outra notícia...</option>'+state.articles.map((a,i)=>'<option value="'+i+'">'+(i+1)+'. '+escapeHTML(a.title||'Nova notícia')+'</option>').join('')+'</select></label><p class="mini muted">A notícia escolhida passa a destaque e a atual ocupa a posição dessa notícia, sem perder os conteúdos.</p></div>':'');
$('articleFields').innerHTML=state.articles.map((a,i)=>'<div class="article-sort-row" data-sort-index="'+i+'"><div class="sort-controls"><span class="drag-handle" draggable="true" tabindex="0" role="button" aria-label="Arrastar notícia '+(i+1)+' para reordenar" title="Arraste para alterar a ordem">⠿</span><div class="sort-arrows"><button type="button" class="sort-arrow" data-move="up" '+(i===0?'disabled':'')+' aria-label="Subir notícia '+(i+1)+'" title="Subir">↑</button><button type="button" class="sort-arrow" data-move="down" '+(i===state.articles.length-1?'disabled':'')+' aria-label="Descer notícia '+(i+1)+'" title="Descer">↓</button></div></div><details class="article-edit" data-article="'+i+'" '+(i===state.articles.length-1?'open':'')+'><summary>'+(i+1)+'. '+escapeHTML(a.title||'Nova notícia')+'</summary>'+editor(a,i)+'</details></div>').join('');
$('count').textContent='('+state.articles.length+'/10)';$('add').disabled=state.articles.length>=10;
}
function picture(article,cls=''){const a=typeof article==='string'?{image:article}:article;const safe=imageURL(a.image);const fit=['cover','contain'].includes(a.imageFit)?a.imageFit:'cover';const pos=['center','top','bottom','left','right'].includes(a.imagePosition)?a.imagePosition:'center';return safe?'<img class="'+cls+'" src="'+escapeHTML(safe)+'" alt="Imagem de '+escapeHTML(a.title||'notícia')+'" loading="lazy" decoding="async" referrerpolicy="no-referrer" style="object-fit:'+fit+';object-position:'+pos+'">':'<div class="placeholder">INFRALOBO · Notícias</div>'}
function readLink(a){const u=validURL(a.link);return u?'<p><a href="'+escapeHTML(u)+'" target="_blank" rel="noopener noreferrer" style="color:#386641;font-weight:700">Saber mais ↗</a></p>':''}
function articleMarkup(a,i,full=false){return '<article class="article">'+picture(a)+'<div><span class="eyebrow">'+escapeHTML(a.category||'Notícia')+'</span><h3>'+escapeHTML(a.title)+'</h3><div class="body-copy '+(full?'':'clamp')+'" id="body-'+i+'">'+articleHTML(a)+'</div>'+(full?'':'<button class="read-more" aria-expanded="false" data-more="'+i+'">Ver mais</button>')+readLink(a)+'</div></article>'}
function template(full=false){
const highlight=state.featured;
return '<div class="newsletter"><div class="newsletter-header"><div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap"><img class="header-logo" src="./logo-infralobo.png" alt="Infralobo Empresa Municipal"><div style="text-align:right"><div class="eyebrow" style="margin:0 0 6px">NEWSLETTER INTERNA</div><small class="issue">'+escapeHTML(state.month)+' · Edição '+escapeHTML(state.number)+'</small></div></div><h1>'+escapeHTML(state.title)+'</h1><div class="intro editorial-copy">'+safeRich(state.introHtml||baseRich(state.intro))+'</div></div><div class="content"><div class="eyebrow" style="margin-bottom:15px">☆ &nbsp; EM DESTAQUE</div><div class="featured">'+picture(highlight)+'<div class="copy"><span class="eyebrow">'+escapeHTML(highlight.category)+'</span><h2>'+escapeHTML(highlight.title)+'</h2><div class="body-copy '+(full?'':'clamp')+'" id="body-featured">'+articleHTML(highlight)+'</div>'+(full?'':'<button class="read-more" data-more="featured" aria-expanded="false">Ver mais →</button>')+readLink(highlight)+'</div></div>'+(state.articles.length?'<h2 class="section-title">Também nesta edição <span class="mini muted">'+state.articles.length+' notícias</span></h2><div class="news-grid layout-'+escapeHTML(state.layout)+'">'+state.articles.map((a,i)=>articleMarkup(a,i,full)).join('')+'</div>':'')+'</div><div class="footer"><strong>INFRALOBO · Empresa Municipal</strong><div>Comunicação interna · '+escapeHTML(state.month)+'</div><div>Esta comunicação destina-se aos colaboradores da Infralobo.</div><div><a href="https://www.infralobo.pt">www.infralobo.pt</a></div></div></div>'
}
function renderPreview(){$('preview').innerHTML=template(false);$('editionName').textContent=state.month;$('editionMeta').textContent='Edição '+state.number;$('editionCount').textContent=(1+state.articles.length)+' / 10 notícias';$('sideEdition').textContent='●  '+state.month+' · '+state.number;$('layoutSelect').value=state.layout}
function updateFromEditor(e){const el=e.target;if(!el.dataset.prop && !['month','number','title','intro'].includes(el.id))return;const target=el.closest('[data-article]');if(target){const ob=target.dataset.article==='featured'?state.featured:state.articles[Number(target.dataset.article)];ob[el.dataset.prop]=el.value}else state[el.id]=el.value;save()}
['month','number','title'].forEach(id=>$(id).addEventListener('input',updateFromEditor));
$('featuredFields').addEventListener('input',updateFromEditor);
for(const id of ['editorialFields','featuredFields','articleFields']){const el=$(id);el.addEventListener('input',e=>{if(e.target.matches('[data-rich]'))storeRich(e.target)});el.addEventListener('mousedown',e=>{if(e.target.closest('[data-command]'))e.preventDefault()});el.addEventListener('click',onRichClick);el.addEventListener('change',onRichChange)}

function swapFeaturedWith(index){
 if(!Number.isInteger(index)||index<0||index>=state.articles.length)return;
 const previous=state.featured;
 state.featured=state.articles[index];
 state.articles[index]=previous;
 editUI();save();notify('Notícia de destaque alterada. A anterior passou para a posição '+(index+1)+'.');
}
$('featuredFields').addEventListener('change',e=>{if(e.target.id!=='featuredSwapSelect'||e.target.value==='')return;swapFeaturedWith(Number(e.target.value))});
let draggingArticleIndex=null;
function reorderArticle(from,to,focusDirection){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=state.articles.length||to>=state.articles.length||from===to)return;
 const [article]=state.articles.splice(from,1);state.articles.splice(to,0,article);
 editUI();save();
 notify('Notícia movida para a posição '+(to+1)+'.');
 if(focusDirection){const row=$('articleFields').querySelector('[data-sort-index="'+to+'"]');row?.querySelector('[data-move="'+focusDirection+'"]')?.focus();}
}
const articleContainer=$('articleFields');
articleContainer.addEventListener('click',e=>{
 const btn=e.target.closest('[data-move]');if(!btn)return;
 const row=btn.closest('[data-sort-index]'),from=Number(row?.dataset.sortIndex);
 const delta=btn.dataset.move==='up'?-1:1;
 reorderArticle(from,from+delta,btn.dataset.move);
});
articleContainer.addEventListener('dragstart',e=>{
 const handle=e.target.closest('.drag-handle');if(!handle){e.preventDefault();return}
 draggingArticleIndex=Number(handle.closest('[data-sort-index]').dataset.sortIndex);
 e.dataTransfer.effectAllowed='move';
 e.dataTransfer.setData('text/plain',String(draggingArticleIndex));
 handle.closest('.article-sort-row').classList.add('is-dragging');
});
articleContainer.addEventListener('dragover',e=>{
 const row=e.target.closest('.article-sort-row');
 if(draggingArticleIndex===null||!row)return;
 e.preventDefault();e.dataTransfer.dropEffect='move';
 articleContainer.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));
 row.classList.add('drop-target');
});
articleContainer.addEventListener('drop',e=>{
 const row=e.target.closest('.article-sort-row');
 if(draggingArticleIndex===null||!row)return;
 e.preventDefault();
 const from=draggingArticleIndex,to=Number(row.dataset.sortIndex);
 draggingArticleIndex=null;
 articleContainer.querySelectorAll('.drop-target,.is-dragging').forEach(el=>el.classList.remove('drop-target','is-dragging'));
 reorderArticle(from,to);
});
articleContainer.addEventListener('dragend',()=>{
 draggingArticleIndex=null;
 articleContainer.querySelectorAll('.drop-target,.is-dragging').forEach(el=>el.classList.remove('drop-target','is-dragging'));
});
articleContainer.addEventListener('keydown',e=>{
 if(!e.target.matches('.drag-handle')||!e.altKey||!['ArrowUp','ArrowDown'].includes(e.key))return;
 e.preventDefault();
 const from=Number(e.target.closest('[data-sort-index]').dataset.sortIndex);
 const to=from+(e.key==='ArrowUp'?-1:1);
 reorderArticle(from,to,e.key==='ArrowUp'?'up':'down');
});

$('articleFields').addEventListener('input',updateFromEditor);
$('articleFields').addEventListener('click',e=>{const promote=e.target.closest('[data-promote]');if(promote){swapFeaturedWith(Number(promote.dataset.promote));return}const btn=e.target.closest('[data-remove]');if(!btn)return;if(!confirm('Eliminar esta notícia?'))return;state.articles.splice(Number(btn.dataset.remove),1);editUI();save();notify('Notícia eliminada.')});
$('add').addEventListener('click',()=>{if(state.articles.length>=10)return notify('Máximo de 10 notícias.');state.articles.push({title:'Nova notícia',category:'Atualidade',text:'',image:'',link:''});editUI();save()});
$('preview').addEventListener('error',e=>{if(e.target.tagName==='IMG'&&e.target.closest('.featured,.article')){const placeholder=document.createElement('div');placeholder.className='placeholder';placeholder.textContent='Imagem indisponível — confirme a partilha pública ou utilize um URL direto';e.target.replaceWith(placeholder)}},true);
$('preview').addEventListener('click',e=>{const btn=e.target.closest('[data-more]');if(!btn)return;const block=$('body-'+btn.dataset.more),open=btn.getAttribute('aria-expanded')==='true';block.classList.toggle('clamp',open);btn.textContent=open?'Ver mais →':'Ver menos ↑';btn.setAttribute('aria-expanded',String(!open))});
$('reset').addEventListener('click',newEdition);
$('layoutSelect').addEventListener('change',e=>{state.layout=e.target.value;save()});
$('editionList').addEventListener('click',e=>{const del=e.target.closest('[data-delete-edition]');if(del){const i=Number(del.dataset.deleteEdition),a=archive[i];if(!a||!confirm('Eliminar definitivamente a edição '+(a.month||'')+' · '+(a.number||'')+'?'))return;archive.splice(i,1);persistArchive();renderEditionList();notify('Edição eliminada.');return}const load=e.target.closest('[data-load]');if(load){const a=archive[Number(load.dataset.load)];if(!a||!confirm('Abrir esta edição? A edição atual será guardada.'))return;saveCurrentToArchive();archive=archive.filter(v=>v.editionId!==a.editionId);persistArchive();state=JSON.parse(JSON.stringify(a));state.layout=['classic','odd','magazine','list','mosaic','alternating','minimal'].includes(state.layout)?state.layout:'classic';editUI();save();renderEditionList();notify('Edição aberta.')}});
function download(name,text,type){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function filename(ext){return 'infralobo-newsletter-'+String(state.month).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9-]+/gi,'-').toLowerCase()+'.'+ext}
function outlookFilename(){
 const clean=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'').toLowerCase();
 const number=clean(state.number)||'sem-numero';
 const monthAndYear=clean(state.month)||'sem-data';
 const layoutNames={classic:'grelha-3-colunas',odd:'tres-noticias',magazine:'revista',list:'lista-ilustrada',mosaic:'mosaico',alternating:'ziguezague',minimal:'editorial-compacto'};
 const layout=layoutNames[state.layout]||clean(state.layout)||'esquema-original';
 return 'infralobo-newsletter-edicao-'+number+'-'+monthAndYear+'-'+layout+'.eml';
}

$('exportJson').addEventListener('click',()=>download(filename('json'),JSON.stringify(state,null,2),'application/json'));
$('importJson').addEventListener('click',()=>$('fileInput').click());
$('fileInput').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const v=JSON.parse(await f.text());if(!v||typeof v!=='object'||!Array.isArray(v.articles))throw Error();saveCurrentToArchive();state={...starter(),...v,featured:{...starter().featured,...v.featured},articles:v.articles.slice(0,10),editionId:editionId(),layout:['classic','odd','magazine','list','mosaic','alternating','minimal'].includes(v.layout)?v.layout:'classic'};editUI();save();renderEditionList();notify('Edição importada.')}catch{notify('Ficheiro JSON inválido.')}e.target.value=''});
const cssEmail='body{margin:0;padding:0;background:#f1f4ef;font-family:Arial,Helvetica,sans-serif;color:#24312a}.wrap{width:100%;max-width:700px;margin:0 auto;background:#ffffff}.head{padding:38px 52px 34px;background:#fff;border-bottom:6px solid #A7C957}.head h2{color:#386641}.issue-line{color:#386641;font-size:13px;font-weight:bold;letter-spacing:.2px}.section{padding:31px 52px 34px;background:#fff;border-bottom:1px solid #dce6dc;overflow-wrap:break-word}.section img{max-width:100%;height:auto;border-radius:8px}.section h2{color:#386641;margin:13px 0 20px}.section p,.editorial-email p{line-height:1.65;margin:0 0 13px;background:transparent}.section ul,.section ol,.editorial-email ul,.editorial-email ol{margin:8px 0 16px;padding:0 0 0 25px;background:transparent;list-style-position:outside}.section li,.editorial-email li{margin:0 0 7px;padding:0 0 0 4px;line-height:1.6;background:transparent}.section li p,.editorial-email li p{margin:0 0 5px}.editorial-email{line-height:1.65;background:#fff}.foot{padding:28px 52px;background:#386641;color:#fff}a{color:#386641;text-decoration:underline}@media(max-width:600px){.head,.section,.foot{padding-left:26px;padding-right:26px}}';
const cssEmailLayouts=".news-row td,.article-horizontal td{box-sizing:border-box}.email-container a{color:#386641}.email-container ul,.email-container ol{margin:8px 0 16px;padding-left:25px}@media screen and (max-width:600px){.email-container{width:100%!important}.email-pad{padding-left:22px!important;padding-right:22px!important}.news-row .stack-cell,.article-horizontal .stack-cell{display:block!important;width:100%!important;box-sizing:border-box}.news-row{table-layout:auto!important}.compact-image{width:80px!important}}";
function outlookContent(html){
 const doc=new DOMParser().parseFromString('<div>'+html+'</div>','text/html');
 const root=doc.body.firstElementChild;
 root.querySelectorAll('ul,ol').forEach(list=>{
  list.style.margin='8px 0 16px';
  list.style.padding='0 0 0 25px';
  list.style.backgroundColor='transparent';
  list.style.listStylePosition='outside';
 });
 root.querySelectorAll('li').forEach(li=>{
  li.style.margin='0 0 7px';
  li.style.padding='0 0 0 4px';
  li.style.lineHeight='1.6';
  li.style.backgroundColor='transparent';
 });
 root.querySelectorAll('p').forEach(p=>{
  if(!p.style.marginBottom)p.style.marginBottom='13px';
  p.style.backgroundColor='transparent';
 });
 return root.innerHTML;
}
/* Estruturas com tabelas e estilos inline: funcionam também no Outlook clássico. */
function emailArticleParts(a){
 const url=imageURL(a.image),fit=a.imageFit==='contain'?'contain':'cover';
 const image=url?'<img src="'+escapeHTML(url)+'" alt="'+escapeHTML(a.title||'Imagem da notícia')+'" width="600" style="display:block;width:100%;max-width:100%;height:auto;object-fit:'+fit+';border:0">':'';
 const text='<div style="font-family:Arial,Helvetica,sans-serif;color:#24312a;line-height:1.65;overflow-wrap:break-word">'+
  '<div style="font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#6A994E;margin:0 0 7px">'+escapeHTML(a.category||'Notícia')+'</div>'+
  '<h3 style="font-size:20px;line-height:1.3;color:#386641;margin:0 0 15px">'+escapeHTML(a.title)+'</h3>'+
  outlookContent(articleHTML(a))+
  (validURL(a.link)?'<p style="margin:14px 0 0"><a href="'+escapeHTML(validURL(a.link))+'" style="color:#386641;font-weight:bold">Saber mais</a></p>':'')+
  '</div>';
 return {image,text};
}
function emailImageCell(parts,width){
 return '<td class="stack-cell" valign="top" width="'+width+'" style="width:'+width+';padding:0;background-color:#f0f5ed">'+parts.image+'</td>';
}
function emailTextCell(parts,width,padding='22px'){
 return '<td class="stack-cell" valign="top" width="'+width+'" style="width:'+width+';padding:'+padding+';background-color:#ffffff">'+parts.text+'</td>';
}
function emailArticle(a,mode='vertical',reverse=false){
 const parts=emailArticleParts(a);
 if(mode==='horizontal'&&parts.image){
  const cells=reverse?
   emailTextCell(parts,'58%')+emailImageCell(parts,'42%'):
   emailImageCell(parts,'42%')+emailTextCell(parts,'58%');
  return '<table role="presentation" class="article-horizontal" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;width:100%;background:#ffffff"><tr>'+cells+'</tr></table>';
 }
 if(mode==='compact'){
  const image=parts.image?'<td class="compact-image" width="105" valign="top" style="width:105px;padding:16px 18px 16px 0">'+parts.image+'</td>':'';
  return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;width:100%;border-bottom:1px solid #dce6dc"><tr><td valign="top" style="padding:18px 10px 18px 0">'+parts.text+'</td>'+image+'</tr></table>';
 }
 return (parts.image?'<div style="margin:0 0 17px">'+parts.image+'</div>':'')+
  '<div style="padding:0 4px">'+parts.text+'</div>';
}
function emailRow(items,widths,modes=[]){
 if(!items.length)return '';
 const cols=items.map((a,i)=>{
  const w=widths[i]||Math.round(100/items.length);
  return '<td class="stack-cell" width="'+w+'%" valign="top" style="width:'+w+'%;padding:8px;vertical-align:top">'+
   '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;background:#fff;border:1px solid #dce6dc"><tr><td style="padding:17px">'+emailArticle(a,modes[i]||'vertical')+'</td></tr></table></td>';
 }).join('');
 return '<table role="presentation" class="news-row" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;table-layout:fixed"><tr>'+cols+'</tr></table>';
}
function emailLayout(articles,layout){
 const out=[];
 if(layout==='classic'){
  for(let i=0;i<articles.length;i+=3)out.push(emailRow(articles.slice(i,i+3),[34,33,33]));
 }else if(layout==='odd'){
  for(let i=0;i<articles.length;i+=3){
   if(articles[i])out.push(emailRow([articles[i]],[100]));
   if(articles[i+1])out.push(emailRow(articles.slice(i+1,i+3),[50,50]));
  }
 }else if(layout==='magazine'){
  for(let i=0;i<articles.length;i+=6){
   if(articles[i])out.push(emailRow(articles.slice(i,i+2),[66,34]));
   if(articles[i+2])out.push('<div style="padding:8px">'+emailArticle(articles[i+2],'horizontal')+'</div>');
   if(articles[i+3])out.push(emailRow(articles.slice(i+3,i+6),[34,33,33]));
  }
 }else if(layout==='list'){
  articles.forEach(a=>out.push('<div style="padding:8px 0;border-bottom:1px solid #dce6dc">'+emailArticle(a,'horizontal')+'</div>'));
 }else if(layout==='mosaic'){
  for(let i=0;i<articles.length;i+=5){
   out.push(emailRow(articles.slice(i,i+2),[72,28]));
   if(articles[i+2])out.push(emailRow(articles.slice(i+2,i+5),[34,33,33]));
  }
 }else if(layout==='alternating'){
  articles.forEach((a,i)=>out.push('<div style="padding:9px 0">'+emailArticle(a,'horizontal',i%2===1)+'</div>'));
 }else if(layout==='minimal'){
  articles.forEach(a=>out.push(emailArticle(a,'compact')));
 }else{
  articles.forEach(a=>out.push(emailRow([a],[100])));
 }
 return out.join('');
}
function emailBody(){
 const issue=escapeHTML(state.month)+' · Edição '+escapeHTML(state.number);
 const lead=emailArticleParts(state.featured);
 return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;background:#f1f4ef"><tr><td align="center" style="padding:20px 8px">'+
 '<table role="presentation" class="email-container" width="700" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:700px;background:#ffffff"><tr><td class="email-pad" style="padding:38px 52px 34px;border-bottom:6px solid #A7C957;background:#ffffff">'+
 '<p><img src="https://infralobo-newsletter.vercel.app/logo-infralobo.png" alt="Infralobo Empresa Municipal" width="260" style="display:block;width:260px;max-width:100%;height:auto"></p>'+
 '<div style="color:#386641;font-weight:bold;font-size:13px">NEWSLETTER INTERNA · '+issue+'</div>'+
 '<h2 style="color:#386641">'+escapeHTML(state.title)+'</h2>'+
 '<div class="editorial-email" style="line-height:1.65;background:#fff">'+outlookContent(safeRich(state.introHtml||baseRich(state.intro)))+'</div></td></tr>'+
 '<tr><td class="email-pad" style="padding:30px 52px 24px;background:#f4f8f1">'+
 '<div style="font-size:12px;font-weight:bold;letter-spacing:1.2px;color:#6A994E;margin:0 0 12px">EM DESTAQUE</div>'+
 (lead.image?'<div style="margin-bottom:16px">'+lead.image+'</div>':'')+lead.text+'</td></tr>'+
 (state.articles.length?'<tr><td class="email-pad" style="padding:29px 28px 35px;background:#ffffff">'+
 '<h2 style="color:#386641;margin:0 10px 13px;font-size:23px">Também nesta edição</h2>'+
 emailLayout(state.articles,state.layout)+'</td></tr>':'')+
 '<tr><td style="padding:28px 52px;background-color:#386641;color:#ffffff;font-size:12px">INFRALOBO · Empresa Municipal · Comunicação interna</td></tr>'+
 '</table></td></tr></table>';
}
function emailHTML(){return '<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Newsletter Infralobo</title><style>'+cssEmail+'</style></head><body>'+emailBody()+'</body></html>'}
$('htmlExport').addEventListener('click',()=>download(filename('html'),emailHTML(),'text/html;charset=utf-8'));
$('downloadEmail').addEventListener('click',()=>{const boundary='infralobo-newsletter';const subject='Newsletter Infralobo · '+state.month;const eml=['From: Infralobo <newsletter@infralobo.pt>','To:','Subject: =?UTF-8?B?'+utf8b64(subject)+'?=','MIME-Version: 1.0','Content-Type: multipart/alternative; boundary="'+boundary+'"','','--'+boundary,'Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',utf8b64([state.title,state.intro,state.featured.title,state.featured.text,...state.articles.flatMap(a=>[a.title,a.text])].join('\n\n')),'--'+boundary,'Content-Type: text/html; charset=UTF-8','Content-Transfer-Encoding: base64','',utf8b64(emailHTML()),'--'+boundary+'--',''].join('\r\n');download(outlookFilename(),eml,'message/rfc822');notify('E-mail exportado. Abra o .eml no Outlook e confirme o remetente antes de enviar.')});
function utf8b64(str){return btoa(Array.from(new TextEncoder().encode(str),b=>String.fromCharCode(b)).join(''))}
$('print').addEventListener('click',()=>window.print());
function setView(preview){document.body.classList.toggle('view-preview',preview);$('tabPreview').classList.toggle('active',preview);$('tabEdit').classList.toggle('active',!preview)}
$('tabEdit').addEventListener('click',()=>setView(false));$('tabPreview').addEventListener('click',()=>setView(true));
$('tabAdd').addEventListener('click',()=>{setView(false);$('add').click()});
$('sideNew').addEventListener('click',()=>$('reset').click());

editUI();renderEditionList();renderPreview();setView(true);
