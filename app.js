'use strict';
const $ = id => document.getElementById(id);
const number = value => new Intl.NumberFormat('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value);
const historyKey = 'varilla-column-history-v1';
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
let history=read(historyKey,[]);
if(!Array.isArray(history))history=[];
history=history.filter(item=>{try{estimateColumn(item);return Number.isFinite(Date.parse(item.date));}catch{return false;}}).slice(0,20);
let result,installPrompt;
function calculate(){
  if(!$('quote-form').reportValidity())return false;
  try{result=estimateColumn({width:Number($('width').value),height:Number($('height').value),percentage:Number($('percentage').value)});}
  catch(error){$('message').textContent=error.message;return false;}
  $('total').textContent=number(result.steel);
  $('section-area').textContent=`${number(result.section)} cm²`;
  $('result-percentage').textContent=`${result.percentage.toFixed(1)}%`;
  $('rebar-options').replaceChildren();
  for(const bar of result.options){
    const row=document.createElement('div');row.className='rebar-option';
    const badge=document.createElement('span');badge.className='bar-badge';badge.textContent=`#${bar.number}`;
    const info=document.createElement('div');const title=document.createElement('strong');title.textContent=`${bar.count} ${bar.count===1?'varilla':'varillas'} de ${bar.diameter}`;
    const caption=document.createElement('small');caption.textContent=`${number(bar.area)} cm² por varilla`;info.append(title,caption);
    const provided=document.createElement('span');provided.className='provided';provided.textContent=`${number(bar.provided)} cm²`;
    row.append(badge,info,provided);$('rebar-options').append(row);
  }
  return true;
}
$('quote-form').addEventListener('submit',event=>{event.preventDefault();if(calculate())$('message').textContent='Estimación actualizada.';});
$('quote-form').addEventListener('input',()=>{$('percentage-value').textContent=`${Number($('percentage').value).toFixed(1)}%`;$('message').textContent='Datos modificados. Calcula para actualizar la estimación.';});
function renderHistory(){
  syncWidget();
  $('history-count').textContent=history.length;$('history-list').replaceChildren();$('clear-history').disabled=!history.length;
  if(!history.length){const p=document.createElement('p');p.className='empty';p.textContent='Guarda tu primera estimación para compararla después.';$('history-list').append(p);}
  history.forEach((item,index)=>{
    const q=estimateColumn(item),row=document.createElement('div');row.className='history-item';
    const info=document.createElement('div');info.textContent=`${q.width} × ${q.height} cm · cuantía ${q.percentage.toFixed(1)}%`;
    const date=document.createElement('small');date.textContent=new Date(item.date).toLocaleString('es-MX',{dateStyle:'medium',timeStyle:'short'});info.append(date);
    const total=document.createElement('strong');total.textContent=`${number(q.steel)} cm²`;
    const use=document.createElement('button');use.textContent='Usar';use.type='button';use.addEventListener('click',()=>{for(const id of ['width','height','percentage'])$(id).value=q[id];$('percentage-value').textContent=`${q.percentage.toFixed(1)}%`;calculate();$('message').textContent='Estimación recuperada.';$('quote-form').scrollIntoView({behavior:'smooth',block:'center'});});
    const remove=document.createElement('button');remove.textContent='×';remove.type='button';remove.setAttribute('aria-label','Eliminar este cálculo');remove.addEventListener('click',()=>{history.splice(index,1);write(historyKey,history);renderHistory();});
    row.append(info,total,use,remove);$('history-list').append(row);
  });
}
$('save').addEventListener('click',()=>{if(!calculate())return;const{width,height,percentage}=result;history.unshift({width,height,percentage,date:new Date().toISOString()});history=history.slice(0,20);const stored=write(historyKey,history);renderHistory();$('message').textContent=stored?'Estimación guardada en este dispositivo.':'Guardada solo en esta sesión; almacenamiento no disponible.';});
$('clear-history').addEventListener('click',()=>{if(confirm('¿Borrar las estimaciones guardadas?')){history=[];write(historyKey,history);renderHistory();}});
function connection() { $('connection').textContent = navigator.onLine ? 'En línea' : 'Sin conexión'; $('connection').classList.toggle('offline', !navigator.onLine); }
window.addEventListener('online', connection); window.addEventListener('offline', connection);
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });
window.addEventListener('appinstalled', () => { installPrompt = null; $('install').hidden = true; });
$('install').addEventListener('click', async () => { if (installPrompt) { const prompt = installPrompt; await prompt.prompt(); await prompt.userChoice; installPrompt = null; } else $('install-help').showModal(); });
$('close-help').addEventListener('click', () => $('install-help').close());
if (['standalone','window-controls-overlay'].some(mode => window.matchMedia(`(display-mode: ${mode})`).matches)) $('install').hidden = true;
if ('serviceWorker' in navigator) window.addEventListener('load', () => { navigator.serviceWorker.register('./service-worker.js').catch(() => { $('message').textContent = 'No se activó el modo sin conexión. Abre la app desde localhost o HTTPS.'; }); });
calculate(); renderHistory(); connection();

