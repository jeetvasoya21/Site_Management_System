/**
 * Seed Script for SiteOS Enterprise
 * Run: node seed_data.js
 * 
 * This inserts 10+ rows into every table with realistic Indian construction data.
 * Users are created via the model so passwords are properly hashed.
 * All other tables use direct SQL inserts.
 * 
 * DEFAULT PASSWORD for all users: Test@1234
 */

require('dotenv').config();
const pool = require('./config/db');
const User = require('./models/User');

const PASSWORD = 'Test@1234';

async function seed() {
  console.log('🌱 Starting database seed...\n');

  // ──────────────────────────────────────────
  // 1. USERS (12 users across all roles)
  // ──────────────────────────────────────────
  console.log('👤 Creating users...');
  const users = [
    { name: 'Rajesh Kumar',     email: 'admin@siteos.in',         role: 'Admin',           phone: '98765-10001' },
    { name: 'Sunita Sharma',    email: 'admin2@siteos.in',        role: 'Admin',           phone: '98765-10002' },
    { name: 'Vikram Mehta',     email: 'pm1@siteos.in',           role: 'Project_Manager', phone: '98765-20001' },
    { name: 'Priya Patel',      email: 'pm2@siteos.in',           role: 'Project_Manager', phone: '98765-20002' },
    { name: 'Amit Joshi',       email: 'se1@siteos.in',           role: 'Site_Engineer',   phone: '98765-30001' },
    { name: 'Neha Verma',       email: 'se2@siteos.in',           role: 'Site_Engineer',   phone: '98765-30002' },
    { name: 'Suresh Yadav',     email: 'se3@siteos.in',           role: 'Site_Engineer',   phone: '98765-30003' },
    { name: 'Rakesh Patel',     email: 'worker1@siteos.in',       role: 'Worker',          phone: '98980-11111' },
    { name: 'Jignesh Chauhan',  email: 'worker2@siteos.in',       role: 'Worker',          phone: '98980-22222' },
    { name: 'Mehul Shah',       email: 'worker3@siteos.in',       role: 'Worker',          phone: '98980-33333' },
    { name: 'Amit Solanki',     email: 'worker4@siteos.in',       role: 'Worker',          phone: '98980-44444' },
    { name: 'Bhavesh Desai',    email: 'worker5@siteos.in',       role: 'Worker',          phone: '98980-66666' },
  ];

  const createdUsers = [];
  for (const u of users) {
    try {
      const created = await User.create({ ...u, password: PASSWORD });
      createdUsers.push(created);
      console.log(`  ✓ ${created.name} (${created.role})`);
    } catch (err) {
      if (err.code === '23505') {
        console.log(`  ⏭ ${u.name} already exists, skipping`);
        const existing = await User.getByEmail(u.email);
        createdUsers.push(existing);
      } else {
        throw err;
      }
    }
  }

  // ──────────────────────────────────────────
  // 2. PROJECTS (10 projects)
  // ──────────────────────────────────────────
  console.log('\n🏗️  Creating projects...');
  await pool.query(`
    INSERT INTO project (project_name, site_location, project_type, start_date, end_date, budget, status, created_by) VALUES
    ('Gota Housing Block A',      'Gota, Ahmedabad',          'Residential',     '2025-01-10', '2026-06-30', 12500000.00, 'Active',    ${createdUsers[2].user_id}),
    ('Metro Depot Shed',          'Sachin, Surat',            'Infrastructure',  '2025-02-01', '2026-12-31', 6500000.00,  'Active',    ${createdUsers[2].user_id}),
    ('Switchgear Panel Upgrade',  'Makarpura, Vadodara',      'Commercial',      '2025-03-05', '2025-12-31', 2800000.00,  'Active',    ${createdUsers[3].user_id}),
    ('Smart Housing Complex',     'Naranpura, Ahmedabad',     'Residential',     '2025-04-01', '2027-03-31', 32000000.00, 'Active',    ${createdUsers[3].user_id}),
    ('Highway Bridge Rehab',      'Anand–Nadiad Highway',     'Infrastructure',  '2025-05-15', '2026-05-14', 18500000.00, 'Planning',  ${createdUsers[2].user_id}),
    ('Corporate Tower Phase 2',   'SG Highway, Ahmedabad',    'Commercial',      '2025-06-01', '2027-06-01', 45000000.00, 'Planning',  ${createdUsers[3].user_id}),
    ('Village School Renovation', 'Dholka, Ahmedabad',        'Residential',     '2025-01-20', '2025-07-31', 1200000.00,  'Completed', ${createdUsers[2].user_id}),
    ('Water Tank Construction',   'Gandhinagar',              'Infrastructure',  '2025-03-01', '2025-09-30', 3500000.00,  'Active',    ${createdUsers[2].user_id}),
    ('Mall Interior Fitout',      'CG Road, Ahmedabad',       'Commercial',      '2025-07-01', '2026-01-31', 8000000.00,  'Active',    ${createdUsers[3].user_id}),
    ('Solar Farm Mounting',       'Charanka, Patan',          'Infrastructure',  '2025-08-01', '2026-03-31', 5600000.00,  'Planning',  ${createdUsers[2].user_id})
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 10 projects inserted');

  // ──────────────────────────────────────────
  // 3. WORKERS (12 workers — linked to users 8–12 + extras)
  // ──────────────────────────────────────────
  console.log('\n👷 Creating workers...');
  await pool.query(`
    INSERT INTO worker (user_id, project_id, name, skill_type, contact, rate_type, base_rate, salary) VALUES
    (${createdUsers[7].user_id},  1, 'Rakesh Patel',      'Mason',        '98980-11111', 'Daily',   900.00,  27000),
    (${createdUsers[8].user_id},  1, 'Jignesh Chauhan',   'Helper',       '98980-22222', 'Daily',   600.00,  18000),
    (${createdUsers[9].user_id},  2, 'Mehul Shah',        'Welder',       '98980-33333', 'Hourly',  120.00,  19200),
    (${createdUsers[10].user_id}, 2, 'Amit Solanki',      'Electrician',  '98980-44444', 'Hourly',  150.00,  24000),
    (${createdUsers[11].user_id}, 3, 'Bhavesh Desai',     'Electrician',  '98980-66666', 'Hourly',  140.00,  22400),
    (NULL,                        1, 'Kiran Rathod',      'Plumber',      '98980-55555', 'Daily',   850.00,  25500),
    (NULL,                        3, 'Dinesh Parmar',     'Carpenter',    '98980-77777', 'Daily',   800.00,  24000),
    (NULL,                        4, 'Sanjay Thakor',     'Mason',        '98980-88888', 'Daily',   950.00,  28500),
    (NULL,                        4, 'Ramesh Bharwad',    'Painter',      '98980-99999', 'Daily',   700.00,  21000),
    (NULL,                        2, 'Gopal Vankar',      'Helper',       '98980-10101', 'Hourly',  80.00,   12800),
    (NULL,                        5, 'Prakash Solanki',   'Steel Fixer',  '98980-20202', 'Daily',   1000.00, 30000),
    (NULL,                        1, 'Harish Makwana',    'Tiler',        '98980-30303', 'Daily',   750.00,  22500)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 12 workers inserted');

  // ──────────────────────────────────────────
  // 4. TASKS (15 tasks across projects)
  // ──────────────────────────────────────────
  console.log('\n📋 Creating tasks...');
  await pool.query(`
    INSERT INTO task (project_id, task_name, assigned_to, start_date, end_date, status, priority, due_date, progress) VALUES
    (1, 'Foundation Excavation',       ${createdUsers[4].user_id}, '2025-01-15', '2025-02-15', 'Completed',   'High',     '2025-02-15', 100),
    (1, 'RCC Column Casting',          ${createdUsers[4].user_id}, '2025-02-20', '2025-04-20', 'In_Progress', 'High',     '2025-04-20', 65),
    (1, 'Brick Wall Construction',     ${createdUsers[4].user_id}, '2025-04-25', '2025-07-25', 'Open',        'Medium',   '2025-07-25', 0),
    (1, 'Plumbing Rough-In',           ${createdUsers[5].user_id}, '2025-05-01', '2025-06-30', 'Open',        'Medium',   '2025-06-30', 0),
    (2, 'Steel Structure Erection',    ${createdUsers[5].user_id}, '2025-02-10', '2025-05-10', 'In_Progress', 'Critical', '2025-05-10', 40),
    (2, 'Roofing Sheet Installation',  ${createdUsers[5].user_id}, '2025-05-15', '2025-07-15', 'Open',        'High',     '2025-07-15', 0),
    (3, 'Panel Wiring Phase 1',        ${createdUsers[6].user_id}, '2025-03-10', '2025-06-10', 'In_Progress', 'High',     '2025-06-10', 55),
    (3, 'Panel Testing & QC',          ${createdUsers[6].user_id}, '2025-06-15', '2025-08-15', 'Open',        'Medium',   '2025-08-15', 0),
    (4, 'Site Clearing & Leveling',    ${createdUsers[4].user_id}, '2025-04-05', '2025-05-05', 'Completed',   'High',     '2025-05-05', 100),
    (4, 'Pile Foundation',             ${createdUsers[4].user_id}, '2025-05-10', '2025-08-10', 'In_Progress', 'Critical', '2025-08-10', 30),
    (5, 'Bridge Pier Inspection',      ${createdUsers[5].user_id}, '2025-06-01', '2025-07-01', 'Open',        'High',     '2025-07-01', 0),
    (7, 'Roof Waterproofing',          ${createdUsers[6].user_id}, '2025-02-01', '2025-03-15', 'Completed',   'Medium',   '2025-03-15', 100),
    (7, 'Classroom Painting',          ${createdUsers[6].user_id}, '2025-03-20', '2025-05-20', 'Completed',   'Low',      '2025-05-20', 100),
    (8, 'Tank Foundation',             ${createdUsers[5].user_id}, '2025-03-10', '2025-05-10', 'In_Progress', 'High',     '2025-05-10', 70),
    (9, 'False Ceiling Installation',  ${createdUsers[4].user_id}, '2025-07-10', '2025-09-10', 'Open',        'Medium',   '2025-09-10', 0)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 15 tasks inserted');

  // ──────────────────────────────────────────
  // 5. INVENTORY ITEMS (12 items)
  // ──────────────────────────────────────────
  console.log('\n📦 Creating inventory items...');
  await pool.query(`
    INSERT INTO inventory_item (item_name, category, uom, unit_cost, min_stock_qty, current_stock, supplier) VALUES
    ('OPC 53 Cement',          'Materials', 'Bags',    380.00,  100, 520,   'UltraTech Cement'),
    ('TMT Steel 12mm',        'Materials', 'Tons',    62000.00, 5,  18,    'Tata Tiscon'),
    ('TMT Steel 8mm',         'Materials', 'Tons',    60000.00, 3,  8,     'Tata Tiscon'),
    ('River Sand',             'Materials', 'Cu.m',   1800.00,  20, 45,    'Local Supplier'),
    ('20mm Aggregate',         'Materials', 'Cu.m',   1500.00,  15, 35,    'Ambuja Quarry'),
    ('Red Clay Bricks',        'Materials', 'Pcs',    7.50,     5000, 12000, 'Morbi Bricks'),
    ('AAC Blocks 600x200x150', 'Materials', 'Pcs',    52.00,    1000, 3500,  'Magicrete'),
    ('PVC Pipe 4 inch',        'Plumbing',  'Meters', 180.00,   50,  120,   'Astral Pipes'),
    ('Electrical Cable 2.5mm', 'Electrical','Meters', 22.00,    200, 450,   'Havells'),
    ('GI Binding Wire',        'Materials', 'Kg',     85.00,    50,  90,    'Local Supplier'),
    ('Waterproof Membrane',    'Chemicals', 'Sq.m',   120.00,   100, 40,    'Dr. Fixit'),
    ('Ready Mix Concrete M25', 'Materials', 'Cu.m',   5500.00,  10,  25,    'ACC RMX')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 12 inventory items inserted');

  // ──────────────────────────────────────────
  // 6. VENDORS (10 vendors)
  // ──────────────────────────────────────────
  console.log('\n🏪 Creating vendors...');
  await pool.query(`
    INSERT INTO vendor (vendor_name, contact, email, address, rating) VALUES
    ('UltraTech Cement Ltd',   '079-2345-6789', 'sales@ultratech.in',     'GIDC Sanand, Ahmedabad',        4.5),
    ('Tata Tiscon (Tata Steel)', '079-6789-0123', 'orders@tatasteel.com',  'Narol Industrial Area, Ahmedabad', 4.8),
    ('Ambuja Cements Ltd',     '079-3456-7890', 'supply@ambuja.com',      'Chandkheda, Ahmedabad',          4.2),
    ('Astral Pipes Ltd',       '079-4567-8901', 'b2b@astralpipes.com',    'Santej, Gandhinagar',            4.6),
    ('Havells India Ltd',      '079-5678-9012', 'dealer@havells.com',     'Vatva GIDC, Ahmedabad',          4.4),
    ('Magicrete Building',     '022-6789-0123', 'info@magicrete.in',      'Kalol, North Gujarat',           4.0),
    ('Morbi Bricks Traders',   '98251-34567',   'morbibricks@gmail.com',  'Morbi, Rajkot',                   3.8),
    ('ACC Ready Mix',          '079-7890-1234', 'rmx@acclimited.com',     'Navrangpura, Ahmedabad',         4.3),
    ('Dr. Fixit (Pidilite)',   '079-8901-2345', 'waterproof@pidilite.com','Odhav, Ahmedabad',               4.7),
    ('Gujarat Electrical Co.', '079-9012-3456', 'info@gujelectrical.in',  'Relief Road, Ahmedabad',         3.9)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 10 vendors inserted');

  // ──────────────────────────────────────────
  // 7. PROCUREMENT (12 purchase orders)
  // ──────────────────────────────────────────
  console.log('\n🛒 Creating procurement orders...');
  await pool.query(`
    INSERT INTO procurement (procurement_id, project_id, vendor_id, item_id, quantity, unit_price, delivery_status, expected_delivery, delivered_at, created_by) VALUES
    ('PO-2025-001', 1, 1, 1,  200, 380.00,   'delivered', '2025-01-20', '2025-01-19', ${createdUsers[2].user_id}),
    ('PO-2025-002', 1, 2, 2,  5,   62000.00, 'delivered', '2025-01-25', '2025-01-24', ${createdUsers[2].user_id}),
    ('PO-2025-003', 1, 6, 6,  8000,7.50,     'delivered', '2025-02-05', '2025-02-04', ${createdUsers[2].user_id}),
    ('PO-2025-004', 2, 2, 3,  10,  60000.00, 'delivered', '2025-02-15', '2025-02-16', ${createdUsers[3].user_id}),
    ('PO-2025-005', 2, 1, 1,  150, 380.00,   'shipped',   '2025-04-10', NULL,         ${createdUsers[3].user_id}),
    ('PO-2025-006', 3, 5, 9,  300, 22.00,    'delivered', '2025-03-20', '2025-03-19', ${createdUsers[3].user_id}),
    ('PO-2025-007', 3, 10,9,  200, 22.00,    'ordered',   '2025-06-20', NULL,         ${createdUsers[3].user_id}),
    ('PO-2025-008', 4, 1, 1,  500, 380.00,   'ordered',   '2025-05-20', NULL,         ${createdUsers[2].user_id}),
    ('PO-2025-009', 4, 3, 5,  30,  1500.00,  'ordered',   '2025-05-25', NULL,         ${createdUsers[2].user_id}),
    ('PO-2025-010', 8, 8, 12, 15,  5500.00,  'delivered', '2025-03-20', '2025-03-21', ${createdUsers[2].user_id}),
    ('PO-2025-011', 1, 4, 8,  80,  180.00,   'shipped',   '2025-05-01', NULL,         ${createdUsers[2].user_id}),
    ('PO-2025-012', 9, 7, 7,  2000,52.00,    'ordered',   '2025-07-20', NULL,         ${createdUsers[3].user_id})
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 12 procurement orders inserted');

  // ──────────────────────────────────────────
  // 8. MATERIAL ISSUE (12 issues)
  // ──────────────────────────────────────────
  console.log('\n📤 Creating material issues...');
  await pool.query(`
    INSERT INTO material_issue (project_id, task_id, item_id, quantity, issued_by) VALUES
    (1, 1, 1,  80,  ${createdUsers[4].user_id}),
    (1, 1, 2,  2,   ${createdUsers[4].user_id}),
    (1, 2, 1,  60,  ${createdUsers[4].user_id}),
    (1, 2, 2,  3,   ${createdUsers[4].user_id}),
    (1, 3, 6,  3000,${createdUsers[4].user_id}),
    (2, 5, 3,  4,   ${createdUsers[5].user_id}),
    (2, 5, 10, 20,  ${createdUsers[5].user_id}),
    (3, 7, 9,  150, ${createdUsers[6].user_id}),
    (4, 9, 1,  100, ${createdUsers[4].user_id}),
    (4, 10,2,  5,   ${createdUsers[4].user_id}),
    (7, 12,11, 30,  ${createdUsers[6].user_id}),
    (8, 14,12, 10,  ${createdUsers[5].user_id})
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 12 material issues inserted');

  // ──────────────────────────────────────────
  // 9. ATTENDANCE (30 records — multiple workers, dates)
  // ──────────────────────────────────────────
  console.log('\n📅 Creating attendance records...');
  await pool.query(`
    INSERT INTO attendance (worker_id, project_id, date, status, hours_worked, labor_cost, recorded_by) VALUES
    (1, 1, '2025-04-01', 'Present',  8, 900.00,  ${createdUsers[4].user_id}),
    (1, 1, '2025-04-02', 'Present',  8, 900.00,  ${createdUsers[4].user_id}),
    (1, 1, '2025-04-03', 'Half_Day', 4, 450.00,  ${createdUsers[4].user_id}),
    (1, 1, '2025-04-04', 'Present',  8, 900.00,  ${createdUsers[4].user_id}),
    (1, 1, '2025-04-05', 'Absent',   0, 0.00,    ${createdUsers[4].user_id}),
    (2, 1, '2025-04-01', 'Present',  8, 600.00,  ${createdUsers[4].user_id}),
    (2, 1, '2025-04-02', 'Present',  8, 600.00,  ${createdUsers[4].user_id}),
    (2, 1, '2025-04-03', 'Present',  8, 600.00,  ${createdUsers[4].user_id}),
    (2, 1, '2025-04-04', 'Absent',   0, 0.00,    ${createdUsers[4].user_id}),
    (2, 1, '2025-04-05', 'Present',  8, 600.00,  ${createdUsers[4].user_id}),
    (3, 2, '2025-04-01', 'Present',  8, 960.00,  ${createdUsers[5].user_id}),
    (3, 2, '2025-04-02', 'Present',  6, 720.00,  ${createdUsers[5].user_id}),
    (3, 2, '2025-04-03', 'Present',  8, 960.00,  ${createdUsers[5].user_id}),
    (4, 2, '2025-04-01', 'Present',  8, 1200.00, ${createdUsers[5].user_id}),
    (4, 2, '2025-04-02', 'Half_Day', 4, 600.00,  ${createdUsers[5].user_id}),
    (4, 2, '2025-04-03', 'Present',  8, 1200.00, ${createdUsers[5].user_id}),
    (5, 3, '2025-04-01', 'Present',  8, 1120.00, ${createdUsers[6].user_id}),
    (5, 3, '2025-04-02', 'Present',  8, 1120.00, ${createdUsers[6].user_id}),
    (5, 3, '2025-04-03', 'Absent',   0, 0.00,    ${createdUsers[6].user_id}),
    (6, 1, '2025-04-01', 'Present',  8, 850.00,  ${createdUsers[4].user_id}),
    (6, 1, '2025-04-02', 'Present',  8, 850.00,  ${createdUsers[4].user_id}),
    (7, 3, '2025-04-01', 'Present',  8, 800.00,  ${createdUsers[6].user_id}),
    (7, 3, '2025-04-02', 'Present',  8, 800.00,  ${createdUsers[6].user_id}),
    (8, 4, '2025-04-01', 'Present',  8, 950.00,  ${createdUsers[4].user_id}),
    (8, 4, '2025-04-02', 'Present',  8, 950.00,  ${createdUsers[4].user_id}),
    (8, 4, '2025-04-03', 'Present',  8, 950.00,  ${createdUsers[4].user_id}),
    (9, 4, '2025-04-01', 'Present',  8, 700.00,  ${createdUsers[4].user_id}),
    (9, 4, '2025-04-02', 'Absent',   0, 0.00,    ${createdUsers[4].user_id}),
    (10,2, '2025-04-01', 'Present',  8, 640.00,  ${createdUsers[5].user_id}),
    (10,2, '2025-04-02', 'Present',  8, 640.00,  ${createdUsers[5].user_id})
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 30 attendance records inserted');

  // ──────────────────────────────────────────
  // 10. FINANCE (15 records across projects)
  // ──────────────────────────────────────────
  console.log('\n💰 Creating finance records...');
  await pool.query(`
    INSERT INTO finance (project_id, cost_category, amount, date, description, payment_status, source) VALUES
    (1, 'Material',    76000.00,   '2025-01-20', 'Cement purchase PO-001',              'Paid',    'procurement'),
    (1, 'Material',    310000.00,  '2025-01-25', 'TMT Steel 12mm purchase PO-002',      'Paid',    'procurement'),
    (1, 'Material',    60000.00,   '2025-02-05', 'Bricks purchase PO-003',              'Paid',    'procurement'),
    (1, 'Labor',       45000.00,   '2025-04-05', 'Weekly labor payout — Week 14',       'Paid',    'salary'),
    (1, 'Equipment',   18000.00,   '2025-03-01', 'Excavator rental — 3 days',           'Paid',    'manual'),
    (2, 'Material',    600000.00,  '2025-02-16', 'Steel 8mm PO-004',                    'Paid',    'procurement'),
    (2, 'Labor',       28800.00,   '2025-04-05', 'Weekly labor payout — Week 14',       'Paid',    'salary'),
    (2, 'Equipment',   35000.00,   '2025-03-15', 'Crane rental — 5 days',               'Paid',    'manual'),
    (3, 'Material',    6600.00,    '2025-03-20', 'Electrical cable PO-006',             'Paid',    'procurement'),
    (3, 'Labor',       19200.00,   '2025-04-05', 'Weekly labor payout — Week 14',       'Pending', 'salary'),
    (4, 'Material',    190000.00,  '2025-05-01', 'Cement advance for pile foundation',  'Pending', 'procurement'),
    (4, 'Labor',       38500.00,   '2025-04-05', 'Weekly labor payout — Week 14',       'Paid',    'salary'),
    (7, 'Material',    3600.00,    '2025-03-01', 'Waterproofing membrane',              'Paid',    'manual'),
    (7, 'Labor',       12000.00,   '2025-05-25', 'Final labor settlement',              'Paid',    'salary'),
    (8, 'Material',    82500.00,   '2025-03-22', 'RMX Concrete PO-010',                'Paid',    'procurement')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 15 finance records inserted');

  // ──────────────────────────────────────────
  // 11. LEAVE APPLICATIONS (10 records)
  // ──────────────────────────────────────────
  console.log('\n🏖️  Creating leave applications...');
  await pool.query(`
    INSERT INTO leave_application (worker_id, start_date, end_date, reason, status, reviewed_by) VALUES
    (1,  '2025-04-10', '2025-04-12', 'Family wedding in village',          'Approved',  ${createdUsers[4].user_id}),
    (2,  '2025-04-15', '2025-04-15', 'Medical appointment',               'Approved',  ${createdUsers[4].user_id}),
    (3,  '2025-04-20', '2025-04-22', 'Personal work — home town visit',   'Pending',   NULL),
    (4,  '2025-05-01', '2025-05-03', 'Holi festival travel',              'Approved',  ${createdUsers[5].user_id}),
    (5,  '2025-04-18', '2025-04-18', 'Not feeling well',                  'Rejected',  ${createdUsers[6].user_id}),
    (6,  '2025-05-05', '2025-05-07', 'Daughter school admission',         'Pending',   NULL),
    (7,  '2025-04-25', '2025-04-26', 'Government office work',            'Approved',  ${createdUsers[6].user_id}),
    (8,  '2025-05-10', '2025-05-14', 'Village farming season',            'Pending',   NULL),
    (9,  '2025-04-28', '2025-04-28', 'Doctor visit for back pain',        'Approved',  ${createdUsers[4].user_id}),
    (10, '2025-05-02', '2025-05-02', 'Child vaccination',                 'Pending',   NULL)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  ✓ 10 leave applications inserted');

  // ──────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('═══════════════════════════════════════════');
  console.log('  LOGIN CREDENTIALS (all same password):');
  console.log('  Password: Test@1234');
  console.log('');
  console.log('  Admin:           admin@siteos.in');
  console.log('  Project Manager: pm1@siteos.in');
  console.log('  Site Engineer:   se1@siteos.in');
  console.log('  Worker:          worker1@siteos.in');
  console.log('═══════════════════════════════════════════\n');

  await pool.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
