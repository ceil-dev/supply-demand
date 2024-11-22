import { DemandProps, ExtendSuppliersMethod, ScopedDemand, Supplier, Suppliers } from './types';
export declare const supplyDemand: <TSuppliers extends Suppliers, TRootSupplier = Supplier<any, any, TSuppliers>>(rootSupplier: TRootSupplier, suppliers: TSuppliers) => TRootSupplier extends Supplier<unknown, infer R> ? R : never;
export declare const synchronous: <T extends Supplier<any, Promise<{
    result?: unknown;
} | undefined | void>>>(supplier: T) => T;
export declare const cached: <T extends Supplier>(supplier: T) => T;
export default supplyDemand;
export { DemandProps, ExtendSuppliersMethod, ScopedDemand, Supplier, Suppliers };
