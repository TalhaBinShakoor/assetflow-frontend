export interface Asset {
  id: number;
  name: string;
  category: string;
  status: string;
  purchaseDate: string | null;
}

export interface AssetRequest {
  name: string;
  category: string;
  status: string;
  purchaseDate: string;
}
