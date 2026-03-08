# ShopAI - AI-Powered E-Commerce Platform

<div align="center">

![ShopAI Logo](https://img.shields.io/badge/Shop-AI-purple?style=for-the-badge&labelColor=000)

**A next-generation e-commerce platform powered by artificial intelligence**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

[Demo](#demo) • [Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started)

</div>

---

## The Problem with Current E-Commerce Platforms

### What Traditional E-Commerce Lacks:

1. **No Intelligent Product Discovery**
   - Static search that only matches exact keywords
   - No understanding of user intent or context
   - Irrelevant search results frustrate users

2. **Generic Shopping Experience**
   - Same homepage for every visitor
   - No personalization based on preferences
   - One-size-fits-all product recommendations

3. **Poor Decision Support**
   - Overwhelming number of products without guidance
   - No AI assistant to help compare products
   - Customers left to research elsewhere

4. **Limited Customer Engagement**
   - No instant support outside business hours
   - Generic chatbots with scripted responses
   - No proactive shopping assistance

5. **Slow and Clunky Checkout**
   - Multiple page redirects
   - Account creation forced before purchase
   - Abandoned carts due to friction

---

## Our Solution: ShopAI

**ShopAI reimagines e-commerce with AI at its core, not as an afterthought.**

### What Makes Us Different:

| Feature | Traditional E-Commerce | ShopAI |
|---------|----------------------|--------|
| Search | Keyword matching only | AI-powered semantic search with intent understanding |
| Recommendations | "Customers also bought" | Personalized AI-curated suggestions based on behavior |
| Customer Support | Basic chatbot or none | AI Shopping Assistant with Groq-powered intelligence |
| Product Discovery | Category browsing | Natural language queries ("gift for my tech-savvy dad") |
| Checkout | Multi-step, account required | Streamlined COD with guest checkout |
| Performance | Heavy, slow loading | Optimized with Turbopack, instant page loads |

---

## Key Features

### AI-Powered Features

**Intelligent Shopping Assistant**
- Natural language product search
- Personalized recommendations
- Product comparisons and reviews summary
- Gift suggestions based on recipient profile

**Smart Search**
- Semantic understanding of queries
- Fuzzy matching for typos
- Context-aware results
- Real-time suggestions

### Core E-Commerce Features

**Product Management**
- 10+ categories with 100+ products
- Dynamic pricing with compare-at prices
- Stock management
- Featured products and badges
- Rich product images from Unsplash

**User Experience**
- Beautiful, responsive design
- Dark/Light theme support
- Instant cart updates with Zustand
- Wishlist synchronization
- Smart product filtering

**Authentication**
- Email/Password registration
- Google OAuth integration
- Secure session management
- Role-based access (Customer/Admin)

**Checkout Flow**
- Cash on Delivery (COD) payment
- Guest checkout support
- Address management
- Order tracking
- Order history

**Admin Capabilities**
- Product management
- Order management
- User management
- Analytics dashboard

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with App Router & Turbopack |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | Beautiful, accessible components |
| **Framer Motion** | Smooth animations |
| **Zustand** | Client state management |
| **TanStack Query** | Server state management |

### Backend
| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | RESTful API endpoints |
| **Prisma ORM** | Database management |
| **Supabase PostgreSQL** | Primary database |
| **NextAuth.js v5** | Authentication |

### AI Integration
| Technology | Purpose |
|------------|---------|
| **Groq AI** | Fast LLM inference for shopping assistant |
| **Vercel AI SDK** | AI integration layer |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **Caddy** | Reverse proxy with automatic HTTPS |
| **Bun** | Fast JavaScript runtime & package manager |

---

## Project Structure

```
shopai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── products/       # Product CRUD
│   │   │   ├── categories/     # Category management
│   │   │   ├── cart/           # Cart operations
│   │   │   ├── orders/         # Order processing
│   │   │   └── ai/             # AI endpoints
│   │   └── page.tsx            # Homepage
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Header, Footer
│   │   ├── store/              # Product, Cart components
│   │   └── auth/               # Authentication modals
│   │
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── auth.ts             # NextAuth config
│   │   └── stores/             # Zustand stores
│   │
│   └── types/                  # TypeScript definitions
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── public/                     # Static assets
└── mini-services/              # WebSocket services
```

---

## Database Schema

### Core Entities

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────<│    Order    │────<│  OrderItem  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  │                    ▼
┌─────────────┐           │            ┌─────────────┐
│   CartItem  │           │            │   Product   │
└─────────────┘           │            └─────────────┘
       │                  │                    │
       │                  │                    │
       ▼                  │                    ▼
┌─────────────┐           │            ┌─────────────┐
│ WishlistItem│           │            │  Category   │
└─────────────┘           │            └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │   Address   │
                   └─────────────┘
```

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (or Supabase account)
- Google Cloud Console account (for OAuth)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase (optional, if using Supabase)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth
NEXTAUTH_SECRET="your-random-secret-key"
AUTH_SECRET="your-random-secret-key"

# Admin Credentials
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shopai.git
cd shopai

# Install dependencies
bun install

# Generate Prisma client
bun run db:push

# Seed the database
bun run db:seed

# Start development server
bun run dev
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google`
4. Copy Client ID and Secret to your `.env`

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/signin` | Sign in with credentials |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/signout` | Sign out user |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (with filters) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:slug` | Get category by slug |

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart` | Add item to cart |
| PUT | `/api/cart/:id` | Update cart item |
| DELETE | `/api/cart/:id` | Remove from cart |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get user's orders |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:id` | Get order details |

---

## Features Roadmap

### Completed ✅
- [x] User authentication (Email + Google OAuth)
- [x] Product catalog with categories
- [x] Shopping cart with persistence
- [x] Wishlist functionality
- [x] Cash on Delivery checkout
- [x] Order management
- [x] Admin panel basics
- [x] Dark/Light theme
- [x] Responsive design

### In Progress 🚧
- [ ] AI Shopping Assistant chatbot
- [ ] Smart product recommendations
- [ ] Semantic search
- [ ] Product reviews and ratings

### Planned 📋
- [ ] Multiple payment methods (Stripe, Razorpay)
- [ ] Real-time order tracking
- [ ] Email notifications
- [ ] Inventory management
- [ ] Analytics dashboard
- [ ] Multi-vendor support
- [ ] International shipping

---

## Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+

Optimizations:
- Turbopack for fast builds
- Image optimization with Next.js Image
- Database connection pooling with Prisma
- Client-side state caching

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Unsplash](https://unsplash.com/) for product images
- [Groq](https://groq.com/) for fast AI inference
- [Supabase](https://supabase.com/) for backend infrastructure

---

<div align="center">

**Built with ❤️ **

[Website](#) • [Documentation](#) • [Report Bug](#) • [Request Feature](#)

</div>
