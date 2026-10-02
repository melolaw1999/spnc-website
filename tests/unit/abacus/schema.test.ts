import { describe, expect, it } from 'vitest';
import {
  InvalidData, MAX_BODY, parseStrictJson, validateData, validateStores,
  validateSnapshot, validateTree, type Snapshot,
} from '../../../src/lib/abacus/schema';

const PLANS = 'black-abacus-sku-plans-v1';
const ARCHIVES = 'black-abacus-sku-archives-v1';
const FIFO = 'black-abacus-fifo-v1';
// Synthetic values only. No production files, service, browser or network.
function fixture() {
  return {
    products: [{ id: 'synthetic', name: 'Synthetic product', group: 'domestic', costType: 'rmb', cost: 0,
      price: 20, shipping: 0, tax: 0, platform: 3, cases: 1, barcode: '', family: '', flavor: '', spec: '',
      note: '', line: '', goodsId: '', goodsCode: '', extra: { preserved: null } }],
    sfRates: [{ name: 'Synthetic A/Synthetic C', rates: [0, 1, 2, 3, 4],
      handlingRate: { base: 0, includedCases: 0, additional: 0 },
      ordinaryRates: { 'Synthetic A': {
        yunda: { minWeightExclusive: 3, baseFee: 0, perKgFee: 2 },
        yto: { small: { maxWeight: 3, firstWeight: 0.2, stepsPerKg: 10, firstFee: 0, stepFee: 0.15 },
          large: { firstKg: 1, firstFee: 4, perKgFee: 3 } },
      } } }, { name: 'Synthetic B', rates: [1, 2, 3, 4, 5] }],
    defaultPlans: { synthetic: { planPrice: '10', planNote: '' } },
    fifoReference: { synthetic: { stock: null, locked: null, asOf: '', note: '', reserve: '', source: '',
      batches: [], history: [['', 0, 0]], extra: { preserved: false } } },
    procurement: { asOf: '', orders: [{ id: 'synthetic-order', date: '2024-02-29', name: '', status: '', currency: '', file: '',
      lineAmount: null, rows: [{ barcode: '', currency: '', name: '', spec: '', unit: '', kind: '', note: '', sheet: '',
        qty: -1.5, cost: 0, amount: -4.25, priceSource: '', extra: [null, 0] }] }], excluded: [{ file: '', reason: '' }] },
    stores: {
      [PLANS]: {},
      [ARCHIVES]: { synthetic: [{ id: 'synthetic-archive', name: 'Synthetic archive', createdAt: 'Legacy free text',
        skuId: '', adMode: '', values: { cost: 0, price: -1, freightProvince: '', freightCarrier: '', shippingConfirmed: false,
          sfAuto: true, sfSplit: 0, sfRegion: 0 }, plan: { planNote: '' }, result: { net: null, profit: 0, loss: -3 }, extra: [] }], empty: [] },
      [FIFO]: { synthetic: { stock: null, locked: 0, manualBatches: true, inferred: false,
        batches: [{ name: 'Z first', date: '2026-09-02', qty: 0, cost: 2 },
          { name: 'A second', date: '2026-09-01', qty: 3, cost: 1.5 }], history: [['Legacy', 0, 0]], extra: null } },
    },
  };
}
type Fixture = ReturnType<typeof fixture>;
const snapshot = () => ({ schema: 1, revision: 1, updatedAt: '2026-10-02T12:30:45.123Z', data: fixture() });
const copy = <T>(value: T): T => structuredClone(value);
const encode = (value: unknown) => JSON.stringify(value);
function freeze(value: unknown): void {
  if (value !== null && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
}

describe('strict JSON boundary', () => {
  it('preserves zeros, nulls, empty arrays/objects and valid supplementary Unicode', () => {
    const raw = '{"empty":[],"obj":{},"zero":0,"nil":null,"text":"合法😀","flags":[true,false]}';
    expect(parseStrictJson(raw)).toEqual(JSON.parse(raw));
    expect(parseStrictJson(new TextEncoder().encode(raw))).toEqual(JSON.parse(raw));
    expect(parseStrictJson('"\\ud83d\\ude00"')).toBe('😀');
    expect(parseStrictJson('false')).toBe(false);
  });
  it.each(['{"a":1,"a":2}', '{"a":1,"\\u0061":2}', '{"nested":[{"x":null,"x":0}]}'])('rejects duplicate decoded keys: %s', raw => {
    expect(() => parseStrictJson(raw)).toThrow(InvalidData);
  });
  it.each(['__proto__', 'prototype', 'constructor'])('rejects dangerous key %s at any nesting', key => {
    expect(() => parseStrictJson(`{"nested":{"${key}":0}}`)).toThrow(InvalidData);
    expect(() => validateTree(JSON.parse(`{"${key}":0}`))).toThrow(InvalidData);
  });
  it.each(['NaN', 'Infinity', '-Infinity', '1e309', '9007199254740992', '-9007199254740992', '9007199254740993.0'])('rejects unsafe/nonfinite number %s', raw => {
    expect(() => parseStrictJson(raw)).toThrow(InvalidData);
  });
  it.each(['', '[1,]', '{"a":1,}', '{a:1}', '01', '.5', '1.', '+1', 'true false', '{}x', '"\n"', '"\\q"', '"unterminated'])('rejects malformed/trailing JSON %s', raw => {
    expect(() => parseStrictJson(raw)).toThrow(InvalidData);
  });
  it('rejects malformed UTF-8 and lone Unicode surrogates in text and keys', () => {
    for (const bytes of [[0xc0, 0xaf], [0xed, 0xa0, 0x80], [0xff], [0xf0, 0x9f]]) expect(() => parseStrictJson(Uint8Array.from(bytes))).toThrow(InvalidData);
    for (const raw of ['"\\ud800"', '"\\udfff"', '{"\\ud800":1}', '"\ud800"']) expect(() => parseStrictJson(raw)).toThrow(InvalidData);
    expect(() => validateTree({ bad: '\udfff' })).toThrow(InvalidData);
    expect(() => validateTree({ ['\ud800']: 'bad key' })).toThrow(InvalidData);
  });
  it('enforces UTF-8 bytes, accepting exactly 2 MiB and rejecting the next byte', () => {
    const exact = '"' + '界'.repeat((MAX_BODY - 2) / 3) + '"';
    expect(new TextEncoder().encode(exact).byteLength).toBe(MAX_BODY);
    expect((parseStrictJson(exact) as string).length).toBe((MAX_BODY - 2) / 3);
    expect(() => parseStrictJson(exact + ' ')).toThrow(InvalidData);
    expect(() => parseStrictJson(new TextEncoder().encode(exact + ' '))).toThrow(InvalidData);
  });
  it('enforces root-relative depth 32 for all tree values, including null', () => {
    const nested = (count: number) => '['.repeat(count) + 'null' + ']'.repeat(count);
    expect(() => parseStrictJson(nested(32))).not.toThrow();
    expect(() => parseStrictJson(nested(33))).toThrow(InvalidData);
    expect(() => validateTree(JSON.parse(nested(32)))).not.toThrow();
    expect(() => validateTree(JSON.parse(nested(33)))).toThrow(InvalidData);
  });
  it('allows a bounded storage envelope without relaxing default input limits', () => {
    const oversized = '"' + 'x'.repeat(MAX_BODY) + '"';
    expect(() => parseStrictJson(oversized)).toThrow(InvalidData);
    expect(() => parseStrictJson(oversized, { maxBytes: MAX_BODY + 32 * 1024, maxDepth: 34 })).not.toThrow();
    const depth34 = '['.repeat(34) + 'null' + ']'.repeat(34);
    expect(() => parseStrictJson(depth34, { maxDepth: 34 })).not.toThrow();
    expect(() => parseStrictJson(depth34)).toThrow(InvalidData);
    for (const options of [{ maxBytes: Infinity }, { maxBytes: MAX_BODY + 32769 }, { maxDepth: 35 }, { maxDepth: -1 }]) expect(() => parseStrictJson('{}', options)).toThrow(InvalidData);
  });
  it('rejects values that JSON cannot faithfully represent', () => {
    for (const value of [undefined, 1n, new Date(), new Map(), () => 1, { value: undefined }, [, 1], Object.assign([], { hidden: 1 }), Object.create({ inherited: true })]) expect(() => validateTree(value)).toThrow(InvalidData);
    const accessor = { get value() { throw new Error('must not execute getter'); } };
    expect(() => validateTree(accessor)).toThrow(InvalidData);
    const accessorArray = [0]; Object.defineProperty(accessorArray, '0', { get() { throw new Error('must not execute getter'); }, enumerable: true });
    expect(() => validateTree(accessorArray)).toThrow(InvalidData);
    const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
    expect(() => validateTree(cyclic)).toThrow(InvalidData);
  });
});

describe('ledger and snapshot schema', () => {
  it('accepts complete legacy shape without mutation, sorting or default-plan merge', () => {
    const data = fixture(), before = copy(data); freeze(data);
    expect(() => validateData(data)).not.toThrow(); expect(data).toEqual(before);
    expect(data.stores[PLANS]).toEqual({}); expect(data.defaultPlans.synthetic.planPrice).toBe('10');
    expect(data.stores[ARCHIVES].empty).toEqual([]); expect(data.stores[FIFO].synthetic.stock).toBeNull();
    expect(data.stores[FIFO].synthetic.batches.map(batch => batch.name)).toEqual(['Z first', 'A second']);
    expect(() => validateData(parseStrictJson(encode(data)))).not.toThrow();
  });
  it('requires exactly the six data fields and exactly three object stores', () => {
    for (const data of [{ ...fixture(), extra: null }, { ...fixture(), procurement: undefined }, { ...fixture(), products: [] }, { ...fixture(), sfRates: [] }]) expect(() => validateData(data)).toThrow(InvalidData);
    const stores = fixture().stores;
    for (const bad of [null, [], { ...stores, extra: {} }, { [PLANS]: {}, [ARCHIVES]: {} }, { ...stores, [FIFO]: [] }, { ...stores, [PLANS]: null }]) expect(() => validateStores(bad)).toThrow(InvalidData);
  });
  it('matches Python required-text whitespace rather than JS trim', () => {
    for (const blank of ['\u0085', '\u001c', '\u001f', '\u2003', '\u3000']) {
      const data = fixture(); data.products[0].name = blank; expect(() => validateData(data)).toThrow(InvalidData);
    }
    const data = fixture(); data.products[0].name = '\ufeff'; expect(() => validateData(data)).not.toThrow();
  });
  it('accepts optional excluded absence and rejects unsupported procurement fields', () => {
    const data = fixture(); Reflect.deleteProperty(data.procurement, 'excluded'); expect(() => validateData(data)).not.toThrow();
    expect(() => validateData({ ...data, procurement: { orders: [], newPrivateField: 'preserve, do not drop' } })).toThrow(InvalidData);
    expect(() => validateData({ ...data, procurement: {} })).toThrow(InvalidData);
  });
  it('keeps null only where Python allows it, with no boolean numeric coercion', () => {
    const mutations: Array<(data: Fixture) => void> = [
      d => Reflect.set(d.products[0], 'cost', null), d => Reflect.set(d.products[0], 'price', true),
      d => Reflect.set(d.stores[FIFO].synthetic.batches[0], 'cost', null),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].values, 'cost', null),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].result, 'net', false),
      d => Reflect.set(d.procurement.orders[0].rows[0], 'qty', false),
    ];
    for (const mutate of mutations) { const data = fixture(); mutate(data); expect(() => validateData(data)).toThrow(InvalidData); }
  });
  it('rejects invalid FIFO quantities, flags, dates, zero cost and malformed history', () => {
    const mutations: Array<(data: Fixture) => void> = [
      d => Reflect.set(d.stores[FIFO].synthetic, 'stock', 0.5),
      d => Reflect.set(d.stores[FIFO].synthetic, 'stock', -1),
      d => Reflect.set(d.stores[FIFO].synthetic, 'stock', true),
      d => Reflect.deleteProperty(d.stores[FIFO].synthetic, 'stock'),
      d => Reflect.set(d.stores[FIFO].synthetic, 'locked', -1),
      d => Reflect.set(d.stores[FIFO].synthetic, 'manualBatches', 1),
      d => { d.stores[FIFO].synthetic.batches[0].cost = 0; },
      d => { d.stores[FIFO].synthetic.batches[0].date = '2026-02-29'; },
      d => { d.stores[FIFO].synthetic.batches[0].date = '0000-01-01'; },
      d => Reflect.set(d.stores[FIFO].synthetic, 'history', [['bad', 1]]),
    ];
    for (const mutate of mutations) { const data = fixture(); mutate(data); expect(() => validateData(data)).toThrow(InvalidData); }
  });
  it('rejects decimal/exponent JSON tokens in Python integer-only fields', () => {
    for (const token of ['1.0', '1e0', '0.0']) {
      const raw = encode(fixture()).replace('"cases":1', `"cases":${token}`);
      expect(() => validateData(parseStrictJson(raw))).toThrow(InvalidData);
    }
    const raw = encode(fixture()).replace('"sfSplit":0', '"sfSplit":0.0');
    expect(() => validateData(parseStrictJson(raw))).toThrow(InvalidData);
  });
  it('validates archives without treating timestamps as new ISO-only fields', () => {
    for (const flag of [0, 1, false, true]) {
      const data = fixture(); Reflect.set(data.stores[ARCHIVES].synthetic[0].values, 'sfSplit', flag); expect(() => validateData(data)).not.toThrow();
    }
    const mutations: Array<(data: Fixture) => void> = [
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].values, 'sfSplit', 2),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].values, 'sfRegion', 0.5),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].values, 'freightProvince', 0),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].plan, 'planNote', 0),
      d => { d.stores[ARCHIVES].synthetic[0].id = ''; },
      d => Reflect.set(d.stores[ARCHIVES], 'empty', null),
    ];
    for (const mutate of mutations) { const data = fixture(); mutate(data); expect(() => validateData(data)).toThrow(InvalidData); }
  });
  it('rejects freight schema drift and invalid small/large parcel boundaries', () => {
    const mutations: Array<(data: Fixture) => void> = [
      d => { d.sfRates[0].rates.pop(); },
      d => Reflect.set(d.sfRates[0].handlingRate!, 'includedCases', 0.5),
      d => Reflect.set(d.sfRates[0].handlingRate!, 'extra', 0),
      d => Reflect.set(d.sfRates[0].ordinaryRates!, 'Other province', {}),
      d => Reflect.set(d.sfRates[0].ordinaryRates!['Synthetic A'], 'unsupported', {}),
      d => { d.sfRates[0].ordinaryRates!['Synthetic A'].yto.small.stepsPerKg = 0; },
      d => { d.sfRates[0].ordinaryRates!['Synthetic A'].yto.small.maxWeight = 0; },
      d => { d.sfRates[0].ordinaryRates!['Synthetic A'].yto.small.firstWeight = 4; },
      d => { d.sfRates[0].ordinaryRates!['Synthetic A'].yto.large.firstKg = 4; },
      d => { d.sfRates[0].ordinaryRates!['Synthetic A'].yunda.baseFee = -1; },
    ];
    for (const mutate of mutations) { const data = fixture(); mutate(data); expect(() => validateData(data)).toThrow(InvalidData); }
  });
  it('validates snapshot schema, safe positive revision and actual zoned calendar time', () => {
    for (const updatedAt of ['2026-10-02T12:30:45Z', '2024-02-29T00:00:00.000+08:00', '2026-10-02T12:30:45-05:30']) expect(() => validateSnapshot({ ...snapshot(), updatedAt })).not.toThrow();
    for (const updatedAt of ['2026-10-02', '2026-10-02T12:30:45', '2026-02-29T00:00:00Z', '2026-10-02T24:00:00Z', '2026-10-02T12:30:60Z', '2026-10-02T12:30:45+24:00', '0000-01-01T00:00:00Z']) expect(() => validateSnapshot({ ...snapshot(), updatedAt })).toThrow(InvalidData);
    for (const revision of [0, -1, 1.5, true, null, Number.MAX_SAFE_INTEGER + 1]) expect(() => validateSnapshot({ ...snapshot(), revision })).toThrow(InvalidData);
    expect(() => validateSnapshot({ ...snapshot(), schema: 2 })).toThrow(InvalidData);
    expect(() => validateSnapshot({ ...snapshot(), syncedAt: 'extra' })).toThrow(InvalidData);
    const unknown: unknown = snapshot(); validateSnapshot(unknown); const narrowed: Snapshot = unknown; expect(narrowed.data.products.length).toBe(1);
  });
  it('cannot bypass snapshot byte limits via a direct object or storage parser allowance', () => {
    const value = snapshot(); value.data.products[0].note = 'x'.repeat(MAX_BODY);
    expect(() => validateSnapshot(value)).toThrow(InvalidData);
    const parsed = parseStrictJson(encode(value), { maxBytes: MAX_BODY + 32768, maxDepth: 34 });
    expect(() => validateSnapshot(parsed)).toThrow(InvalidData);
  });
  it('matches the verified Python baseline on a synthetic boundary corpus', () => {
    const values: unknown[] = [fixture()];
    const mutations: Array<(data: Fixture) => void> = [
      d => Reflect.set(d.products[0], 'cost', null), d => Reflect.set(d.products[0], 'cost', true),
      d => { d.products[0].name = '\u0085'; }, d => { d.products[0].name = '\ufeff'; },
      d => { d.products.push(copy(d.products[0])); }, d => Reflect.set(d.products[0], 'cases', 1.5),
      d => Reflect.set(d.stores[FIFO].synthetic, 'stock', 0), d => Reflect.set(d.stores[FIFO].synthetic, 'stock', false),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].values, 'cost', null),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].result, 'net', null),
      d => Reflect.set(d.stores[ARCHIVES].synthetic[0].result, 'net', false),
      d => Reflect.deleteProperty(d.procurement, 'excluded'), d => Reflect.set(d.procurement, 'unsupported', []),
      d => { d.procurement.orders[0].rows[0].cost = -2.5; },
      d => { d.procurement.orders[0].date = '2023-02-29'; },
      d => Reflect.set(d.stores[PLANS], 'synthetic', { planNote: null }),
      d => Reflect.set(d.sfRates[0].handlingRate!, 'includedCases', true),
      d => { d.sfRates[0].ordinaryRates!['Synthetic A'].yto.large.firstKg = 4; },
    ];
    for (const mutate of mutations) { const data = fixture(); mutate(data); values.push(data); }
    const rawCases = values.map(encode);
    rawCases.push(encode(fixture()).replace('"cases":1', '"cases":1.0'));
    rawCases.push(encode(fixture()).replace('"sfSplit":0', '"sfSplit":0.0'));
    // 固定合成预期：2026-10-02 与原 Python 校验器逐例对照通过，保留全部 21 个边界样例。
    // Python validator SHA-256: 8b5d1de3e4c152181dc90f9d60f06d046566afca6808774e3e6fc6c67e896096
    // Corpus SHA-256: 7f58997ebe778604c428e4d8231b4c3cae065fcef0d330a0170ab9edf4bb87ed
    // 原独立适配器保留动态 Python 对照；此发布仓不依赖外部 Python 或父目录。
    const pythonBaseline = [true,false,false,false,true,false,false,true,false,false,true,false,true,false,true,false,false,false,false,false,false];
    const actual = rawCases.map(raw => { try { validateData(parseStrictJson(raw)); return true; } catch { return false; } });
    expect(actual).toEqual(pythonBaseline);
  });
});
