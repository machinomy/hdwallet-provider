const ALLOWED_PATHS = ["44'/0'", "44'/1'", "44'/60'", "44'/61'"];

export const DEFAULT_PATH = "m/44'/60'/0'/0";

export function normalizePath(path?: string): string {
  const usedPath = path || DEFAULT_PATH;
  return usedPath.replace(/^m\//, "");
}

export class InvalidDerivationPathError extends Error {}

export function ensurePath(path: string) {
  if (!ALLOWED_PATHS.some(hdPref => path.startsWith(hdPref))) {
    throw new InvalidDerivationPathError(
      `Ledger derivation path allowed are ${ALLOWED_PATHS.join(", ")}. ${path} is not supported`
    );
  }
}

export function componentsFromPath(path: string) {
  ensurePath(path);
  // check if derivation path follows 44'/60'/x'/n or 44'/60'/x'/y/n pattern
  const regExp = /^(44'\/(?:0|1|60|61)'\/\d+'?\/(?:\d+\/)?)(\d+)$/;
  const matchResult = regExp.exec(path);
  if (matchResult === null) {
    throw new InvalidDerivationPathError(
      "To get multiple accounts your derivation path must follow pattern 44'/60|61'/x'/n or 44'/60'/x'/y/n"
    );
  }
  return { basePath: matchResult[1], index: parseInt(matchResult[2], 10) };
}
