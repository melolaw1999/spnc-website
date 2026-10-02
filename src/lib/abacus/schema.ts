/** Strict JSON and ledger validation shared by the local website API/storage.
 * Mirrors app/server.py. Validation never merges defaults, coerces values,
 * drops extra nested fields, sorts batches or mutates the supplied ledger.
 */
export const MAX_SNAPSHOT_BYTES = 2 * 1024 * 1024;
export const MAX_BODY = MAX_SNAPSHOT_BYTES;
export const STORE_KEYS = [
  'black-abacus-sku-plans-v1',
  'black-abacus-sku-archives-v1',
  'black-abacus-fifo-v1',
] as const;
export const DATA_KEYS = ['products', 'sfRates', 'defaultPlans', 'fifoReference', 'procurement', 'stores'] as const;
export type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
export type JsonObject = { [key: string]: JsonValue };
export type Stores = { [K in (typeof STORE_KEYS)[number]]: JsonObject };
export type Data = {
  products: JsonObject[];
  sfRates: JsonObject[];
  defaultPlans: JsonObject;
  fifoReference: JsonObject;
  procurement: JsonObject & { orders: JsonObject[] };
  stores: Stores;
};
export type Snapshot = { schema: 1; revision: number; updatedAt: string; data: Data };

export class InvalidData extends Error {
  constructor(message = 'invalid data') { super(message); this.name = 'InvalidData'; }
}

const BAD_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const own = (value: object, key: PropertyKey): boolean => Object.prototype.hasOwnProperty.call(value, key);
// JS erases the distinction between JSON 1 and 1.0. Preserve token provenance
// without changing values so Python integer-only fields still reject 1.0/1e0.
const floatTokens = new WeakMap<object, Set<string>>();

function reject(message: string): never { throw new InvalidData(message); }
function isObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
function object(value: unknown, message: string): asserts value is Record<string, unknown> {
  if (!isObject(value)) reject(message);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every(key => own(value, key));
}
function unicode(value: string): void {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const next = value.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) reject('invalid Unicode string');
    } else if (c >= 0xdc00 && c <= 0xdfff) reject('invalid Unicode string');
  }
}
function text(value: unknown, nonempty = false): asserts value is string {
  // Python str.strip whitespace differs from JS trim (notably U+0085/U+FEFF).
  const pythonBlank = /^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]*$/u;
  if (typeof value !== 'string' || (nonempty && pythonBlank.test(value))) reject('text field required');
  unicode(value);
}
function number(value: unknown, minimum?: number, integer = false): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) reject('numeric field must be finite');
  if (Number.isInteger(value) && !Number.isSafeInteger(value)) reject('JSON integer exceeds JavaScript safe range');
  if ((integer && !Number.isSafeInteger(value)) || (minimum !== undefined && value < minimum)) reject('numeric field is out of range');
}
function numberAt(container: object, key: string | number, minimum?: number, integer = false): void {
  const value = (container as Record<string, unknown>)[key];
  number(value, minimum, integer);
  if (integer && floatTokens.get(container)?.has(String(key))) reject('numeric field must be an integer token');
}
function calendar(value: unknown): asserts value is string {
  text(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) reject('ISO calendar date required');
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) reject('ISO calendar date required');
}
function timestamp(value: unknown): asserts value is string {
  text(value);
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!m) reject('ISO timestamp with timezone required');
  calendar(m[1]);
  if (+m[2] > 23 || +m[3] > 59 || +m[4] > 59) reject('ISO timestamp with timezone required');
  if (m[5] !== 'Z' && (+m[5].slice(1, 3) > 23 || +m[5].slice(4, 6) > 59)) reject('ISO timestamp with timezone required');
}

export function validateTree(value: unknown, depth = 0): asserts value is JsonValue {
  if (depth > 32) reject('JSON exceeds depth limit');
  if (isObject(value)) {
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string' || BAD_KEYS.has(key)) reject('unsafe JSON key');
      unicode(key);
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (!descriptor.enumerable || !own(descriptor, 'value')) reject('unsupported JSON property');
      validateTree(descriptor.value, depth + 1);
    }
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!own(value, i)) reject('unsupported sparse JSON array');
      const descriptor = Object.getOwnPropertyDescriptor(value, String(i))!;
      if (!descriptor.enumerable || !own(descriptor, 'value')) reject('unsupported JSON property');
      validateTree(descriptor.value, depth + 1);
    }
    if (Reflect.ownKeys(value).length !== value.length + 1) reject('unsupported JSON array property');
  } else if (typeof value === 'string') unicode(value);
  else if (typeof value === 'number') number(value);
  else if (value !== null && typeof value !== 'boolean') reject('unsupported JSON value');
}

