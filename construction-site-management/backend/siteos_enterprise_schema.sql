-- SiteOS Enterprise Complete PostgreSQL Schema
-- Fixed: Site_Manager removed from role check, Half Day added to attendance status,
--         UNIQUE constraint on attendance, notifications table added, project_members table added.
-- Run directly in pgAdmin or psql.

--------------------------------------------------
-- 1. CLEANUP (Drop tables in correct order to avoid FK errors)
--------------------------------------------------
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS leave_application CASCADE;
DROP TABLE IF EXISTS finance CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS material_issue CASCADE;
DROP TABLE IF EXISTS procurement CASCADE;
DROP TABLE IF EXISTS vendor CASCADE;
DROP TABLE IF EXISTS inventory_item CASCADE;
DROP TABLE IF EXISTS worker CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

--------------------------------------------------
-- 2. CREATE TABLES
--------------------------------------------------

-- Users Table (Handles role-based authentication)
-- FIX: Removed 'Site_Manager' from role CHECK — only Site_Engineer is valid
CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Project_Manager', 'Site_Engineer', 'Worker')),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table (Core Project Management)
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    site_location VARCHAR(255),
    project_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'On_Hold', 'Planning', 'Cancelled')),
    created_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Members Table (Site Engineer → Project assignment)
-- FIX: This table was missing from original schema, causing runtime crashes
CREATE TABLE project_members (
    project_member_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE,
    member_role VARCHAR(50) DEFAULT 'Site_Engineer' CHECK (member_role IN ('Site_Engineer', 'Project_Manager', 'Admin')),
    from_date DATE,
    to_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_id)
);

-- Tasks Table (Task Management & Assignment)
CREATE TABLE task (
    task_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    assigned_to INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'In_Progress', 'Completed', 'Blocked', 'Review')),
    priority VARCHAR(50) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    due_date DATE,
    deadline DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    workers_assigned JSONB DEFAULT '[]'::jsonb,
    materials_used JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workers Table (Workforce & Salary Management)
CREATE TABLE worker (
    worker_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES project(project_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    skill_type VARCHAR(100),
    contact VARCHAR(50),
    rate_type VARCHAR(50) CHECK (rate_type IN ('Daily', 'Hourly', 'Monthly')),
    base_rate NUMERIC(15, 2) DEFAULT 0.00,
    salary NUMERIC(15, 2) DEFAULT 0.00,
    attendance JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table (Item Catalog & Stock)
CREATE TABLE inventory_item (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    uom VARCHAR(50),
    unit_cost NUMERIC(15, 2) DEFAULT 0.00,
    min_stock_qty INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors Table (Supplier details)
CREATE TABLE vendor (
    vendor_id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    contact VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    rating NUMERIC(3, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Procurement Table (Purchase Orders mapping to Inventory & Vendor)
CREATE TABLE procurement (
    id SERIAL PRIMARY KEY,
    procurement_id VARCHAR(50) UNIQUE,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendor(vendor_id) ON DELETE SET NULL,
    item_id INTEGER REFERENCES inventory_item(item_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(15, 2) DEFAULT 0.00,
    delivery_status VARCHAR(50) DEFAULT 'ordered' CHECK (delivery_status IN ('ordered', 'shipped', 'delivered', 'cancelled')),
    expected_delivery DATE,
    delivered_at DATE,
    created_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Material Issue Table (Tracking material usage on site/tasks)
CREATE TABLE material_issue (
    material_issue_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES task(task_id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES inventory_item(item_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    issued_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Table (Daily per-worker attendance)
-- FIX: Added UNIQUE(worker_id, date) so ON CONFLICT works correctly
-- FIX: Added 'Half Day' (with space) to status CHECK — frontend sends "Half Day" not "Half_Day"
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES worker(worker_id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Half Day', 'Half_Day', 'Leave', 'Holiday')),
    hours_worked NUMERIC(5, 2) DEFAULT 0,
    labor_cost NUMERIC(15, 2) DEFAULT 0.00,
    recorded_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (worker_id, date)
);

-- Finance Table (Expenses, Revenue, Salary Payouts)
CREATE TABLE finance (
    finance_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    cost_category VARCHAR(100),
    amount NUMERIC(15, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker Leave System
CREATE TABLE leave_application (
    leave_id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES worker(worker_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
    reviewed_on TIMESTAMP
);

-- Notifications Table (DB-backed notification system)
-- FIX: Previously notifications were only in-memory — this makes them persistent
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(100) DEFAULT 'general',
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------
-- 3. SAMPLE DATA
--------------------------------------------------

INSERT INTO project (project_name, site_location, project_type, start_date, budget, status)
VALUES ('Downtown Commercial Tower', '1200 NY Ave', 'Commercial', CURRENT_DATE, 5000000.00, 'Active');

INSERT INTO inventory_item (item_name, category, uom, unit_cost, min_stock_qty, current_stock, supplier)
VALUES 
('Portland Cement', 'Materials', 'Bags', 450.00, 100, 500, 'Ambuja Cements'),
('TMT Steel Bars', 'Materials', 'Tons', 65000.00, 5, 20, 'Tata Steel');
