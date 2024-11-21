import {
  DemandProps,
  DemandReturn,
  ExtendSuppliersMethod,
  Future,
  ScopedDemand,
  Supplier,
  SupplierReturn,
  Suppliers,
  SuppliersMerge,
} from './types';

const extendSuppliers = <TSups extends Suppliers>(
  { clear, add, remove }: SuppliersMerge<TSups>,
  superSuppliers: TSups
) => {
  const result = (clear ? {} : { ...superSuppliers }) as TSups;

  if (add) Object.assign(result, add);
  if (remove) Object.keys(remove).forEach((key) => remove[key] && delete result[key]);

  return result;
};

const createScopedDemandMethod = <TSups extends Suppliers>(
  superProps: DemandProps<TSups>
): ScopedDemand<TSups> => {
  return (props) => {
    const {
      key = superProps.key,
      type, // must be unique
      data,
      gracefully,
    } = props;

    const suppliers = extendSuppliers(
      props.suppliers || ({} as SuppliersMerge<TSups>),
      superProps.suppliers || ({} as TSups)
    );

    const path = `${superProps.path}/${key}(${type})`;

    return globalDemand<TSups>({
      key,
      type: type as any,
      path,
      data: data as any,
      future: superProps.future,
      gracefully,
      suppliers,
      supply: superProps.supply,
    });
  };
};

const globalDemand = <TSups extends Suppliers>(
  props: DemandProps<TSups>
): DemandReturn<typeof props.gracefully, any> => {
  const { key, type, path, data, future, supply, gracefully, suppliers = {} as TSups } = props;

  if (!key) throw new Error(`no key (type: ${type ? '"' + type + '"' : 'undefined'})`);
  if (typeof suppliers !== 'object')
    throw new Error(`suppliers must be of type object ("${key}" of type "${type}")`);

  const supplier: Supplier<unknown, unknown, TSups> = suppliers[type] || suppliers['default'];
  if (!supplier) {
    throw new Error(`no supplier for "${key}" of type "${type}"`);
  }

  const scopedDemand = createScopedDemandMethod<TSups>({
    key,
    type,
    path,
    data,
    future,
    supply,
    suppliers,
  });

  const getSupplierTypes = () => Object.keys(suppliers) as (keyof TSups)[];

  const supplied = () =>
    supplier(data, {
      key,
      type,
      path,
      getSupplierTypes,
      future,
      demand: scopedDemand,
    });

  if (gracefully) {
    try {
      return { result: supplied() };
    } catch (e) {
      return { error: e };
    }
  }

  return supplied();
};

export const supplyDemand = <T extends Suppliers, RT = Supplier<any, any, T>>(
  rootSupplier: RT,
  suppliers: T
) => {
  const future = createFuture<T & { $$root: RT }>();

  const res = globalDemand<T & { $$root: RT }>({
    key: 'root',
    type: '$$root',
    path: 'root',
    future,
    supply: future.supply,
    suppliers: {
      ...suppliers,
      $$root: rootSupplier,
    },
  });

  return res as RT extends Supplier<unknown, infer R> ? R : never;
};

const createFuture = <TSuppliers extends Suppliers>(): Future<TSuppliers> => {
  type AwaitedEntry<
    TSuppliers extends Suppliers,
    TKey extends keyof TSuppliers,
    TValue = SupplierReturn<TSuppliers[TKey]>,
  > = {
    value: TValue | Promise<TValue>;
    resolve: (v: TValue) => void;
  };

  const awaited: Partial<{ [Key in keyof TSuppliers]: AwaitedEntry<TSuppliers, Key> }> = {};

  const getAwaited = <TKey extends keyof TSuppliers>(
    key: TKey,
    ...rest: [] | [value: SupplierReturn<TSuppliers[TKey]>]
  ): AwaitedEntry<TSuppliers, TKey> => {
    if (awaited[key]) return awaited[key];

    if (rest.length) {
      return (awaited[key] = {
        value: rest[0],
        resolve: (v) => {
          if (!awaited[key]) {
            console.warn(`future getAwaited: awaited entry "${String(key)}" disappeared?!`);
            return;
          }
          awaited[key].value = v;
        },
      });
    }

    let resolve: AwaitedEntry<TSuppliers, TKey>['resolve'];
    const promise = new Promise<SupplierReturn<TSuppliers[TKey]>>((res) => {
      resolve = (v) => {
        if (!awaited[key]) {
          console.warn(`future getAwaited: awaited entry "${String(key)}" disappeared?!`);

          return;
        }

        const prevValue = awaited[key].value;
        // awaited[key].value = v;
        delete awaited[key];

        if (prevValue === promise) res(v);
      };
    });

    awaited[key] = { value: promise, resolve: resolve! };

    return awaited[key];
  };

  return Object.freeze({
    supply: (key, value) => {
      // Only if is actively being demanded
      awaited[key]?.resolve(value);

      // TODO: or....?
      // awaited[key]
      //   ? // is being demanded
      //     awaited[key].resolve(value)
      //   : // preparing for future demands
      //     getAwaited(key, value);
    },
    supplier: async (_, { type }) => {
      return getAwaited(type).value;
    },
  });
};

// Chains executions
export const synchronous = <
  T extends Supplier<any, Promise<{ result?: unknown } | undefined | void>>,
>(
  supplier: T
) => {
  let holdPromise: Promise<unknown> | undefined;

  return ((data, scope) => {
    const run = async () => {
      const prevHold = holdPromise;

      const resultPromise = new Promise(async (resolve) => {
        let resolveHold: (v: unknown) => void;
        const currHold = (holdPromise = new Promise(async (r) => {
          resolveHold = r;
        }));

        if (prevHold) await prevHold;

        ///
        const res = await supplier(data, scope);
        ///

        if (holdPromise === currHold) {
          holdPromise = undefined;
        }

        resolve(res?.result);

        resolveHold!(undefined);
      });

      return resultPromise;
    };

    return run();
  }) as T;
};

// Return cached value once recevied resolved the supplier
export const cached = <T extends Supplier>(supplier: T) => {
  const result: { value?: SupplierReturn<T> } = {};

  return ((data, scope) => {
    if ('value' in result) return result.value;
    return (result.value = supplier(data, scope));
  }) as T;
};

export default supplyDemand;
export { DemandProps, ExtendSuppliersMethod, ScopedDemand, Supplier, Suppliers };
