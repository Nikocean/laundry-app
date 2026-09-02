import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Courier,
  Order,
  OrderStatus,
  PerfumeOption,
  ServiceDefinition,
  AppNotification,
  UserRole,
  PaymentMethod,
  OrderItem,
  ServiceType,
} from '../types/laundry';
import { INITIAL_COURIERS, INITIAL_ORDERS, LAUNDRY_SERVICES, PERFUME_OPTIONS } from '../data/initialData';
import { generateOrderNumber } from '../utils/formatters';

export type AppViewMode = 'customer' | 'courier' | 'admin' | 'dual' | 'spec';

interface LaundryContextType {
  orders: Order[];
  couriers: Courier[];
  services: ServiceDefinition[];
  perfumes: PerfumeOption[];
  notifications: AppNotification[];
  activeViewMode: AppViewMode;
  setActiveViewMode: (mode: AppViewMode) => void;
  activeCourierId: string;
  setActiveCourierId: (id: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  
  // Actions
  createCustomerOrder: (data: {
    items: OrderItem[];
    serviceType: ServiceType;
    serviceName: string;
    perfumeAroma: string;
    customerAddress: string;
    customerPhone: string;
    customerName: string;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
    isExpress: boolean;
    totalWeightKg?: number;
  }) => Order;
  
  createOfflineWalkInOrder: (data: {
    customerName: string;
    customerPhone: string;
    serviceType: ServiceType;
    serviceName: string;
    items: OrderItem[];
    totalWeightKg?: number;
    perfumeAroma: string;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
    isExpress: boolean;
  }) => Order;
  
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, actorName?: string, notes?: string) => boolean;
  assignCourier: (orderId: string, courierId: string) => boolean;
  confirmPickup: (orderId: string, courierId: string) => boolean;
  confirmDelivery: (orderId: string, courierId: string, proofPhotoUrl?: string, signatureUrl?: string) => boolean;
  toggleCourierAvailability: (courierId: string) => void;
  updateCourierLocation: (courierId: string, x: number, y: number, address?: string) => void;
  updateServicePrice: (serviceId: string, newPrice: number) => void;
  addNotification: (title: string, message: string, targetRole: UserRole | 'all', orderId?: string) => void;
  markNotificationsAsRead: (role: UserRole) => void;
  resetDemoData: () => void;
  runDemoSimulation: () => void;
  isSimulating: boolean;
}

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const LaundryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('laundry_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [couriers, setCouriers] = useState<Courier[]>(() => {
    const saved = localStorage.getItem('laundry_couriers');
    return saved ? JSON.parse(saved) : INITIAL_COURIERS;
  });

  const [services, setServices] = useState<ServiceDefinition[]>(LAUNDRY_SERVICES);
  const [perfumes] = useState<PerfumeOption[]>(PERFUME_OPTIONS);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      targetRole: 'customer',
      title: 'Kurir Sedang Mengantar!',
      message: 'Kurir Budi Santoso sedang dalam perjalanan mengantar pesanan LND-2026-0891.',
      orderId: 'ord-001',
      timestamp: 'Baru saja',
      read: false,
      type: 'delivery_update'
    },
    {
      id: 'notif-2',
      targetRole: 'admin',
      title: 'Pesanan Baru Masuk!',
      message: 'Pesanan LND-2026-0894 dari Aulia Putri siap dijemput.',
      orderId: 'ord-004',
      timestamp: '10 menit lalu',
      read: false,
      type: 'order_created'
    }
  ]);

  const [activeViewMode, setActiveViewMode] = useState<AppViewMode>('dual');
  const [activeCourierId, setActiveCourierId] = useState<string>('courier-01');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ord-001');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('laundry_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('laundry_couriers', JSON.stringify(couriers));
  }, [couriers]);

  const addNotification = (title: string, message: string, targetRole: UserRole | 'all', orderId?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      targetRole,
      title,
      message,
      orderId,
      timestamp: 'Baru saja',
      read: false,
      type: 'status_changed'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = (role: UserRole) => {
    setNotifications(prev =>
      prev.map(n => (n.targetRole === role || n.targetRole === 'all' ? { ...n, read: true } : n))
    );
  };

  const createCustomerOrder = (data: {
    items: OrderItem[];
    serviceType: ServiceType;
    serviceName: string;
    perfumeAroma: string;
    customerAddress: string;
    customerPhone: string;
    customerName: string;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
    isExpress: boolean;
    totalWeightKg?: number;
  }): Order => {
    const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const deliveryFee = 10000;
    const discount = data.isExpress ? 0 : 5000;
    const totalPrice = subtotal + deliveryFee - discount;
    const orderNumber = generateOrderNumber();
    const now = new Date();
    const timestampStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      source: 'app_customer',
      customerId: 'cust-current',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      customerCoordinates: {
        x: Math.floor(25 + Math.random() * 50),
        y: Math.floor(25 + Math.random() * 50),
      },
      items: data.items,
      totalWeightKg: data.totalWeightKg,
      serviceType: data.serviceType,
      serviceName: data.serviceName,
      perfumeAroma: data.perfumeAroma,
      specialInstructions: data.specialInstructions,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cash' ? 'cod' : 'paid',
      subtotal,
      deliveryFee,
      discount,
      totalPrice,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isExpress: data.isExpress,
      timeline: [
        {
          status: 'pending',
          timestamp: timestampStr,
          title: 'Pesanan Dibuat',
          description: `Customer membuat pemesanan layanan ${data.serviceName} melalui aplikasi Flutter`,
          actor: 'customer',
          actorName: data.customerName,
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    addNotification('Pesanan Baru Masuk', `Pesanan ${orderNumber} dari ${data.customerName} menunggu penjemputan/konfirmasi`, 'admin', newOrder.id);
    return newOrder;
  };

  const createOfflineWalkInOrder = (data: {
    customerName: string;
    customerPhone: string;
    serviceType: ServiceType;
    serviceName: string;
    items: OrderItem[];
    totalWeightKg?: number;
    perfumeAroma: string;
    paymentMethod: PaymentMethod;
    specialInstructions?: string;
    isExpress: boolean;
  }): Order => {
    const subtotal = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    const deliveryFee = 0; // Walk-in offline no delivery fee by default
    const discount = 0;
    const totalPrice = subtotal;
    const orderNumber = generateOrderNumber();
    const now = new Date();
    const timestampStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      orderNumber,
      source: 'offline_pos',
      customerId: `cust-walkin-${Date.now()}`,
      customerName: data.customerName + ' (Walk-In Toko)',
      customerPhone: data.customerPhone,
      customerAddress: 'Ambil Sendiri di Outlet Laundry Hub',
      customerCoordinates: { x: 50, y: 50 },
      items: data.items,
      totalWeightKg: data.totalWeightKg,
      serviceType: data.serviceType,
      serviceName: data.serviceName,
      perfumeAroma: data.perfumeAroma,
      specialInstructions: data.specialInstructions,
      status: 'washing', // Langsung masuk antrian cuci workshop
      paymentMethod: data.paymentMethod,
      paymentStatus: 'paid',
      subtotal,
      deliveryFee,
      discount,
      totalPrice,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isExpress: data.isExpress,
      timeline: [
        {
          status: 'picked_up',
          timestamp: timestampStr,
          title: 'Diterima di Kasir Toko',
          description: 'Pakaian diserahkan customer di kasir POS outlet & ditimbang',
          actor: 'admin',
          actorName: 'Kasir Toko'
        },
        {
          status: 'washing',
          timestamp: timestampStr,
          title: 'Mulai Masuk Proses Cuci',
          description: `Pakaian diproses dengan parfum ${data.perfumeAroma}`,
          actor: 'admin',
          actorName: 'Workshop Team'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    addNotification('Order POS Kasir Dibuat', `Nota Walk-in ${orderNumber} berhasil dibuat dan masuk antrian cuci.`, 'admin', newOrder.id);
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    actorName: string = 'Admin Toko',
    notes?: string
  ): boolean => {
    const now = new Date();
    const timestampStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    let eventTitle = '';
    let eventDesc = '';

    switch (newStatus) {
      case 'pending':
        eventTitle = 'Menunggu Konfirmasi';
        eventDesc = notes || 'Pesanan berada dalam antrian verifikasi.';
        break;
      case 'picked_up':
        eventTitle = 'Cucian Diterima di Workshop';
        eventDesc = notes || 'Cucian telah dijemput dan masuk proses verifikasi timbangan.';
        break;
      case 'washing':
        eventTitle = 'Sedang Dicuci & Disetrika';
        eventDesc = notes || 'Pakaian sedang dicuci higienis, dikeringkan, dan disetrika uap.';
        break;
      case 'done':
        eventTitle = 'Selesai Cuci & QC Packing';
        eventDesc = notes || 'Pakaian telah disetrika rapi, wangi tahan lama, dan dipacking plastik kedap udara.';
        break;
      case 'delivering':
        eventTitle = 'Sedang Diantar Kurir';
        eventDesc = notes || 'Kurir membawa paket cucian dan sedang dalam perjalanan menuju lokasi Anda.';
        break;
      case 'delivered':
        eventTitle = 'Pesanan Selesai / Diterima';
        eventDesc = notes || 'Paket cucian telah diterima oleh customer.';
        break;
      case 'cancelled':
        eventTitle = 'Pesanan Dibatalkan';
        eventDesc = notes || 'Pesanan dibatalkan atas permintaan.';
        break;
    }

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedTimeline = [
            ...ord.timeline,
            {
              status: newStatus,
              timestamp: timestampStr,
              title: eventTitle,
              description: eventDesc,
              actor: (actorName.toLowerCase().includes('kurir') ? 'courier' : 'admin') as any,
              actorName,
            }
          ];

          return {
            ...ord,
            status: newStatus,
            updatedAt: now.toISOString(),
            timeline: updatedTimeline,
          };
        }
        return ord;
      })
    );

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      addNotification(
        `Status Pesanan Diperbarui: ${eventTitle}`,
        `Pesanan ${targetOrder.orderNumber} kini: ${eventTitle}`,
        'customer',
        orderId
      );
    }

    return true;
  };

  const assignCourier = (orderId: string, courierId: string): boolean => {
    const courier = couriers.find(c => c.id === courierId);
    if (!courier) return false;

    const now = new Date();
    const timestampStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const newStatus: OrderStatus = 'delivering';
          return {
            ...ord,
            courierId: courier.id,
            courierName: courier.name,
            courierPhone: courier.phone,
            courierAvatar: courier.avatar,
            status: newStatus,
            estimatedDeliveryTime: '20-30 Menit lagi',
            updatedAt: now.toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: newStatus,
                timestamp: timestampStr,
                title: 'Kurir Ditugaskan & Berangkat',
                description: `Kurir ${courier.name} (${courier.vehicle} - ${courier.plateNumber}) ditugaskan mengantar pesanan.`,
                actor: 'admin',
                actorName: 'Admin Operasional'
              }
            ]
          };
        }
        return ord;
      })
    );

    setCouriers(prev =>
      prev.map(c => (c.id === courierId ? { ...c, activeOrderId: orderId } : c))
    );

    addNotification(
      'Tugas Pengantaran Baru',
      `Anda ditugaskan mengantar pesanan laundry ke customer.`,
      'courier',
      orderId
    );
    addNotification(
      'Kurir Sedang Berangkat',
      `Kurir ${courier.name} sedang dalam perjalanan mengantar pakaian Anda.`,
      'customer',
      orderId
    );

    return true;
  };

  const confirmPickup = (orderId: string, courierId: string): boolean => {
    const courier = couriers.find(c => c.id === courierId);
    return updateOrderStatus(orderId, 'picked_up', courier ? `Kurir ${courier.name}` : 'Kurir', 'Cucian telah dijemput dari lokasi customer.');
  };

  const confirmDelivery = (
    orderId: string,
    courierId: string,
    proofPhotoUrl?: string,
    signatureUrl?: string
  ): boolean => {
    const courier = couriers.find(c => c.id === courierId);
    const now = new Date();
    const timestampStr = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'delivered',
            paymentStatus: 'paid',
            proofPhotoUrl: proofPhotoUrl || 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&auto=format&fit=crop&q=80',
            proofSignatureUrl: signatureUrl,
            updatedAt: now.toISOString(),
            timeline: [
              ...ord.timeline,
              {
                status: 'delivered',
                timestamp: timestampStr,
                title: 'Pesanan Berhasil Diserahterimakan',
                description: `Kurir ${courier?.name || 'Kurir'} berhasil menyerahkan pesanan kepada customer disertai bukti serah terima foto.`,
                actor: 'courier',
                actorName: courier?.name || 'Kurir'
              }
            ]
          };
        }
        return ord;
      })
    );

    setCouriers(prev =>
      prev.map(c => (c.id === courierId ? { ...c, activeOrderId: undefined, completedToday: c.completedToday + 1 } : c))
    );

    addNotification(
      'Pesanan Laundry Selesai!',
      'Terima kasih telah menggunakan jasa laundry kami. Pakaian Anda telah sampai.',
      'customer',
      orderId
    );
    addNotification(
      'Pengantaran Berhasil Diselesaikan',
      `Kurir ${courier?.name || ''} telah menyelesaikan pengantaran dengan bukti foto.`,
      'admin',
      orderId
    );

    return true;
  };

  const toggleCourierAvailability = (courierId: string) => {
    setCouriers(prev =>
      prev.map(c => (c.id === courierId ? { ...c, isAvailable: !c.isAvailable } : c))
    );
  };

  const updateCourierLocation = (courierId: string, x: number, y: number, address?: string) => {
    setCouriers(prev =>
      prev.map(c =>
        c.id === courierId
          ? {
              ...c,
              currentLocation: {
                x,
                y,
                address: address || c.currentLocation.address
              }
            }
          : c
      )
    );
  };

  const updateServicePrice = (serviceId: string, newPrice: number) => {
    setServices(prev =>
      prev.map(s => (s.id === serviceId ? { ...s, basePrice: newPrice } : s))
    );
  };

  const resetDemoData = () => {
    localStorage.removeItem('laundry_orders');
    localStorage.removeItem('laundry_couriers');
    setOrders(INITIAL_ORDERS);
    setCouriers(INITIAL_COURIERS);
    setSelectedOrderId('ord-001');
    addNotification('Data Reset', 'Data simulasi telah di-reset ke kondisi awal.', 'all');
  };

  // Live Simulation Runner (animates courier moving on map towards destination)
  const runDemoSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      // Move courier-01 gradually
      setCouriers(prev =>
        prev.map(c => {
          if (c.id === 'courier-01') {
            const nextX = Math.min(72, c.currentLocation.x + 6);
            const nextY = Math.max(38, c.currentLocation.y - 1);
            return {
              ...c,
              currentLocation: {
                x: nextX,
                y: nextY,
                address: `Jl. Menuju Apartemen Sudirman (Titik km ${(step * 0.4).toFixed(1)})`
              }
            };
          }
          return c;
        })
      );

      if (step >= 7) {
        clearInterval(interval);
        setIsSimulating(false);
        // Auto mark delivered to showcase full roundtrip!
        confirmDelivery('ord-001', 'courier-01');
      }
    }, 1200);
  };

  return (
    <LaundryContext.Provider
      value={{
        orders,
        couriers,
        services,
        perfumes,
        notifications,
        activeViewMode,
        setActiveViewMode,
        activeCourierId,
        setActiveCourierId,
        selectedOrderId,
        setSelectedOrderId,
        createCustomerOrder,
        createOfflineWalkInOrder,
        updateOrderStatus,
        assignCourier,
        confirmPickup,
        confirmDelivery,
        toggleCourierAvailability,
        updateCourierLocation,
        updateServicePrice,
        addNotification,
        markNotificationsAsRead,
        resetDemoData,
        runDemoSimulation,
        isSimulating,
      }}
    >
      {children}
    </LaundryContext.Provider>
  );
};

export const useLaundry = () => {
  const context = useContext(LaundryContext);
  if (!context) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};
