# QR Code Features - Building Management System

## Overview
This building management system now includes comprehensive QR code functionality for building access, payments, and service management. QR codes provide a secure and convenient way for residents and owners to interact with the system.

## Features Added

### 1. QR Code Generation
- **Payment QR Codes**: Generate QR codes for maintenance and utility payments
- **Access QR Codes**: Create building entry QR codes for residents and visitors
- **Service QR Codes**: Generate QR codes for service requests and maintenance
- **Custom QR Codes**: Create custom QR codes for any building-related purpose

### 2. QR Code Management (Owner)
- **Centralized Management**: Manage all QR codes from one dashboard
- **Building-Specific QR Codes**: Generate unique QR codes for each building
- **Payment Integration**: Link QR codes to payment systems
- **Access Control**: Manage building entry permissions via QR codes

### 3. QR Code Scanning (Resident)
- **Building Access**: Scan QR codes to enter buildings
- **Payment Processing**: Scan payment QR codes for quick transactions
- **Service Requests**: Scan service QR codes to request maintenance
- **Information Display**: View building details from scanned QR codes

### 4. Payment System Integration
- **QR Code Payments**: Pay maintenance fees by scanning QR codes
- **Payment History**: Track all payment transactions
- **Multiple Payment Methods**: Support for credit cards, bank transfers, and QR codes
- **Real-time Status Updates**: Instant payment confirmation

## How to Use

### For Building Owners

#### 1. Access QR Code Management
- Navigate to `/owner/qr-codes` in your dashboard
- Use the navigation menu to access QR Code Management

#### 2. Generate New QR Codes
- Go to the "Generate New" tab
- Select QR code type (Payment, Building Access, Service, Contact, Custom)
- Enter the required data
- Click "Generate QR Code"

#### 3. Manage Existing QR Codes
- Use the "Manage QR Codes" tab
- Filter by building
- View all QR codes for each building
- Download or copy QR code data

#### 4. QR Code Types Available
- **Payment QR**: `PAYMENT:BuildingID:BuildingName:Type:Amount:Resident:Unit`
- **Access QR**: `ACCESS:BuildingID:BuildingName:EntryPoint`
- **Service QR**: `SERVICE:ServiceType:BuildingID:Contact`
- **Contact QR**: `CONTACT:Name:Phone:Email:BuildingID`

### For Residents

#### 1. Scan Building QR Codes
- Navigate to `/resident/qr-codes`
- Use the "Scan QR Code" tab
- Allow camera access when prompted
- Point camera at building QR codes

#### 2. Make Payments via QR Code
- Go to `/resident/payment`
- View your payment QR code in the overview
- Scan the QR code with your payment app
- Complete the payment process

#### 3. Access Building Information
- Scan any building QR code
- View building details and access status
- Check payment requirements
- Access service information

## Technical Implementation

### QR Code Components
- **QRCodeDisplay**: Shows QR codes with download and copy options
- **QRCodeGenerator**: Creates new QR codes with custom data
- **QRCodeScanner**: Scans QR codes using device camera

### Data Format
QR codes use a structured format for easy parsing:
```
TYPE:ID:NAME:SUBTYPE:VALUE:ADDITIONAL_INFO
```

Examples:
- `PAYMENT:1:Sunrise Apartments:MAINTENANCE:500:JOHN_DOE:101`
- `ACCESS:1:Sunrise Apartments:ENTRANCE:MAIN`
- `SERVICE:CLEANING:1:MIKE_JOHNSON:+1234567891`

### Security Features
- **Role-based Access**: Only authorized users can generate/scan QR codes
- **Building-specific Codes**: QR codes are tied to specific buildings
- **Data Validation**: QR code data is validated before processing
- **Access Logging**: All QR code scans are logged for security

## Installation and Setup

### 1. Install Dependencies
```bash
npm install qrcode react-qr-code qr-scanner
```

### 2. Import Components
```typescript
import { QRCodeDisplay, QRCodeGenerator, QRCodeScanner } from '@/components/ui/qr-code';
```

### 3. Use in Your Components
```typescript
// Display a QR code
<QRCodeDisplay 
  data="PAYMENT:1:Building:MAINTENANCE:500"
  title="Payment QR"
  description="Scan to pay"
/>

// Generate new QR codes
<QRCodeGenerator />

// Scan QR codes
<QRCodeScanner />
```

## File Structure

```
components/
  ui/
    qr-code.tsx          # Main QR code components
dashboard/
  OwnerNavigation.tsx    # Navigation with QR code links
app/
  owner/
    qr-codes/
      page.tsx           # Owner QR code management
  resident/
    qr-codes/
      page.tsx           # Resident QR code scanner
    payment/
      page.tsx           # Payment system with QR codes
lib/
  types.ts               # Updated with Payment interface
  data.ts                # Mock data for QR codes
```

## Benefits

### For Building Owners
- **Efficient Management**: Centralized QR code management
- **Cost Reduction**: Reduced need for physical access cards
- **Better Security**: Track all building access
- **Payment Automation**: Streamlined payment collection

### For Residents
- **Convenient Access**: No need to carry physical keys/cards
- **Quick Payments**: Instant payment via QR codes
- **Better Information**: Access building details instantly
- **Mobile-First**: Works seamlessly on mobile devices

## Future Enhancements

### Planned Features
- **Biometric Integration**: Combine QR codes with fingerprint/face recognition
- **Offline Support**: QR codes that work without internet
- **Advanced Analytics**: Track QR code usage patterns
- **Integration APIs**: Connect with third-party payment systems
- **Multi-language Support**: Localized QR code content

### Technical Improvements
- **Real-time Updates**: Live QR code generation and updates
- **Advanced Encryption**: Enhanced security for sensitive data
- **Performance Optimization**: Faster QR code generation and scanning
- **Mobile App**: Native mobile applications for better performance

## Troubleshooting

### Common Issues

#### 1. Camera Not Working
- Ensure camera permissions are granted
- Check if device supports camera access
- Try refreshing the page

#### 2. QR Code Not Scanning
- Ensure good lighting conditions
- Hold camera steady
- Check if QR code is damaged or obscured

#### 3. Payment Issues
- Verify QR code data is correct
- Check payment method is supported
- Ensure sufficient funds

### Support
For technical support or feature requests, please contact the development team or create an issue in the project repository.

## Conclusion

The QR code system provides a modern, secure, and convenient way to manage building access, payments, and services. It enhances the user experience for both building owners and residents while maintaining security and efficiency.

The system is designed to be scalable and can be easily extended with additional features as needed.
