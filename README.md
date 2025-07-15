# ScammerAlert Platform

A comprehensive scammer alert platform built with React, TypeScript, and Firebase Realtime Database.

## Features

- 🔍 **Real-time Search**: Search scammers by name, phone number, or category
- ➕ **Public Reporting**: Submit scammer reports with screenshots (no login required)
- 🛠️ **Admin Panel**: Secure admin dashboard for report approval and management
- 📱 **Responsive Design**: Mobile-first design with smooth animations
- 🔒 **Secure**: Firebase security rules and admin authentication

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Realtime Database**
3. Copy your Firebase configuration
4. Update the `.env` file with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_ADMIN_PASSWORD=your-secure-admin-password
```

### 2. Database Rules

Copy the rules from `firebase-database-rules.json` to your Firebase Realtime Database Rules:

1. Go to Firebase Console → Realtime Database → Rules
2. Replace the default rules with the content from `firebase-database-rules.json`
3. Publish the rules

### 3. Installation

```bash
npm install
npm run dev
```

## Database Structure

```
/reports
  /{reportId}
    phoneNumber: string
    name: string (optional)
    category: string
    description: string (optional)
    screenshots: string[] (base64 encoded, max 3)
    approved: boolean
    reportCount: number
    createdAt: timestamp
    updatedAt: timestamp
```

## Usage

### Public Features
- **Search**: Enter name, phone number, or keyword to search for scammers
- **Report**: Submit new scammer reports with optional screenshots
- **View Results**: See verified scammer details with evidence

### Admin Features
- **Access**: Click settings icon → enter admin password
- **Review**: View all pending reports
- **Approve**: Approve reports to make them publicly visible
- **Manage**: Edit or delete reports as needed

## Security Features

- Firebase security rules prevent unauthorized access
- Admin panel protected by password authentication
- All reports require admin approval before becoming public
- Screenshots stored as base64 to avoid external storage dependencies

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Realtime Database
- **Icons**: Lucide React
- **Animations**: Custom CSS animations

## Production Deployment

1. Update Firebase security rules for production
2. Change admin password in environment variables
3. Configure Firebase hosting or deploy to your preferred platform
4. Set up proper authentication for admin panel (recommended)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details