-- FAQ テーブル: 自動応答のベースとなる質問・回答を保持する
create table if not exists faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- サンプルFAQ(実データ確定後に管理画面から編集・入れ替え可能)
insert into faq (question, answer) values
  ('営業時間', '営業時間は平日10:00〜19:00、土日祝10:00〜18:00です。'),
  ('料金', '基本メニューは3,000円〜です。詳細はメニュー表をご確認ください。'),
  ('アクセス', '最寄り駅から徒歩5分です。駐車場は店舗裏に2台分ございます。'),
  ('定休日', '定休日は毎週水曜日です。祝日の場合は営業いたします。'),
  ('予約の可否', 'ご予約可能です。LINEで希望日時をお知らせください。');

-- メニューテーブル: 施術メニューと料金を保持する(FAQ自動応答と管理画面の両方で使用)
create table if not exists menu (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- サンプルメニュー(実データ確定後に管理画面から編集・入れ替え可能)
insert into menu (name, price) values
  ('カット', 4000),
  ('パーマ', 7000),
  ('カラー', 6500),
  ('縮毛矯正', 12000),
  ('トリートメント', 3500),
  ('ヘッドスパ', 3000),
  ('眉カット', 1000),
  ('カット+トリートメント', 7000),
  ('カット+パーマ', 10500),
  ('カット+カラー', 10000),
  ('パーマ+トリートメント', 10000),
  ('カラー+トリートメント', 9500),
  ('カット+パーマ+トリートメント', 13500),
  ('カット+カラー+トリートメント', 13000),
  ('縮毛矯正+トリートメント', 15000);

-- 問い合わせログ: FAQで回答できなかった質問 / システムエラー発生時の質問を記録する(エスカレーション機能で使用)
create table if not exists inquiry_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  line_user_id text,
  reason text not null default 'unanswerable', -- 'unanswerable' | 'error'
  created_at timestamptz not null default now()
);

-- 一斉配信ログ: 管理画面から送信したお知らせの履歴(LINEの友だち全員への配信はLINE側のbroadcast APIが管理するため、
-- 配信先リストをこちら側で持つ必要はない。送信内容と結果の記録のみ保持する)
create table if not exists broadcast_logs (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  status text not null default 'success', -- 'success' | 'error'
  created_at timestamptz not null default now()
);
