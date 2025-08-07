# Health App

### On Desktop

1. **Install Node.js**
   - Download and install Node.js from [https://nodejs.org](https://nodejs.org)

2. **Unzip the Code**
   - Extract the contents of the downloaded ZIP file to your preferred location.

### On Mobile

1. **Download Expo Go**
   - Install **Expo Go** from:
     - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
     - [Apple App Store](https://apps.apple.com/app/expo-go/id982107779)

---

## Running the Server

1. Open a command prompt and run:
   ```bash
   cd Server
   npm install
   npm run dev
   ```

---

## Running the Client

1. Open another command prompt and run:
   ```bash
   cd Client
   ```

2. Check your **IPv4 address**:
   - Run `ipconfig`
   - Copy your computer's **IPv4 address**

3. Update your configuration:
   - Open `Client/src/utils/config.js`
   - Replace the existing IP with your **IPv4 address**

4. Start the client:
   ```bash
   npm install
   npm start
   ```

5. You’ll see a **QR Code** in the terminal.

---

## Connect Mobile Device

1. Open **Expo Go** on your phone.
2. Scan the **QR Code** shown in the terminal.
