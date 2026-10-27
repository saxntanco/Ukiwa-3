const fs=require('node:fs'),{models,sources}=require('../model-data.js');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const row=(...s)=>`<tr>${s.map(x=>`<td>${x}</td>`).join('')}</tr>`;
const table=(h,rows)=>`<div class="audit-table"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const inventory=table(['機器・既存ページ','作業前','今回'],[
 row('VCB：vcb-3d.html／vcb-3d.js','独立360°モデルあり','外観・制御回路・故障例を更新。URLは維持'),
 row('PAS：pas-vtla-3d.html／pas-vtla-3d.js','独立360°モデルあり','参考機種のU–W接続と制御線処置へ訂正'),
 row('VT：vt-withstand-3d.html／vt-withstand-3d.js','独立360°モデルあり','PD-100HF外観と原理を分離、根拠のない数値を削除'),
 row('DS・PF付きLBS・LA・ZCT','独立360°モデルなし','4モデルを追加'),
 row('CT：ct-calculator.html／ct-core.js、用語・継電器教材','計算・解説あり。独立360°モデルなし','既存の計算・利用者の編集は保持。3Dは未作成'),
 row('VCB点検：vcb-inspection-guide.html、VT水槽比喩：vt-water-analogy.html、PAS試験：pas-vt-withstand-simulator.html','解説・模式図・シミュレーター。独立360°外観モデルとは別','関連ページとして確認。今回の機種別3Dと区別し、既存本文は保持'),
 row('equipment-map.html／equipment-map.js','21機器の概要・図あり。独立360°ではない','既存の説明・点検教材リンクは保持し、該当する7機器へ360°モデルのリンクを追加'),
 row('zukan.html・glossary.html','図鑑・用語解説。説明があるだけでは3D完成と数えない','図鑑の360°欄だけを7モデルへ更新。その他の導線は保持')
]);
const priorities=table(['優先順','機器','判断・進捗'],[
 row('1','DS','開いた接点と断路の意味を理解しやすく、開閉位置を外形図で照合可能。単極DV-1を実装'),
 row('2','PF付きLBS','受電設備の負荷開閉と短絡遮断の役割分担に効果。外形図・取説がそろうPFS-201M-Aを実装'),
 row('3','ZCT','地絡検出と相電流の和の理解に効果。OTG-N68の寸法・仕様を確認して実装'),
 row('4','LA','線路から接地への保護機能を理解。方式・外形を確認できるGL-B6Gを実装'),
 row('次候補','CT・高圧限流ヒューズ単体','独立モデル未作成。PFはLBSの構成部品として追加済み。単体CT/PFの型式選定・断面図・極性や試験端子の資料照合は未着手'),
 row('次候補','EVT・ZPD・油入変圧器・モールド変圧器','独立モデル未作成。特定型式の巻線結線・断面・内部配置の資料照合が必要。ZPDはPASの機能説明に含めた'),
 row('次候補','進相コンデンサ・直列リアクトル・高圧ケーブル端末','独立モデル未作成。型式選定・一次資料照合は未着手。端末は屋内外・ケーブル構造・キットを特定してから施工断面を確認する')
]);
const corrections=table(['観点','主な修正・表現方針'],[
 row('① 外形','VCBはV6D-MLD、PASはKLT-PA-D2N11LT、VTはPD-100HFの外形図に統一。メーカー・機種の異なる部品を混ぜない。寸法比と端子配置を採り、ボルト・曲面などは簡略化'),
 row('② 内部構造','未確認の密閉機器内部や巻線の立体配置を削除。実機外観と機能模式図を別タブにし、模式図を実機の断面と呼ばない。確認済みの外から見える鉄心・PF・接点等は3Dに表示'),
 row('③ 結線','PASのVTをU–Wへ訂正。ZCTは主接点の電源側、LAは負荷側の三相各相。VCBの引外し用a3（52a）とTCの直列回路、DC電源への帰路を表示。VTは一次・二次、ヒューズ、通常負担と二次短絡試験を分離'),
 row('④ 動作','VCBはキャッチ解除前／後の電源断を区別。補助スイッチ不追従でもTC通電は電源・67・52aがそろう場合だけ。架空の6秒焼損・TC断線で閉じた67に発生するアークの演出を削除。PF溶断後の再投入でPFが復帰する状態を禁止'),
 row('⑤ 説明','接点状態、TC励磁、補助接点、表示文を共通の離散状態から更新。見た目の橙色は部品選択であり通電ではない。電圧・磁束を電流の光として流さない。LA・ZCTは帰路条件を添えた静止模式に限定')
]);
const sourcesHtml=Object.entries(sources).map(([k,a])=>`<li id="source-${k}"><a href="${esc(a[1])}" target="_blank" rel="noopener">${esc(a[0])}</a><br><small>${esc(a[2])}／閲覧確認：2026-10-27</small></li>`).join('');
const detail=Object.entries(models).map(([k,d])=>`<details><summary>${esc(d.short)} — ${esc(d.ref)}</summary><p><a href="${d.file}">360°モデルを開く →</a></p><dl><dt>資料確認</dt><dd>${esc(d.verified)}</dd><dt>寸法基準</dt><dd>${esc(d.dims)}</dd><dt>簡略化</dt><dd>${esc(d.simplified)}</dd><dt>未確認・未再現</dt><dd>${esc(d.unknown)}</dd><dt>出典</dt><dd>${d.sources.map(id=>`<a href="#source-${id}">${esc(sources[id][0])}</a>`).join(' ／ ')}</dd></dl></details>`).join('');
const html=`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>360°モデルの精査・追加記録｜うきわメモ</title><link rel="stylesheet" href="model-viewer.css?v=20261027"><style>.audit section{margin:28px 0}.audit h2{font-size:22px}.audit h3{font-size:17px}.audit-table{overflow:auto}table{border-collapse:collapse;min-width:600px;width:100%;font-size:14px;background:white}td,th{padding:14px;text-align:left;vertical-align:top;border:1px solid #cadce2}th{background:#dfeef1}td:first-child{min-width:145px;font-weight:700}.audit details{background:white;border:1px solid #cadce2;border-radius:14px;padding:16px;margin:12px 0}.audit summary{cursor:pointer;font-weight:700}.audit dd{margin:4px 0 16px}.audit dt{font-weight:700}.audit li{margin:10px 0}.audit code{overflow-wrap:anywhere}.audit p{max-width:900px}</style></head><body class="mv-page"><header class="mv-header"><a href="index.html">🛟 うきわメモ</a><a href="zukan.html#models3d">360°の図鑑へ →</a></header><main class="mv-main audit"><section class="mv-intro"><span class="mv-eyebrow">EVIDENCE &amp; REVIEW · 2026.10.27</span><h1>360°モデルの精査・追加記録</h1><p>既存3モデルを修正し、DS・PF付きLBS・LA・ZCTを追加しました。外観は特定型式の外形図から再構成し、内部位置が確認できない部品は、別の機能模式図で扱っています。</p><p>実物のCAD・電磁界解析・試験手順書ではありません。正確に再現できた範囲と、できていない範囲をこのページと各モデルに記録します。</p></section><section><h2>作業開始時の確認と対象</h2><p>基準コード：<code>2097c6d2e7ae8d9aaae660e4eb6ae7349c2d4951</code>。公開ページ・リポジトリ・AGENTS.md、図鑑と関連教材を確認。高圧機器の独立360°ページはVCB・PAS・VTの3件。複製名のページとゲームの3D表現は別モデルに数えていません。</p>${inventory}</section><section><h2>追加機器の優先順位</h2><p>現場での接点・保護・検出の理解への効果と、参考型式の外形・機能を一次資料で照合できる範囲から選定。使用頻度の数値調査を行った順位ではありません。</p>${priorities}<p>未作成を「資料が存在しない」とは判定していません。型式選定や資料照合が未着手のものと、今回調べても内部位置を確認できなかったものを区別しています。</p></section><section><h2>5観点の精査</h2>${corrections}</section><section><h2>モデル別の再現範囲</h2>${detail}</section><section><h2>確認結果と限界</h2><ul><li>自動確認：VCBの正常引外し、解除前後の電源断、解除後の67復帰、不追従故障、動作中の再生再入力、LBSの溶断・再投入禁止・開路からの誤開始防止、初期化、7モデルの有限な形状・部品ID、機種固有の要点。</li><li>ブラウザー確認：ChromiumのPC幅1100 CSS px・スマホ幅390 CSS px。7モデルの読み込み、六方向、部品選択、タブ切替、拡大、図鑑の導線、状態変更と説明を確認。原図と代表外観・接続を画面で照合。</li><li>実機との実寸測定、実物の内部配置・接触圧・厳密な動作時間、電流・電圧・温度の数値解析は未実施です。実機での保護性能や試験の安全性を保証する検証ではありません。</li><li>スマホの実機タッチ・2本指ピンチ、iOS Safari・Android端末での性能は未検証。Pointer Eventsで回転・ピンチを実装し、ブラウザーではクリック・視点ボタン・キーボードを確認しました。</li><li>既存の関連シミュレーター・計算ページ全体の再検証は対象外。図鑑のほかの機能と利用者の変更を保持しました。</li></ul><p>公開ページで反映を確認したかどうかは、作業完了報告に記載します。この記録だけで公開完了と判定しないでください。</p></section><section><h2>メーカー一次資料</h2><p>発行・改訂日が確認できないものは未確認・未記載と表示。カタログの掲載終了や差替えに備え、資料番号・型式・ページも併記しています。メーカー資料の画像そのものは再配布していません。</p><ol>${sourcesHtml}</ol></section><nav class="mv-related"><a href="zukan.html#models3d">7つの360°モデルへ →</a></nav></main><footer class="mv-footer">うきわメモ ｜ 2026.10.27</footer></body></html>`;
fs.writeFileSync('model-audit-20261027.html',html);
