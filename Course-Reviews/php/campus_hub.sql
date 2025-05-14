-- SQL for Course Reviews Platform

CREATE DATABASE IF NOT EXISTS campus_hub;
USE campus_hub;

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  professor VARCHAR(255) NOT NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  reviewer VARCHAR(255) NOT NULL,
  rating FLOAT NOT NULL,
  difficulty INT NOT NULL,
  workload INT NOT NULL,
  summary TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id INT NOT NULL,
  commenter VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(id)
);
