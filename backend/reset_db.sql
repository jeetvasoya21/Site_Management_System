-- Run this SQL script in your PostgreSQL database (e.g. using pgAdmin or psql)
-- This will DROP all existing tables, immediately deleting all previously inserted mock data.
-- 
-- WARNING: This deletes ALL data from these tables.
-- 
-- After running this, re-run siteos_enterprise_schema.sql to recreate all tables.

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS leave_application CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS material_issue CASCADE;
DROP TABLE IF EXISTS materialissue CASCADE;
DROP TABLE IF EXISTS finance CASCADE;
DROP TABLE IF EXISTS procurement CASCADE;
DROP TABLE IF EXISTS vendor CASCADE;
DROP TABLE IF EXISTS inventory_item CASCADE;
DROP TABLE IF EXISTS item CASCADE;
DROP TABLE IF EXISTS worker CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS task CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Schema is now clean. Run siteos_enterprise_schema.sql to recreate all tables.
