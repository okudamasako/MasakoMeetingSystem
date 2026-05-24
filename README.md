# masako会議システム

複数AI人格による意思決定支援ツールです。

## 内容

- AI人格による会議シミュレーション
- 意見比較
- アイデア整理
- 会議結果生成
- 履歴保存
- コピー機能

## 使用技術

- Next.js
- JavaScript
- OpenAI API
- localStorage
- Vercel

## デモ

https://masako-meeting-system.vercel.app/

## 実装済みMVP

- 入力フォーム
- 5人格による会議結果生成
- 結果表示
- コピー機能
- localStorageへの履歴保存
- 履歴一覧と再表示

## ディレクトリ構成

app/  
└ アプリ本体

主要ファイル
- package.json
- next.config.mjs
- postcss.config.mjs
- .env.example

## 起動方法

```bash
npm install
npm run dev
```

http://localhost:3000 を開きます。

## 開発目的

AI人格を活用した
意思決定支援・アイデア整理・会議補助の試作デモ。

## 作者

奥田 真佐子
