export type DemandProps<T = any> = {
  key: string;
  type: string;
  data?: T;
  suppliers?: Suppliers;
};

type ScopedDemandProps<T = any> = {
  key: string;
  type: string;
  data?: T;
  suppliers?: SuppliersMerge;
};

type Demand<T1 = any, T2 = any> = (props: DemandProps<T1>) => T2;

export type ScopedDemand<T1 = any, T2 = any> = (
  props: ScopedDemandProps<T1>
) => T2;

type Scope = DemandProps & {
  supply: () => void;
  monitor: () => void;
  demand: Demand;
};

export type Supplier<TIn = any, TOut = any> = (data: TIn, scope: Scope) => TOut;

export type Suppliers = Record<string, Supplier | undefined>;

type SuppliersMerge = {
  clear?: boolean;
  add?: Suppliers;
  remove?: Record<string, boolean | 0 | 1>;
};

export type ExtendSuppliersMethod = (
  suppliers: SuppliersMerge,
  superSuppliers: Suppliers
) => Suppliers;
