import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const cfg = window.UKIWA_LAB_CONFIG || {};
const $ = (id) => document.getElementById(id);
const panels = ['setupPanel', 'loginPanel', 'deniedPanel', 'appPanel'];

function show(id) {
  panels.forEach((p) => $(p)?.classList.toggle('hidden', p !== id));
}
function status(el, text, isError = false) {
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#ffc1c1' : '';
  el.classList.remove('hidden');
}
function hideStatus(el) { el?.classList.add('hidden'); }
function configured() {
  const c = cfg.firebaseConfig;
  return !!(c && c.apiKey && c.authDomain && c.projectId && c.appId && cfg.ownerEmailHash);
}
function tagsFromText(text) {
  return [...new Set(String(text || '').split(',').map(v => v.trim()).filter(Boolean))].slice(0, 20);
}
function tsMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  return 0;
}
function formatDate(value) {
  const ms = tsMillis(value);
  if (!ms) return '';
  return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms));
}
async function sha256(text) {
  const bytes = new TextEncoder().encode(String(text || '').trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function isOwner(u) {
  if (!u?.email || !cfg.ownerEmailHash) return false;
  return (await sha256(u.email)) === cfg.ownerEmailHash;
}
function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code === 'auth/unauthorized-domain') {
    return 'このドメインがFirebaseで許可されていません。Authentication → 設定 → 承認済みドメインに saxntanco.github.io を追加してください。';
  }
  if (code === 'auth/popup-closed-by-user') return 'ログイン画面が閉じられました。';
  if (code === 'auth/popup-blocked') return 'ログイン画面がブロックされました。ブラウザのポップアップを許可して、もう一度押してください。';
  return `ログインできませんでした: ${code || err?.message || 'unknown error'}`;
}

