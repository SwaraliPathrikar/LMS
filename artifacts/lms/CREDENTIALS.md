# Municipal Corporation Library Management System - User Credentials

## System Overview
This is a role-based library management system with three user roles: Admin, Librarian, and Citizen. Each role has specific access and capabilities.

---

## 🔐 Login Credentials

### 1. ADMINISTRATOR
**Role**: Full system access across all libraries and departments

| Field | Value |
|-------|-------|
| **Email** | `admin@corp.gov.in` |
| **Password** | `admin@123` |
| **Name** | Admin |
| **Access** | All libraries, all members, all reports |

**Admin Capabilities:**
- View all members across all library branches
- Manage fines for all libraries
- View system-wide dashboard with KPIs
- Access all reports and analytics
- Manage all events (city-wide)
- View all digital resources

---

### 2. LIBRARIANS
**Role**: Branch-level management with library-specific access

#### Librarian 1 - Central Municipal Library
| Field | Value |
|-------|-------|
| **Email** | `meera.kulkarni@lib.gov.in` |
| **Password** | `librarian@123` |
| **Name** | Dr. Meera Kulkarni |
| **Assigned Library** | Central Municipal Library (lib1) |
| **Access** | Members of lib1, fines for lib1 |

#### Librarian 2 - Vazirabad Branch Library
| Field | Value |
|-------|-------|
| **Email** | `ramesh.patil@lib.gov.in` |
| **Password** | `librarian@456` |
| **Name** | Shri. Ramesh Patil |
| **Assigned Library** | Vazirabad Branch Library (lib2) |
| **Access** | Members of lib2, fines for lib2 |

#### Librarian 3 - Taroda Reading Center
| Field | Value |
|-------|-------|
| **Email** | `anita.joshi@lib.gov.in` |
| **Password** | `librarian@789` |
| **Name** | Smt. Anita Joshi |
| **Assigned Library** | Taroda Reading Center (lib3) |
| **Access** | Members of lib3, fines for lib3 |

**Librarian Capabilities:**
- View only their assigned library's members
- Manage fines for their library only
- View library-specific dashboard
- Create and manage events for their library
- Monitor book inventory for their library
- View circulation transactions for their library

---

### 3. CITIZENS / READERS
**Role**: Personal library account access

#### Citizen 1 - Premium Member
| Field | Value |
|-------|-------|
| **Email** | `rajesh@email.com` |
| **Password** | `citizen@123` |
| **Name** | Rajesh Sharma |
| **Membership ID** | MEM-2024-001 |
| **Type** | Premium |
| **Library** | Central Municipal Library (lib1) |
| **Status** | Active |
| **Borrowed Books** | 3 |
| **Fines Due** | ₹0 |

#### Citizen 2 - Student Member
| Field | Value |
|-------|-------|
| **Email** | `priya@email.com` |
| **Password** | `citizen@456` |
| **Name** | Priya Desai |
| **Membership ID** | MEM-2024-002 |
| **Type** | Student |
| **Library** | Central Municipal Library (lib1) |
| **Status** | Active |
| **Borrowed Books** | 5 |
| **Fines Due** | ₹50 |

#### Citizen 3 - Standard Member
| Field | Value |
|-------|-------|
| **Email** | `amit@email.com` |
| **Password** | `citizen@789` |
| **Name** | Amit Kulkarni |
| **Membership ID** | MEM-2024-003 |
| **Type** | Standard |
| **Library** | Vazirabad Branch Library (lib2) |
| **Status** | Active |
| **Borrowed Books** | 1 |
| **Fines Due** | ₹0 |

**Citizen Capabilities:**
- View personal "My Library Account" dashboard
- See only their own borrowed books
- View and pay only their own fines
- Browse and search books
- Register for events
- View personal notifications
- Cannot see other members' information

---

## 🎯 Role-Based Access Control Summary

| Feature | Admin | Librarian | Citizen |
|---------|-------|-----------|---------|
| **Dashboard** | System-wide KPIs | Library-specific | Personal account |
| **Members List** | All members (all libraries) | Library members only | ❌ No access |
| **Fines Management** | All fines (all libraries) | Library fines only | Own fines only |
| **Events** | Create/manage city-wide | Create/manage for library | Browse & register |
| **Book Search** | All books | All books | All books |
| **Circulation** | View all | View library's | View own |
| **Reports** | System-wide | Library-specific | ❌ No access |

---

## 🚀 Quick Start

1. **For Admin Testing:**
   - Click "Administrator" role
   - Enter: `admin@corp.gov.in` / `admin@123`
   - Or click "Admin" demo button

2. **For Librarian Testing:**
   - Click "Librarian" role
   - Enter: `meera.kulkarni@lib.gov.in` / `librarian@123`
   - Or click "Librarian" demo button
   - Auto-selects Central Municipal Library

3. **For Citizen Testing:**
   - Click "Citizen / Reader" role
   - Enter: `rajesh@email.com` / `citizen@123`
   - Or click "Citizen" demo button
   - See personal dashboard with own data

---

## 📋 Data Consistency

All user credentials are balanced across the system:
- ✅ Citizens have matching member records
- ✅ Librarians are assigned to specific libraries
- ✅ All fines, transactions, and notifications reference correct user IDs
- ✅ Event registrations use correct member IDs
- ✅ Circulation transactions use correct member IDs
- ✅ All data is consistent across the application

---

## 🔒 Security Notes

- Passwords are stored in mock data for demo purposes only
- In production, use proper password hashing and authentication
- Librarians automatically see their assigned library on login
- Citizens can only access their own personal data
- Admin has unrestricted access to all data

---

## 📱 Testing Scenarios

### Scenario 1: Admin Overview
1. Login as Admin
2. View all members across all libraries
3. See system-wide fines and KPIs
4. Access city-wide reports

### Scenario 2: Librarian Management
1. Login as Librarian (Meera)
2. Auto-selects Central Municipal Library
3. View only lib1 members
4. Manage only lib1 fines
5. Create events for lib1

### Scenario 3: Citizen Personal Account
1. Login as Citizen (Rajesh)
2. See personal dashboard with own stats
3. View only own fines (₹0)
4. Browse books and events
5. Cannot see other members

### Scenario 4: Citizen with Pending Fines
1. Login as Citizen (Priya)
2. See personal dashboard
3. View pending fine of ₹50
4. Alert shown for overdue books
5. Can pay fine from dashboard

---

## 🎓 Learning Path

1. **Start with Admin** - Understand full system
2. **Try Librarian** - See branch-level management
3. **Test as Citizen** - Experience user perspective
4. **Compare Views** - Notice role-based differences

