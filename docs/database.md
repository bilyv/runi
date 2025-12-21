# Database Structure

## Overview
This project uses Convex as its backend database solution. Convex provides a real-time database with built-in authentication and serverless functions.

## Schema Definition
The database schema is defined in `convex/schema.ts` using Convex's schema definition language.

### Core Tables

#### Users
- `_id`: Internal ID (String)
- `name`: User's full name (String)
- `email`: User's email address (String)
- `businessName`: Name of the user's business (String)
- `businessEmail`: Business email address (String)
- `phoneNumber`: Contact phone number (String)
- `createdAt`: Account creation timestamp (Number)

#### Products
- `_id`: Internal ID (String)
- `name`: Product name (String)
- `description`: Product description (String)
- `price`: Product price (Number)
- `categoryId`: Reference to product category (String)
- `stockQuantity`: Current stock quantity (Number)
- `createdAt`: Creation timestamp (Number)

#### Product Categories
- `_id`: Internal ID (String)
- `name`: Category name (String)
- `description`: Category description (String)
- `createdAt`: Creation timestamp (Number)

#### Sales
- `_id`: Internal ID (String)
- `productId`: Reference to sold product (String)
- `quantity`: Number of items sold (Number)
- `unitPrice`: Price per unit at time of sale (Number)
- `totalAmount`: Total sale amount (Number)
- `customerId`: Customer identifier (String)
- `createdAt`: Sale timestamp (Number)

#### Expenses
- `_id`: Internal ID (String)
- `categoryId`: Reference to expense category (String)
- `amount`: Expense amount (Number)
- `description`: Expense description (String)
- `date`: Date of expense (Number)
- `createdAt`: Creation timestamp (Number)

#### Expense Categories
- `_id`: Internal ID (String)
- `name`: Category name (String)
- `description`: Category description (String)
- `createdAt`: Creation timestamp (Number)



#### Folders (Documents)
- `_id`: Internal ID (String)
- `name`: Folder name (String)
- `parentId`: Parent folder ID for nesting (String, optional)
- `createdAt`: Creation timestamp (Number)

#### Files (Documents)
- `_id`: Internal ID (String)
- `name`: File name (String)
- `folderId`: Parent folder ID (String)
- `url`: File storage URL (String)
- `size`: File size in bytes (Number)
- `type`: File MIME type (String)
- `createdAt`: Upload timestamp (Number)

## Relationships
- Products reference Product Categories via `categoryId`
- Sales reference Products via `productId`
- Expenses reference Expense Categories via `categoryId`
- Files reference Folders via `folderId`
- Folders can be nested via `parentId`

## Data Access Patterns
Data is accessed through Convex queries and mutations defined in the respective module files in the `convex/` directory.