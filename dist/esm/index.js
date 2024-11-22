var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const extendSuppliers = ({ clear, add, remove }, superSuppliers) => {
    const result = (clear ? {} : Object.assign({}, superSuppliers));
    if (add)
        Object.assign(result, add);
    if (remove)
        Object.keys(remove).forEach((key) => remove[key] && delete result[key]);
    return result;
};
const createScopedDemandMethod = (superProps) => {
    return (props) => {
        const { key = superProps.key, type, data, gracefully, } = props;
        const suppliers = extendSuppliers(props.suppliers || {}, superProps.suppliers || {});
        const path = `${superProps.path}/${key}(${type})`;
        return globalDemand({
            key,
            type: type,
            path,
            data: data,
            future: superProps.future,
            gracefully,
            suppliers,
            supply: superProps.supply,
        });
    };
};
const globalDemand = (props) => {
    const { key, type, path, data, future, supply, gracefully, suppliers = {} } = props;
    if (!key)
        throw new Error(`no key (type: ${type ? '"' + type + '"' : 'undefined'})`);
    if (typeof suppliers !== 'object')
        throw new Error(`suppliers must be of type object ("${key}" of type "${type}")`);
    const supplier = suppliers[type] || suppliers['default'];
    if (!supplier) {
        throw new Error(`no supplier for "${key}" of type "${type}"`);
    }
    const scopedDemand = createScopedDemandMethod({
        key,
        type,
        path,
        data,
        future,
        supply,
        suppliers,
    });
    const getSupplierTypes = () => Object.keys(suppliers);
    const supplied = () => supplier(data, {
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
        }
        catch (e) {
            return { error: e };
        }
    }
    return supplied();
};
export const supplyDemand = (rootSupplier, suppliers) => {
    const future = createFuture();
    const res = globalDemand({
        key: 'root',
        type: '$$root',
        path: 'root',
        future,
        supply: future.supply,
        suppliers: Object.assign(Object.assign({}, suppliers), { $$root: rootSupplier }),
    });
    return res;
};
const createFuture = () => {
    const awaited = {};
    const getAwaited = (key, ...rest) => {
        if (awaited[key])
            return awaited[key];
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
        let resolve;
        const promise = new Promise((res) => {
            resolve = (v) => {
                if (!awaited[key]) {
                    console.warn(`future getAwaited: awaited entry "${String(key)}" disappeared?!`);
                    return;
                }
                const prevValue = awaited[key].value;
                delete awaited[key];
                if (prevValue === promise)
                    res(v);
            };
        });
        awaited[key] = { value: promise, resolve: resolve };
        return awaited[key];
    };
    return Object.freeze({
        supply: (key, value) => {
            var _a;
            (_a = awaited[key]) === null || _a === void 0 ? void 0 : _a.resolve(value);
        },
        supplier: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { type }) {
            return getAwaited(type).value;
        }),
    });
};
export const synchronous = (supplier) => {
    let holdPromise;
    return ((data, scope) => {
        const run = () => __awaiter(void 0, void 0, void 0, function* () {
            const prevHold = holdPromise;
            const resultPromise = new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
                let resolveHold;
                const currHold = (holdPromise = new Promise((r) => __awaiter(void 0, void 0, void 0, function* () {
                    resolveHold = r;
                })));
                if (prevHold)
                    yield prevHold;
                const res = yield supplier(data, scope);
                if (holdPromise === currHold) {
                    holdPromise = undefined;
                }
                resolve(res === null || res === void 0 ? void 0 : res.result);
                resolveHold(undefined);
            }));
            return resultPromise;
        });
        return run();
    });
};
export const cached = (supplier) => {
    const result = {};
    return ((data, scope) => {
        if ('value' in result)
            return result.value;
        return (result.value = supplier(data, scope));
    });
};
export default supplyDemand;
//# sourceMappingURL=index.js.map