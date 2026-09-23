export type AvailableCourier = {
  id: string;
  userId: string;
  isAvailable: boolean;
  currentLat: number | null;
  currentLng: number | null;
  lastActiveAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
};
