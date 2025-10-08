# AI-Powered Fintech Expense Management Dashboard

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

*A comprehensive, production-ready fintech application for intelligent expense tracking and management, featuring AI-powered categorization, real-time analytics, and robust financial reporting.*

[Demo](#-demo) • [Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## Overview

This is a senior-level full-stack fintech application that demonstrates modern web development practices with enterprise-grade architecture. Built with TypeScript, React, Node.js, and PostgreSQL, it features AI-powered expense categorization, real-time analytics, and comprehensive financial management tools.

### Architecture Highlights

- **Microservices-Ready**: Clean separation between frontend, backend, and database
- **AI Integration**: OpenAI GPT-4 for intelligent expense categorization
- **Real-time Analytics**: Interactive dashboards with live data visualization
- **Production Security**: JWT authentication, rate limiting, input validation
- **Scalable Design**: Docker containerization with horizontal scaling support

---

## Features

### **Authentication & Security**
- Secure JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting and request validation
- Protected routes and role-based access
- CORS and security headers (Helmet.js)

### **Expense Management**
- Full CRUD operations for expenses
- Advanced filtering and search capabilities
- Bulk import/export functionality
- Receipt upload and management
- Recurring expense tracking
- Multi-category tagging system

### **AI-Powered Features**
- **Smart Categorization**: OpenAI GPT-4 integration for automatic expense categorization
- **Confidence Scoring**: AI predictions with accuracy metrics
- **Learning System**: Improves accuracy based on user corrections
- **Fallback Rules**: Rule-based categorization when AI is unavailable

### **Analytics & Reporting**
- **Real-time Dashboard**: Interactive charts and KPIs
- **Spending Trends**: Time-series analysis with multiple grouping options
- **Category Insights**: Detailed breakdown of spending patterns
- **Budget Tracking**: Visual progress indicators and alerts
- **Custom Reports**: Exportable financial reports (PDF, CSV, Excel)

### **User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: User preference-based theming
- **Offline Support**: Progressive Web App capabilities
- **Real-time Updates**: Live data synchronization
- **Accessibility**: WCAG 2.1 AA compliant

---

## Technology Stack

### **Frontend**
```
React 18 + TypeScript
├── Vite (Build Tool)
├── TanStack Query (Server State)
├── React Router v6 (Routing)
├── React Hook Form + Zod (Forms & Validation)
├── Tailwind CSS (Styling)
├── Recharts (Data Visualization)
├── Lucide React (Icons)
└── Zustand (Client State)
```

### **Backend**
```
Node.js + Express + TypeScript
├── Prisma ORM (Database)
├── PostgreSQL 15 (Database)
├── JWT + bcryptjs (Authentication)
├── OpenAI API (AI Features)
├── Winston (Logging)
├── Helmet (Security)
├── Express Rate Limit (Rate Limiting)
└── Zod (Validation)
```

### **Infrastructure**
```
Docker + Docker Compose
├── PostgreSQL (Database)
├── Redis (Caching)
├── Nginx (Reverse Proxy)
└── Prisma (Database Management)
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or use Docker)
- **Redis** 6+ (optional, for caching)
- **OpenAI API Key** (for AI features)

### Option 1: Docker Setup (Recommended)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd fintech-dashboard

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see Environment Setup below)

# 3. Start all services with Docker
docker-compose up -d

# 4. Run database migrations and seed data
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Health Check: http://localhost:3001/health
```

### Option 2: Local Development

```bash
# 1. Set up the database
createdb fintech_db

# 2. Backend setup
cd backend
npm install
cp .env.example .env
# Configure your database URL and other settings
npm run migrate
npm run seed
npm run dev

# 3. Frontend setup (in another terminal)
cd frontend
npm install
npm run dev

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

---

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/fintech_db

# Authentication
JWT_SECRET=your-super-secure-32-character-secret-key
JWT_EXPIRY=7d

# AI Features
OPENAI_API_KEY=sk-your-openai-api-key-here

# Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL='https://ai-powered-fintech-expense-management.onrender.com/api'
```

### Optional Variables

```bash
# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |
| `PUT` | `/api/auth/password` | Change password | ✅ |

### Expense Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/expenses` | List expenses (paginated) | ✅ |
| `POST` | `/api/expenses` | Create expense | ✅ |
| `PUT` | `/api/expenses/:id` | Update expense | ✅ |
| `DELETE` | `/api/expenses/:id` | Delete expense | ✅ |
| `POST` | `/api/expenses/bulk` | Bulk import | ✅ |
| `POST` | `/api/expenses/:id/categorize` | AI categorization | ✅ |

### Analytics & Reporting

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/analytics/overview` | Dashboard overview | ✅ |
| `GET` | `/api/analytics/trends` | Spending trends | ✅ |
| `GET` | `/api/analytics/categories` | Category analysis | ✅ |
| `GET` | `/api/reports` | List reports | ✅ |
| `POST` | `/api/reports/generate` | Generate report | ✅ |

### Query Parameters

```bash
# Expense filtering
GET /api/expenses?page=1&limit=20&category=food&startDate=2024-01-01

# Analytics grouping
GET /api/analytics/trends?period=month&groupBy=category&categories=food,transport
```

---

## 🏛️ Database Schema

### Core Tables

```sql
-- Users table
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
categories (
  id UUID PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR DEFAULT '#3B82F6',
  icon VARCHAR DEFAULT 'folder',
  is_default BOOLEAN DEFAULT false
);

-- Expenses table
expenses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  merchant VARCHAR,
  payment_method payment_method_enum,
  ai_confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance

```sql
-- Optimized for common queries
CREATE INDEX idx_expenses_user_date ON expenses(user_id, transaction_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expenses_merchant ON expenses(merchant);
```

---

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard-specific components
│   ├── expenses/           # Expense management
│   └── reports/            # Reporting components
├── hooks/                  # Custom React hooks
├── services/               # API services
├── types/                  # TypeScript interfaces
└── utils/                  # Utility functions
```

### State Management Strategy

- **Server State**: TanStack Query for API data and caching
- **Client State**: Zustand for UI state management
- **Form State**: React Hook Form for form handling
- **URL State**: React Router for navigation state

### Custom Hooks

```typescript
// Example usage
const { data: expenses, isLoading } = useExpenses({
  page: 1,
  limit: 20,
  category: 'food'
});

const createExpense = useCreateExpense();
await createExpense.mutateAsync(expenseData);
```

---

## AI Integration Details

### OpenAI Configuration

```typescript
// AI Service Configuration
const aiService = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  temperature: 0.1, // Low for consistent results
});
```

### Categorization Process

1. **Primary**: OpenAI GPT-4 analysis of transaction data
2. **Fallback**: Rule-based categorization using keywords
3. **Learning**: User corrections improve future predictions
4. **Confidence**: Each prediction includes accuracy score

### Example AI Prompt

```
Analyze this expense:
- Description: "Coffee and pastry at local cafe"
- Merchant: "Blue Bottle Coffee"
- Amount: $12.50

