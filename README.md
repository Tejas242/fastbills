<div align="center">
  <h1>FastBills</h1>
  <p><strong>Supermarket Billing System</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue" alt="Platform iOS | Android">
    <img src="https://img.shields.io/badge/Made%20with-Expo%20%7C%20React%20Native-61dafb.svg" alt="Made with Expo and React Native">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License MIT">
  </p>
</div>

## 📱 Overview

FastBills is a comprehensive point of sale and inventory management solution built for modern supermarkets and retail stores. Built with React Native and Expo, this mobile application streamlines the billing process, inventory management, and provides detailed business analytics.

## ✨ Features

### 🛒 Product Management
- **Browse Products**: Intuitive catalog with category filtering and search
- **Barcode Scanning**: Quickly find products using device camera
- **Inventory Tracking**: Auto-updating stock levels with low stock alerts
- **Product Images**: Visual identification of products in catalog

### 🧾 Billing Operations
- **Smart Cart**: Real-time total calculation with tax estimation
- **Price Overrides**: Manager-authorized price modifications
- **Multiple Payment Methods**: Support for cash, card, and UPI payments
- **Change Calculation**: Automatic computing of change for cash payments

### 👥 Customer Management
- **Customer Details**: Save customer information for receipts
- **Loyalty Integration**: Ready for loyalty program implementation
- **Digital Receipts**: Share receipts via multiple channels

### 💼 Business Operations
- **Void Transactions**: Manager-approved void process with reason tracking
- **Returns & Refunds**: Process returns with reference to original transaction
- **Sales Reports**: Analyze sales by time period or category
- **Cash Register**: Track cash flow with opening/closing balances

### 🎨 User Experience
- **Role-Based Access**: Different permissions for cashiers vs managers
- **Dark Mode**: Full dark mode support for reduced eye strain
- **Responsive Design**: Works on various screen sizes and orientations
- **PDF Receipts**: Generate professional PDF receipts for printing or sharing

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app for testing on physical devices

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fastbills.git
   cd fastbills
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Open on your device:
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)
   - Or press 'a' for Android emulator / 'i' for iOS simulator

### Demo Credentials
- **Cashier Role:** username: `cashier`, password: `password`
- **Manager Role:** username: `manager`, password: `password123`

## 📂 Project Structure

```
fastbills/
├── app/                  # Expo Router app directory
│   ├── (tabs)/           # Tab-based screens
│   ├── bill/             # Bill detail screens
│   └── checkout/         # Checkout flow screens
├── assets/               # Static assets
├── components/           # Reusable UI components
│   ├── ui/               # Basic UI elements
│   └── themed/           # Theme-aware components
├── constants/            # App constants and configuration
├── context/              # React Context providers
├── data/                 # Sample data and mocks
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 📱 Application Screens

### Main Tabs
- **Products**: Browse available products with category filtering
- **Cart**: View current cart items and proceed to checkout
- **History**: Access past transactions and receipts
- **Settings**: User preferences and application settings

### Additional Screens
- **Checkout Flow**: Multi-step checkout process
- **Bill Details**: Detailed view of transaction with sharing options
- **Inventory Management**: Stock level adjustments and monitoring
- **Reports**: Sales and inventory analytics

## 🔧 Technical Implementation

### Core Technologies
- **React Native**: Cross-platform mobile framework
- **Expo**: Development toolchain and runtime
- **TypeScript**: Type safety throughout the application
- **expo-router**: File-based navigation system

### State Management
- **Context API**: App-wide state management
- **AsyncStorage**: Persistent local storage solution

### UI Components
- **Custom Themed Components**: Consistent styling with dark mode support
- **Expo Symbols**: Modern icon system
- **Reusable UI Library**: Composable component system

### Device Features
- **Camera**: Barcode scanning capabilities
- **Sharing**: PDF and text receipt sharing
- **Print**: Receipt printing preparation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Expo Team](https://expo.dev/) for the amazing development platform
- [React Native Community](https://reactnative.dev/) for the robust framework
- Icons made by various artists from [Expo Symbols](https://symbols.expo.fyi/)
