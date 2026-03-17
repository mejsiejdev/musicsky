export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T> {
  return { success: true as const, data: data as T };
}

export function fail(error: unknown): ActionResult<never> {
  return {
    success: false as const,
    error:
      error instanceof Error
        ? error.message
        : "Something went wrong. Try again.",
  };
}
