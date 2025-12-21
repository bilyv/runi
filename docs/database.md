# Database Structure

## Overview
This project uses Convex as its backend database solution. Convex provides a real-time database with built-in authentication and serverless functions.

## Schema Definition
The database schema is defined in `convex/schema.ts` using Convex's schema definition language.

### User & Staff Management

#### Users (`users`)
- `_id`: Internal ID (ID)
- `name`: User's full name (String)
- `email`: User's email address (String)
- `businessName`: Name of the user's business (String)
- `businessEmail`: Business email address (String)
- `phoneNumber`: Contact phone number (String)
- `createdAt`: Account creation timestamp (Number)

#### Staff (`staff`)
- `staff_id`: Custom identifier (String)
- `user_id`: Reference to owner `users` table (ID)
- `staff_full_name`: Staff name (String)
- `email_address`: Staff email (String)
- `phone_number`: Staff phone (String)
- `password`: Hashed password (String)
- `is_active`: Status flag (Boolean)
- `updated_at`: Last update timestamp (Number)

### Inventory & Products

#### Products (`products`)
- `user_id`: Reference to `users` (ID)
- `name`: Product name (String)
- `category_id`: Reference to `productcategory` (ID)
- `quantity_box`: Stock in boxes (Number)
- `quantity_kg`: Stock in kilograms (Number)
- `price_per_box`: Selling price (Number)
- `price_per_kg`: Selling price (Number)
- `boxed_low_stock_threshold`: Alert level (Number)
- `updated_at`: Timestamp (Number)

#### Product Categories (`productcategory`)
- `user_id`: Reference to `users` (ID)
- `category_name`: Name (String)

#### Stock Movements (`stock_movements`)
- `product_id`: Reference to product (ID)
- `movement_type`: 'product_edit', 'product_delete', etc. (String)
- `old_value/new_value`: Changes tracking (Union)
- `status`: 'pending', 'approved', 'rejected' (String)
- `performed`: User/Staff who initiated (String)

### Sales & Financials

#### Sales (`sales`)
- `user_id`: Reference to `users` (ID)
- `product_id`: Reference to `products` (ID)
- `boxes_quantity/kg_quantity`: Sold amounts (Number)
- `total_amount`: Total value (Number)
- `amount_paid`: Paid value (Number)
- `payment_status`: 'pending', 'partial', 'completed' (Literal)
- `client_name`: Customer name (String)

#### Sales Audit (`sales_audit`)
- `sales_id`: Reference to `sales` (ID)
- `audit_type`: 'insert', 'update', 'delete' (String)
- `old_values/new_values`: Snapshot of data (Any)
- `approval_status`: Status of the change (Literal)

#### Expenses (`expenses`)
- `userId`: Reference to `users` (ID)
- `title`: Description (String)
- `amount`: Cost (Number)
- `categoryId`: Reference to `expensecategory` (ID)

#### Deposits (`deposit`)
- `user_id`: Reference to `users` (String)
- `deposit_type`: Bank/M-Pesa etc. (String)
- `amount`: Deposited amount (Number)
- `approval`: Status (String)

### Documents

#### Folders (`folders`)
- `user_id`: Reference to `users` (ID)
- `folder_name`: Name (String)
- `file_count`: Meta information (Number)

#### Files (`files`)
- `user_id`: Reference to `users` (ID)
- `storage_id`: Reference to Convex `_storage` (ID)
- `folder_id`: Reference to `folders` (ID, optional)

## Relationships
- Products reference Product Categories via `category_id`
- Sales and Audits reference Products via `product_id`
- Expenses reference Expense Categories via `categoryId`
- Files reference Folders via `folder_id`
- Staff and all transactions reference the owner via `user_id` or `userId`

## Data Access Patterns
Data is accessed through Convex queries and mutations defined in the respective module files in the `convex/` directory. Real-time subscriptions are used for live updates across all modules.
