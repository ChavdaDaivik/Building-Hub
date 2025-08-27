import { Building, Wing, Floor, Resident, Service, Message, MaintenanceRecord, PaymentMethod } from './types';

// Mock data for development
export const mockBuildings: Building[] = [
  {
    id: '1',
    name: 'Sunrise Apartments',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    totalFloors: 15,
    ownerId: 'owner1',
    paymentQRCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockWings: Wing[] = [
  {
    id: '1',
    name: 'Wing A',
    buildingId: '1',
    totalFloors: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Wing B',
    buildingId: '1',
    totalFloors: 15,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockFloors: Floor[] = [
  {
    id: '1',
    number: 1,
    wingId: '1',
    buildingId: '1',
    totalUnits: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    number: 2,
    wingId: '1',
    buildingId: '1',
    totalUnits: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockResidents: Resident[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    work: 'Software Engineer',
    maintenancePaid: true,
    maintenanceAmount: 500,
    buildingId: '1',
    wingId: '1',
    floorId: '1',
    unitNumber: '101',
    password: 'resident123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Cleaning Service',
    description: 'Daily cleaning and maintenance',
    servicemanName: 'Mike Johnson',
    phone: '+1234567891',
    address: '456 Service St',
    openingTime: '08:00',
    closingTime: '18:00',
    buildingId: '1',
    wingIds: ['1', '2'],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Welcome to Sunrise Apartments!',
    senderId: 'owner1',
    senderName: 'Building Manager',
    senderRole: 'owner',
    buildingId: '1',
    createdAt: new Date('2024-01-01'),
  },
];

export const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: '1',
    residentId: '1',
    residentName: 'John Doe',
    buildingId: '1',
    wingId: '1',
    floorId: '1',
    amount: 500,
    dueDate: new Date('2024-02-01'),
    paidDate: new Date('2024-01-15'),
    status: 'paid',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    buildingId: '1',
    type: 'qr',
    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    description: 'QR Code for Maintenance Payment',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    residentId: '1',
    buildingId: '1',
    amount: 500,
    type: 'maintenance',
    status: 'pending',
    qrCodeData: 'PAYMENT:1:Sunrise Apartments:MAINTENANCE:500:JOHN_DOE:101',
    dueDate: new Date('2024-02-01'),
    description: 'Monthly Maintenance Fee - February 2024',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
