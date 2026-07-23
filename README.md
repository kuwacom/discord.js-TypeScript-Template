# discord.js TypeScript Template

discord.js v14 と TypeScript を使って BOT を作るためのテンプレートです

現在の主な構成は以下です

- `discord.js` `14.26.3`
- `@discordjs/voice` `0.19.2`
- `opusscript` `0.0.8`
- `TypeScript` `6.0.3`
- `ESLint` `10.2.1`
- `Prettier` `3.8.3`
- `zod` による環境変数バリデーション
- `ShardingManager` を前提にした起動構成
- 任意で使える簡易シャード同期 API
- 外部 API 呼び出し用の汎用 `APIClient`（openapi-fetch + raw fetch の 2 経路・throw 方式のエラーハンドリング）

## 特徴

- コマンド
- ボタン
- セレクトメニュー
- モーダル
- メッセージコマンド
- スラッシュコマンド
- シャード管理
- Presence 更新タスク
- メモリ使用量デバッグタスク
- `zod` による `.env` 検証
- `ESLint` と `Prettier` によるコード品質管理
- 外部 API 呼び出し用の汎用 `APIClient`（openapi-fetch + 生 fetch の 2 経路・タイムアウト・ヘッダーマスク・トークン認証対応）

## 動作要件

- Node.js `22.13.0` 以上
- npm

`package.json` の `engines.node` に合わせて、Node.js は `22.13.0` 以上を前提にしています

## セットアップ

```bash
npm install
```

`.env.example` を `.env` にコピーして値を設定します

```env
BOT_PREFIX="!!example"
BOT_TOKEN=""
SHARD_SYNC_API_ADDRESSES=http://localhost:3000/v1
SHARD_SYNC_API_HOST=true
SHARD_SYNC_API_ORIGIN="*"
```

ビルドして起動します

```bash
npm run build
npm start
```

型チェックだけを行いたい場合は以下を使えます

```bash
npm run typecheck
```

## 環境変数

| 変数名                     | 説明                                              | 補足                                    |
| -------------------------- | ------------------------------------------------- | --------------------------------------- |
| `BOT_PREFIX`               | メッセージコマンドのプレフィックス                | 例 `!!`                                 |
| `BOT_TOKEN`                | Discord BOT のトークン                            | 必須                                    |
| `SHARD_SYNC_API_ADDRESSES` | シャード同期 API の接続先 URL                     | `SHARD_SYNC_API_HOST=true` のときは必須 |
| `SHARD_SYNC_API_HOST`      | シャード同期 API をこのプロセスで起動するかどうか | `true` `1` `yes` `on` で有効            |
| `SHARD_SYNC_API_ORIGIN`    | シャード同期 API の CORS Origin                   | 既定値 `*`                              |
| `TS_DIST_PATH`             | ビルド済みファイルの出力先                        | 既定値 `./dist`                         |

環境変数のスキーマは [src/schemas/env.ts](src/schemas/env.ts) にあります  
読み込みは [src/configs/env.ts](src/configs/env.ts) で行います

## 利用できるスクリプト

| コマンド               | 内容                                         |
| ---------------------- | -------------------------------------------- |
| `npm run build`        | `tsc` と `tsc-alias` でビルド                |
| `npm run typecheck`    | TypeScript の型チェックのみ実行              |
| `npm run gen:api`      | `openapi.yaml` から TypeScript 型定義を生成  |
| `npm run lint`         | ESLint でプロジェクト全体を検査              |
| `npm run lint:fix`     | ESLint の自動修正を実行                      |
| `npm run format`       | Prettier でプロジェクト全体を整形            |
| `npm run format:check` | Prettier の整形チェックのみ実行              |
| `npm start`            | ビルド済みの `dist/index.js` を起動          |
| `npm run dev`          | ビルド後に `--dev` 付きで起動                |
| `npm test`             | ビルド後に BOT を起動                        |
| `npm run wintest`      | Windows 向けにタイトルを付けてビルド後に起動 |
| `npm run winstart`     | Windows 向けにタイトルを付けて起動           |

