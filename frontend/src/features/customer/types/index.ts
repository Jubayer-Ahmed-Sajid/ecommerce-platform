export interface CustomerProfile {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  defaultAddress?: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  city: string;
  district?: string;
  postalCode?: string;
}
