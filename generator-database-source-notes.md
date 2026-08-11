# 非常用発電機データベース v1 調査・実装メモ

最終確認日: 2026-08-11

## 収録件数

- 発電装置・制御装置の型式/シリーズ: 75件
- 試験方法: 26件
- 警報・保護: 30件
- 部品・補機: 30件
- 合計: 161件

## データ品質の考え方

型式/シリーズは、メーカー公式の製品ページまたは公式ニュースで存在を確認できたものを中心に登録した。型式別取扱説明書、現地の制御盤端子図、I/Oリスト、整定表を確認できていない項目について、端子番号、接点論理、設定値、試験短絡箇所を記入していない。

試験方法・警報・部品の説明は「一般原理による説明」であり、特定型式の正式手順ではない。詳細画面にもその区分を常時表示する。

## 主な公式確認先

- [ヤンマー 非常用発電システム](https://www.yanmar.com/jp/energy/emergency_generator/products/)
- [ヤンマー キュービクル型発電システム](https://www.yanmar.com/jp/energy/emergency_generator/cubicle/products/)
- [デンヨー 防災用発電設備](https://www.denyo.co.jp/products/generator/emergency/bosai/)
- [デンヨー 一般停電用予備発電装置](https://www.denyo.co.jp/products/generator/emergency/ippan/)
- [デンヨー LPガス一般停電用予備発電機](https://www.denyo.co.jp/products/generator/emergency/lpgas/)
- [デンヨー 縦型一般停電用予備発電機](https://www.denyo.co.jp/products/generator/emergency/vtype1/)
- [東京電機 製品情報](https://www.tokyodenki.co.jp/product/)
- [ニシハツ 製品情報](https://nishihatsu.co.jp/product)
- [明電舎 非常用発電装置](https://www.meidensha.co.jp/products/energy/prod_04/prod_04_04/)
- [三菱重工 MGS-R公式発表](https://www.mhi.com/jp/news/22032401.html)
- [AIRMAN エンジン発電機](https://www.airman.co.jp/product/category-4/)
- [Caterpillar Diesel Generator Sets](https://www.cat.com/en_US/by-industry/electric-power/product-solutions/diesel-generator-sets.html)
- [Cummins Diesel Generators](https://www.cummins.com/generators/diesel)
- [Deep Sea Electronics Genset Controls](https://www.deepseaelectronics.com/genset)
- [ComAp InteliLite](https://www.comap-control.com/products/controllers/single-gen-set-controllers/intelilite/)
- [DEIF AGC 150 series](https://www.deif.com/land-power/the-agc-150-series/)
- [Woodward easYgen-3000XT](https://www.woodward.com/products/industrial/easygen-3000xt/)

個別の発電装置/制御装置には、可能な限りその型式またはシリーズの公式ページURLをデータ内の `source` に保持した。

## 既存ページから保持した内容

- 自動始動・停止シミュレーション
- PAS開放から停電、始動、電圧確立、負荷切替、復電、冷却運転、停止までの教材
- 63Q、26W、49、非常停止、始動失敗等の保護連動教材
- TEST、COM、2線、1線、DIP、ECU/PLC、不明の異常模擬分類
- 発電機構成部品教材、現場点検表、停止ソレノイド教材

## 実装した機能

- 全文検索（型式、メーカー、試験名、警報名、部品名）
- タブ切替（型式・試験・警報・部品）
- メーカー/分類フィルター
- 詳細ダイアログ
- 型式から試験・警報・部品へのリンク
- 試験・警報・部品から関連型式への逆引き
- お気に入り・最近見た項目（ブラウザ内保存）
- 試験前の前提と、試験後の復旧確認を常時表示
- 公式資料/一般原理/旧系列/生産終了の信頼度区分
- 不足資料の明示

## 追加調査が必要なもの

- 現場にある実機のメーカー・正式型式・製造番号・銘板写真
- 制御盤の正式型式、展開接続図、端子台図、I/Oリスト
- 各警報入力の通常状態、接点論理、入力電圧、許容定格
- TESTボタン、DIP、COM端子の型式別正式仕様
- 社内操作票、試験要領、管理値、記録様式
- 復旧後に求められるAUTO/遠方許可/52G/無警報の現場別条件

## 安全上の扱い

このデータベースは、端子短絡、開放、電圧印加、停復電、52G操作、警報バイパスを指示する操作票ではない。現場責任者、社内手順書、操作票、系統状態、停電範囲、無電圧確認、誤投入防止、回路分離、残留エネルギー、原状復帰を優先する。
