# FBLA App

<p align="center">
  <img src="assets/images/fblalinkicon.png" alt="FBLA App icon" width="140" />
</p>

A mobile application built for the Future Business Leaders of America (FBLA) organization, designed to help students connect, discover events, access resources, and stay informed about the FBLA community.

## 📱 Overview

This app provides a centralized platform for FBLA members to:

- **Community** — Connect with other FBLA members and engage with social content
- **Events** — Browse and stay updated on upcoming FBLA events and competitions
- **Resources** — Access study materials, guides, and helpful resources
- **Profile** — Manage personal information and app preferences

## 🎨 Design

The app was designed using Figma for wireframing and UI prototyping.

> **Figma Wireframe:** https://www.figma.com/design/w8x2KONai1l4PURPQIDeCE/FBLA-App?node-id=1-2&t=YxcoLuUYObugUnPQ-1

## 🛠️ Tools & Technologies

| Category          | Technology                                                                     | Description                                                                |
| ----------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **Framework**     | [Expo](https://expo.dev)                                                       | React Native development framework for building cross-platform mobile apps |
| **Language**      | [TypeScript](https://www.typescriptlang.org/)                                  | Type-safe JavaScript for improved code quality                             |
| **Navigation**    | [React Navigation](https://reactnavigation.org/)                               | Routing and navigation library for React Native                            |
| **Backend**       | [Firebase](https://firebase.google.com/)                                       | Authentication, database, and cloud services                               |
| **UI Components** | Expo SDK                                                                       | Built-in Expo libraries for icons, fonts, haptics, and system UI           |
| **Animations**    | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | Smooth animations and gestures                                             |
| **Fonts**         | [Google Fonts (Lato)](https://fonts.google.com/specimen/Lato)                  | Custom typography via Expo Fonts                                           |

### Key Dependencies

- `expo-router` — File-based routing
- `react-native-screens` — Native screen optimization
- `react-native-gesture-handler` — Touch gesture handling
- `expo-image` — Optimized image loading
- `expo-haptics` — Tactile feedback
- `react-native-webview` — Web content rendering

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone (https://github.com/1prcntethan/fblaapp/tree/main)
   cd fblaapp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your preferred platform**
   - **iOS Simulator:** Press `i` in the terminal
   - **Android Emulator:** Press `a` in the terminal
   - **Web:** Press `w` in the terminal
   - **Expo Go:** Scan the QR code with the Expo Go app on your phone

## 📂 Project Structure

```
fblaapp/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.tsx         # Root layout with navigation
│   ├── index.tsx           # Home screen
│   ├── community.tsx       # Community feed screen
│   ├── events.tsx          # Events listing screen
│   ├── resources.tsx       # Resources screen
│   └── profile.tsx         # User profile screen
├── assets/                 # Images and media
├── constants/              # Theme colors, mock data
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 📜 Terms & Conditions

### Acceptance of Terms

By downloading, installing, or using this application, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, do not use the app.

### Use License

Permission is granted to use this application for personal, non-commercial purposes only. You may not:

- Modify or copy the application's source code
- Use the application for any unlawful purpose
- Attempt to reverse engineer or decompile the application
- Remove any copyright or proprietary notices

### User Content

Users are responsible for any content they post or share through the app. By using the app, you agree not to post content that:

- Is illegal, harmful, or offensive
- Infringes on intellectual property rights
- Contains viruses or malicious code
- Spams or solicits other users

### Privacy

This app may collect and process personal information as described in our Privacy Policy. By using the app, you consent to such processing.

### Disclaimers

The app is provided "as is" without warranty of any kind. The developers are not responsible for:

- Any errors or omissions in the app's content
- Any loss or damage resulting from app usage
- Service interruptions or technical issues

### Limitation of Liability

In no event shall the developers be liable for any indirect, incidental, or consequential damages arising from the use of the app.

### Changes to Terms

We reserve the right to modify these Terms & Conditions at any time. Continued use of the app after changes constitutes acceptance of the new terms.

## 📚 Sources & References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Fonts - Lato](https://fonts.google.com/specimen/Lato)
- [FBLA Official Website](https://www.fbla-pbl.org/)

## 📄 License

This project is for educational purposes as part of the FBLA competition.

---

_Last updated: April 2026_
