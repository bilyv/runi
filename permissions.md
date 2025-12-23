see my describtion "# Database Schema: Roles and Permissions

This document outlines the database structure required to support the **Permissions** system, specifically matching the UI structure of the "Permissions" sub-tab in the Staff management section.

## 1. Table: `permissions` (Convex Definition)

This table defines the available permissions in the system with structured keys for UI mapping:

```typescript
// convex/schema.ts snippet

permissions: defineTable({
  // Unique identifier used everywhere (frontend + backend)
  permission_key: v.string(), 
  // Example: "sales.manage_sales.edit"

  // UI structure
  main_tab_key: v.string(), 
  // Example: "sales", "products", "cash", "expenses"

  sub_tab_key: v.string(),  
  // Example: "manage_sales", "add_sales", "live_stock"

  action_key: v.string(),   
  // Example: "create", "view", "edit", "delete"

  // Human-readable label (for admin UI)
  label: v.string(),        
  // Example: "Edit Sales Record"

  // Optional description (nice for admin clarity)
  description: v.optional(v.string()),

  created_at: v.number(),
})
  .index("by_permission_key", ["permission_key"])
  .index("by_main_tab", ["main_tab_key"])
  .index("by_main_sub", ["main_tab_key", "sub_tab_key"])
  .index("by_full_path", ["main_tab_key", "sub_tab_key", "action_key"]),
```

## 2. Table: `staff_permissions` (Convex Definition)

To support the dynamic toggling of permissions per staff member, a junction-style table is recommended. This table links specific permission keys to a staff member.

```typescript
// convex/schema.ts snippet

staff_permissions: defineTable({
  staff_id: v.id("staff"),      // Foreign Key to the staff table
  user_id: v.id("users"),       // The business owner ID (for multi-tenant scoping)
  permission_key: v.string(),   // The unique ID of the permission (e.g., 'p1_view', 'c1_create')
  is_enabled: v.boolean(),      // Whether this specific permission is granted
  updated_at: v.number(),       // Unix timestamp of the last change
})
.index("by_staff", ["staff_id"])
.index("by_user_staff", ["user_id", "staff_id"])
.index("by_staff_key", ["staff_id", "permission_key"]),
```

## 3. Table Relationships

| Table | Relationship | Target Table | Description |
| :--- | :--- | :--- | :--- |
| `permissions` | `1 : N` | `staff_permissions` | One permission can be assigned to many staff members. |
| `staff` | `1 : N` | `staff_permissions` | One staff member can have many specific permission entries. |
| `users` | `1 : N` | `staff_permissions` | Each permission entry is scoped to the business owner (User). |

## 4. Permission Key Reference (UI Mapping)

The `permission_key` column should store the internal IDs used in the frontend. Below is the mapping based on the sub-tabs:

### Product Tab
| Sub-Tab | Internal Key | Display Name | Main Tab | Sub Tab | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Categories** | `p4_view` | View Category | `products` | `categories` | `view` |
| | `p4_add` | Add Category | `products` | `categories` | `create` |
| | `p4_edit` | Edit Category | `products` | `categories` | `edit` |
| | `p4_delete` | Delete Category | `products` | `categories` | `delete` |
| **Product Adding** | `p2_view` | View Product List | `products` | `product_adding` | `view` |
| | `p2` | Adding Only | `products` | `product_adding` | `create` |
| **Live Stock** | `p1_view` | View Stock | `products` | `live_stock` | `view` |
| | `p1_edit` | Edit Stock | `products` | `live_stock` | `edit` |
| | `p1_delete` | Delete Stock Entry | `products` | `live_stock` | `delete` |

### Sales Tab
| Sub-Tab | Internal Key | Display Name | Main Tab | Sub Tab | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Manage Sales** | `s1_view` | View Sales Config | `sales` | `manage_sales` | `view` |
| | `s1_edit` | Edit Sales Config | `sales` | `manage_sales` | `edit` |
| | `s1_delete` | Delete Sales Config | `sales` | `manage_sales` | `delete` |
| **Audit Sales** | `s4_view` | View Sales Audit | `sales` | `audit_sales` | `view` |
| | `s4_confirm` | Confirm Sale | `sales` | `audit_sales` | `confirm` |
| | `s4_reject` | Reject Sale | `sales` | `audit_sales` | `reject` |

