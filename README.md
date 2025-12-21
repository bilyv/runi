# Runi

Runi is a comprehensive business management application built with modern web technologies. This project serves as a robust template for managing various aspects of a business, including inventory, sales, customers, expenses, and staff.

## 🚀 Features

- **Home**: Real-time overview of business performance and metrics.
- **Products**: Comprehensive inventory management (add, edit, delete with approval workflow, tracking).
  - Two-phase product editing and deletion approval workflow to prevent accidental data loss
  - Detailed stock movement tracking and auditing
- **Sales**: Process and track sales orders with full audit trails.
  - Manual and automated sales tracking
  - Payment status management (Pending, Partial, Completed)
  - Sales audit system for tracking changes and deletions
- **Expenses**: Record and categorize business expenses with budget tracking.
- **Documents**: Advanced file management system with folder organization.
- **Reports**: Data visualization and business analytics (Daily, Weekly, Monthly).
- **Staff Management**: Comprehensive team management system.
  - Separate Staff login portal
  - Role-based permissions and access levels
  - Detailed staff activity tracking
- **Settings**: Application configuration and business preferences.
- **Cash Tracking**: Financial flows, including bank/mobile money deposits and debt tracking.
- **Authentication**: 
  - Boss Login: Secure sign-in via Convex Auth.
  - Staff Login: Custom authentication system for employees.

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
- **UI Components**: Custom component library using Radix UI primitives and Framer Motion for animations
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Routing**: React Router DOM (fully implemented for direct URL access to all modules)

### Backend & Database
- **Platform**: [Convex](https://convex.dev/)
  - Real-time database with automatic conflict resolution
  - Serverless functions (Queries, Mutations, Actions)
  - Built-in authentication for business owners via `@convex-dev/auth`
  - Custom authentication for staff members
  - Managed file storage
- **Database Schema**: Structured data with indexes for performance
- **API Layer**: Type-safe Convex functions in the `convex/` directory

## 📂 Project Structure

```
├── convex/                   # Backend API & Database
│   ├── auth.config.ts        # Auth configuration
│   ├── auth.ts               # Authentication logic
│   ├── schema.ts             # Database schema definition
│   ├── dashboard.ts          # Dashboard analytics API
│   ├── products.ts           # Product & Inventory API
│   ├── sales.ts              # Sales & Audit API
│   ├── expenses.ts           # Expense management API
│   ├── files.ts              # File management API
│   ├── folders.ts            # Folder organization API
│   ├── staff.ts              # Staff & Permissions API
│   ├── deposit.ts            # Cash tracking & Deposits API
│   ├── users.ts              # Owner profile API
│   └── http.ts               # HTTP actions
│
├── src/                      # Frontend Application
│   ├── components/           # Shared UI Components
│   │   ├── layout/           # Dashboard & Navigation layouts
│   │   ├── ui/               # Primary UI elements (Buttons, Inputs, etc.)
│   │   └── DebtorsList.tsx    # Specific business logic components
│   │
│   ├── features/             # Domain-driven Modules
│   │   ├── auth/             # Login & Registration (Owner & Staff)
│   │   ├── dashboard/        # Analytics & Overview
│   │   ├── products/         # Inventory management
│   │   ├── sales/            # Sales processing & Auditing
│   │   ├── expenses/         # Financial tracking
│   │   ├── documents/        # File & Folder management
│   │   ├── staff/            # Staff management UI
│   │   └── cash-tracking/    # Deposits & Debt tracking
│   │
│   ├── lib/                  # Shared utilities & constants
│   ├── App.tsx               # Main routing & configuration
│   └── main.tsx              # Application entry point
```

## 🗄️ Database Schema

The application follows a relational-style schema within Convex:

**Management Tables:**
- `users`: Business owner accounts
- `staff`: Employee accounts with custom auth
- `settings`: Application-wide configurations

**Inventory & Sales:**
- `products`: Product details and stock levels (Unit: Boxes/KG)
- `productcategory`: Logical grouping for products
- `restock`: History of added stock
- `stock_movements`: Log of all inventory changes (used for approval workflows)
- `sales`: Transaction records
- `sales_audit`: Detailed log of sales modifications for security

**Financials:**
- `expenses`: Business spending records
- `expensecategory`: Spending classifications
- `deposit`: Tracking bank and mobile money deposits

**Organization:**
- `folders`: Directory structure for files
- `files`: Specifically uploaded business documents

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   npm install
   ```

2. **Backend Setup**
   ```bash
   npx convex dev
   ```
   Follow the prompts to link your project or create a new one.

3. **Environment Variables**
   Ensure your `.env.local` is populated with:
   - `VITE_CONVEX_URL`
   - `CONVEX_DEPLOYMENT`

4. **Run Application**
   ```bash
   npm run dev
   ```

## 📜 Available Scripts
- `npm run dev`: Full application launch (Frontend + Convex)
- `npm run build`: Production bundle generation
- `npm run lint`: Code quality check

## 🔒 Security & Roles
Runi implements a strict security model:
- **Owners**: Full access to all modules, financial data, and staff management.
- **Staff**: Restricted access based on assigned permissions (Sales, Product editing, etc.).
- **Audit Trails**: Critical actions (Stock changes, Sale edits) require reasons and log the performing user.

## 👤 Author
**Ntwari K. Brian**

## 📄 License
[MIT](LICENSE)
