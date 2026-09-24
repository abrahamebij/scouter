export interface PreStock {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  contract_address: string;
  markPrice: number;
  markValuation: number;
  tokenPrice: number;
  impliedValuation: number;
  supply: number;
}

export interface PreStockDerived extends PreStock {
  premiumPercent: number;
  priceDifference: number;
  valuationDifference: number;
}

export type SortField = "name" | "tokenPrice" | "markPrice" | "impliedValuation" | "premiumPercent";
export type SortDirection = "asc" | "desc";
