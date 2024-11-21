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

const supplierA: Supplier<undefined, void, { supplierB: typeof supplierB }> = (_, { future }) => {
  setTimeout(() => {
    console.log('SUPPLYING B!');

    future.supply('supplierB', 'HELLO');
  }, 3000);
};

const supplierB: Supplier<undefined, Promise<string>> = async () => {
  return 'seven';
};

const supplierD = ((_, { future }) => {
  return Math.random();
}) satisfies Supplier;

const run = () => {
  supplyDemand(
    async (_, { demand, future }) => {
      console.log(
        demand({
          type: 'supplierD',
        })
      );
      console.log(
        demand({
          type: 'supplierD',
        })
      );
      console.log(
        demand({
          type: 'supplierD',
        })
      );

      const b1 = await demand({
        type: 'supplierB',
      });
      console.log('b1:', b1);

      demand({ type: 'supplierA' });

      const b2 = await demand({
        type: 'supplierB',
        suppliers: {
          add: {
            supplierB: future.supplier,
          },
        },
      });
      console.log('b2:', b2);

      (async () => {
        const b3 = await demand({
          type: 'supplierB',
          suppliers: {
            add: {
              supplierB: future.supplier,
            },
          },
        });

        console.log('b3:', b3);
      })().catch(console.warn);

      future.supply('supplierB', 'haha');

      const b4 = await demand({
        type: 'supplierC',
        suppliers: {
          clear: true,
          add: {
            supplierC: async () => {
              return 7;
            },
            // supplierB: future.supplier,
          },
        },
      });
      console.log('b4:', b4);
    },
    {
      supplierA,
      supplierB,
      supplierD: cached(supplierD),
    }
  );
};

run();
```

---

### License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
