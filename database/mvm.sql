-- MVM (Most Valuable Muscle) database schema
-- phpMyAdmin の「インポート」から実行できます。
-- 既存テーブルやデータを削除しないように作成しています。

CREATE DATABASE IF NOT EXISTS `mvm`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `mvm`;

CREATE TABLE IF NOT EXISTS `exercises` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '種目ID',
  `name` VARCHAR(255) NOT NULL COMMENT '種目名',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '作成日時',
  PRIMARY KEY (`id`),
  UNIQUE KEY `exercises_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='トレーニングで使用する種目マスタ';

CREATE TABLE IF NOT EXISTS `workouts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ワークアウトID',
  `name` VARCHAR(100) NULL COMMENT 'メニュー名',
  `exercise_id` BIGINT UNSIGNED NOT NULL COMMENT '種目ID',
  `date` DATE NOT NULL COMMENT '実施日',
  `category` VARCHAR(100) NULL COMMENT 'メニューのカテゴリ',
  `tags` JSON NULL COMMENT '検索・分類用ラベルの配列',
  `weight_mode` VARCHAR(20) NOT NULL DEFAULT 'weighted' COMMENT '重量方式（weighted=重量、bodyweight=自重）',
  PRIMARY KEY (`id`),
  KEY `workouts_date_index` (`date`),
  KEY `workouts_category_index` (`category`),
  CONSTRAINT `workouts_exercise_id_foreign`
    FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='実施したワークアウトの記録';

CREATE TABLE IF NOT EXISTS `workout_sets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'セットID',
  `workout_id` BIGINT UNSIGNED NOT NULL COMMENT 'ワークアウトID',
  `weight` DECIMAL(7,2) NOT NULL COMMENT '重量（kg）',
  `reps` INT UNSIGNED NOT NULL COMMENT '回数',
  PRIMARY KEY (`id`),
  KEY `workout_sets_workout_id_index` (`workout_id`),
  CONSTRAINT `workout_sets_workout_id_foreign`
    FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ワークアウトごとのセット記録';

CREATE TABLE IF NOT EXISTS `body_metrics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '身体指標ID',
  `weight` DECIMAL(5,2) NOT NULL COMMENT '体重（kg）',
  `arm_size` DECIMAL(5,2) NULL COMMENT '腕周り（cm）',
  `recorded_at` DATE NOT NULL COMMENT '記録日',
  PRIMARY KEY (`id`),
  KEY `body_metrics_recorded_at_index` (`recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体重・腕周りなどの身体指標';

CREATE TABLE IF NOT EXISTS `training_plans` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '週間予定ID',
  `day_of_week` TINYINT UNSIGNED NOT NULL COMMENT '曜日（0=日曜、6=土曜）',
  `title` VARCHAR(100) NOT NULL COMMENT '予定のメニュー名',
  `focus_area` VARCHAR(100) NULL COMMENT '主なトレーニング部位',
  `note` TEXT NULL COMMENT '予定に関するメモ',
  `created_at` TIMESTAMP NULL DEFAULT NULL COMMENT '作成日時',
  `updated_at` TIMESTAMP NULL DEFAULT NULL COMMENT '更新日時',
  PRIMARY KEY (`id`),
  KEY `training_plans_day_of_week_index` (`day_of_week`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='毎週繰り返すトレーニング予定';

CREATE TABLE IF NOT EXISTS `schedule_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '期間指定予定ID',
  `title` VARCHAR(255) NOT NULL COMMENT '予定名',
  `start_date` DATE NOT NULL COMMENT '開始日',
  `end_date` DATE NULL COMMENT '終了日',
  `created_at` TIMESTAMP NULL DEFAULT NULL COMMENT '作成日時',
  `updated_at` TIMESTAMP NULL DEFAULT NULL COMMENT '更新日時',
  PRIMARY KEY (`id`),
  KEY `schedule_events_start_date_index` (`start_date`),
  KEY `schedule_events_end_date_index` (`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='特定の日付または期間に登録する予定';

CREATE TABLE IF NOT EXISTS `reference_videos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '参考動画ID',
  `title` VARCHAR(255) NOT NULL COMMENT '動画タイトル',
  `url` VARCHAR(2048) NOT NULL COMMENT '動画のURL',
  `category` VARCHAR(100) NULL COMMENT '動画のカテゴリ',
  `thumbnail_url` VARCHAR(2048) NULL COMMENT 'サムネイル画像のURL',
  `created_at` TIMESTAMP NULL DEFAULT NULL COMMENT '作成日時',
  `updated_at` TIMESTAMP NULL DEFAULT NULL COMMENT '更新日時',
  PRIMARY KEY (`id`),
  KEY `reference_videos_category_index` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='トレーニングの参考動画';

CREATE TABLE IF NOT EXISTS `workout_videos` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'ワークアウト動画紐付けID',
  `workout_id` BIGINT UNSIGNED NOT NULL COMMENT 'ワークアウトID',
  `reference_video_id` BIGINT UNSIGNED NOT NULL COMMENT '参考動画ID',
  PRIMARY KEY (`id`),
  UNIQUE KEY `workout_videos_unique` (`workout_id`, `reference_video_id`),
  CONSTRAINT `workout_videos_workout_id_foreign` FOREIGN KEY (`workout_id`) REFERENCES `workouts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workout_videos_reference_video_id_foreign` FOREIGN KEY (`reference_video_id`) REFERENCES `reference_videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ワークアウト当日に使用した参考動画';
