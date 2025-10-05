# ChatSpark - Real-time Chat Application

ChatSpark is a modern, real-time chat application built with React and Firebase, offering a seamless and interactive messaging experience. The application features a clean, intuitive interface with real-time message updates, user authentication, and file sharing capabilities.

## 🌟 Features

- **Real-time Messaging**: Instant message delivery and updates
- **User Authentication**: Secure email/password authentication with Firebase
- **User Profiles**: Customizable user profiles and display names
- **File Sharing**: Support for image uploads and sharing
- **Emoji Support**: Built-in emoji picker for expressive communication
- **Online Status**: Real-time user online/offline status
- **Search Users**: Easy user search functionality
- **Responsive Design**: Fully responsive layout for all devices
- **Message History**: Persistent chat history with timestamps

## 🛠️ Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ritikgupta856/ChatSpark.git
   cd chatspark-realtime-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password) and Firestore Database
   - Create a `.env` file in the root directory with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Start Chatting**: Search for users and start new conversations
3. **Share Files**: Upload and share images in conversations
4. **Customize Profile**: Update your profile picture and display name
5. **Manage Chats**: View and manage your chat history

## 🔐 Security Features

- Secure user authentication
- Protected routes
- Real-time data validation
- File upload restrictions
- User data privacy


