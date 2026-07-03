-- ==========================================
-- AI Interview Assistant Database Schema
-- Target Database: MySQL 8.x
-- ==========================================

CREATE DATABASE IF NOT EXISTS ai_interview_db;
USE ai_interview_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Interview Sessions Table
CREATE TABLE IF NOT EXISTS interview_sessions (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    mode VARCHAR(50) NOT NULL,
    score DECIMAL(3, 1) DEFAULT 0.0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    user_answer TEXT NULL,
    ai_feedback TEXT NULL,
    score INT DEFAULT NULL,
    correct_answer TEXT NULL,
    missing_points TEXT NULL,
    suggestions TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexing for performance
CREATE INDEX idx_sessions_user ON interview_sessions(user_id);
CREATE INDEX idx_questions_session ON questions(session_id);
