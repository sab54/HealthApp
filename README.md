# TrustCura+

**TrustCura+** is a full-stack mobile health application designed to help users become more self-aware of their daily health through simple logging, tracking, and personalized recommendations.  
When users feel they cannot manage issues with self-monitoring alone, they can consult with OCR-verified doctors, book appointments, and find nearby healthcare providers.  

It consists of two main components:

- **Client**: A **React Native app (Expo Go & Expo Snack)** for Android/iOS and browser preview.  
- **Server**: A **Node.js + Express backend** deployed on **AWS EC2**, managing authentication, health data, chat, and doctor verification with SQLite3 as the database.  

---

## Features

### Client (React Native + Expo Go + Expo Snack)
- **Authentication**: OTP-based registration and login with auto country code and silent verification.  
- **Daily Well-being Logging**: Mood, energy, and sleep quality.  
- **Symptom Tracking**: Up to 3 symptoms with severity and notes.  
- **Task Management**: Daily and custom health tasks.  
- **Trend Visualization**: Charts for mood, sleep, energy, and task completion.  
- **Personalized Recommendations**: Daily suggestions and weather-based advice.  
- **Doctor Consultation**:  
  - Credential upload with OCR verification.  
  - Appointment booking via built-in chat.  
  - Chat supports text, voice, and images.  
  - Share location with doctors.  
  - Find nearby hospitals, clinics, and pharmacies.  
- **Data Security**: Local encryption and secure API communication.  

### Server (Express + SQLite3 on AWS EC2)
- OTP-based authentication and authorization.  
- Doctor verification APIs.  
- Health data storage and retrieval.  
- Secure chat and appointment APIs.  
- Geo-location APIs for nearby providers.  
- Recommendation engine based on logs and weather.  

---

## User Roles

- **General User (Patient)**: Logs daily well-being, tracks symptoms, manages health tasks, views trends, receives recommendations, and can consult doctors when needed.  
- **Verified Doctor**: Uploads credentials for OCR verification, manages profile and availability, and communicates with patients through the built-in chat and appointment 


## Credentials to Login

- **General User (John Doe)**   
      Phone: +44 3333333333

- **Verified Doctor (Dr Sarah Johnson)**:
      Phone: +44 1111111111

- **Pending Verification Doctor (Dr Michael Brown)**:
      Phone: +44 2222222222
   

---

## OTP Authentication (Academic Project Note)

- The app uses **OTP-based authentication with auto-verification**.  
- In a real production system, OTPs would be sent via **SMS gateways**.  
- Due to **cost constraints** and the **academic nature of this project**, SMS delivery is **not enabled**.  
- Instead, OTPs are **simulated and auto-verified** in the background for demonstration purposes.  

---

## Project Structure

```
TrustCura+/
├── Client/                  # React Native app (Expo Go + Expo Snack)
│   ├── src/
│   │   ├── screens/         # UI screens
│   │   ├── components/      # Reusable UI components
│   │   └── utils/           # API helpers
│   └── package.json
│
├── Server/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/          # DB config
│   │   ├── migrations/      # SQLite schema setup
│   │   ├── routes/          # REST API endpoints
│   │   └── server.js        # Express entry point
│   ├── tests/               # Jest test suite
│   └── package.json
│
├── README.md
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)  
- [npm](https://www.npmjs.com/)  
- [Expo CLI](https://docs.expo.dev/get-started/installation/)  
- An **AWS EC2** instance for backend deployment  

---

## Permissions (Required)

To use core features, allow the following permissions when prompted:

- **Location** – find nearby providers and share your location during consultation.
- **Camera** – capture images (documents, symptoms) for chat and doctor verification.
- **Photos/Media/Files (Storage)** – upload credentials, share images, and download documents or reports.
- **Microphone** – send voice messages in chat.

If you previously denied a permission, enable it in your device settings:
- **Android**: Settings → Apps → **TrustCura+** → Permissions.
- **iOS**: Settings → **TrustCura+** → enable the listed permissions.

---


### 1. **Unzip the Code**
   - Extract the contents of the downloaded ZIP file to your preferred location.
   cd TrustCura+

---

### 2. Backend Setup (Server)

```bash
cd Server
npm install
```

## Running the Server
```bash
npm start
```
Server runs on: **http://localhost:3000**

#### Deployment on AWS EC2
1. Launch an **Ubuntu EC2 instance**.  
2. Install Node.js & npm.  

   cd TrustCura+/Server
   npm install
   ```
4. Start server with **nohup / pm2**:  
   ```bash
   npm install -g pm2
   pm2 start src/server.js
   pm2 save
   ```

---
 
## Running the Client

There are two ways to run and test the **TrustCura+ client app**:

### 1. Expo Go (Mobile – Recommended)

1. Install **Expo Go** on your mobile device:  
   - [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779)  
   - [Android (Google Play)](https://play.google.com/store/apps/details?id=host.exp.exponent)  

2. Start the client locally in another terminal:  
   ```bash
   cd Client
   ```
3.  Check your **IPv4 address**:
   - Run `ipconfig`
   - Copy your computer's **IPv4 address**

4. Update your configuration:
   - Open `Client/src/utils/config.js`
   - Replace the existing IP with your **IPv4 address**

5. Start the client:
   ```bash
   npm install
   npm start
   ```

6. Scan the QR code from your terminal/browser.  
   - On iOS → scan with **Camera app**.  
   - On Android → open **Expo Go** and scan the QR code. 

7. The app opens directly in **Expo Go**.   

---

### 2. Expo Snack (Browser – Quick Testing)
1. Visit [https://snack.expo.dev](https://snack.expo.dev).  
2. Upload or paste the project code from the `Client/` folder.  
3. Run the project directly in the browser  (https://snack.expo.dev/@sunidhia/trustcura).  
4. Test instantly on web or mobile without installing anything locally.  

Note: Extensive testing was done on Android
---

## Testing 

### Backend
```bash
cd Server
npm test
```

### Client
```bash
cd Client
npm test
```

---

## Troubleshooting (Quick)
- **Cannot reach backend from phone**: confirm `API_BASE` uses your machine’s **IPv4 and port 3000**, your phone and computer are on the **same network**, and EC2 Security Group allows inbound 5000 if pointing to EC2.  
- **QR code opens but app can’t fetch data**: check that the backend is running and CORS is configured if needed.  
- **Location/Camera not working**: ensure permissions are **allowed** in device settings.  
- **PM2 shows app stopped**: run `pm2 logs trustcura` to inspect errors; fix and `pm2 restart trustcura`.  

---