import http from 'k6/http';
import { Counter } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '10s', target: 30 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 0 },
  ],
};

export let success = new Counter('success');
export let outOfStock = new Counter('out_of_stock');
export let systemError = new Counter('system_error');

export default function () {
  const res = http.post(
    'http://localhost:3000/orders',
    JSON.stringify({
      product_id: 1,
      email: `user${__VU}@test.com`,
      flash_sale_id: 1,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );

  if (res.status === 201) {
    // This is the actual count of the queued jobs. If the stocks available is 50 pcs we can still see 50+ success queued jobs here because alot of
    // users sending a request at the same time.
    // Over selling is being handled in the job processor as well so we don't worry about it here.
    success.add(1);
  } else if (res.status === 409 || res.status === 400) {
    // This is expected error when the flash sale product is already out of stock
    outOfStock.add(1);
  } else if (res.status >= 500) {
    systemError.add(1);
  }
}