### Cash Tracking Tab
| Sub-Tab | Internal Key | Display Name | Main Tab | Sub Tab | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Deposited** | `c1_view` | View Deposited | `cash_tracking` | `deposited` | `view` |
| | `c1_create` | Create Deposition | `cash_tracking` | `deposited` | `create` |
| | `c1_edit` | Edit Deposited | `cash_tracking` | `deposited` | `edit` |
| | `c1_delete` | Delete Deposited | `cash_tracking` | `deposited` | `delete` |
| **Debtor** | `c2_view` | View Debtors | `cash_tracking` | `debtor` | `view` |

### Department Master Switches
| Department | Internal Key | Description | Main Tab | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Product** | `product_master` | Global toggle for all Product permissions | `products` | `master` |
| **Sales** | `sales_master` | Global toggle for all Sales permissions | `sales` | `master` |
| **Cash Tracking** | `cash_tracking_master` | Global toggle for all Cash Tracking permissions | `cash_tracking` | `master` |

---

## 5. Business Logic Requirements

### View Dependency (Frontend & Backend)
As implemented in the UI, all actions within a sub-group depend on the `_view` permission. 

1.  **Validation**: If a request comes into the API for an action (e.g., `update_stock`), the backend should check if the staff member has both `p1_view` **and** `p1_edit` enabled in the `staff_permissions` table.
2.  **Cascade Disable**: When the `_view` permission is set to `false` in the database, all other keys for that sub-group associated with that `staff_id` should also be set to `false` or deleted.

### 6. Navigation Visibility (Sidebar Logic)
The **Department Master Switches** (e.g., `product_master`) directly control the visibility of the primary navigation tabs in the staff member's interface.

1.  **Dynamic Rendering**: The staff's sidebar/navigation system must query the `staff_permissions` table for these master keys upon login or session refresh.
2.  **Toggle Behavior**:
    *   **IF `master_key` is TRUE**: The department tab (e.g., "Products") is visible and accessible in the sidebar.
    *   **IF `master_key` is FALSE**: The department tab is completely removed from the sidebar and navigation menu.
3.  **URL Protection**: If a staff member attempts to manually navigate to a URL they don't have the master permission for (e.g., `/products`), the system should redirect them back to the dashboard.

## 7. Staff-Specific Pages and Permission Integration

To provide staff members with access to business functionality while maintaining security, three new staff-specific pages have been created that mirror the admin functionality:

### 7.1 Staff Products Page (`/staffproducts`)

This page mirrors the admin products functionality but with staff-appropriate access controls:

| Sub-Tab | Internal Key | Display Name | Main Tab | Sub Tab | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Categories** | `sp4_view` | View Category | `staff_products` | `categories` | `view` |
| | `sp4_add` | Add Category | `staff_products` | `categories` | `create` |
| | `sp4_edit` | Edit Category | `staff_products` | `categories` | `edit` |
| | `sp4_delete` | Delete Category | `staff_products` | `categories` | `delete` |
| **Product Adding** | `sp2_view` | View Product List | `staff_products` | `product_adding` | `view` |
| | `sp2` | Adding Only | `staff_products` | `product_adding` | `create` |
| **Live Stock** | `sp1_view` | View Stock | `staff_products` | `live_stock` | `view` |
| | `sp1_edit` | Edit Stock | `staff_products` | `live_stock` | `edit` |
| | `sp1_delete` | Delete Stock Entry | `staff_products` | `live_stock` | `delete` |

### 7.2 Staff Sales Page (`/staffsales`)

This page mirrors the admin sales functionality but with staff-appropriate access controls:

| Sub-Tab | Internal Key | Display Name | Main Tab | Sub Tab | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Manage Sales** | `ss1_view` | View Sales Config | `staff_sales` | `manage_sales` | `view` |
| | `ss1_edit` | Edit Sales Config | `staff_sales` | `manage_sales` | `edit` |
| | `ss1_delete` | Delete Sales Config | `staff_sales` | `manage_sales` | `delete` |
| **Audit Sales** | `ss4_view` | View Sales Audit | `staff_sales` | `audit_sales` | `view` |
| | `ss4_confirm` | Confirm Sale | `staff_sales` | `audit_sales` | `confirm` |
| | `ss4_reject` | Reject Sale | `staff_sales` | `audit_sales` | `reject` |

