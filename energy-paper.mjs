import './energy-pdf-compat.mjs';
import * as pdfjs from './vendor/pdfjs/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('./energy-pdf-worker.mjs', import.meta.url).href;
const $ = id => document.getElementById(id);
let context = null, pdf = null, page = 1, docVersion = 0, renderVersion = 0, renderTask = null;
const loaded = new Map();
function setPane(pane) {
  const paper = pane === 'paper';
  $('paper-panel').hidden = !paper; $('dbody').hidden = paper;
  for (const button of document.querySelectorAll('[data-energy-pane]')) button.setAttribute('aria-pressed', String(button.dataset.energyPane === pane));
  if (paper && pdf) renderPage();
}
window.ukiwaEnergySetPane = setPane;
function controls() {
  $('paper-page').textContent = pdf ? `${page} / ${pdf.numPages} ページ` : 'PDF未選択';
  $('paper-prev').disabled = !pdf || page <= 1; $('paper-next').disabled = !pdf || page >= pdf.numPages;
  $('paper-zoom').disabled = !pdf;
}
function updateContext(next) {
  if (!next?.url || !/^https:\/\/www\.eccj\.or\.jp\//.test(next.url)) return;
  const changed = context?.url !== next.url; context = next;
  $('paper-title').textContent = `${next.year} ${next.subject}・問題${next.question}（ページは問題PDFの見出しで確認）`;
  $('paper-official').href = next.url;
  if (!changed) return;
  $('paper-load').disabled = false; docVersion++; renderVersion++; renderTask?.cancel(); pdf = loaded.get(next.url) || null; page = 1;
  $('paper-view').replaceChildren(); $('paper-status').textContent = pdf ? 'この年度のPDFを表示できます。' : '公式PDFを表示するか、公式サイトから保存したPDFを選んでください。';
  $('paper-file').value = ''; controls();
  if (!$('paper-panel').hidden && pdf) renderPage();
}
async function renderPage() {
  if (!pdf || $('paper-panel').hidden) return;
  const version = ++renderVersion, currentPdf = pdf, selectedPage = page;
  renderTask?.cancel();
  try {
    const source = await currentPdf.getPage(selectedPage);
    if (version !== renderVersion) return;
    const fit = Math.max(200, $('paper-view').clientWidth - 24) / source.getViewport({scale:1}).width;
    const zoom = Number($('paper-zoom').value), viewport = source.getViewport({scale:fit * zoom});
    const canvas = document.createElement('canvas'), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * dpr); canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`; canvas.style.height = `${viewport.height}px`;
    canvas.setAttribute('aria-label', `${context.year} ${context.subject} 問題PDF ${selectedPage}ページ`); canvas.setAttribute('role','img');
    $('paper-view').replaceChildren(canvas); $('paper-view').scrollTo(0,0);
    renderTask = source.render({canvasContext:canvas.getContext('2d'), viewport, transform:dpr === 1 ? null : [dpr,0,0,dpr,0,0]});
    await renderTask.promise;
    if (version === renderVersion) { controls(); $('paper-status').textContent = `${selectedPage}ページを表示中。問題番号と年度・課目を表紙で確認してください。`; }
  } catch (error) {
    if (version === renderVersion && error.name !== 'RenderingCancelledException') $('paper-status').textContent = 'ページを表示できませんでした。公式PDFを別タブで開くか、保存したPDFを選び直してください。';
  }
}
async function loadDocument(source, isLocal) {
  const version = ++docVersion, url = context.url;
  $('paper-load').disabled = true; $('paper-status').textContent = 'PDFを読み込んでいます…';
  try {
    const loadedPdf = await pdfjs.getDocument({...source, isEvalSupported:false}).promise;
    if (version !== docVersion) { await loadedPdf.destroy(); return; }
    pdf = loadedPdf; loaded.set(url,pdf); page = 1; controls();
    $('paper-status').textContent = isLocal ? '選択したPDFはこの画面だけで使用します。年度と課目を表紙で確認してください。' : '公式サイトのPDFを読み込みました。';
    await renderPage();
  } catch {
    if (version === docVersion) $('paper-status').textContent = '公式サイトからの直接読込が制限されているか、PDFを読み込めませんでした。「公式PDFを別タブで開く」から保存し、「保存したPDFを選ぶ」で表示できます。';
  } finally { if (version === docVersion) $('paper-load').disabled = false; }
}
for (const button of document.querySelectorAll('[data-energy-pane]')) button.onclick = () => setPane(button.dataset.energyPane);
$('paper-load').onclick = () => { if (context) loadDocument({url:context.url}, false); };
$('paper-file').onchange = async () => { const file = $('paper-file').files[0]; if (!file || !context) return; const version = docVersion; try { const bytes = new Uint8Array(await file.arrayBuffer()); if (version !== docVersion) return; if (new TextDecoder().decode(bytes.subarray(0,1024)).indexOf('%PDF-') < 0) { $('paper-status').textContent = 'PDF形式のファイルを選んでください。'; return; } await loadDocument({data:bytes}, true); } catch { $('paper-status').textContent = 'ファイルを読み込めませんでした。もう一度選び直してください。'; } };
$('paper-prev').onclick = () => { if (pdf && page > 1) { page--; controls(); renderPage(); } };
$('paper-next').onclick = () => { if (pdf && page < pdf.numPages) { page++; controls(); renderPage(); } };
$('paper-zoom').onchange = renderPage;
window.addEventListener('ukiwa-energy-paper', event => updateContext(event.detail));
let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderPage,150); });
updateContext(window.ukiwaEnergyPaper); setPane('answer'); controls();
