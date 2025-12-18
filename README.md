# Runi

Runi is a comprehensive business management application built with modern web technologies. This project serves as a robust template for managing various aspects of a business, including inventory, sales, customers, and expenses.

## 🚀 Features

- **Dashboard**: Real-time overview of business performance and metrics.
- **Products**: Comprehensive inventory management (add, edit, tracking).
- **Sales**: Process and track sales orders.
- **Expenses**: Record and categorize business expenses.
- **Documents**: File management system for business records.
- **Reports**: Data visualization and business analytics.
- **Users**: Manage team members, roles, and permissions.
- **Settings**: Application configuration and preferences.
- **Transactions**: Financial history and transaction logs.
- **Authentication**: Secure sign-in and session management via Convex Auth.

## 🔗 Routing

The application implements full client-side routing for direct access to all modules:

- **Direct URL Access**: Each module can be accessed directly via its URL (e.g., `/dashboard`, `/products`, `/sales`)
- **Persistent Navigation**: Refreshing the page maintains the current module view
- **Browser History**: Back/forward navigation works seamlessly between modules
- **Dynamic Parameters**: Module selection is managed through URL parameters
- **Fallback Handling**: Invalid URLs automatically redirect to the dashboard

### 🛠️ Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) with TypeScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- **UI Components**: Custom component library with reusable elements
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **State Management**: React Context API and useState/useReducer hooks
- **Routing**: React Router DOM (fully implemented for direct URL access to all modules)

