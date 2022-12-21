import {
  DemandProps,
  ExtendSuppliersMethod,
  ScopedDemand,
  Supplier,
  Suppliers,
} from './types';

const extendSuppliers: ExtendSuppliersMethod = (
  { clear, add, remove },
  superSuppliers
) => {
  const result = clear ? {} : { ...superSuppliers };

  if (add) Object.assign(result, add);

  if (remove)
    Object.keys(remove).forEach((key) => remove[key] && delete result[key]);

  return result;
};

const createScopedDemandMethod = (superProps: DemandProps): ScopedDemand => {
  return (props) => {
    const {
      key = superProps.key,
      type, // must be unique
    } = props;

    const suppliers = extendSuppliers(
      props.suppliers || {},
      superProps.suppliers || {}
    );

    return demand({
      key,
      type,
      data: ('data' in props ? props : superProps).data,
      suppliers,
    });
  };
};

const demand = <T>(props: DemandProps): T => {
  const { key, type, data, suppliers = {} } = props;

  if (!key)
    throw new Error(`no key (type: ${type ? '"' + type + '"' : 'undefined'})`);
  if (typeof suppliers !== 'object')
    throw new Error(
      `suppliers must be of type object ("${key}" of type "${type}")`
    );

  const supplier = suppliers[type] || suppliers.default;
  if (!supplier) {
    throw new Error(`no supplier for "${key}" of type "${type}"`);
  }

  const scopedDemand = createScopedDemandMethod({
    key,
    type,
    data,
    suppliers,
  });

  const supply = () => {
    //
  };

  const monitor = () => {
    //
  };

  return supplier(data, {
    key,
    type,
    supply,
    monitor,
    demand: scopedDemand,
  });
};

const supplyDemand = <T>(
  rootSupplier: Supplier<any, T>,
  suppliers: Suppliers
) => {
  return demand<T>({
    key: 'root',
    type: '$$root',
    suppliers: {
      ...suppliers,
      $$root: rootSupplier,
    },
  });
};

export default supplyDemand;
export {
  DemandProps,
  ExtendSuppliersMethod,
  ScopedDemand,
  Supplier,
  Suppliers,
};