if (!configured()) {
  show('setupPanel');
} else {
  const app = initializeApp(cfg.firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let user = null;
  let unsubscribe = null;
  let articles = [];
  let selectedId = '';

  async function login() {
    hideStatus($('loginStatus'));
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (err) {
      status($('loginStatus'), friendlyAuthError(err), true);
    }
  }

  async function logout() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    await signOut(auth);
  }

  function openEditor(article = null) {
    $('articleView').classList.add('hidden');
    $('editor').classList.remove('hidden');
    hideStatus($('saveStatus'));
    $('docId').value = article?.id || '';
    $('titleInput').value = article?.title || '';
    $('categoryInput').value = article?.category || '⚡ 電気';
    $('tagsInput').value = (article?.tags || []).join(', ');
    $('bodyInput').value = article?.body || '';
    $('deleteBtn').classList.toggle('hidden', !article?.id);
    setTimeout(() => $('titleInput').focus(), 0);
  }

  function closeEditor() {
    $('editor').classList.add('hidden');
    $('articleView').classList.remove('hidden');
    if (selectedId) {
      const a = articles.find(x => x.id === selectedId);
      if (a) renderArticle(a); else renderWelcome();
    } else renderWelcome();
  }

  function renderWelcome() {
    $('articleView').replaceChildren();
    const div = document.createElement('div');
    div.className = 'empty';
    div.textContent = '左の一覧から記事を選ぶか、「＋ 新しい記事」でメモを作成してください。';
    $('articleView').appendChild(div);
  }

  function renderArticle(article) {
    selectedId = article.id;
    $('editor').classList.add('hidden');
    $('articleView').classList.remove('hidden');
    const root = $('articleView');
    root.replaceChildren();

    const h = document.createElement('h2'); h.textContent = article.title || '無題';
    const meta = document.createElement('div'); meta.className = 'meta';
    meta.textContent = [article.category, formatDate(article.updatedAt)].filter(Boolean).join(' ・ ');
    const tags = document.createElement('div');
    (article.tags || []).forEach(t => {
      const s = document.createElement('span'); s.className = 'tag'; s.textContent = t; tags.appendChild(s);
    });
    const body = document.createElement('div'); body.className = 'body'; body.textContent = article.body || '';
    const actions = document.createElement('div'); actions.style.marginTop = '24px';
    const edit = document.createElement('button'); edit.className = 'btn'; edit.type = 'button'; edit.textContent = '編集';
    edit.addEventListener('click', () => openEditor(article));
    actions.appendChild(edit);
    root.append(h, meta, tags, body, actions);
    renderList();
  }

  function filteredArticles() {
    const q = $('searchInput').value.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(a => [a.title, a.category, (a.tags || []).join(' '), a.body].join(' ').toLowerCase().includes(q));
  }

  function renderList() {
    const root = $('articleList');
    root.replaceChildren();
    const items = filteredArticles();
    if (!items.length) {
      const e = document.createElement('div'); e.className = 'empty'; e.textContent = '記事がありません'; root.appendChild(e); return;
    }
    items.forEach(a => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'articleItem' + (a.id === selectedId ? ' active' : '');
      const title = document.createElement('b'); title.textContent = a.title || '無題';
      const small = document.createElement('small'); small.textContent = [a.category, formatDate(a.updatedAt)].filter(Boolean).join(' ・ ');
      b.append(title, small);
      b.addEventListener('click', () => renderArticle(a));
      root.appendChild(b);
    });
  }

  function subscribeArticles() {
    if (unsubscribe) unsubscribe();
    const col = collection(db, 'users', user.uid, 'articles');
    const q = query(col, orderBy('updatedAt', 'desc'));
    unsubscribe = onSnapshot(q, (snap) => {
      articles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      renderList();
      if (selectedId) {
        const selected = articles.find(a => a.id === selectedId);
        if (selected && $('editor').classList.contains('hidden')) renderArticle(selected);
      }
    }, (err) => {
      const root = $('articleList');
      root.replaceChildren();
      const e = document.createElement('div'); e.className = 'status'; e.style.color = '#ffc1c1';
      e.textContent = `Firestoreを読めません: ${err.code || err.message}`;
      root.appendChild(e);
    });
  }

  $('loginBtn').addEventListener('click', login);
  $('logoutBtn').addEventListener('click', logout);
  $('deniedLogoutBtn').addEventListener('click', logout);
  $('newBtn').addEventListener('click', () => { selectedId = ''; openEditor(); });
  $('cancelBtn').addEventListener('click', closeEditor);
  $('searchInput').addEventListener('input', renderList);

  $('editor').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus($('saveStatus'));
    const id = $('docId').value;
    const data = {
      title: $('titleInput').value.trim(),
      category: $('categoryInput').value,
      tags: tagsFromText($('tagsInput').value),
      body: $('bodyInput').value,
      updatedAt: serverTimestamp()
    };
    try {
      if (id) {
        await setDoc(doc(db, 'users', user.uid, 'articles', id), data, { merge: true });
        selectedId = id;
      } else {
        data.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, 'users', user.uid, 'articles'), data);
        selectedId = ref.id;
      }
      status($('saveStatus'), '保存しました');
      setTimeout(closeEditor, 300);
    } catch (err) {
      status($('saveStatus'), `保存できません: ${err.code || err.message}`, true);
    }
  });

  $('deleteBtn').addEventListener('click', async () => {
    const id = $('docId').value;
    if (!id) return;
    if (!confirm('この記事を削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'articles', id));
      selectedId = '';
      closeEditor();
    } catch (err) {
      status($('saveStatus'), `削除できません: ${err.code || err.message}`, true);
    }
  });

  onAuthStateChanged(auth, async (u) => {
    user = u;
    if (!u) {
      if (unsubscribe) { unsubscribe(); unsubscribe = null; }
      show('loginPanel');
      return;
    }

    let allowed = false;
    try { allowed = await isOwner(u); } catch (_) { allowed = false; }
    if (!allowed) {
      show('deniedPanel');
      return;
    }

    const chip = $('ownerChip');
    chip.replaceChildren();
    if (u.photoURL) {
      const img = document.createElement('img'); img.src = u.photoURL; img.alt = ''; chip.appendChild(img);
    }
    const span = document.createElement('span'); span.textContent = u.displayName || 'OWNER'; chip.appendChild(span);
    show('appPanel');
    subscribeArticles();
  });
}