/** Recursive JSON parser: JSON.parse alone silently accepts duplicate keys. */
export type StrictJsonOptions = { maxBytes?: number; maxDepth?: number };
export function parseStrictJson(raw: string | Uint8Array, options: StrictJsonOptions = {}): unknown {
  // The small optional allowance is solely for storage metadata envelopes.
  // Their enclosed snapshot must still pass the unrelaxed snapshot validator.
  const maxBytes = options.maxBytes ?? MAX_BODY, maxDepth = options.maxDepth ?? 32;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_BODY + 32 * 1024
      || !Number.isSafeInteger(maxDepth) || maxDepth < 0 || maxDepth > 34) reject('invalid JSON parser limits');
  let source: string;
  if (typeof raw === 'string') {
    if (raw.length > maxBytes) reject('JSON exceeds size limit');
    unicode(raw);
    if (new TextEncoder().encode(raw).byteLength > maxBytes) reject('JSON exceeds size limit');
    source = raw;
  } else if (raw instanceof Uint8Array) {
    if (raw.byteLength > maxBytes) reject('JSON exceeds size limit');
    try { source = new TextDecoder('utf-8', { fatal: true }).decode(raw); }
    catch { reject('invalid JSON encoding'); }
  } else reject('JSON must be text or bytes');
  let index = 0;
  const skip = () => { while (index < source.length && /[\x20\x09\x0a\x0d]/.test(source[index])) index++; };
  const string = (): string => {
    const start = index++;
    while (index < source.length) {
      const ch = source.charCodeAt(index++);
      if (ch === 34) {
        let result: string;
        try { result = JSON.parse(source.slice(start, index)) as string; }
        catch { reject('invalid JSON string'); }
        unicode(result);
        return result;
      }
      if (ch < 32) reject('invalid JSON string');
      if (ch === 92) {
        if (index >= source.length) reject('invalid JSON string');
        const escape = source[index++];
        if (escape === 'u') {
          if (!/^[0-9a-fA-F]{4}$/.test(source.slice(index, index + 4))) reject('invalid JSON escape');
          index += 4;
        } else if (!'"\\/bfnrt'.includes(escape)) reject('invalid JSON escape');
      }
    }
    return reject('unterminated JSON string');
  };
  type Parsed = { value: JsonValue; float?: boolean };
  const remember = (container: object, key: string, parsed: Parsed) => {
    if (parsed.float) {
      let keys = floatTokens.get(container);
      if (!keys) { keys = new Set(); floatTokens.set(container, keys); }
      keys.add(key);
    }
  };
  const value = (depth: number): Parsed => {
    if (depth > maxDepth) reject('JSON exceeds depth limit');
    skip();
    const ch = source[index];
    if (ch === '"') return { value: string() };
    if (ch === '{') {
      index++; skip();
      const result: JsonObject = {}, seen = new Set<string>();
      if (source[index] === '}') { index++; return { value: result }; }
      while (true) {
        skip(); if (source[index] !== '"') reject('JSON object key required');
        const key = string();
        if (BAD_KEYS.has(key)) reject('unsafe JSON key');
        if (seen.has(key)) reject('duplicate JSON key');
        seen.add(key); skip(); if (source[index++] !== ':') reject('JSON colon required');
        const parsed = value(depth + 1); result[key] = parsed.value; remember(result, key, parsed);
        skip(); const end = source[index++];
        if (end === '}') break;
        if (end !== ',') reject('JSON comma required');
      }
      return { value: result };
    }
    if (ch === '[') {
      index++; skip(); const result: JsonValue[] = [];
      if (source[index] === ']') { index++; return { value: result }; }
      while (true) {
        const parsed = value(depth + 1); remember(result, String(result.length), parsed); result.push(parsed.value);
        skip(); const end = source[index++];
        if (end === ']') break;
        if (end !== ',') reject('JSON comma required');
      }
      return { value: result };
    }
    for (const [token, literal] of [['true', true], ['false', false], ['null', null]] as const) {
      if (source.startsWith(token, index)) { index += token.length; return { value: literal }; }
    }
    const match = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(source.slice(index));
    if (!match) reject('invalid JSON value');
    index += match[0].length;
    const parsed = Number(match[0]); number(parsed);
    return { value: parsed, float: /[.eE]/.test(match[0]) };
  };
  const parsed = value(0).value;
  skip(); if (index !== source.length) reject('trailing JSON content');
  // Every node/string/number/key has already passed the same tree checks while
  // parsing, including the selected envelope depth bound.
  return parsed;
}

