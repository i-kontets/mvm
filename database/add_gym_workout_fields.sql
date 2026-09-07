-- MVM ジム記録対応 追加SQL
-- phpMyAdminで一度だけ実行してください。
-- 既存のワークアウトは DEFAULT 'home' により「自宅」として残ります。

ALTER TABLE `workouts`
  ADD COLUMN `training_place` VARCHAR(20) NOT NULL DEFAULT 'home' COMMENT '実施場所（home=自宅、gym=ジム）' AFTER `tags`,
  ADD COLUMN `record_type` VARCHAR(20) NOT NULL DEFAULT 'strength' COMMENT '記録タイプ（strength=筋トレ、cardio=有酸素）' AFTER `training_place`,
  ADD COLUMN `duration_minutes` INT UNSIGNED NULL COMMENT '有酸素運動の実施時間（分）' AFTER `record_type`,
  ADD INDEX `workouts_training_place_index` (`training_place`),
  ADD INDEX `workouts_record_type_index` (`record_type`);

ALTER TABLE `workout_sets`
  MODIFY COLUMN `reps` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '回数（有酸素記録では0）';
