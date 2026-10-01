# Faruk Fashion - E-Commerce-Website

**Style That Speaks** — A full-stack e-commerce platform for bags, trolleys, handbags, school & college bags, kids bags, office bags, sling bags, and travelling kits.

## Features

* Customer registration, login & profile management
* Google Sign-In with OAuth2
* Forgot password with email OTP
* Product catalogue with categories, search & multiple images
* Shopping cart and checkout
* Razorpay online payments + Cash on Delivery
* Order tracking and returns
* Admin dashboard for products, stock, orders, customers & offers
* GST-based product pricing
* Order confirmation emails
* Dark / light theme
* Responsive design for desktop and mobile

## Tech Stack

| Layer          | Technology                                |
| -------------- | ----------------------------------------- |
| Frontend       | React 18, Vite, React Router, Axios, CSS  |
| Backend        | Java 21, Spring Boot 3.2, Spring Security |
| Authentication | JWT, Google OAuth2                        |
| Database       | MongoDB Atlas                             |
| Payments       | Razorpay                                  |
| Email          | Gmail SMTP                                |
| Notifications  | Twilio SMS / WhatsApp                     |
| Deployment     | Vercel, Render                            |

## Project Structure

```text
FarukFashion/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
└── Backend/
    ├── src/main/java/com/farukfashion/
    ├── src/main/resources/
    ├── Dockerfile
    └── pom.xml
```

## Prerequisites

* Node.js 18+
* Java 21
* Maven 3.9+
* MongoDB Atlas or MongoDB
* Razorpay account
* Gmail App Password

## Setup

### Backend

```bash
cd Backend
mvn spring-boot:run
```

Backend API:

```text
http://localhost:8080/api
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

### Environment Variables

Configure MongoDB, JWT, Razorpay, Gmail and frontend URL in the backend configuration.

Frontend:

```env
VITE_API_URL=http://localhost:8080/api
```

## Main API Endpoints

| Method | Endpoint                     | Purpose          |
| ------ | ---------------------------- | ---------------- |
| POST   | `/api/auth/register`         | Register user    |
| POST   | `/api/auth/login`            | User login       |
| POST   | `/api/auth/forgot-password`  | Password reset   |
| GET    | `/api/products`              | Get products     |
| POST   | `/api/orders`                | Create order     |
| POST   | `/api/orders/verify-payment` | Verify payment   |
| GET    | `/api/orders/my`             | Customer orders  |
| *      | `/api/admin/**`              | Admin operations |

## Admin Panel

Administrators can manage:

* Products and stock
* Orders
* Customers
* Offers and banners
* Product images and GST
* Store dashboard

## Payment & Notifications

**Razorpay** handles online payments, with Cash on Delivery also supported.

The platform can send **order confirmation emails** to customers and sellers. Optional SMS and WhatsApp notifications can be enabled through Twilio.

## Deployment

* **Frontend:** Vercel
* **Backend:** Render
* **Database:** MongoDB Atlas

Production environment variables should be configured through the hosting platform rather than committed to GitHub.

## Security

* JWT-based authentication
* Google OAuth2
* Role-based admin authorization
* Secure payment verification
* Environment-based secret configuration
* HTTPS recommended for production

## License

Private project for **Faruk Fashion**. All rights reserved.
