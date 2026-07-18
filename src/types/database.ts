export interface Vendor {
  id: string;
  name: string;
  description: string;
  reputation_score: number;
  staked_sats: number;
  lightning_address?: string;
  created_at: string;
}

export interface Service {
  id: string;
  vendor_id: string;
  category: string;
  title: string;
  description: string;
  price_sats: number;
  endpoint_url: string;
  payload_format: any;
  uptime_percentage: number;
  avg_latency_ms: number;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  service_id: string;
  buyer_agent_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export type ServiceWithVendor = Service & {
  vendor: Vendor;
};

export interface MarketplaceFilters {
  categories: string[];
  minSats: number;
  maxSats: number;
  minReputation: number;
}