### Backend & Database
- **Platform**: [Convex](https://convex.dev/)
  - Real-time database with automatic conflict resolution
  - Serverless functions for business logic
  - Built-in authentication via `@convex-dev/auth`
  - File storage with `_storage` table
- **Database Schema**: Defined in `convex/schema.ts` with tables for products, sales, expenses, users, and more
- **API Layer**: Convex functions (queries, mutations, actions) in respective feature files

### Authentication
- **Library**: `@convex-dev/auth` with password provider
- **Session Management**: Automatic session handling with secure cookies
- **Protected Routes**: Custom hooks and wrappers for route protection

### Development & Deployment
- **Language**: TypeScript (strict mode)
- **Linting**: ESLint with recommended presets
- **Code Formatting**: Prettier
- **Package Manager**: npm
- **Deployment**: Convex hosting with automatic CI/CD

## 📂 Project Structure

```
├── convex/                   # Backend API & Database
│   ├── _generated/           # Auto-generated Convex code
│   ├── auth.config.ts        # Auth configuration
│   ├── auth.ts               # Authentication logic & handlers
│   ├── schema.ts             # Database schema using Convex
│   ├── dashboard.ts          # Dashboard API endpoints
│   ├── products.ts           # Product API endpoints
│   ├── sales.ts              # Sales API endpoints
│   ├── expenses.ts           # Expenses API endpoints
│   ├── documents.ts          # Document management API
│   ├── reports.ts            # Reporting API
│   ├── users.ts              # User management API
│   ├── settings.ts           # Settings API
│   └── http.ts               # HTTP routes
│
├── src/                      # Frontend Application
│   ├── components/           # Shared UI Components
│   │   ├── layout/           # Layout Components
│   │   │   ├── BusinessDashboard.tsx  # Main dashboard layout wrapper with routing integration
│   │   │   ├── Navbar.tsx             # Top navigation bar
│   │   │   └── Sidebar.tsx            # Side navigation menu
│   │   ├── ui/               # Generic UI Elements
│   │   │   ├── Button.tsx             # Reusable button component
│   │   │   ├── Input.tsx              # Form input component
│   │   │   ├── Modal.tsx              # Dialog/Modal component
│   │   │   └── StatCard.tsx           # Dashboard statistic card
│   │   └── ThemeProvider.tsx # Theme context provider (Dark/Light mode)
│   │
│   ├── features/             # Feature-based Modules
│   │   ├── auth/             # Authentication Screens
│   │   │   ├── SignInForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── SignOutButton.tsx
│   │   ├── dashboard/        # Dashboard Feature
│   │   │   └── Dashboard.tsx
│   │   ├── products/         # Product Management
│   │   │   └── Products.tsx
│   │   ├── sales/            # Sales & Orders
│   │   │   ├── AddSale.tsx           # Add new sales component
│   │   │   ├── ManageSales.tsx       # Manage existing sales component
│   │   │   ├── AuditSales.tsx        # Audit sales transactions component
│   │   │   └── Sales.tsx             # Main sales component with tab navigation
│   │   ├── expenses/         # Expense Tracking
│   │   │   └── Expenses.tsx
│   │   ├── documents/        # File Management
│   │   │   └── Documents.tsx
│   │   ├── reports/          # Analytics & Reports
│   │   │   └── Reports.tsx
│   │   ├── users/            # User Administration
│   │   │   └── Users.tsx
│   │   ├── settings/         # App Settings
│   │   │   └── Settings.tsx
│   │   └── transactions/     # Transaction History
│   │       └── Transactions.tsx
│   │
│   ├── lib/                  # Utilities
│   │   └── utils.ts          # Helper functions (Tailwind merge, etc.)
│   │
│   ├── App.tsx               # Main App Component with Route Definitions
│   ├── main.tsx              # React Entry Point with BrowserRouter
│   └── index.css             # Global Styles & Tailwind Directives
│
├── public/                   # Static Assets
├── .env.local                # Environment Variables
├── package.json              # Dependencies & Scripts
└── tsconfig.json             # TypeScript Configuration
```

### 🗄️ Database Schema

The application uses Convex as its backend database with the following key tables:

**Core Business Tables:**
- `users` - User accounts and profiles
- `products` - Product inventory with box/kg tracking
- `productcategory` - Product categories
- `sales` - Sales transactions with detailed tracking
- `sales_audit` - Audit trail for sales transactions
- `expenses` - Business expenses with categorization
- `expensecategory` - Expense categories
- `documents` - File storage metadata
- `folders` - Document organization
- `files` - Individual file records

**Tracking & Monitoring Tables:**
- `stock_additions` - New inventory additions
- `stock_corrections` - Inventory adjustments
- `damaged_products` - Damaged inventory tracking
- `stock_movements` - All inventory movements

#### Sales Table Structure

The `sales` table contains the following fields:
- `sales_id` - Unique identifier for the sale
- `user_id` - Reference to the user who owns this record
- `product_id` - Reference to the product being sold
- `boxes_quantity` - Number of boxes sold
- `kg_quantity` - Weight in kilograms sold
- `box_price` - Price per box
- `kg_price` - Price per kilogram
- `profit_per_box` - Profit margin per box
- `profit_per_kg` - Profit margin per kilogram
- `total_amount` - Total sale value
- `amount_paid` - Amount already paid by customer
- `remaining_amount` - Outstanding balance
- `payment_status` - Current payment status (pending/partial/completed)
- `payment_method` - Method of payment used
- `performed_by` - User who executed the sale
- `client_id` - Reference to the customer
- `client_name` - Customer name
- `phone_number` - Customer contact number
- `updated_at` - Timestamp of last modification

#### Sales Audit Table Structure

The `sales_audit` table tracks all changes to sales records:
- `audit_id` - Unique identifier for the audit record
- `user_id` - Reference to the user who owns this record
- `sales_id` - Reference to the sales record being audited
- `audit_type` - Type of change (insert/update/delete)
- `boxes_change` - Changes to box quantities (before/after values)
- `kg_change` - Changes to kg quantities (before/after values)
- `old_values` - Complete previous state of the record
- `new_values` - Complete new state of the record
- `performed_by` - User who made the change
- `approval_status` - Current approval status (pending/approved/rejected)
- `approved_by` - User who approved the change (if applicable)
- `approved_timestamp` - When the change was approved (if applicable)
- `reason` - Explanation for the audit action
- `updated_at` - Timestamp of the audit record creation

Each table is designed with appropriate indexes for optimal query performance and includes timestamp fields for audit trails.

## 🔄 Routing Implementation

The application now features a complete client-side routing system that enables direct URL access to all modules:

1. **BrowserRouter Integration**: The main application is wrapped with React Router's BrowserRouter in `main.tsx`
2. **Route Configuration**: Dynamic routes are configured in `App.tsx` to handle module parameters
3. **Parameter-Based Navigation**: The `BusinessDashboard.tsx` component uses `useParams` to read URL parameters and `useNavigate` for programmatic navigation
4. **Validation & Fallback**: Invalid module URLs are automatically redirected to the dashboard
5. **State Synchronization**: URL changes are synchronized with application state for consistent UI

This implementation ensures users can bookmark, share, and directly access any module while maintaining the existing application functionality.

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Convex**
   This project uses Convex for the backend. You need to set up your Convex project and environment variables.

   Run the dev command to initialize:
   ```bash
   npx convex dev
   ```
   
   - If this is your first time, it will prompt you to log in to Convex.
   - You will be asked to select an existing project or create a new one.
   - This process will automatically generate a `.env.local` file with your `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`.

   **Note:** If you are using authentication providers (like GitHub, Google, etc.), you will need to configure them in the [Convex Dashboard](https://dashboard.convex.dev/) and add any required environment variables.

4. **Start the development server**
   This command runs both the frontend (Vite) and backend (Convex) concurrently.
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Convex Dashboard: Automatically opens or runs in the background

### Build for Production

To build the application for production:

```bash
npm run build
```

## 📜 Scripts

- `npm run dev`: Starts both frontend and backend in development mode with proper routing.
- `npm run dev:frontend`: Starts only the Vite frontend server with routing enabled.
- `npm run dev:backend`: Starts only the Convex backend server.
- `npm run build`: Builds the project for production.
- `npm run lint`: Runs type checking and linting.

## 🔒 Authentication

This project uses `@convex-dev/auth` for handling user authentication. Ensure you have configured your Convex project correctly to handle auth providers if needed.

## � Author

**Ntwari K. Brian**


## �📄 License

[MIT](LICENSE)
