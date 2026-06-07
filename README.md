# Doctor Sahab 🩺

**Doctor Sahab** is a premium mobile application built with React Native and Expo. It serves as a modern healthcare portal connecting patients with specialist doctors, facilitating seamless appointment scheduling, and featuring a streaming AI-powered health assistant for instant guidance.

---

## 🚀 Key Features

- **👤 Secure Authentication & Profile Management**
  - Sign up and login via email/password.
  - Persistent sessions using React Context and AsyncStorage.
  - Comprehensive user profile detailing Name, Email, Address, Gender, Date of Birth, and Phone Number with a visual profile picture editor.

- **🔍 Smart Doctor Discovery**
  - Advanced search to locate doctors by name, speciality, degree, experience, fees, or location.
  - Quick filtering using interactive specialty chips (General Physician, Gynecologist, Dermatologist, Pediatrician, Neurologist, Cardiologist, etc.).
  - Instant call routing to get in touch with the clinic directly.

- **📅 Slot Booking & Appointment Scheduler**
  - Interactive profile pages showing doctor biographies, fees, and location details.
  - Date and time slot selectors for making real-time reservations.
  - Custom consultation duration and shift preferences.

- **💳 Active Appointment Manager**
  - Live appointments list with tabs for **Upcoming**, **Past**, and **All** bookings.
  - Real-time updates with background polling every 10 seconds.
  - Quick cancellations (with validation checks) and mock payment flow for settling dues online.

- **🤖 AI-Powered Health Assistant**
  - Advanced symptom analyzer and health chatbot.
  - Event streaming using **Server-Sent Events (SSE)** for fast, real-time typing responses.
  - Beautiful Markdown message rendering.
  - Quick action suggestion chips (e.g. Flu Symptoms, Find General Physician, Headache Analysis) for faster querying.

---

## 🛠️ Technology Stack

- **Framework**: [Expo](https://expo.dev) (SDK 54) & [React Native](https://reactnative.dev)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (File-based routing with tab and stacked navigation)
- **State Management**: React Context API (Authentication & Profile state)
- **Data Storage**: `@react-native-async-storage/async-storage`
- **Streaming**: `react-native-sse` for real-time AI streaming
- **Rich Text Rendering**: `react-native-markdown-display`
- **UI Components**: `@expo/vector-icons`, `react-native-safe-area-context`, `react-native-reanimated`, and native CSS-in-JS style configurations.

---

## 📁 Directory Structure

```text
Doctor-Sahab-App/
├── app/                      # Expo Router App entry
│   ├── (tabs)/               # Bottom tab navigation (Home, Doctors, Appointments, AI, Profile)
│   ├── details/              # Doctor detail screen [id].tsx
│   ├── info/                 # Markdown info pages [slug].tsx
│   └── profile/              # Profile editing screen edit.tsx
├── components/               # Reusable UI components
│   ├── details/              # Booking date/time and header views
│   └── home/                 # Category, Search, Headline, and Doctor lists
├── constants/                # Style, color, and theme configurations
├── context/                  # Context providers (e.g., AuthContext)
├── hooks/                    # Reusable React hooks
├── assets/                   # Image assets, icons, and fonts
├── .env                      # Local environment configuration variables
└── package.json              # Dependencies and execution scripts
```

---

## 🏁 Getting Started

### 📋 Prerequisites

Make sure you have the following installed on your local environment:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your mobile device, or an Android/iOS emulator set up.

### ⚙️ Installation & Setup

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd Doctor-Sahab-App
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (you can base it off `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Add your backend server URL to the environment configuration:
   ```env
   EXPO_PUBLIC_BACKEND_URL=https://your-backend-api-url.com
   ```

4. **Start the Development Server:**
   ```bash
   npm run start
   # or
   npx expo start
   ```

5. **Run the App:**
   - Scan the QR code printed in the terminal using your phone camera (iOS) or the Expo Go App (Android).
   - Press `a` to run on an Android Emulator.
   - Press `i` to run on an iOS Simulator.
   - Press `w` to open the web version.

---

## ⚠️ Disclaimer

The AI Assistant is designed to provide general health advice and information based on the symptoms provided. It does **not** replace a professional medical diagnosis, prescription, or doctor's advice. Always consult a certified healthcare professional for medical emergencies and personalized advice.