`npm test` はテストランナーではなく、ビルド後に BOT を起動するコマンドです

## プロジェクト構成

| パス                                                         | 役割                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| [src/index.ts](src/index.ts)                                 | 親プロセスの起点 `ShardingManager` を起動                |
| [src/bot.ts](src/bot.ts)                                     | 各シャードプロセスの起点 イベント登録とタスク起動を担当  |
| [src/services/discord.ts](src/services/discord.ts)           | `client` と各種レジストリを保持し ログイン前初期化を担当 |
| [src/handlers](src/handlers)                                 | `messageCreate` と `interactionCreate` の振り分け        |
| [src/commands](src/commands)                                 | コマンド実装                                             |
| [src/buttons](src/buttons)                                   | ボタン実装                                               |
| [src/selectMenus](src/selectMenus)                           | セレクトメニュー実装                                     |
| [src/modals](src/modals)                                     | モーダル実装                                             |
| [src/tasks](src/tasks)                                       | 定期実行タスク                                           |
| [src/configs](src/configs)                                   | 設定値と起動引数                                         |
| [src/schemas](src/schemas)                                   | `zod` スキーマ定義                                       |
| [src/api](src/api)                                           | 外部 API 呼び出し用クライアントとシャード同期 API クライアント |
| [src/api/apiClient.ts](src/api/apiClient.ts)               | 汎用 API クライアント（openapi-fetch + 生 fetch の 2 経路） |
| [src/api/shards](src/api/shards)                           | シャード同期 API の呼び出し関数群                         |
| [src/routes](src/routes)                                     | シャード同期 API のルーティング                          |
| [src/lib](src/lib)                                          | 共通ライブラリ（API エラー定義など）                      |
| [src/models/api](src/models/api)                             | API の型モデル                                           |
| [src/types](src/types)                                       | アプリ内部で使う型定義                                   |
| [src/types/generated](src/types/generated)                   | `openapi-typescript` が自動生成する OpenAPI 型定義       |
| [src/format](src/format)                                     | エラー文言などの整形                                     |
| [src/utils](src/utils)                                       | 補助関数                                                 |
| [eslint.config.cjs](eslint.config.cjs)                       | ESLint flat config                                       |
| [.prettierrc](.prettierrc)                                   | Prettier 設定                                            |
| [.prettierignore](.prettierignore)                           | Prettier の除外設定                                      |
| [docker-compose.yaml](docker-compose.yaml)                   | Docker で起動するためのサンプル                          |
| [discord-bot-template.service](discord-bot-template.service) | systemd 用サンプル                                       |

## 内部状態

このテンプレートは以下の状態をメモリ上に持ちながら動作します

| 状態              | 定義場所                                           | 説明                                       |
| ----------------- | -------------------------------------------------- | ------------------------------------------ |
| `client`          | [src/services/discord.ts](src/services/discord.ts) | Discord クライアント本体                   |
| `slashCommands`   | [src/services/discord.ts](src/services/discord.ts) | グローバル登録するスラッシュコマンド一覧   |
| `commands`        | [src/services/discord.ts](src/services/discord.ts) | コマンド名をキーにしたコマンド実装マップ   |
| `buttons`         | [src/services/discord.ts](src/services/discord.ts) | ボタンの実装一覧                           |
| `selectMenus`     | [src/services/discord.ts](src/services/discord.ts) | セレクトメニューの実装一覧                 |
| `modals`          | [src/services/discord.ts](src/services/discord.ts) | モーダルの実装一覧                         |
| `env`             | [src/configs/env.ts](src/configs/env.ts)           | `zod` で検証済みの環境変数                 |
| `connectionCount` | [src/shardSyncAPI.ts](src/shardSyncAPI.ts)         | シャードごとの接続数を持つ簡易メモリストア |

`connectionCount` はプロセス内メモリなので、永続化はされません  
再起動でクリアされる前提の簡易同期用です

## 起動から動作までの流れ

