# namakon-bot

GitHub Actions で1日3回、Xに「生コンクリート調査員」の魅力を自動投稿するBot。

## セットアップ

### 1. X Developer Portal の設定

1. [X Developer Portal](https://developer.x.com/) でプロジェクトとアプリを作成
2. **User authentication settings** で OAuth 2.0 を有効化
3. **Type of App**: Web App
4. **Callback URI**: `http://localhost:8787/callback`
5. **Client ID** をメモ

### 2. ローカル環境の準備

```bash
npm install
cp .env.example .env
```

`.env` に `X_CLIENT_ID` を記入。

### 3. refresh_token の取得

```bash
npx tsx scripts/auth_pkce.ts
```

表示されるURLをブラウザで開いて認可し、リダイレクトURLの `code` パラメータを貼り付けると `refresh_token` が表示されます。

### 4. GitHub Secrets の登録

リポジトリの **Settings > Secrets and variables > Actions** に以下を登録:

| Secret | 説明 |
|--------|------|
| `X_CLIENT_ID` | X Developer Portal の Client ID |
| `X_REFRESH_TOKEN` | 手順3で取得した refresh_token |
| `X_REDIRECT_URI` | `http://localhost:8787/callback` |
| `SEED_SALT` | 任意のランダム文字列（文面多様化用） |

### 5. 動作確認

```bash
# ローカルで DRY_RUN
DRY_RUN=true SLOT=0 SEED_SALT=test npm run build && npm start
```

GitHub Actions の **workflow_dispatch** からも手動実行可能。

## 投稿スケジュール

| JST | UTC | SLOT |
|-----|-----|------|
| 08:10 | 23:10 (前日) | 0 |
| 12:10 | 03:10 | 1 |
| 20:10 | 11:10 | 2 |

## スパム回避について

- ハッシュタグは関連性の高いものに限定しています
- `HASHTAG_MODE=SAFE` に設定すると最大3個に制限されます
- NGワード・誇大表現チェック機能（guard.ts）が自動で違反文面を弾きます
- 同日3投稿で Hook / CTA / 主張が被らないようにシード制御しています

## refresh_token のローテーション

X API の refresh_token はローテーションされる場合があります。その場合、Bot実行時にログに新しい refresh_token が出力されるので、手動で GitHub Secrets を更新してください。自動化する場合は GitHub API で Secrets を更新する処理の追加を検討してください。
