export interface ScammerReport {
  id: string;
  phoneNumber: string;
  name?: string;
  category: string;
  description?: string;
  screenshots?: string[];
  approved: boolean;
  reportCount: number;
  votes: {
    yes: number;
    no: number;
    voters: string[];
  };
  createdAt: number;
  updatedAt: number;
}

export interface SearchFilters {
  query: string;
  category: string;
}