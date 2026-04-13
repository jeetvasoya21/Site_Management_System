-- SiteOS Enterprise — Migration SQL
-- Run this on an EXISTING database to apply all schema fixes WITHOUT dropping data.
-- Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING).

-- 1. Fix "User" role CHECK — remove Site_Manager, keep only valid roles
-- PostgreSQL requires dropping and recreating the constraint
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_role_check";
ALTER TABLE "User" ADD CONSTRAINT "User_role_check"
  CHECK (role IN ('Admin', 'Project_Manager', 'Site_Engineer', 'Worker'));

-- 2. Fix attendance status CHECK — add 'Half Day' (space) to allowed values
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check
  CHECK (status IN ('Present', 'Absent', 'Half Day', 'Half_Day', 'Leave', 'Holiday'));

-- 3. Fix hours_worked column type (should be NUMERIC not just INTEGER for half-days)
ALTER TABLE attendance ALTER COLUMN hours_worked TYPE NUMERIC(5,2);

-- 4. Add UNIQUE(worker_id, date) to attendance so ON CONFLICT works correctly
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_worker_id_date_key;
ALTER TABLE attendance ADD CONSTRAINT attendance_worker_id_date_key UNIQUE (worker_id, date);

-- 5. Create project_members table (was missing from original schema)
CREATE TABLE IF NOT EXISTS project_members (
    project_member_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE,
    member_role VARCHAR(50) DEFAULT 'Site_Engineer' CHECK (member_role IN ('Site_Engineer', 'Project_Manager', 'Admin')),
    from_date DATE,
    to_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_id)
);

-- 6. Create notifications table (was missing — notifications were in-memory only)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE,
    title VARCHAR(255),
    message TEXT NOT NULL,
    type VARCHAR(100) DEFAULT 'general',
    severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Update any existing 'Site_Manager' users to 'Site_Engineer' if they exist
UPDATE "User" SET role = 'Site_Engineer' WHERE role = 'Site_Manager';

-- Done!
SELECT 'Migration applied successfully' AS result;