1. [src/index.ts](src/index.ts) が起動し `ShardingManager` を作成
2. `ShardingManager` が各シャードで [src/bot.ts](src/bot.ts) を起動
3. [src/services/discord.ts](src/services/discord.ts) の `initBot()` が `commands` `buttons` `selectMenus` `modals` を `dist` から読み込む
4. `client.login()` が完了すると `ready` イベントで Presence 更新とメモリ使用量ログを開始
5. `ready` 時に `setSlashCommand()` が実行されてグローバルコマンドを登録
6. メッセージは [src/handlers/messageCreateHandler.ts](src/handlers/messageCreateHandler.ts) がプレフィックスを見て振り分け
7. インタラクションは [src/handlers/interactionCreateHandler.ts](src/handlers/interactionCreateHandler.ts) が種別ごとに振り分け
8. `SHARD_SYNC_API_HOST` が有効なら [src/shardSyncAPI.ts](src/shardSyncAPI.ts) が REST API を起動

## コマンドや UI を追加する方法

### コマンド

新しいコマンドは `src/commands/<commandName>/` に追加します

- `index.ts`
- `executeMessage.ts`
- `executeInteraction.ts`

例として [src/commands/template/index.ts](src/commands/template/index.ts) を見ると構成が分かりやすいです

### ボタン

新しいボタンは `src/buttons/<buttonName>/` に追加します

- `index.ts`
- `builders.ts`
- `executeInteraction.ts`

`index.ts` の `customId` 配列に、受け付ける ID の先頭値を定義します

### セレクトメニュー

新しいセレクトメニューは `src/selectMenus/<selectMenuName>/` に追加します

- `index.ts`
- `executeInteraction.ts`

### モーダル

新しいモーダルは `src/modals/<modalName>/` に追加します

- `index.ts`
- `executeInteraction.ts`

## 外部 API を呼ぶ

このテンプレートには外部 API を呼ぶための汎用クライアント [src/api/apiClient.ts](src/api/apiClient.ts) が含まれています
`APIClient` は **2 つのリクエスト経路** を持っています

| メソッド群 | 内部実装 | 用途 |
| --- | --- | --- |
| `get` / `post` / `put` / `delete` / `patch` | `openapi-fetch` | OpenAPI 定義にあるパス（型安全）|
| `getUrl` / `postUrl` / `putUrl` / `deleteUrl` / `patchUrl` | 生 `fetch` | OpenAPI 定義にない外部 API |

両経路ともタイムアウト・認証ヘッダー・エラーハンドリングは共通です

### 基本的な使い方

```typescript
import { APIClient } from '@/api/apiClient';

const client = new APIClient({
  baseUrl: 'https://api.example.com/v1',
  timeout: 10000, // デフォルト 5000ms
});

// 認証トークンが必要な場合
client.setUserToken('your-token');

// OpenAPI 定義にあるパス（型安全）
const data = await client.get<ResponseType>('/resource');
const created = await client.post<ResponseType, BodyType>('/resource', {
  name: 'example',
});
```

### OpenAPI 定義にない外部 API を叩く場合

`getUrl` / `postUrl` 等のメソッドは絶対 URL を受け取り、生 fetch でリクエストします
OpenAPI 定義への追記が難しいサードパーティ API 向けです

```typescript
// OpenAPI 定義にない外部 API（絶対 URL を指定）
const data = await client.getUrl<ResponseType>('https://api.thirdparty.com/v1/resource');

const created = await client.postUrl<ResponseType, BodyType>(
  'https://api.thirdparty.com/v1/resource',
  { name: 'example' },
);
```

### エラーハンドリング

API エラーは `ApiResultError` として throw されます  
呼び出し元で try/catch して処理します

```typescript
import { isApiResultError } from '@lib/apiError';

try {
  const data = await client.get<ResponseType>('/resource');
} catch (error) {
  if (isApiResultError(error)) {
    // API が返したエラー（HTTP ステータス・ErrorCode 付き）
    logger.error(`${error.status} ${error.code}: ${error.message}`);
  } else {
    // ネットワークエラーやタイムアウト等
    logger.error('Network error', error);
  }
}
```

