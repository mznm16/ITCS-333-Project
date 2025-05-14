-- Database schema for Campus Hub Study Groups

-- Create database
CREATE DATABASE IF NOT EXISTS campus_hub;
USE campus_hub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study groups table
CREATE TABLE IF NOT EXISTS study_groups (
    group_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    course VARCHAR(50) NOT NULL,
    description TEXT,
    max_members INT NOT NULL DEFAULT 5,
    current_members INT NOT NULL DEFAULT 1,
    meeting_time INT,
    location VARCHAR(100),
    days JSON,
    requirements JSON,
    image VARCHAR(255),
    owner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    is_owner BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY (group_id, user_id)
);

-- Group resources table
CREATE TABLE IF NOT EXISTS group_resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    added_by VARCHAR(50),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE
);

-- Group sessions table
CREATE TABLE IF NOT EXISTS group_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    day VARCHAR(10) NOT NULL,
    month VARCHAR(10) NOT NULL,
    year VARCHAR(10) NOT NULL,
    time VARCHAR(20) NOT NULL,
    title VARCHAR(100) NOT NULL,
    topics TEXT,
    status VARCHAR(20) DEFAULT 'Ongoing',
    session_type VARCHAR(20) DEFAULT 'study',
    FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE
);

-- Group chat messages table
CREATE TABLE IF NOT EXISTS group_chat (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    text TEXT NOT NULL,
    is_owner BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
); 