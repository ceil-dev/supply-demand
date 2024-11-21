export type DependantSuppliers<T extends Suppliers> = {
  [K in Extract<keyof T, string>]: T[K] extends Supplier<unknown, unknown, infer R>
    ? R extends Record<string, never>
      ? T[K]
      : T extends R
      ? T[K]
      : `Missing dependency of '${K}'`
    : never;
};

export type DemandProps<
  TSups extends Suppliers,
  TType extends Extract<keyof TSups, string> = Extract<keyof TSups, string>
> = {
  key: string;
  type: TType;
  path: string;
  data?: TSups[TType] extends Supplier<infer D> ? D : never;
  future: Future<TSups>;
  gracefully?: boolean;
  supply: Future<TSups>['supply'];
  suppliers?: TSups;
};

export type SupplierReturn<TSupplier> = TSupplier extends Supplier<any, infer RReturn>
  ? RReturn extends Promise<infer Value>
    ? Value
    : RReturn
  : never;

export type Future<TSuppliers extends Suppliers> = {
  supplier: Supplier<undefined | never, Promise<any>, TSuppliers>;
  supply: <TKey extends keyof TSuppliers>(
    key: TKey,
    value: SupplierReturn<TSuppliers[TKey]>
  ) => void;
};

export type SupplyMethod = (props: { type: string; data: unknown }) => void;

export type ScopedDemand<TSups extends Suppliers> = <
  T extends SuppliersMerge<TSups>,
  TType extends T['clear'] extends true
    ? Extract<keyof T['add'], string>
    : Extract<keyof TSups | keyof T['add'], string>,
  TGracefully extends boolean = false,
  TS = TType extends keyof TSups
    ? TSups[TType]
    : T['add'] extends Suppliers
    ? TType extends keyof T['add']
      ? T['add'][TType]
      : never
    : never
>(props: {
  key?: string;
  type: TType;
  data?: TS extends Supplier<infer D> ? D : never;
  gracefully?: TGracefully;
  suppliers?: T;
}) => TS extends Supplier<any, infer R> ? DemandReturn<TGracefully, R> : never;

export type Scope<
  TSups extends Suppliers,
  TType extends Extract<keyof TSups, string> = Extract<keyof TSups, string>
> = {
  key: string;
  type: TType;
  path: string;
  future: Future<TSups>;
  getSupplierTypes: () => (keyof TSups)[];
  demand: ScopedDemand<TSups>;
};

export type Supplier<TData = any, TReturn = any, TSups extends Suppliers = object> = (
  data: TData,
  scope: Scope<TSups>
) => TReturn;

export type Suppliers = Record<string, Supplier> | object;

export type SuppliersMerge<TSups extends Suppliers> = {
  clear?: boolean;
  add?: Partial<TSups> & Record<Exclude<string, keyof TSups>, Supplier>;
  remove?: Record<keyof TSups, boolean | 0 | 1>;
};

export type ExtendSuppliersMethod<TSups extends Suppliers> = (
  suppliers: SuppliersMerge<TSups>,
  superSuppliers: TSups
) => TSups;

export type DemandReturn<Gracefully, T> = Gracefully extends true
  ? { error: unknown; result?: never } | { result: T; error?: never }
  : T;
