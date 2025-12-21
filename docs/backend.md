# Backend Architecture

## Overview
The backend is built using Convex, a reactive backend-as-a-service platform that provides real-time database capabilities, serverless functions, and built-in authentication.

## Technology Stack
- **Platform**: Convex
- **Database**: Convex Database (built on FoundationDB)
- **Authentication**: Convex Authentication with Password provider
- **API**: Convex HTTP Actions for external integrations
- **File Storage**: Convex File Storage

## Core Components

### Convex Functions
Convex provides three types of serverless functions:

#### Queries
- Read-only functions that fetch data from the database
- Automatically re-run when underlying data changes
- Used for fetching lists, records, and computed values
- Defined in module files with `query` wrapper

#### Mutations
- Write functions that modify database state
- Used for creating, updating, and deleting records
- Return values to the client after execution
- Defined in module files with `mutation` wrapper

#### Actions
- Long-running functions for complex operations
- Can call external APIs and perform async operations
- Used for sending emails, processing payments, etc.
- Defined in module files with `action` wrapper

### Modules
Backend logic is organized into modules in the `convex/` directory:

- `auth.ts`: Authentication-related functions
- `dashboard.ts`: Dashboard data aggregation
- `expenseCategories.ts`: Expense category management
- `expenses.ts`: Expense record management
- `files.ts`: File management
- `folders.ts`: Folder management
- `http.ts`: HTTP endpoints
- `productCategories.ts`: Product category management
- `products.ts`: Product management
- `sales.ts`: Sales transaction management
- `staff.ts`: Staff management and custom authentication
- `deposit.ts`: Bank and Mobile Money deposit tracking
- `settings.ts`: User settings management
- `users.ts`: User profile management

### Schema Definition
Defined in `convex/schema.ts`:
- Table definitions with typed schemas
- Index definitions for optimized queries
- Relationship definitions between tables

### HTTP Endpoints
Defined in `convex/http.ts`:
- Public webhook endpoints
- Integration endpoints for third-party services
- Custom API routes

## Data Flow
1. Frontend components call Convex queries/mutations via generated API
2. Convex executes serverless functions
3. Functions interact with database as needed
4. Results returned to frontend
5. Real-time updates automatically pushed to subscribed components

## Deployment
- Automatic deployment via Convex CLI
- Continuous integration with GitHub
- Zero-downtime deployments
- Automatic scaling based on demand

## Security
- Row-level security policies
- Authentication required for data access
- Input validation on all mutations
- Rate limiting on API endpoints