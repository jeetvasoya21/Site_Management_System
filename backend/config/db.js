const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const ensureSchema = async () => {
  try {
    // 1. User
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Site_Engineer',
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Project
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project (
        project_id SERIAL PRIMARY KEY,
        project_name VARCHAR(255) NOT NULL,
        site_location VARCHAR(255),
        project_type VARCHAR(100),
        start_date DATE,
        end_date DATE,
        budget NUMERIC(15, 2),
        status VARCHAR(50) DEFAULT 'Active',
        created_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE project ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
    `);

    // 3. Task
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task (
        task_id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
        task_name VARCHAR(255) NOT NULL,
        assigned_to INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'Open',
        priority VARCHAR(50) DEFAULT 'Medium',
        due_date DATE,
        deadline DATE,
        progress INTEGER DEFAULT 0,
        workers_assigned JSONB DEFAULT '[]'::jsonb,
        materials_used JSONB DEFAULT '[]'::jsonb,
        dependencies JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE task ADD COLUMN IF NOT EXISTS priority VARCHAR(50) DEFAULT 'Medium';
      ALTER TABLE task ADD COLUMN IF NOT EXISTS due_date DATE;
      ALTER TABLE task ADD COLUMN IF NOT EXISTS deadline DATE;
      ALTER TABLE task ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
      ALTER TABLE task ADD COLUMN IF NOT EXISTS workers_assigned JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE task ADD COLUMN IF NOT EXISTS materials_used JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE task ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;
    `);

    // 4. Worker
    await pool.query(`
      CREATE TABLE IF NOT EXISTS worker (
        worker_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        project_id INTEGER REFERENCES project(project_id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        skill_type VARCHAR(100),
        contact VARCHAR(50),
        rate_type VARCHAR(50),
        base_rate NUMERIC(10, 2),
        salary NUMERIC(15, 2) DEFAULT 0,
        attendance JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE worker ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL;
      ALTER TABLE worker ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES project(project_id) ON DELETE SET NULL;
      ALTER TABLE worker ADD COLUMN IF NOT EXISTS salary NUMERIC(15, 2) DEFAULT 0;
      ALTER TABLE worker ADD COLUMN IF NOT EXISTS attendance JSONB DEFAULT '[]'::jsonb;
    `);

    // 5. Inventory Items
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_item (
        item_id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        uom VARCHAR(50),
        unit_cost NUMERIC(10, 2),
        min_stock_qty INTEGER DEFAULT 0,
        current_stock INTEGER DEFAULT 0,
        supplier VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Vendor
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor (
        vendor_id SERIAL PRIMARY KEY,
        vendor_name VARCHAR(255) NOT NULL,
        contact VARCHAR(50),
        email VARCHAR(255),
        address TEXT,
        rating NUMERIC(3, 1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Procurement
    await pool.query(`
      CREATE TABLE IF NOT EXISTS procurement (
        id SERIAL PRIMARY KEY,
        procurement_id VARCHAR(50), 
        project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES vendor(vendor_id) ON DELETE SET NULL,
        item_id INTEGER REFERENCES inventory_item(item_id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(10, 2),
        delivery_status VARCHAR(50) DEFAULT 'ordered',
        expected_delivery DATE,
        delivered_at DATE,
        created_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Material Issue
    await pool.query(`
      CREATE TABLE IF NOT EXISTS material_issue (
        material_issue_id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES task(task_id) ON DELETE CASCADE,
        item_id INTEGER REFERENCES inventory_item(item_id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        issued_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Attendance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES worker(worker_id) ON DELETE CASCADE,
        project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
        date DATE NOT NULL,
        status VARCHAR(50),
        hours_worked INTEGER DEFAULT 0,
        labor_cost NUMERIC(12, 2) DEFAULT 0,
        recorded_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Finance
    await pool.query(`
      CREATE TABLE IF NOT EXISTS finance (
        finance_id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
        cost_category VARCHAR(100),
        amount NUMERIC(15, 2),
        date DATE,
        description TEXT,
        payment_status VARCHAR(50) DEFAULT 'Pending',
        source VARCHAR(50) DEFAULT 'manual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Leave Application
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leave_application (
        leave_id SERIAL PRIMARY KEY,
        worker_id INTEGER REFERENCES worker(worker_id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_by INTEGER REFERENCES "User"(user_id) ON DELETE SET NULL,
        reviewed_on TIMESTAMP
      );
    `);

    // 12. Project Members (assign site engineers to projects)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project(project_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES "User"(user_id) ON DELETE CASCADE,
        project_role VARCHAR(50) DEFAULT 'Site_Engineer',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );
    `);

    // Add unique constraint on attendance (worker+date) for upsert
    await pool.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'attendance_worker_date_unique'
        ) THEN
          ALTER TABLE attendance ADD CONSTRAINT attendance_worker_date_unique UNIQUE (worker_id, date);
        END IF;
      END $$;
    `);

    // 13. Add password_reset_count column to User table for reset-limit tracking
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS password_reset_count INTEGER DEFAULT 0;
    `);

    console.log('Database schemas verified properly.');
  } catch (err) {
    console.error('Failed to ensure database schemas:', err);
  }
};

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connection successful');
    ensureSchema().catch((schemaErr) => {
      console.error('Schema initialization error:', schemaErr);
    });
  }
});

module.exports = pool;