function validatePlans(plans: unknown): void {
  object(plans, 'plans must be an object');
  for (const [identifier, plan] of Object.entries(plans)) {
    text(identifier, true); object(plan, 'plan must be an object');
    for (const value of Object.values(plan)) text(value);
  }
}
function validateFifo(models: unknown): void {
  object(models, 'FIFO store must be an object');
  for (const [identifier, model] of Object.entries(models)) {
    text(identifier, true); object(model, 'FIFO model requires stock and batches');
    if (!own(model, 'stock') || !Array.isArray(model.batches)) reject('FIFO model requires stock and batches');
    if (model.stock !== null) numberAt(model, 'stock', 0, true);
    if (own(model, 'locked') && model.locked !== null) numberAt(model, 'locked', 0, true);
    for (const name of ['asOf', 'note', 'reserve', 'source']) if (own(model, name)) text(model[name]);
    for (const name of ['inferred', 'manualBatches']) if (own(model, name) && typeof model[name] !== 'boolean') reject('FIFO flags must be boolean');
    for (const batch of model.batches) {
      object(batch, 'incomplete FIFO batch');
      if (!['name', 'date', 'qty', 'cost'].every(key => own(batch, key))) reject('incomplete FIFO batch');
      text(batch.name, true); calendar(batch.date); numberAt(batch, 'qty', 0, true); numberAt(batch, 'cost', 0);
      if (batch.cost === 0) reject('FIFO batch cost must be positive');
    }
    if (own(model, 'history')) {
      if (!Array.isArray(model.history)) reject('FIFO history must be an array');
      for (const row of model.history) {
        if (!Array.isArray(row) || row.length !== 3) reject('FIFO history row must have three fields');
        text(row[0]); numberAt(row, 1, 0, true); numberAt(row, 2, 0);
      }
    }
  }
}
function validateArchives(archives: Record<string, unknown>): void {
  const strings = new Set(['freightProvince', 'freightCarrier']);
  const flags = new Set(['shippingConfirmed', 'sfAuto', 'sfSplit']);
  for (const [identifier, records] of Object.entries(archives)) {
    text(identifier, true);
    if (!Array.isArray(records)) reject('SKU archives must be arrays');
    for (const record of records) {
      object(record, 'archive values must be an object'); object(record.values, 'archive values must be an object');
      for (const name of ['id', 'name', 'createdAt']) text(record[name], true);
      for (const name of ['skuId', 'adMode']) if (own(record, name)) text(record[name]);
      for (const [name, value] of Object.entries(record.values)) {
        if (strings.has(name)) text(value);
        else if (flags.has(name)) {
          if (typeof value !== 'boolean' && !(typeof value === 'number' && (value === 0 || value === 1) && !floatTokens.get(record.values)?.has(name))) reject('archive flag must be boolean or zero/one');
        } else numberAt(record.values, name, name === 'sfRegion' ? 0 : undefined, name === 'sfRegion');
      }
      if (own(record, 'plan')) validatePlans({ [identifier]: record.plan });
      if (own(record, 'result')) {
        object(record.result, 'archive result must be an object');
        for (const value of Object.values(record.result)) if (value !== null) number(value);
      }
    }
  }
}
export function validateStores(value: unknown): asserts value is Stores {
  object(value, 'all three known stores are required');
  if (!exact(value, STORE_KEYS)) reject('all three known stores are required');
  validateTree(value);
  for (const store of Object.values(value)) object(store, 'each store must be an object');
  validatePlans(value[STORE_KEYS[0]]);
  validateArchives(value[STORE_KEYS[1]] as Record<string, unknown>);
  validateFifo(value[STORE_KEYS[2]]);
}
function validateOrdinaryRates(region: Record<string, unknown>): void {
  if (own(region, 'handlingRate')) {
    const handling = region.handlingRate;
    object(handling, 'handling rate requires base, includedCases and additional');
    if (!exact(handling, ['base', 'includedCases', 'additional'])) reject('handling rate requires base, includedCases and additional');
    numberAt(handling, 'base', 0); numberAt(handling, 'includedCases', 0, true); numberAt(handling, 'additional', 0);
  }
  if (!own(region, 'ordinaryRates')) return;
  const rates = region.ordinaryRates;
  object(rates, 'ordinary freight provinces must belong to the region');
  const provinces = new Set((region.name as string).split('/'));
  if (!Object.keys(rates).every(key => provinces.has(key))) reject('ordinary freight provinces must belong to the region');
  function fields(value: unknown, keys: string[]): asserts value is Record<string, number> {
    object(value, 'ordinary freight parameters are incomplete or unsupported');
    if (!exact(value, keys)) reject('ordinary freight parameters are incomplete or unsupported');
    for (const key of keys) numberAt(value, key, 0);
  }
  for (const carriers of Object.values(rates)) {
    object(carriers, 'ordinary freight carrier is unsupported');
    if (!Object.keys(carriers).every(key => ['yunda', 'yto'].includes(key))) reject('ordinary freight carrier is unsupported');
    if (own(carriers, 'yunda')) fields(carriers.yunda, ['minWeightExclusive', 'baseFee', 'perKgFee']);
    if (own(carriers, 'yto')) {
      const yto = carriers.yto;
      object(yto, 'YTO freight requires small and large parameters');
      if (!exact(yto, ['small', 'large'])) reject('YTO freight requires small and large parameters');
      fields(yto.small, ['maxWeight', 'firstWeight', 'stepsPerKg', 'firstFee', 'stepFee']);
      fields(yto.large, ['firstKg', 'firstFee', 'perKgFee']);
      if (yto.small.stepsPerKg <= 0 || yto.small.maxWeight <= 0 || yto.small.firstWeight > yto.small.maxWeight) reject('YTO small parcel weight parameters are out of range');
      if (yto.large.firstKg > Math.ceil(yto.small.maxWeight)) reject('YTO first weight exceeds the large parcel boundary');
    }
  }
}

