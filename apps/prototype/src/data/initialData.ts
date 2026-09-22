import { Courier, Order, PerfumeOption, ServiceDefinition } from '../types/laundry';

export const LAUNDRY_SERVICES: ServiceDefinition[] = [
  {
    id: 'kiloan_reguler',
    name: 'Cuci Kiloan Reguler (Cuci + Kering + Setrika + Lipat)',
    description: 'Pakaian sehari-hari ditimbang kiloan. Bersih wangi, disetrika rapi dan dipacking plastik kedap.',
    category: 'kiloan',
    basePrice: 9000,
    unit: 'kg (Min. 3 kg)',
    estimatedDurationHours: 48,
    iconName: 'Shirt',
    popular: true
  },
  {
    id: 'kiloan_express',
    name: 'Cuci Kiloan Express 24 Jam',
    description: 'Layanan prioritas kilat. Pakaian selesai dicuci, disetrika, dan siap diantar dalam waktu 24 jam.',
    category: 'kiloan',
    basePrice: 15000,
    unit: 'kg (Min. 3 kg)',
    estimatedDurationHours: 24,
    iconName: 'Zap',
    popular: true
  },
  {
    id: 'satuan_baju',
    name: 'Cuci Satuan Premium (Jas, Gaun, Kemeja Sutra)',
    description: 'Perawatan khusus dry clean / wet clean premium untuk jas formal, batik sutra, blazer, & gaun pesta.',
    category: 'satuan',
    basePrice: 35000,
    unit: 'potong',
    estimatedDurationHours: 72,
    iconName: 'Sparkles',
    popular: false
  },
  {
    id: 'satuan_tas',
    name: 'Cuci & Spa Tas Branded (Leather / Canvas / Suede)',
    description: 'Pembersihan mendalam, deep cleaning, leather conditioning & penghilangan noda jamur pada tas kesayangan.',
    category: 'spesial',
    basePrice: 65000,
    unit: 'buah',
    estimatedDurationHours: 96,
    iconName: 'Briefcase',
    popular: true
  },
  {
    id: 'satuan_sepatu',
    name: 'Deep Clean Sepatu & Sneakers',
    description: 'Cuci sepatu komprehensif: upper, midsole, outsole, insole, tali sepatu, dan anti-bacterial treatment.',
    category: 'spesial',
    basePrice: 40000,
    unit: 'pasang',
    estimatedDurationHours: 72,
    iconName: 'Footprints',
    popular: true
  },
  {
    id: 'satuan_bedcover',
    name: 'Cuci Bedcover & Blanket King Size',
    description: 'Pencucian higienis dengan mesin kapasitas besar, disanitasi tungau & debu dengan aroma tahan lama.',
    category: 'satuan',
    basePrice: 35000,
    unit: 'set',
    estimatedDurationHours: 48,
    iconName: 'Layers',
    popular: false
  },
  {
    id: 'setrika_saja',
    name: 'Setrika Uap Kiloan Saja',
    description: 'Hanya setrika uap rapi bergaransi tanpa kusut untuk pakaian yang sudah dicuci di rumah.',
    category: 'kiloan',
    basePrice: 6000,
    unit: 'kg',
    estimatedDurationHours: 24,
    iconName: 'Flame',
    popular: false
  }
];

export const PERFUME_OPTIONS: PerfumeOption[] = [
  { id: 'sakura', name: 'Sakura Blossom (Floral Lembut)', notes: 'Aroma bunga jepang segar & manis menenangkan', isPopular: true },
  { id: 'ocean_fresh', name: 'Ocean Breeze (Segar Sporty)', notes: 'Aroma dingin fresh cocok untuk pakaian santai & aktif', isPopular: true },
  { id: 'lavender', name: 'French Lavender (Aromatherapy)', notes: 'Wangi relaksasi cocok untuk sprei, selimut, & piyama' },
  { id: 'vanilla_sweet', name: 'Vanilla Comfort (Hangat Mewah)', notes: 'Aroma manis vanila lembut tahan hingga 14 hari' },
  { id: 'snappy', name: 'Baby Snappy (Bedak Bayi Lembut)', notes: 'Aroma khas bedak bayi yang lembut & ramah kulit sensitif' }
];