Categories: [Food & Dining, Transportation, Shopping, ...]

Return: {"category": "Food & Dining", "confidence": 0.95}
```

---

## Analytics Features

### Dashboard Metrics

- **Total Spending**: Current vs previous period comparison
- **Transaction Count**: Volume analysis with trends
- **Average Transaction**: Spending behavior insights
- **Category Breakdown**: Visual distribution with charts

### Chart Types

- **Line Charts**: Spending trends over time
- **Pie Charts**: Category distribution
- **Bar Charts**: Comparative analysis
- **Progress Bars**: Budget vs actual spending

### Real-time Updates

```typescript
// Live data updates using React Query
const { data } = useQuery({
  queryKey: ['dashboard-overview'],
  queryFn: fetchOverview,
  refetchInterval: 30000, // 30 seconds
});
```

---

## Security Features

### Authentication Security

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 salt rounds
- **Token Expiry**: Configurable expiration times
- **Refresh Tokens**: Secure session management

### API Security

- **Rate Limiting**: Request throttling per IP/user
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Origin allowlist

### Infrastructure Security

```typescript
// Security middleware stack
app.use(helmet()); // Security headers
app.use(rateLimit()); // Rate limiting
app.use(cors(corsOptions)); // CORS configuration
app.use(validateInput); // Input validation
```

---

## Testing

### Backend Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Frontend Testing

```bash
# Component tests
npm test

