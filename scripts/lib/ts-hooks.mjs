// Permite ao Node importar o código TypeScript do estúdio (imports sem extensão → .ts).
// Uso: node --import ./scripts/lib/ts-register.mjs script.mjs
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (e) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      for (const ext of ['.ts', '/index.ts']) {
        try {
          return await next(specifier + ext, context);
        } catch {}
      }
    }
    throw e;
  }
}
