# genie
# GENIE

A full-stack home services booking platform built with the MERN stack. Genie helps users discover, book, and manage at-home service professionals for tasks like salon care, cleaning, appliance service, and maintenance.

[![GitHub repo size](https://img.shields.io/github/repo-size/AgarwalYash14/Genie)](https://github.com/AgarwalYash14/Genie) [![Visitors](https://api.visitorbadge.io/api/visitors?path=AgarwalYash14.Genie)](https://github.com/AgarwalYash14/Genie) [![GitHub stars](https://img.shields.io/github/stars/AgarwalYash14/Genie)](https://github.com/AgarwalYash14/Genie/stargazers) [![GitHub forks](https://img.shields.io/github/forks/AgarwalYash14/Genie)](https://github.com/AgarwalYash14/Genie/network/members) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## About

Genie is an innovative on-demand home services platform designed to make home maintenance simple, fast, and trustworthy. Built using MongoDB, Express.js, React, and Node.js, it connects homeowners with verified professionals in a single convenient booking experience.

![GENIE](https://raw.githubusercontent.com/AgarwalYash14/Genie/main/client/public/main_page.jpeg)

## Key Features

- Verified professionals and service categories
- Real-time booking and scheduling
- Secure payments using Razorpay
- Cart and checkout flow
- Responsive UI for desktop and mobile
- Admin dashboard for managing bookings and services
- JWT-based user authentication
- Google Places integration for location-based booking

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication

### Integrations

- Razorpay Payment Gateway
- Google Maps / Places API
- JWT for authentication

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)
- Git

### Getting Started

1. Clone the repository

```bash
git clone https://github.com/AgarwalYash14/Genie.git
cd Genie
```

2. Install frontend dependencies

```bash
cd client
npm install
```

3. Install backend dependencies

```bash
cd ../server
npm install
```

4. Configure environment variables

Create `.env` files in both folders using the example files already included.

Client example:

```bash
cp client/.env.example client/.env
```

Server example:

```bash
cp server/.env.example server/.env
```

Example values:

```env
# client/.env
VITE_PLACES_NEW_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
```

```env
# server/.env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/Genie
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_key_here
```

5. Run the application

Frontend:

```bash
cd client
npm run dev
```

Backend:

```bash
cd server
npm start
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

## Admin Credentials

Use the admin panel at the deployed site or local admin route and sign in with the configured admin account.

- Admin Email: `admin@gmail`
- Admin Password: `admin@1234`

## Benefits

### For Users

- Convenient booking system
- Verified professionals
- Transparent pricing
- Secure payment options
- Time-saving home service management

### For Service Providers

- Improved customer reach
- Easy profile management
- Reliable booking workflow
- Secure payment processing

## Future Scope

- Geographic expansion
- More service categories
- AI-powered recommendations
- Advanced analytics
- Sustainability features

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
