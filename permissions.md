# Database Schema: Roles and Permissions

This document outlines the database structure required to support the **Roles & Permissions** system, specifically matching the UI structure of the "Permissions" sub-tab in the Staff management section.

## 1. Table: `staff_permissions` (Convex Definition)

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

## 2. Table Relationships

| Table | Relationship | Target Table | Description |
| :--- | :--- | :--- | :--- |
| `staff` | `1 : N` | `staff_permissions` | One staff member can have many specific permission entries. |
| `users` | `1 : N` | `staff_permissions` | Each permission entry is scoped to the business owner (User). |

## 3. Permission Key Reference (UI Mapping)

The `permission_key` column should store the internal IDs used in the frontend. Below is the mapping based on the sub-tabs:

### Product Tab
| Sub-Tab | Internal Key | Display Name |
| :--- | :--- | :--- |
| **Categories** | `p4_view` | View Category |
| | `p4_add` | Add Category |
| | `p4_edit` | Edit Category |
| | `p4_delete` | Delete Category |
| **Product Adding** | `p2_view` | View Product List |
| | `p2` | Adding Only |
| **Live Stock** | `p1_view` | View Stock |
| | `p1_edit` | Edit Stock |
| | `p1_delete` | Delete Stock Entry |

### Sales Tab
| Sub-Tab | Internal Key | Display Name |
| :--- | :--- | :--- |
| **Manage Sales** | `s1_view` | View Sales Config |
| | `s1_edit` | Edit Sales Config |
| | `s1_delete` | Delete Sales Config |
| **Audit Sales** | `s4_view` | View Sales Audit |
| | `s4_confirm` | Confirm Sale |
| | `s4_reject` | Reject Sale |

### Cash Tracking Tab
| Sub-Tab | Internal Key | Display Name |
| :--- | :--- | :--- |
| **Deposited** | `c1_view` | View Deposited |
| | `c1_create` | Create Deposition |
| | `c1_edit` | Edit Deposited |
| | `c1_delete` | Delete Deposited |
| **Debtor** | `c2_view` | View Debtors |

### Department Master Switches
| Department | Internal Key | Description |
| :--- | :--- | :--- |
| **Product** | `product_master` | Global toggle for all Product permissions |
| **Sales** | `sales_master` | Global toggle for all Sales permissions |
| **Cash Tracking** | `cash_tracking_master` | Global toggle for all Cash Tracking permissions |

---

## 4. Business Logic Requirements

### View Dependency (Frontend & Backend)
As implemented in the UI, all actions within a sub-group depend on the `_view` permission. 

1.  **Validation**: If a request comes into the API for an action (e.g., `update_stock`), the backend should check if the staff member has both `p1_view` **and** `p1_edit` enabled in the `staff_permissions` table.
2.  **Cascade Disable**: When the `_view` permission is set to `false` in the database, all other keys for that sub-group associated with that `staff_id` should also be set to `false` or deleted.

### 5. Navigation Visibility (Sidebar Logic)
The **Department Master Switches** (e.g., `product_master`) directly control the visibility of the primary navigation tabs in the staff member's interface.

1.  **Dynamic Rendering**: The staff's sidebar/navigation system must query the `staff_permissions` table for these master keys upon login or session refresh.
2.  **Toggle Behavior**:
    *   **IF `master_key` is TRUE**: The department tab (e.g., "Products") is visible and accessible in the sidebar.
    *   **IF `master_key` is FALSE**: The department tab is completely removed from the sidebar and navigation menu.
3.  **URL Protection**: If a staff member attempts to manually navigate to a URL they don't have the master permission for (e.g., `/products`), the system should redirect them back to the dashboard.
