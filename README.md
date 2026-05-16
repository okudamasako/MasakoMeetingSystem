# masako会議システム

複数AI人格による意思決定支援ツールです。

## 起動

```bash
npm install
npm run dev
```

http://localhost:3000 を開きます。

## AI生成

OpenAI APIを使う場合は `.env.local` を作成し、次を設定します。

```bash
OPENAI_API_KEY=your_api_key_here
```

APIキーが未設定の場合は、画面確認用のデモ応答で動作します。

## 実装済みMVP

- 入力フォーム
- 5人格による会議結果生成
- 結果表示
- コピー機能
- localStorageへの履歴保存
- 履歴一覧と再表示
