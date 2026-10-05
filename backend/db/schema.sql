-- Local Tourist Day-Visit Planner and Information System
-- Database schema (matches SRS Appendix B - Entity Relationship Diagram)

CREATE DATABASE IF NOT EXISTS tourist_planner
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tourist_planner;

-- ------------------------------------------------------------
-- Table: places
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS places (
  place_id      INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  category      ENUM('Religious','Nature','Heritage','Cultural','Recreational') NOT NULL,
  description   TEXT          NOT NULL,
  opening_times VARCHAR(150)  NOT NULL DEFAULT 'Not specified',
  travel_tips   TEXT,
  distance_km   DECIMAL(5,2)  NOT NULL,          -- approx. distance from Bokundara, Piliyandala
  latitude      DECIMAL(10,7) NOT NULL,
  longitude     DECIMAL(10,7) NOT NULL,
  is_verified   TINYINT(1)    NOT NULL DEFAULT 0, -- NFR-03: flag unverified / approximate data
  image_url     VARCHAR(500),
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: visit_plans
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_plans (
  plan_id      INT AUTO_INCREMENT PRIMARY KEY,
  plan_name    VARCHAR(150) NOT NULL DEFAULT 'My Day Visit Plan',
  planned_date DATE NULL,
  total_distance_km DECIMAL(6,2) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: visit_plan_places (join table, many-to-many)
-- Preserves the tourist's chosen order via visit_order
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visit_plan_places (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  plan_id     INT NOT NULL,
  place_id    INT NOT NULL,
  visit_order INT NOT NULL,
  FOREIGN KEY (plan_id)  REFERENCES visit_plans(plan_id)  ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(place_id)      ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Table: admins (FR-17: administrator login)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  admin_id      INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