export function validateData(value: unknown): asserts value is Data {
  object(value, 'unexpected data schema');
  if (!exact(value, DATA_KEYS)) reject('unexpected data schema');
  validateTree(value);
  if (!Array.isArray(value.products) || !Array.isArray(value.sfRates)) reject('products and sfRates must be arrays');
  if (!value.products.length || value.sfRates.length < 2) reject('at least one product and two freight regions are required');
  const identifiers = new Set<string>();
  for (const product of value.products) {
    object(product, 'product must be an object');
    for (const name of ['id', 'name', 'group', 'costType']) text(product[name], true);
    if (identifiers.has(product.id as string)) reject('duplicate product id');
    identifiers.add(product.id as string);
    for (const name of ['cost', 'price', 'shipping', 'tax', 'platform']) numberAt(product, name, 0);
    if (own(product, 'cases')) numberAt(product, 'cases', 1, true);
    for (const name of ['barcode', 'family', 'flavor', 'spec', 'note', 'line', 'goodsId', 'goodsCode']) if (own(product, name)) text(product[name]);
  }
  for (const region of value.sfRates) {
    object(region, 'freight region requires five rates');
    if (!Array.isArray(region.rates) || region.rates.length !== 5) reject('freight region requires five rates');
    text(region.name, true);
    for (const rate of region.rates) number(rate, 0);
    validateOrdinaryRates(region);
  }
  object(value.defaultPlans, 'reference fields must be objects'); object(value.fifoReference, 'reference fields must be objects');
  const procurement = value.procurement;
  object(procurement, 'procurement must contain an orders array');
  if (!Array.isArray(procurement.orders)) reject('procurement must contain an orders array');
  if (!Object.keys(procurement).every(key => ['orders', 'asOf', 'excluded'].includes(key))) reject('unsupported procurement fields; preserve and review the source schema');
  validateStores(value.stores); validatePlans(value.defaultPlans); validateFifo(value.fifoReference);
  for (const order of procurement.orders) {
    object(order, 'procurement order requires rows');
    if (!Array.isArray(order.rows)) reject('procurement order requires rows');
    calendar(order.date);
    for (const name of ['name', 'status', 'currency', 'file']) text(order[name]);
    for (const row of order.rows) {
      object(row, 'procurement row must be an object');
      for (const name of ['barcode', 'currency', 'name', 'spec', 'unit', 'kind', 'note', 'sheet']) text(row[name]);
      for (const name of ['qty', 'cost', 'amount']) numberAt(row, name);
      if (own(row, 'priceSource')) text(row.priceSource);
    }
  }
  if (own(procurement, 'excluded')) {
    if (!Array.isArray(procurement.excluded)) reject('excluded procurement records must be an array');
    for (const record of procurement.excluded) {
      object(record, 'excluded record must be an object'); text(record.file); text(record.reason);
    }
  }
  if (own(procurement, 'asOf')) text(procurement.asOf);
}

export function validateSnapshot(value: unknown): asserts value is Snapshot {
  object(value, 'unexpected snapshot schema');
  if (!exact(value, ['schema', 'revision', 'updatedAt', 'data']) || value.schema !== 1) reject('unexpected snapshot schema');
  validateTree(value);
  numberAt(value, 'revision', 1, true); timestamp(value.updatedAt); validateData(value.data);
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > MAX_BODY) reject('snapshot exceeds size limit');
}