### 7.3 Staff Cash Tracking Page (`/staffcashtracking`)

This page mirrors the admin cash tracking functionality but with staff-appropriate access controls:

| Sub-Tab | Internal Key | Display Name | Main Tab | Sub Tab | Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Deposited** | `sc1_view` | View Deposited | `staff_cash_tracking` | `deposited` | `view` |
| | `sc1_create` | Create Deposition | `staff_cash_tracking` | `deposited` | `create` |
| | `sc1_edit` | Edit Deposited | `staff_cash_tracking` | `deposited` | `edit` |
| | `sc1_delete` | Delete Deposited | `staff_cash_tracking` | `deposited` | `delete` |
| **Debtor** | `sc2_view` | View Debtors | `staff_cash_tracking` | `debtor` | `view` |

### 7.4 Staff Department Master Switches

| Department | Internal Key | Description | Main Tab | Action |
| :--- | :--- | :--- | :--- | :--- |
| **Staff Product** | `staff_product_master` | Global toggle for all Staff Product permissions | `staff_products` | `master` |
| **Staff Sales** | `staff_sales_master` | Global toggle for all Staff Sales permissions | `staff_sales` | `master` |
| **Staff Cash Tracking** | `staff_cash_tracking_master` | Global toggle for all Staff Cash Tracking permissions | `staff_cash_tracking` | `master` |

### 7.5 Staff-Specific Business Logic

1. **UI Consistency**: Each staff page maintains the same UI structure and functionality as its admin counterpart, ensuring a consistent user experience.

2. **Permission Validation**: All API calls from staff pages must validate permissions against the `staff_permissions` table, ensuring staff members can only perform actions they are authorized for.

3. **Granular Access Control**: Staff permissions are applied at the feature level, allowing for fine-grained control over what each staff member can access:
   - Staff can have view-only access to sensitive data
   - Staff can be restricted to specific sub-functions
   - Staff permissions can be updated dynamically without system restart

4. **Session-Based Access**: Staff permissions are validated at session initialization and re-validated for each sensitive operation to prevent unauthorized access.

5. **Role-Based UI Rendering**: The UI dynamically renders components based on the staff member's assigned permissions, hiding or disabling unauthorized features.

## 8. Implementation Steps for Staff-Specific Pages

To create staff-specific pages (staffproducts, staffsales, staffcashtracking) that mirror admin functionality with permission controls:

### 8.1 Frontend Implementation

1. **Create new route components**:
   - Create `/src/features/staff/StaffProducts.tsx` for staff products page
   - Create `/src/features/staff/StaffSales.tsx` for staff sales page
   - Create `/src/features/staff/StaffCashTracking.tsx` for staff cash tracking page

2. **Implement permission checking hooks**:
   - Create `useStaffPermissions()` hook to fetch and cache staff permissions
   - Implement functions to check if a staff member has specific permissions (e.g., `canViewProducts()`, `canEditSales()`)

3. **Create permission-aware UI components**:
   - Implement components that conditionally render based on permissions
   - Create wrapper components that check permissions before allowing actions

4. **Integrate with existing UI**:
   - Mirror the admin UI structure in the new staff pages
   - Add permission checks to all interactive elements
   - Implement dynamic sidebar navigation that respects staff permissions

### 8.2 Backend Implementation

1. **Create permission checking functions**:
   - Create server-side functions to validate staff permissions for each action
   - Implement middleware to check permissions before processing requests

2. **Update Convex functions**:
   - Add permission checks to all existing Convex functions
   - Create new functions specific to staff access patterns

3. **Populate permissions table**:
   - Add seed data to the `permissions` table with all available permissions
   - Create default permission sets for common staff roles

### 8.3 Integration with Staff Account System

1. **Update staff authentication**:
   - Ensure staff session includes permission data
   - Implement permission refresh mechanisms

2. **Link to existing permissions system**:
   - Ensure new staff pages use the same `staff_permissions` table
   - Implement UI in admin panel to configure staff permissions for new pages

### 8.4 Testing and Validation

1. **Test permission combinations**:
   - Verify that staff with different permission sets see appropriate UI
   - Ensure unauthorized actions are properly blocked

2. **Validate UI mirroring**:
   - Confirm that staff pages provide the same functionality as admin pages
   - Ensure consistent user experience between admin and staff interfaces