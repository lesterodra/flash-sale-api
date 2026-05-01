export type CreateOrder = {
  product_id: number;
  email: string;
  flash_sale_id: number;
};

export type QueueAddedResponse = {
  job_id?: string;
  message: string;
};
