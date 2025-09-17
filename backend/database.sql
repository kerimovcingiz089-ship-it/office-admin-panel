-- Office Management Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS office_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE office_management;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  position VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  role_id INT,
  join_date DATE DEFAULT CURDATE(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  permissions JSON,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inquiries table
CREATE TABLE inquiries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  email VARCHAR(255),
  status ENUM('new', 'planned', 'completed') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Meetings table
CREATE TABLE meetings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inquiry_id INT,
  user_id INT,
  location VARCHAR(255),
  images JSON,
  notes TEXT,
  status ENUM('planned', 'completed') DEFAULT 'planned',
  meeting_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Projects table
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  meeting_id INT,
  user_id INT,
  project_images JSON,
  project_pdf TEXT,
  status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Pricing table
CREATE TABLE pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT,
  user_id INT,
  price DECIMAL(10,2),
  weight_kg DECIMAL(8,2),
  price_offer_pdf TEXT,
  notes TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_default) VALUES
('Admin', 'Tam səlahiyyətli administrator', '{"dashboard": true, "users": true, "inquiries": true, "meetings": true, "projects": true, "pricing": true, "roles": true}', true),
('Müştəri Xidmətləri', 'Sorğular və görüşlər üçün', '{"dashboard": true, "users": false, "inquiries": true, "meetings": true, "projects": false, "pricing": false, "roles": false}', true),
('Layihə Meneceri', 'Layihələndirmə və qiymətləndirmə üçün', '{"dashboard": true, "users": false, "inquiries": false, "meetings": false, "projects": true, "pricing": true, "roles": false}', true);

-- Insert default admin user (password: 123456)
INSERT INTO users (name, email, password, department, position, role_id, status) VALUES
('Əhməd Yılmaz', 'ahmed@ofis.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'İnformasiya Texnologiyaları', 'Proqram Tərtibatçısı', 1, 'active'),
('Aysu Kərimli', 'aysu@ofis.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'Müştəri Xidmətləri', 'Müştəri Xidmətləri Mütəxəssisi', 2, 'active'),
('Məhəmməd Əliyev', 'mehemmed@ofis.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iQeO', 'Layihə İdarəetməsi', 'Layihə Meneceri', 3, 'active');





