var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import supplyDemand, { cached } from '.';
const supplierA = (_, { future }) => {
    setTimeout(() => {
        console.log('SUPPLYING B!');
        future.supply('valueB', 'WORLD!');
    }, 3000);
};
const supplierB = () => __awaiter(void 0, void 0, void 0, function* () {
    return 'hello';
});
const supplierD = (() => {
    return Math.random();
});
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    yield supplyDemand((_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { demand, future }) {
        console.log(demand({
            type: 'valueD',
        }));
        console.log(demand({
            type: 'valueD',
        }));
        const b1 = yield demand({
            type: 'valueB',
        });
        console.log('b1:', b1);
        demand({ type: 'valueA' });
        const b2 = yield demand({
            type: 'valueB',
            suppliers: {
                add: {
                    valueB: future.supplier,
                },
            },
        });
        console.log('b2:', b2);
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const b3 = yield demand({
                type: 'valueB',
                suppliers: {
                    add: {
                        valueB: future.supplier,
                    },
                },
            });
            console.log('b3:', b3);
        }))().catch(console.warn);
        future.supply('valueB', 'haha');
    }), {
        valueA: supplierA,
        valueB: supplierB,
        valueD: cached(supplierD),
    });
});
run().catch(console.error);
//# sourceMappingURL=example.js.map