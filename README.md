<<<<<<< HEAD
# Building Hub - Modern Building Management System

A comprehensive mobile-first building management application built with Next.js, TypeScript, and Tailwind CSS. This app provides a complete solution for building owners and residents to manage properties, communicate, and handle maintenance.

## 🏗️ Features

### For Building Owners
- **Building Management**: Add, edit, and manage multiple buildings with detailed information
- **Wing & Floor Management**: Organize buildings into wings and floors for better structure
- **Resident Management**: Add, edit, and manage residents with automatic password generation
- **Service Management**: Configure and manage building services with provider details
- **Communication Hub**: Send messages and announcements to residents
- **Payment Methods**: Upload QR codes and images for online payments
- **Maintenance Tracking**: Monitor maintenance payments and status

### For Residents
- **Dashboard**: View building information, services, and announcements
- **Service Directory**: Access available building services with contact information
- **Message Center**: Receive and view building announcements
- **Maintenance Status**: Check maintenance payment status and history
- **Building Information**: Access building details, floor plans, and contact info

### Core Features
- **Role-based Access Control**: Secure separation between owners and residents
- **Real-time Communication**: Built-in messaging system for building announcements
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Authentication System**: Secure login and registration for both user types
- **Data Management**: Comprehensive data models for buildings, residents, and services

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd building-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Accounts

#### Owner Account
- **Email**: owner@example.com
- **Password**: owner123

#### Resident Account
- **Email**: john@example.com
- **Password**: resident123

## 🏛️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── login/            # Authentication pages
│   ├── owner/            # Owner-specific pages
│   │   ├── dashboard/    # Owner dashboard
│   │   ├── add/          # Add building
│   │   ├── residents/    # Manage residents
│   │   ├── services/     # Manage services
│   │   └── messages/     # Communication hub
│   ├── resident/         # Resident-specific pages
│   │   ├── dashboard/    # Resident dashboard
│   │   ├── messages/     # View announcements
│   │   └── services/     # View services
│   └── layout.tsx        # Root layout
├── components/            # Reusable UI components
│   └── ui/              # Shadcn/ui components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and data
│   ├── types.ts         # TypeScript interfaces
│   └── data.ts          # Mock data
└── public/               # Static assets
```

## 🎨 UI Components

The app uses a modern design system built with:
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality React components
- **Lucide React**: Beautiful icons
- **Responsive Design**: Mobile-first approach

## 🔐 Authentication & Security

- **Role-based Access**: Separate interfaces for owners and residents
- **Protected Routes**: Automatic redirection based on user role
- **Session Management**: Persistent login state with localStorage
- **Input Validation**: Form validation and error handling

## 📱 Mobile Features

- **Responsive Design**: Works seamlessly on all device sizes
- **Touch-friendly**: Optimized for mobile interactions
- **Progressive Web App**: Can be installed on mobile devices
- **Offline Support**: Basic functionality works without internet

## 🗄️ Data Models

### Building
- Basic information (name, address, city, state, zip)
- Total floors and wings
- Payment methods (QR codes, images)
- Owner association

### Wing
- Name and building association
- Total floors per wing
- Floor management

### Floor
- Floor number and wing association
- Total units per floor
- Unit management

### Resident
- Personal information (name, email, phone, work)
- Building, wing, floor, and unit assignment
- Maintenance payment status
- Auto-generated credentials

### Service
- Service details (name, description)
- Provider information (name, phone, address)
- Operating hours
- Building and wing availability

### Message
- Content and sender information
- Role-based messaging (owner/resident)
- Building-specific communication
- Timestamp and metadata

## 🚧 Development

### Adding New Features
1. Create new page in appropriate directory (`/owner` or `/resident`)
2. Add to navigation if needed
3. Update types in `lib/types.ts` if adding new data models
4. Add mock data in `lib/data.ts` for development

### Styling
- Use Tailwind CSS classes for styling
- Follow the existing design patterns
- Ensure mobile responsiveness
- Use the established color scheme

### State Management
- Use React hooks for local state
- Use AuthContext for authentication state
- Keep components focused and single-purpose

## 📦 Building for Production

### Build the app
```bash
npm run build
# or
yarn build
```

### Start production server
```bash
npm start
# or
yarn start
```

### Environment Variables
Create a `.env.local` file for environment-specific configuration:
```env
NEXT_PUBLIC_APP_NAME=Building Hub
NEXT_PUBLIC_API_URL=your-api-url
```

## 🔮 Future Enhancements

- **Real-time Chat**: WebSocket integration for live messaging
- **Push Notifications**: Mobile push notifications for announcements
- **File Upload**: Document and image management
- **Payment Integration**: Real payment gateway integration
- **Analytics Dashboard**: Building performance metrics
- **Maintenance Requests**: Resident maintenance request system
- **Visitor Management**: Guest registration and tracking
- **Parking Management**: Parking space allocation and management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@buildinghub.com

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Shadcn/ui** for the beautiful components
- **Tailwind CSS** for the utility-first CSS approach
- **Lucide** for the beautiful icons

---

**Building Hub** - Making building management simple and efficient. 🏢✨
=======
# Building-Hub
>>>>>>> 77fb5d2b15f652ee131f5bedf75151bef47904cc
