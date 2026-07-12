import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── ROLES ─────────────────────────────────────────
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'ADMIN' }, update: {}, create: { name: 'ADMIN', label: 'Administrator' } }),
    prisma.role.upsert({ where: { name: 'ASSET_MANAGER' }, update: {}, create: { name: 'ASSET_MANAGER', label: 'Asset Manager' } }),
    prisma.role.upsert({ where: { name: 'DEPARTMENT_HEAD' }, update: {}, create: { name: 'DEPARTMENT_HEAD', label: 'Department Head' } }),
    prisma.role.upsert({ where: { name: 'EMPLOYEE' }, update: {}, create: { name: 'EMPLOYEE', label: 'Employee' } }),
  ]);
  console.log('✅ Roles created');

  const [adminRole, assetMgrRole, deptHeadRole, employeeRole] = roles;
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  // ─── DEPARTMENTS ───────────────────────────────────
  const departments = await Promise.all([
    prisma.department.upsert({ where: { code: 'IT' }, update: {}, create: { name: 'Information Technology', code: 'IT', description: 'IT department managing technology infrastructure' } }),
    prisma.department.upsert({ where: { code: 'HR' }, update: {}, create: { name: 'Human Resources', code: 'HR', description: 'People management and recruitment' } }),
    prisma.department.upsert({ where: { code: 'FIN' }, update: {}, create: { name: 'Finance', code: 'FIN', description: 'Financial operations and accounting' } }),
    prisma.department.upsert({ where: { code: 'OPS' }, update: {}, create: { name: 'Operations', code: 'OPS', description: 'Business operations and logistics' } }),
    prisma.department.upsert({ where: { code: 'MKT' }, update: {}, create: { name: 'Marketing', code: 'MKT', description: 'Marketing and communications' } }),
    prisma.department.upsert({ where: { code: 'ENG' }, update: {}, create: { name: 'Engineering', code: 'ENG', description: 'Product engineering and development' } }),
  ]);
  console.log('✅ Departments created');

  const [itDept, hrDept, finDept, opsDept, mktDept, engDept] = departments;

  // ─── USERS ─────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetflow.com' },
    update: {},
    create: {
      email: 'admin@assetflow.com', password: hashedPassword,
      firstName: 'System', lastName: 'Admin', employeeId: 'EMP-0001',
      roleId: adminRole.id, departmentId: itDept.id, isEmailVerified: true,
    },
  });

  const assetMgr = await prisma.user.upsert({
    where: { email: 'manager@assetflow.com' },
    update: {},
    create: {
      email: 'manager@assetflow.com', password: hashedPassword,
      firstName: 'Asset', lastName: 'Manager', employeeId: 'EMP-0002',
      roleId: assetMgrRole.id, departmentId: opsDept.id, isEmailVerified: true,
    },
  });

  const deptHead = await prisma.user.upsert({
    where: { email: 'head@assetflow.com' },
    update: {},
    create: {
      email: 'head@assetflow.com', password: hashedPassword,
      firstName: 'Department', lastName: 'Head', employeeId: 'EMP-0003',
      roleId: deptHeadRole.id, departmentId: engDept.id, isEmailVerified: true,
    },
  });

  const employees = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john@assetflow.com' }, update: {},
      create: { email: 'john@assetflow.com', password: hashedPassword, firstName: 'John', lastName: 'Doe', employeeId: 'EMP-0004', roleId: employeeRole.id, departmentId: engDept.id, isEmailVerified: true, managerId: deptHead.id },
    }),
    prisma.user.upsert({
      where: { email: 'jane@assetflow.com' }, update: {},
      create: { email: 'jane@assetflow.com', password: hashedPassword, firstName: 'Jane', lastName: 'Smith', employeeId: 'EMP-0005', roleId: employeeRole.id, departmentId: itDept.id, isEmailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: 'bob@assetflow.com' }, update: {},
      create: { email: 'bob@assetflow.com', password: hashedPassword, firstName: 'Bob', lastName: 'Wilson', employeeId: 'EMP-0006', roleId: employeeRole.id, departmentId: mktDept.id, isEmailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: 'alice@assetflow.com' }, update: {},
      create: { email: 'alice@assetflow.com', password: hashedPassword, firstName: 'Alice', lastName: 'Johnson', employeeId: 'EMP-0007', roleId: employeeRole.id, departmentId: hrDept.id, isEmailVerified: true },
    }),
    prisma.user.upsert({
      where: { email: 'charlie@assetflow.com' }, update: {},
      create: { email: 'charlie@assetflow.com', password: hashedPassword, firstName: 'Charlie', lastName: 'Brown', employeeId: 'EMP-0008', roleId: employeeRole.id, departmentId: finDept.id, isEmailVerified: true },
    }),
  ]);
  console.log('✅ Users created');

  // Update department heads
  await prisma.department.update({ where: { id: itDept.id }, data: { headId: admin.id } });
  await prisma.department.update({ where: { id: engDept.id }, data: { headId: deptHead.id } });

  // ─── ASSET CATEGORIES ──────────────────────────────
  const categories = await Promise.all([
    prisma.assetCategory.upsert({ where: { name: 'Electronics' }, update: {}, create: { name: 'Electronics', description: 'Electronic devices and gadgets', icon: 'Monitor', customFields: JSON.stringify([{ name: 'warranty', label: 'Warranty Period', type: 'text' }, { name: 'brand', label: 'Brand', type: 'text' }]) } }),
    prisma.assetCategory.upsert({ where: { name: 'Furniture' }, update: {}, create: { name: 'Furniture', description: 'Office furniture and fixtures', icon: 'Armchair', customFields: JSON.stringify([{ name: 'material', label: 'Material', type: 'text' }]) } }),
    prisma.assetCategory.upsert({ where: { name: 'Vehicles' }, update: {}, create: { name: 'Vehicles', description: 'Company vehicles', icon: 'Car', customFields: JSON.stringify([{ name: 'registration', label: 'Registration No', type: 'text' }, { name: 'mileage', label: 'Mileage', type: 'number' }]) } }),
    prisma.assetCategory.upsert({ where: { name: 'IT Equipment' }, update: {}, create: { name: 'IT Equipment', description: 'Servers, networking and IT infrastructure', icon: 'Server', customFields: JSON.stringify([{ name: 'ipAddress', label: 'IP Address', type: 'text' }]) } }),
    prisma.assetCategory.upsert({ where: { name: 'Lab Equipment' }, update: {}, create: { name: 'Lab Equipment', description: 'Laboratory instruments and tools', icon: 'FlaskConical' } }),
    prisma.assetCategory.upsert({ where: { name: 'Meeting Rooms' }, update: {}, create: { name: 'Meeting Rooms', description: 'Bookable conference and meeting rooms', icon: 'DoorOpen' } }),
  ]);
  console.log('✅ Categories created');

  const [electronicsCat, furnitureCat, vehiclesCat, itEquipCat, labCat, meetingRoomsCat] = categories;

  // ─── ASSETS ────────────────────────────────────────
  const QRCode = require('qrcode');
  const assetsData = [
    { name: 'MacBook Pro 16"', categoryId: electronicsCat.id, departmentId: engDept.id, serialNumber: 'SN-MBP-001', purchaseDate: new Date('2024-01-15'), acquisitionCost: 2499.00, condition: 'NEW', location: 'Building A, Floor 3', warrantyExpiry: new Date('2027-01-15'), brand: 'Apple', model: 'MacBook Pro M3 Max', vendor: 'Apple Store', assetTag: 'AF-0001', isBookable: false, isShared: false },
    { name: 'MacBook Pro 14"', categoryId: electronicsCat.id, departmentId: engDept.id, serialNumber: 'SN-MBP-002', purchaseDate: new Date('2024-03-10'), acquisitionCost: 1999.00, condition: 'NEW', location: 'Building A, Floor 3', warrantyExpiry: new Date('2027-03-10'), brand: 'Apple', model: 'MacBook Pro M3 Pro', vendor: 'Apple Store', assetTag: 'AF-0002', isBookable: false, isShared: false },
    { name: 'Dell UltraSharp 32" Monitor', categoryId: electronicsCat.id, departmentId: itDept.id, serialNumber: 'SN-MON-001', purchaseDate: new Date('2024-02-20'), acquisitionCost: 899.00, condition: 'NEW', location: 'Building A, Floor 2', brand: 'Dell', model: 'U3223QE', assetTag: 'AF-0003', isBookable: false, isShared: false },
    { name: 'Herman Miller Aeron Chair', categoryId: furnitureCat.id, departmentId: null, serialNumber: 'SN-CHR-001', purchaseDate: new Date('2023-06-01'), acquisitionCost: 1395.00, condition: 'GOOD', location: 'Warehouse', brand: 'Herman Miller', assetTag: 'AF-0004', isBookable: false, isShared: false },
    { name: 'Standing Desk - Electric', categoryId: furnitureCat.id, departmentId: null, serialNumber: 'SN-DSK-001', purchaseDate: new Date('2023-07-15'), acquisitionCost: 699.00, condition: 'GOOD', location: 'Warehouse', brand: 'Uplift', assetTag: 'AF-0005', isBookable: false, isShared: false },
    { name: 'Toyota Camry 2024', categoryId: vehiclesCat.id, departmentId: opsDept.id, serialNumber: 'VIN-TCM-001', purchaseDate: new Date('2024-01-01'), acquisitionCost: 28000.00, condition: 'NEW', location: 'Parking Lot B', brand: 'Toyota', model: 'Camry', assetTag: 'AF-0006', isBookable: true, isShared: true },
    { name: 'Dell PowerEdge R750', categoryId: itEquipCat.id, departmentId: itDept.id, serialNumber: 'SN-SRV-001', purchaseDate: new Date('2024-04-01'), acquisitionCost: 12500.00, condition: 'NEW', location: 'Server Room A', brand: 'Dell', model: 'PowerEdge R750', assetTag: 'AF-0007', isBookable: false, isShared: false },
    { name: 'Cisco Switch 48-Port', categoryId: itEquipCat.id, departmentId: itDept.id, serialNumber: 'SN-NET-001', purchaseDate: new Date('2024-02-15'), acquisitionCost: 3200.00, condition: 'NEW', location: 'Server Room A', brand: 'Cisco', model: 'Catalyst 9300', assetTag: 'AF-0008', isBookable: false, isShared: false },
    { name: 'Conference Room A - Main', categoryId: meetingRoomsCat.id, departmentId: null, serialNumber: null, purchaseDate: null, acquisitionCost: null, condition: 'GOOD', location: 'Building A, Floor 1', assetTag: 'AF-0009', isBookable: true, isShared: true },
    { name: 'Conference Room B - Small', categoryId: meetingRoomsCat.id, departmentId: null, serialNumber: null, purchaseDate: null, acquisitionCost: null, condition: 'GOOD', location: 'Building A, Floor 2', assetTag: 'AF-0010', isBookable: true, isShared: true },
    { name: 'Epson Projector 4K', categoryId: electronicsCat.id, departmentId: null, serialNumber: 'SN-PRJ-001', purchaseDate: new Date('2024-05-01'), acquisitionCost: 1299.00, condition: 'NEW', location: 'AV Storage', brand: 'Epson', model: 'Pro EX11000', assetTag: 'AF-0011', isBookable: true, isShared: true },
    { name: 'iPad Pro 12.9"', categoryId: electronicsCat.id, departmentId: mktDept.id, serialNumber: 'SN-IPD-001', purchaseDate: new Date('2024-06-15'), acquisitionCost: 1099.00, condition: 'NEW', location: 'Building A, Floor 4', brand: 'Apple', model: 'iPad Pro M2', assetTag: 'AF-0012', isBookable: true, isShared: false },
    { name: 'HP Color LaserJet Pro', categoryId: electronicsCat.id, departmentId: null, serialNumber: 'SN-PRT-001', purchaseDate: new Date('2023-11-01'), acquisitionCost: 549.00, condition: 'GOOD', location: 'Print Room', brand: 'HP', model: 'M479fdw', assetTag: 'AF-0013', isBookable: false, isShared: true },
    { name: 'Oscilloscope DSO', categoryId: labCat.id, departmentId: engDept.id, serialNumber: 'SN-OSC-001', purchaseDate: new Date('2023-09-01'), acquisitionCost: 4500.00, condition: 'GOOD', location: 'Lab 101', brand: 'Keysight', model: 'DSOX1204G', assetTag: 'AF-0014', isBookable: true, isShared: true },
    { name: 'ThinkPad X1 Carbon', categoryId: electronicsCat.id, departmentId: finDept.id, serialNumber: 'SN-TP-001', purchaseDate: new Date('2024-02-01'), acquisitionCost: 1899.00, condition: 'NEW', location: 'Building B, Floor 1', brand: 'Lenovo', model: 'X1 Carbon Gen 11', assetTag: 'AF-0015', isBookable: false, isShared: false },
  ];

  for (const assetData of assetsData) {
    const qrCode = await QRCode.toDataURL(assetData.assetTag, { width: 300, margin: 2 });
    await prisma.asset.upsert({
      where: { assetTag: assetData.assetTag },
      update: {},
      create: { ...assetData, qrCode, createdBy: admin.id },
    });
  }
  console.log('✅ Assets created');

  // ─── ALLOCATIONS ───────────────────────────────────
  const asset1 = await prisma.asset.findUnique({ where: { assetTag: 'AF-0001' } });
  const asset2 = await prisma.asset.findUnique({ where: { assetTag: 'AF-0002' } });
  const asset15 = await prisma.asset.findUnique({ where: { assetTag: 'AF-0015' } });

  if (asset1 && asset2 && asset15) {
    await prisma.allocation.create({
      data: {
        assetId: asset1.id, employeeId: employees[0].id, departmentId: engDept.id,
        expectedReturnDate: new Date('2025-12-31'), notes: 'Primary work laptop',
        createdBy: assetMgr.id,
      },
    });
    await prisma.asset.update({ where: { id: asset1.id }, data: { lifecycleStatus: 'ALLOCATED' } });

    await prisma.allocation.create({
      data: {
        assetId: asset2.id, employeeId: employees[1].id, departmentId: itDept.id,
        expectedReturnDate: new Date('2025-06-30'), notes: 'Development laptop',
        createdBy: assetMgr.id,
      },
    });
    await prisma.asset.update({ where: { id: asset2.id }, data: { lifecycleStatus: 'ALLOCATED' } });

    await prisma.allocation.create({
      data: {
        assetId: asset15.id, employeeId: employees[4].id, departmentId: finDept.id,
        expectedReturnDate: new Date('2025-03-15'), notes: 'Finance team laptop',
        allocationStatus: 'OVERDUE',
        createdBy: assetMgr.id,
      },
    });
    await prisma.asset.update({ where: { id: asset15.id }, data: { lifecycleStatus: 'ALLOCATED' } });
  }
  console.log('✅ Allocations created');

  // ─── BOOKINGS ──────────────────────────────────────
  const confRoomA = await prisma.asset.findUnique({ where: { assetTag: 'AF-0009' } });
  const confRoomB = await prisma.asset.findUnique({ where: { assetTag: 'AF-0010' } });

  if (confRoomA && confRoomB) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(11, 0, 0, 0);

    await prisma.booking.create({
      data: {
        assetId: confRoomA.id, bookedBy: employees[0].id,
        title: 'Sprint Planning', description: 'Bi-weekly sprint planning meeting',
        startTime: tomorrow, endTime: tomorrowEnd,
        createdBy: employees[0].id,
      },
    });

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);
    const dayAfterEnd = new Date(dayAfter);
    dayAfterEnd.setHours(15, 30, 0, 0);

    await prisma.booking.create({
      data: {
        assetId: confRoomB.id, bookedBy: employees[2].id,
        title: 'Marketing Review', description: 'Monthly marketing campaign review',
        startTime: dayAfter, endTime: dayAfterEnd,
        createdBy: employees[2].id,
      },
    });
  }
  console.log('✅ Bookings created');

  // ─── MAINTENANCE ───────────────────────────────────
  const printer = await prisma.asset.findUnique({ where: { assetTag: 'AF-0013' } });
  if (printer) {
    await prisma.maintenanceRequest.create({
      data: {
        assetId: printer.id, requestedBy: employees[1].id,
        priority: 'MEDIUM', issueType: 'REPAIR',
        title: 'Paper Jam Issue', description: 'Printer frequently has paper jams. Needs roller cleaning or replacement.',
        workflowStatus: 'PENDING', createdBy: employees[1].id,
      },
    });
  }
  console.log('✅ Maintenance requests created');

  // ─── NOTIFICATIONS ─────────────────────────────────
  for (const emp of employees) {
    await prisma.notification.create({
      data: {
        userId: emp.id, title: 'Welcome to AssetFlow',
        message: 'Welcome! You can now view and manage your assigned assets.',
        type: 'SYSTEM',
      },
    });
  }
  console.log('✅ Notifications created');

  // ─── SETTINGS ──────────────────────────────────────
  const settings = [
    { key: 'company_name', value: 'AssetFlow Inc.', group: 'GENERAL' },
    { key: 'asset_tag_prefix', value: 'AF', group: 'GENERAL' },
    { key: 'overdue_notification_days', value: '3', group: 'NOTIFICATION' },
    { key: 'booking_max_duration_hours', value: '8', group: 'BOOKING' },
    { key: 'maintenance_auto_approve', value: 'false', group: 'MAINTENANCE' },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('✅ Settings created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Users:');
  console.log('  Admin:          admin@assetflow.com   / Admin@123');
  console.log('  Asset Manager:  manager@assetflow.com / Admin@123');
  console.log('  Dept Head:      head@assetflow.com    / Admin@123');
  console.log('  Employee:       john@assetflow.com    / Admin@123');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