export const INITIAL_COURIERS: Courier[] = [
  {
    id: 'courier-01',
    name: 'Budi Santoso',
    phone: '0812-9876-5432',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    vehicle: 'Honda Vario 160 (Box Laundry)',
    plateNumber: 'B 4128 KLS',
    rating: 4.9,
    isAvailable: true,
    currentLocation: {
      x: 35,
      y: 42,
      address: 'Jl. Kemang Raya No. 18, Jakarta Selatan'
    },
    completedToday: 7
  },
  {
    id: 'courier-02',
    name: 'Rian Pratama',
    phone: '0857-1122-3344',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    vehicle: 'Yamaha NMAX 155',
    plateNumber: 'B 3899 SXZ',
    rating: 4.8,
    isAvailable: true,
    currentLocation: {
      x: 68,
      y: 55,
      address: 'Jl. Senopati No. 44, Kebayoran Baru'
    },
    completedToday: 5
  },
  {
    id: 'courier-03',
    name: 'Agus Setiawan',
    phone: '0878-5566-7788',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    vehicle: 'Honda Beat Street',
    plateNumber: 'B 6241 TXM',
    rating: 4.7,
    isAvailable: false,
    currentLocation: {
      x: 50,
      y: 50,
      address: 'Hub Klinik Cuci Express Pusat'
    },
    completedToday: 9
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    orderNumber: 'LND-2026-0891',
    source: 'app_customer',
    customerId: 'cust-01',
    customerName: 'Nikolas Marcellino',
    customerPhone: '0813-8899-0011',
    customerAddress: 'Apartemen Sudirman Park Tower B No. 1402, Jl. KH Mas Mansyur, Jakarta Pusat',
    customerCoordinates: { x: 72, y: 38 },
    items: [
      { id: 'item-1', name: 'Cuci Kiloan Reguler', category: 'kiloan', quantity: 1, unitPrice: 45000, notes: '5.0 kg pakaian harian' },
      { id: 'item-2', name: 'Deep Clean Tas Branded Suede', category: 'tas', quantity: 1, unitPrice: 65000, notes: 'Tas Coach Coklat (Noda kopi di strap)' }
    ],
    totalWeightKg: 5.0,
    serviceType: 'kiloan_reguler',
    serviceName: 'Cuci Kiloan + Spa Tas Branded',
    perfumeAroma: 'Sakura Blossom',
    specialInstructions: 'Tolong tas disikat halus dengan cleaner khusus suede dan jangan diperas mesin.',
    status: 'delivering',
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    subtotal: 110000,
    deliveryFee: 10000,
    discount: 10000,
    totalPrice: 110000,
    courierId: 'courier-01',
    courierName: 'Budi Santoso',
    courierPhone: '0812-9876-5432',
    courierAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    estimatedDeliveryTime: '15 Menit lagi (14:30 WIB)',
    createdAt: '2026-09-01T09:30:00Z',
    updatedAt: '2026-09-02T02:15:00Z',
    isExpress: false,
    timeline: [
      { status: 'pending', timestamp: '01 Sep 2026, 09:30', title: 'Pesanan Diterima', description: 'Customer membuat booking via Customer Mobile App', actor: 'customer', actorName: 'Nikolas Marcellino' },
      { status: 'picked_up', timestamp: '01 Sep 2026, 11:15', title: 'Cucian Dijemput Kurir', description: 'Kurir Budi Santoso menjemput pakaian dari lokasi customer', actor: 'courier', actorName: 'Budi Santoso' },
      { status: 'washing', timestamp: '01 Sep 2026, 14:00', title: 'Proses Cuci & Perawatan', description: 'Pakaian ditimbang, dicuci dengan sabun anti-bakteri & tas dirawat', actor: 'admin', actorName: 'Operator Laundry' },
      { status: 'done', timestamp: '02 Sep 2026, 01:00', title: 'Selesai Cuci & QC Packing', description: 'Cucian selesai disetrika rapi, wangi Sakura, & dipacking plastik kedap', actor: 'admin', actorName: 'Quality Control' },
      { status: 'delivering', timestamp: '02 Sep 2026, 02:15', title: 'Sedang Diantar Kurir', description: 'Kurir Budi Santoso sedang dalam perjalanan menuju alamat Anda', actor: 'courier', actorName: 'Budi Santoso' }
    ]
  },
  {
    id: 'ord-002',
    orderNumber: 'LND-2026-0892',
    source: 'app_customer',
    customerId: 'cust-02',
    customerName: 'Siti Rahmawati',
    customerPhone: '0812-4455-6677',
    customerAddress: 'Jl. Gandaria Tengah III No. 12, Kebayoran Baru, Jakarta Selatan',
    customerCoordinates: { x: 30, y: 70 },
    items: [
      { id: 'item-3', name: 'Deep Clean Sepatu Sneakers Nike Air Jordan', category: 'sepatu', quantity: 2, unitPrice: 40000, notes: '2 Pasang sneakers putih' },
      { id: 'item-4', name: 'Cuci Bedcover King Size', category: 'linen', quantity: 1, unitPrice: 35000 }
    ],
    serviceType: 'satuan_sepatu',
    serviceName: 'Deep Clean Sepatu + Bedcover',
    perfumeAroma: 'French Lavender',
    specialInstructions: 'Sepatu tolong diunyellowing bagian sol samping.',
    status: 'washing',
    paymentMethod: 'transfer_bank',
    paymentStatus: 'paid',
    subtotal: 115000,
    deliveryFee: 12000,
    discount: 0,
    totalPrice: 127000,
    createdAt: '2026-09-01T15:20:00Z',
    updatedAt: '2026-09-01T18:00:00Z',
    isExpress: false,
    timeline: [
      { status: 'pending', timestamp: '01 Sep 2026, 15:20', title: 'Pesanan Dibuat', description: 'Customer order via mobile app', actor: 'customer', actorName: 'Siti Rahmawati' },
      { status: 'picked_up', timestamp: '01 Sep 2026, 16:45', title: 'Dijemput Kurir', description: 'Kurir Rian Pratama menjemput barang cucian', actor: 'courier', actorName: 'Rian Pratama' },
      { status: 'washing', timestamp: '01 Sep 2026, 18:00', title: 'Sedang Dicuci di Workshop', description: 'Sepatu disikat mendalam & bedcover diproses mesin sanitasi', actor: 'admin', actorName: 'Tim Cuci Sepatu' }
    ]
  },
  {
    id: 'ord-003',
    orderNumber: 'LND-2026-0893',
    source: 'offline_pos',
    customerId: 'cust-walkin-01',
    customerName: 'Hendra Wijaya (Walk-in Toko)',
    customerPhone: '0818-0909-8877',
    customerAddress: 'Ambil Sendiri di Toko Laundry Hub (Self Pickup)',
    customerCoordinates: { x: 50, y: 50 },
    items: [
      { id: 'item-5', name: 'Cuci Kiloan Express 24 Jam', category: 'kiloan', quantity: 1, unitPrice: 60000, notes: '4.0 kg pakaian kemeja kantor' }
    ],
    totalWeightKg: 4.0,
    serviceType: 'kiloan_express',
    serviceName: 'Cuci Kiloan Express 24 Jam',
    perfumeAroma: 'Ocean Breeze',
    specialInstructions: 'Customer walk-in langsung ke toko, bayar tunai di kasir.',
    status: 'done',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    subtotal: 60000,
    deliveryFee: 0,
    discount: 0,
    totalPrice: 60000,
    createdAt: '2026-09-01T11:00:00Z',
    updatedAt: '2026-09-02T01:45:00Z',
    isExpress: true,
    timeline: [
      { status: 'picked_up', timestamp: '01 Sep 2026, 11:00', title: 'Diterima di Kasir Toko', description: 'Customer membawa pakaian langsung ke outlet kasir POS', actor: 'admin', actorName: 'Kasir Toko' },
      { status: 'washing', timestamp: '01 Sep 2026, 11:30', title: 'Cuci Prioritas Express', description: 'Proses cuci kilat 24 jam dimulai', actor: 'admin', actorName: 'Admin Workshop' },
      { status: 'done', timestamp: '02 Sep 2026, 01:45', title: 'Siap Diambil di Outlet', description: 'Cucian telah disetrika rapi dan siap diambil oleh customer', actor: 'admin', actorName: 'Kasir Toko' }
    ]
  },
  {
    id: 'ord-004',
    orderNumber: 'LND-2026-0894',
    source: 'app_customer',
    customerId: 'cust-03',
    customerName: 'Aulia Putri',
    customerPhone: '0852-3344-5566',
    customerAddress: 'Jl. Panglima Polim V No. 8, Melawai, Jakarta Selatan',
    customerCoordinates: { x: 45, y: 62 },
    items: [
      { id: 'item-6', name: 'Cuci Satuan Gaun Pesta & Batik Sutra', category: 'pakaian', quantity: 3, unitPrice: 35000 }
    ],
    serviceType: 'satuan_baju',
    serviceName: 'Dry Clean Gaun & Batik Sutra',
    perfumeAroma: 'Vanilla Comfort',
    specialInstructions: 'Jangan pakai pemutih, bahan sutra halus.',
    status: 'pending',
    paymentMethod: 'ewallet',
    paymentStatus: 'paid',
    subtotal: 105000,
    deliveryFee: 10000,
    discount: 5000,
    totalPrice: 110000,
    createdAt: '2026-09-02T02:30:00Z',
    updatedAt: '2026-09-02T02:30:00Z',
    isExpress: false,
    timeline: [
      { status: 'pending', timestamp: '02 Sep 2026, 02:30', title: 'Menunggu Penjemputan', description: 'Pesanan baru masuk, siap di-assign kurir untuk penjemputan', actor: 'customer', actorName: 'Aulia Putri' }
    ]
  },
  {
    id: 'ord-005',
    orderNumber: 'LND-2026-0890',
    source: 'app_customer',
    customerId: 'cust-04',
    customerName: 'Dimas Anggara',
    customerPhone: '0819-7788-9900',
    customerAddress: 'Jl. Tebet Timur Dalam Raya No. 25, Tebet, Jakarta Selatan',
    customerCoordinates: { x: 80, y: 50 },
    items: [
      { id: 'item-7', name: 'Cuci Kiloan Reguler', category: 'kiloan', quantity: 1, unitPrice: 36000, notes: '4 kg pakaian sehari-hari' }
    ],
    totalWeightKg: 4.0,
    serviceType: 'kiloan_reguler',
    serviceName: 'Cuci Kiloan Reguler 4kg',
    perfumeAroma: 'Snappy Baby',
    status: 'delivered',
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    subtotal: 36000,
    deliveryFee: 10000,
    discount: 0,
    totalPrice: 46000,
    courierId: 'courier-02',
    courierName: 'Rian Pratama',
    courierPhone: '0857-1122-3344',
    courierAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    proofPhotoUrl: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&auto=format&fit=crop&q=80',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-31T17:30:00Z',
    isExpress: false,
    timeline: [
      { status: 'pending', timestamp: '30 Agu 2026, 10:00', title: 'Pesanan Dibuat', description: 'Customer memesan cuci kiloan', actor: 'customer' },
      { status: 'picked_up', timestamp: '30 Agu 2026, 11:30', title: 'Dijemput Kurir', description: 'Kurir Rian menjemput cucian', actor: 'courier', actorName: 'Rian Pratama' },
      { status: 'washing', timestamp: '30 Agu 2026, 14:00', title: 'Proses Cuci', description: 'Pakaian dicuci higienis', actor: 'admin' },
      { status: 'done', timestamp: '31 Agu 2026, 15:00', title: 'Selesai Disetrika', description: 'Packing rapi berplastik', actor: 'admin' },
      { status: 'delivering', timestamp: '31 Agu 2026, 16:30', title: 'Sedang Diantar', description: 'Kurir menuju lokasi penerima', actor: 'courier', actorName: 'Rian Pratama' },
      { status: 'delivered', timestamp: '31 Agu 2026, 17:30', title: 'Telah Diterima', description: 'Paket cucian diserahterimakan dengan foto bukti penerima', actor: 'courier', actorName: 'Rian Pratama' }
    ]
  }
];
