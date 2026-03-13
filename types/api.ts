export type GQLResponse = {
  config: any;
  data: any;
  errors?: Array<{ message: string; locations?: any[]; path?: any[]; extensions?: any }>;
  status?: number;
  statusText?: string;
  headers?: any;
  request?: any;
};

export type GQLRequestParams = {
  query: string;
  variables?: Record<string, any>;
};
