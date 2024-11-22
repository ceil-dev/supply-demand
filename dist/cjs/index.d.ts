import { DemandProps, ExtendSuppliersMethod, ScopedDemand, Supplier, Suppliers } from './types';
export declare const supplyDemand: <T extends Suppliers, RT = Supplier<any, any, T>>(rootSupplier: RT, suppliers: T) => RT extends Supplier<unknown, infer R> ? R : never;
export declare const synchronous: <T extends Supplier<any, Promise<{
    result?: unknown;
} | undefined | void>>>(supplier: T) => T;
export declare const cached: <T extends Supplier>(supplier: T) => T;
export default supplyDemand;
export { DemandProps, ExtendSuppliersMethod, ScopedDemand, Supplier, Suppliers };
