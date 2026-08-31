/**
 * Inverse of {@link zip}: turn rows into columns.
 *
 * @example
 * unzip([[1, 'a'], [2, 'b']]); // [[1, 2], ['a', 'b']]
 */
export function unzip<T>(array: ReadonlyArray<readonly T[]>): T[][] {
  if (!Array.isArray(array) || array.length === 0) return [];
  const rows = array.filter((row): row is readonly T[] => Array.isArray(row));
  if (rows.length === 0) return [];
  const width = Math.max(...rows.map((row) => row.length));
  const result: T[][] = new Array(width);
  for (let i = 0; i < width; i += 1) {
    result[i] = rows.map((row) => row[i]);
  }
  return result;
}

export default unzip;
