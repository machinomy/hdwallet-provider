export const DEFAULT_PATH = 'm/44\'/60\'/0\'/0'

export function normalizePath (path?: string): string {
  if (path) {
    return path.replace(/^m\//, "")
  } else {
    return DEFAULT_PATH
  }
}
