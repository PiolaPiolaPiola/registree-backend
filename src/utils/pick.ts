/**Evita que en el request el cliente manipule campos no permitidos*/
export const pick = <K extends string>(source: unknown, keys: readonly K[]): Partial<Record<K, unknown>> => {
    if(typeof source !== 'object' || source === null) return{};

    const result: Partial<Record<K, unknown>> = {};

    for (const key of keys) {
        if (key in source) result[key] = (source as Record<string, unknown>)[key];
    }
  return result;
}