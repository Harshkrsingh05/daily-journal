# daily-journal
It is a website where you can express your thoughts privately or publicly. It is built using Node.js, ExpressJs, Passport.js for authentication, and Mongoose for MongoDB database interaction.
You can visit website here. https://hkjournal.onrender.com/

# Features
User authentication with local strategy and Google OAuth 2.0
Ability for users to register, login, and logout
Secure password storage using bcrypt.js
Integration with MongoDB for storing user data and blog posts
Responsive design for better user experience on mobile devices

# Installation
Clone the repository
git clone <repository-url>
Install dependencies
cd <project-folder>
npm install
Set up environment variables:
Create a .env file in the root directory of your project and add the following variables:
MONGODB_URI=<your-mongodb-uri>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
SESSION_SECRET=<your-session-secret>
Start the server:
npm start

# Contributing
Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.