`ApiResultError` は以下のプロパティを持ちます

| プロパティ | 型                       | 説明                                       |
| ---------- | ------------------------ | ------------------------------------------ |
| `status`   | `number`                 | HTTP ステータスコード                      |
| `code`     | `ErrorCode`              | API 共通エラーコード                       |
| `message`  | `string`                 | エラーメッセージ                           |
| `details`  | `ValidationErrorDetails` | バリデーションエラー時のみ詳細情報         |

### 対応している ErrorCode

| code                   | 想定 HTTP ステータス |
| ---------------------- | -------------------- |
| `BAD_REQUEST`          | 400                  |
| `VALIDATION_ERROR`     | 400                  |
| `UNAUTHORIZED`         | 401                  |
| `FORBIDDEN`            | 403                  |
| `NOT_FOUND`            | 404                  |
| `CONFLICT`             | 409                  |
| `TOO_MANY_REQUESTS`    | 429                  |
| `BAD_GATEWAY`          | 502                  |
| `INTERNAL_SERVER_ERROR`| 500                  |

### 認証ヘッダー

`APIClient` は以下の認証方式をサポートしています

| 方式               | 設定方法                          | ヘッダー                |
| ------------------ | --------------------------------- | ----------------------- |
| Bearer トークン    | `client.setUserToken(token)`      | `Authorization: Bearer` |
| 内部サービス間通信 | コンストラクタの `internalToken`  | `X-Internal-Token`      |

両方を同時に使うことも可能です

### ログ出力とセンシティブヘッダー

リクエスト時にヘッダー内容をログ出力しますが、以下のヘッダーは自動的に `[REDACTED]` 化されます

- `Authorization`
- `Cookie`
- `Set-Cookie`
- `X-API-Key`
- `X-Internal-Token`

### リクエストボディの Content-Type

デフォルトは `application/json` ですが、`Content-Type` ヘッダーを指定することで他の形式も使えます

```typescript
// URLエンコードフォーム
await client.post('/token', body, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
});

// multipart/form-data
await client.post('/upload', body, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

## 外部 API を OpenAPI で管理する

このテンプレートでは [openapi.yaml](openapi.yaml) から TypeScript 型定義を生成し、[src/api/apiClient.ts](src/api/apiClient.ts) の `get` / `post` 等のメソッドが `openapi-fetch` を使ってその型に基づいたリクエストを行います
OpenAPI 定義にない外部 API は `getUrl` / `postUrl` 等のメソッドで生 fetch 経由で呼べます

### openapi-typescript の peer dependency 注意点

`openapi-typescript@7.x` は TypeScript 5.x を peer dependency として要求しますが、このテンプレートは TypeScript 6.x を使用しています  
インストール時に peer dependency 警告が出ますが、`--legacy-peer-deps` 付きでインストールすれば問題なく動作します

```bash
npm install -D openapi-typescript --legacy-peer-deps
```

## 実装上の補足

- 実行時の読み込み対象は `src` ではなく `dist` です
- そのため追加実装後はまず `npm run build` が必要です
- 標準の起動方法は `ShardingManager` 前提です
- 小規模 BOT でも通常起動では 1 シャード構成として動きます
- `help` コマンドは最初から入っています
- メッセージコマンドの別名は [src/configs/discord.ts](src/configs/discord.ts) の `commandsConfig` で管理しています
- lint 設定は `eslint.config.cjs` の flat config を使っています
- TypeScript は `tsconfig.json` で CommonJS 出力を維持しつつ TS 6 系に対応しています

## 注意点

- `setSlashCommand()` は `ready` のたびにグローバルコマンドを登録します
- 本番運用では、必要に応じてコマンドデプロイを別コマンドに分離してください
- [docker-compose.yaml](docker-compose.yaml) は現在 `node:22` ベースです
- 現在の依存関係では Node.js `22.13.0` 以上が必要です

## サポート

詳細が分からない場合はテンプレート内の `template` 実装を参照してください

サポートサーバー  
https://kuwa.app/discord/support/
