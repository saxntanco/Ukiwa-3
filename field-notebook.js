(() => {
  'use strict';
  const name = decodeURIComponent(location.pathname.split('/').pop());
  const templates = {
    'near-miss.html': {title:'ヒヤリを、次の確認に変える', labels:['何が起きたか（事実）','気づけたきっかけ・残せた証拠','原因の仮説（未確認は未確認と書く）','次回どこで、誰と、何を確認するか']},
    'field-essentials.html': {title:'現場ごとの準備メモ', labels:['設備・作業の範囲と今回の目的','図面・型式・資料の版と確認する条件','必要な器具と、使う前に確かめること','作業の区切り・引継ぎ・終了状態']},
    'why-today.html': {title:'「なんで？」を調べられる形にする', labels:['何が疑問か（一文で）','実際に見たこと・数値・測った二点','自分の仮説と、その仮説が成り立つ条件','資料・先輩に確認したいこと']},
    'pukapuka-diary.html': {title:'今日の経験を、次の自分に残す', labels:['今日の作業と自分の担当','分かったこと・迷ったこと','根拠になった説明・資料・実測','次回、再現すること・確認すること']}
  };
  const template = templates[name]; if (!template) return;
  const key = 'ukiwa-field-notebook-v1:' + name;
  const create = (tag, text, cls) => { const e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; };
  const root = create('details', null, 'fn-notebook'); root.append(create('summary', template.title + ' — 下書きを開く'));
  const body = create('div', null, 'fn-body'); body.append(create('p', '事実・推測・次の確認を分けるためのひな形。入力はこの端末・ブラウザー内に保存し、サイトの記事には公開されません。'));
  const form = create('form'); const inputs = [];
  let saved = {};
  try { const parsed = JSON.parse(localStorage.getItem(key) || '{}'); if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) saved = parsed; } catch (_) {}
  template.labels.forEach((text, i) => { const label = create('label', text), input = create('textarea'); input.name = 'field' + i; input.rows = 3; input.value = typeof saved[input.name] === 'string' ? saved[input.name] : ''; label.append(input); form.append(label); inputs.push(input); });
  const status = create('p', '入力すると自動保存します。', 'fn-status'); status.setAttribute('role', 'status');
  const data = () => Object.fromEntries(inputs.map(input => [input.name, input.value]));
  const save = () => { try { localStorage.setItem(key, JSON.stringify(data())); status.textContent = 'この端末に下書きを保存しました。'; } catch (_) { status.textContent = '保存できませんでした。下の「テキストで保存」で手元に残せます。'; } };
  form.addEventListener('input', save); form.addEventListener('submit', e => e.preventDefault());
  const actions = create('div', null, 'fn-actions');
  const download = create('button', 'テキストで保存'); download.type = 'button';
  download.addEventListener('click', () => {
    const text = template.title + '\n\n' + template.labels.map((label, i) => label + '\n' + inputs[i].value).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], {type:'text/plain;charset=utf-8'}));
    const a = create('a'); a.href = url; a.download = 'ukiwa-' + name.replace('.html','') + '-' + new Date().toISOString().slice(0,10) + '.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const clear = create('button', 'この下書きを消す'); clear.type = 'button'; clear.addEventListener('click', () => { if (!confirm('このページの下書きを削除しますか？必要なら先にテキスト保存してください。')) return; try { localStorage.removeItem(key); inputs.forEach(input => input.value = ''); status.textContent = 'このページの下書きを削除しました。'; } catch (_) { status.textContent = '削除できませんでした。ブラウザーの保存設定を確認してください。'; } });
  actions.append(download, clear); body.append(form, actions, status, create('p', 'ブラウザーのデータ削除や端末変更では引き継がれません。残したい記録はテキストで保存できます。', 'fn-small')); root.append(body);
  const main = document.querySelector('main'); if (main) main.append(root); else document.querySelector('.wrap')?.append(root);
})();