// El archivo comparte una instantánea recalculada de los datos actuales.
function calculationText(q) {
  return [
    'VARILLA · ESTIMACIÓN DE ACERO EN COLUMNA',
    `Fecha: ${new Date().toLocaleString('es-MX')}`,
    '',
    `Sección: ${q.width} × ${q.height} cm`,
    `Área de sección: ${number(q.section)} cm²`,
    `Cuantía: ${q.percentage.toFixed(1)}%`,
    `Área de acero calculada: ${number(q.steel)} cm²`,
    '',
    'ALTERNATIVAS POR GROSOR (no se suman entre sí)',
    ...q.options.map(bar => `${bar.count} varillas #${bar.number} (${bar.diameter}) · área aportada: ${number(bar.provided)} cm²`),
    '',
    'Estimación educativa según la cuantía ingresada. No verifica cargas, distribución, separación ni validez estructural. No incluye estribos, longitudes, anclajes ni traslapes. Revisar con el proyecto estructural.'
  ].join('\n');
}
function calculationFile(text) {
  return new File([text], 'varilla-calculo.txt', {type:'text/plain'});
}
function downloadCalculation(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url; link.download = file.name;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
$('download').addEventListener('click', () => {
  if (!calculate()) return;
  downloadCalculation(calculationFile(calculationText(result)));
  $('share-status').textContent = 'Archivo TXT preparado para descargar y abrir en otra aplicación.';
});
$('share').addEventListener('click', async () => {
  const status = $('share-status');
  if (!window.isSecureContext || typeof navigator.share !== 'function') {
    status.textContent = 'El menú nativo requiere Edge compatible y una conexión HTTPS o localhost. También puedes descargar el TXT.';
    return;
  }
  if (!calculate()) return;

  const title = 'Varilla · Cálculo de columna';
  const text = calculationText(result);
  const files = [calculationFile(text)];
  const data = navigator.canShare?.({files}) ? {title, files} : {title, text};

  // Llamar directamente desde el clic conserva la activación del usuario.
  try {
    status.textContent = '';
    await navigator.share(data);
    status.textContent = 'El cálculo se entregó al sistema para compartir.';
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? 'No se compartió el cálculo.'
      : 'No se pudo compartir desde el menú del sistema. Puedes descargar el TXT.';
  }
});
$('new-calculation').addEventListener('click', () => {
  $('quote-form').reset(); $('percentage-value').textContent='1.0%';
  calculate(); $('message').textContent='Nuevo cálculo con los valores de ejemplo.';
  $('share-status').textContent=''; $('width').focus();
});
function searchHistory() {
  const query = $('search').value.trim().toLocaleLowerCase('es-MX');
  let matches = 0;
  for (const row of $('history-list').querySelectorAll('.history-item')) {
    row.hidden = !row.textContent.toLocaleLowerCase('es-MX').includes(query);
    if (!row.hidden) matches++;
  }
  $('search-status').textContent = query ? `${matches} ${matches===1?'cálculo encontrado':'cálculos encontrados'} en el historial.` : '';
}
$('search-form').addEventListener('submit', event => {
  event.preventDefault(); searchHistory();
  $('saved-calculations').scrollIntoView({behavior:'smooth',block:'start'});
});
$('search').addEventListener('input', searchHistory);
new MutationObserver(searchHistory).observe($('history-list'),{childList:true});

function syncWidget() {
  navigator.serviceWorker?.controller?.postMessage({
    type: 'varilla-widget-sync',
    calculation: history[0] ?? null
  });
}
navigator.serviceWorker?.addEventListener('controllerchange', syncWidget);
window.addEventListener('storage', event => {
  if (event.key === historyKey) {
    const stored = read(historyKey, []);
    history = Array.isArray(stored) ? stored.filter(item => {
      try { estimateColumn(item); return Number.isFinite(Date.parse(item.date)); } catch { return false; }
    }).slice(0,20) : [];
    renderHistory();
  }
});

function applyIncomingCalculation() {
  const url = new URL(location.href);
  const data = new URLSearchParams(url.hash.slice(1));
  if (!data.has('importar') && !isColumnAction(url.searchParams.get('url'))) return;
  url.searchParams.delete('url');
  url.hash = 'quote-form';
  historyReplaceURL(url);
  try {
    if (data.get('importar') !== '1') throw new Error();
    const q = estimateColumn({
      width: Number(data.get('width')), height: Number(data.get('height')),
      percentage: Number(data.get('percentage'))
    });
    for (const id of ['width','height','percentage']) $(id).value = q[id];
    $('percentage-value').textContent = `${q.percentage.toFixed(1)}%`;
    if (!calculate()) throw new Error();
    $('message').textContent = 'Cálculo recibido. Revisa los valores antes de guardarlo.';
  } catch {
    $('message').textContent = 'Para importar un cálculo, comparte un TXT de Varilla o texto como «30 × 40 cm al 1%».';
  }
  $('quote-form').scrollIntoView();
}
function historyReplaceURL(url) {
  window.history.replaceState(null, '', url);
}
window.addEventListener('hashchange', applyIncomingCalculation);
applyIncomingCalculation();
