export type FetchTemplatesRequest = {
  email: string;
  page: number;
  pageSize: number;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
};
