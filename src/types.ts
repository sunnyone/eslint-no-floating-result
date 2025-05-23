/**
 * A type that requires checking a specific property.
 * @template T The type to check
 * @template P The property name to check
 */
export type CheckedResult<T, P extends string & keyof T> = T;