# E2E tests
npm run test:e2e

# Visual regression
npm run test:visual
```

### Test Coverage Goals

- **Backend**: 90%+ coverage
- **Frontend**: 85%+ coverage
- **Critical Paths**: 100% coverage
- **API Endpoints**: All tested

---

## Deployment

### Docker Production

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With SSL and load balancing
docker-compose --profile production up -d
```

### Environment-Specific Configs

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: ${DATABASE_URL}
  
  frontend:
    environment:
      VITE_API_URL: ${API_URL}
```

### Health Checks

```bash
# Application health
curl http://localhost:3001/health

# Database connectivity included
# Response: {"status":"healthy","timestamp":"..."}
```

---

## Performance Optimizations

### Database Optimizations

- **Indexes**: Optimized for common query patterns
- **Connection Pooling**: Efficient resource usage
- **Query Optimization**: Analyzed and optimized slow queries

### Frontend Optimizations

- **Code Splitting**: React.lazy for bundle optimization
- **Virtual Scrolling**: Efficient large list rendering
- **Image Optimization**: WebP format with lazy loading
- **Caching Strategy**: React Query with background updates

### Backend Optimizations

- **Response Compression**: Gzip compression for API responses
- **Redis Caching**: Frequently accessed data caching
- **Request Deduplication**: Prevent duplicate API calls

---

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages
- **Code Reviews**: Required for all changes

### Pull Request Guidelines

- Update documentation for API changes
- Add tests for new features
- Ensure CI/CD pipeline passes
- Include screenshots for UI changes

---

## Learning Resources

### Architecture Decisions

- [ADR-001: Database Schema Design](docs/adr/001-database-schema.md)
- [ADR-002: API Design Patterns](docs/adr/002-api-design.md)
- [ADR-003: State Management Strategy](docs/adr/003-state-management.md)

### Development Guides

- [Setting up Development Environment](docs/development/setup.md)
- [API Integration Guide](docs/development/api-integration.md)
- [Testing Best Practices](docs/development/testing.md)

---

## Troubleshooting

### Common Issues

<details>
<summary><strong>Database Connection Issues</strong></summary>

```bash
# Check PostgreSQL status
docker-compose logs postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Reset database
npm run reset-db
```
</details>

<details>
<summary><strong>Frontend Build Issues</strong></summary>

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```
</details>

<details>
<summary><strong>API Connection Issues</strong></summary>

```bash
# Verify backend health
curl http://localhost:3001/health

# Check environment variables
echo $VITE_API_URL

# Inspect network requests in browser DevTools
```
</details>

---

## Demo

### Demo Credentials

```
Email: demo@fintech.com
Password: demo123456
```

### Sample Data

The application comes with pre-seeded data including:
- **50+ sample expenses** across different categories
- **Default categories** with proper icons and colors
- **Mock budget data** for testing budget features
- **Analytics data** for dashboard visualization

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **OpenAI** for AI categorization capabilities
- **Prisma** team for excellent ORM
- **TanStack** for powerful React utilities
- **Tailwind CSS** for utility-first styling
- **React** and **Node.js** communities

---

## Support

### Getting Help

-  **Documentation**: Check the docs folder for detailed guides
-  **Bug Reports**: Open an issue with reproduction steps
-  **Feature Requests**: Suggest improvements via issues
-  **Discussions**: Join our community discussions

### Contact

- **Email**: support@fintech-dashboard.com
- **Documentation**: [docs.fintech-dashboard.com](https://docs.fintech-dashboard.com)
- **Demo**: [demo.fintech-dashboard.com](https://demo.fintech-dashboard.com)

---

<div align="center">

**Built with ❤️ for modern fintech applications**

⭐ Star this repo if you find it helpful!

</div>