import supplyDemand, { Supplier, cached } from '.';

const supplierA: Supplier<undefined, void, { valueB: typeof supplierB }> = (_, { future }) => {
  setTimeout(() => {
    console.log('SUPPLYING B!');

    // SupplierB will change from 'seven' to 'HELLO' after 3 seconds
    future.supply('valueB', 'WORLD!');
  }, 3000);
};

const supplierB: Supplier<undefined, Promise<string>> = async () => {
  return 'hello';
};

const supplierD = (() => {
  return Math.random();
}) satisfies Supplier;

const run = async () => {
  await supplyDemand(
    async (_, { demand, future }) => {
      // First call will return a random number and cache its value
      console.log(
        demand({
          type: 'valueD',
        })
      );
      // Second call returns the same value due to valueD being cached
      console.log(
        demand({
          type: 'valueD',
        })
      );

      // Will be set to whatever value is returned by the original valueB supplier
      const b1 = await demand({
        type: 'valueB',
      });
      console.log('b1:', b1);

      // SupplierA will supply valueB with 'WORLD!' after 3 seconds
      demand({ type: 'valueA' });

      // Will await the future value of valueB
      const b2 = await demand({
        type: 'valueB',
        suppliers: {
          add: {
            valueB: future.supplier,
          },
        },
      });
      console.log('b2:', b2);

      // This will demonstrate that you can await future values and supply them in the same scope
      (async () => {
        const b3 = await demand({
          type: 'valueB',
          suppliers: {
            add: {
              valueB: future.supplier,
            },
          },
        });

        console.log('b3:', b3);
      })().catch(console.warn);

      // This will set valueB to 'haha' for all future demands
      future.supply('valueB', 'haha');
    },
    {
      valueA: supplierA,
      valueB: supplierB,
      valueD: cached(supplierD),
    }
  );
};

run().catch(console.error);
