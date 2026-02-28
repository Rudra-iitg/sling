# 🚗 Sling - Travel Companion Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/express-%5E4.18.2-blue)](https://expressjs.com/)

**Sling** is a modern travel companion platform that connects travelers heading in the same direction. Share rides, split costs, and make new friends along the way - just like Uber and Ola, but for finding travel companions.

![Sling Banner](https://via.placeholder.com/1200x400/2563eb/ffffff?text=Sling+-+Travel+Together,+Save+Together)

## 🌟 Features

### Core Features
- 🔐 **User Authentication** - Secure registration and login with JWT tokens
- 🗺️ **Interactive Maps** - Real-time map integration with Leaflet.js
- 🔍 **Smart Trip Search** - Find trips by location with radius-based filtering
- ➕ **Create Trips** - Easily create and manage your travel plans
- 👥 **Join Trips** - Connect with fellow travelers going your way
- ⭐ **User Profiles** - Comprehensive profiles with ratings and trip history
- 🔔 **Notifications** - Stay updated with real-time notifications
- 💬 **Reviews System** - Rate and review your travel companions
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### User Experience
- 🎨 Modern, clean UI inspired by leading ride-sharing apps
- 🌓 Professional color scheme and typography
- ⚡ Fast and smooth animations
- 📍 Geolocation support
- 🔄 Real-time updates
- 📊 Statistics dashboard

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rudra-iitg/sling.git
   cd sling
   ```

2. **Navigate to the project directory**
   ```bash
   cd travel-companion
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your settings:
   ```env
   PORT=3000
   JWT_SECRET=your-secret-key-here-change-in-production
   NODE_ENV=development
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser**

   Navigate to `http://localhost:3000`

🎉 You're all set! The application should now be running.

## 📁 Project Structure

```
sling/
├── travel-companion/
│   ├── public/
│   │   ├── css/
│   │   │   └── styles.css          # Main stylesheet
│   │   ├── js/
│   │   │   └── app.js              # Frontend JavaScript
│   │   └── index.html              # Main HTML file
│   ├── server/
│   │   ├── routes/
│   │   │   ├── auth.js             # Authentication routes
│   │   │   ├── trips.js            # Trip management routes
│   │   │   └── users.js            # User management routes
│   │   ├── database.js             # Database operations
│   │   ├── database.json           # JSON database file
│   │   └── index.js                # Express server setup
│   ├── package.json
│   └── .env                        # Environment variables
├── README.md
├── TODO.md
└── LICENSE
```

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables and animations
- **JavaScript (ES6+)** - Vanilla JavaScript for interactivity
- **Leaflet.js** - Interactive maps
- **Font Awesome** - Icon library
- **Google Fonts (Inter)** - Typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication tokens
- **bcrypt.js** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Database
- **JSON File-Based Storage** - Simple and effective for development
- *(Can be upgraded to MongoDB, PostgreSQL, or MySQL for production)*

## 📚 API Documentation

### Authentication Endpoints

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get current user
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Trip Endpoints

#### Get all trips
```http
GET /api/trips
```

#### Search trips by location
```http
GET /api/trips/search?lat=28.6139&lng=77.2090&radius=10
```

#### Create a trip
```http
POST /api/trips
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Weekend Trip to Mountains",
  "description": "Relaxing trip to the hills",
  "originAddress": "New Delhi",
  "originLat": 28.6139,
  "originLng": 77.2090,
  "destinationAddress": "Manali",
  "destinationLat": 32.2396,
  "destinationLng": 77.1887,
  "departureDate": "2024-06-15",
  "departureTime": "06:00",
  "maxCompanions": 3,
  "pricePerPerson": 1500,
  "transportMode": "car"
}
```

#### Join a trip
```http
POST /api/trips/:id/join
Authorization: Bearer <token>
```

#### Leave a trip
```http
POST /api/trips/:id/leave
Authorization: Bearer <token>
```

### User Endpoints

#### Get user profile
```http
GET /api/users/:id
```

#### Update profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Doe",
  "phone": "+1234567890",
  "bio": "Love to travel!"
}
```

## 🎯 Usage Guide

### For Travelers Looking for Companions

1. **Sign Up** - Create an account with your email
2. **Search Trips** - Use the search page to find trips near you
3. **Filter Results** - Narrow down by transport mode, date, and radius
4. **View Details** - Click on a trip to see full details
5. **Join Trip** - Request to join trips that match your plans
6. **Connect** - Get notified and coordinate with trip creators

### For Trip Creators

1. **Login** - Sign in to your account
2. **Create Trip** - Click "Create Trip" in the navigation
3. **Enter Details** - Fill in origin, destination, date, and other info
4. **Set Preferences** - Define max companions and pricing
5. **Publish** - Your trip is now visible to nearby travelers
6. **Manage** - View and manage trip requests from your dashboard

## 🔒 Security Features

- 🔐 Password hashing with bcrypt
- 🎫 JWT-based authentication
- 🛡️ CORS protection
- ✅ Input validation
- 🚫 SQL injection prevention (using parameterized queries)
- 🔑 Environment variable protection

## 🧪 Testing

Currently, the application can be tested manually. To run the application in development mode:

```bash
npm run dev
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Create a new trip
- [ ] Search for trips by location
- [ ] Join and leave trips
- [ ] Update user profile
- [ ] View notifications
- [ ] Responsive design on different devices

## 🚀 Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create sling-travel`
4. Set environment variables: `heroku config:set JWT_SECRET=your-secret`
5. Deploy: `git push heroku main`

### Deploy to DigitalOcean/AWS/Azure

1. Set up a Node.js server
2. Clone the repository
3. Install dependencies
4. Configure environment variables
5. Use PM2 or systemd to keep the app running
6. Set up Nginx as a reverse proxy

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 TODO & Roadmap

See [TODO.md](TODO.md) for planned features and known issues.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Rudra** - *Initial work* - [@Rudra-iitg](https://github.com/Rudra-iitg)

## 🙏 Acknowledgments

- Inspired by modern ride-sharing platforms like Uber and Ola
- Built with love for the travel community
- Special thanks to all contributors

## 📞 Support

For support, email rudra@example.com or open an issue in the GitHub repository.

## 🔗 Links

- [GitHub Repository](https://github.com/Rudra-iitg/sling)
- [Report Bug](https://github.com/Rudra-iitg/sling/issues)
- [Request Feature](https://github.com/Rudra-iitg/sling/issues)

---

**Made with ❤️ by the Sling Team**

*Travel Together, Save Together!*
