# Supply-Demand

**Short project description**  
_Functional programming dependency paradigm_

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Example](#example)
5. [License](#license)

---

## Overview

Our versatile library is designed to simplify the creation of complex, demand-driven workflows. It facilitates extensible and recursive query resolution through a flexible supplier mechanism. Each supplier can provide operations or data based on the requested type, forming a dynamic foundation for constructing intricate workflows that adapt seamlessly to your needs.

---

## Installation

```bash
# Clone the repository
npm install @ceil-dev/supply-demand
```

---

### Usage

```javascript
import {supplyDemand} from '@ceil-dev/supply-demand';
```

---

### Example

```typescript
import supplyDemand, { Supplier, cached } from '@ceil-dev/supply-demand';

const supplierA: Supplier<undefined, void, { valueB: typeof supplierB }> = (
  _,
  { future },
) => {
  setTimeout(() => {
    console.log("SUPPLYING B!");

    // valueB will change to 'WORLD!' after 3 seconds
    future.supply("valueB", "WORLD!");
  }, 3000);
};

const supplierB: Supplier<undefined, Promise<string>> = async () => {
  return "hello";
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
          type: "valueD",
        }),
      );
      // Second call returns the same value due to valueD being cached
      console.log(
        demand({
          type: "valueD",
        }),
      );

      // Will be set to whatever value is returned by the original valueB supplier
      const b1 = await demand({
        type: "valueB",
      });
      console.log("b1:", b1);

      // SupplierA will supply valueB with 'WORLD!' after 3 seconds
      demand({ type: "valueA" });

      // Will await the future value of valueB
      const b2 = await demand({
        type: "valueB",
        suppliers: {
          add: {
            valueB: future.supplier,
          },
        },
      });
      console.log("b2:", b2);

      // This will demonstrate that you can await future values and supply them in the same scope
      (async () => {
        const b3 = await demand({
          type: "valueB",
          suppliers: {
            add: {
              valueB: future.supplier,
            },
          },
        });

        console.log("b3:", b3);
      })().catch(console.warn);

      // This will set valueB to 'haha' for all future demands
      future.supply("valueB", "haha");
    },
    {
      valueA: supplierA,
      valueB: supplierB,
      valueD: cached(supplierD),
    },
  );
};

run().catch(console.error);
```

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
