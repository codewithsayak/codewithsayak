import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import chromium, { inflate, setupLambdaEnvironment } from '@sparticuz/chromium';

// The bundled browser also works outside AWS. Extract its NSS/NSPR libraries
// on ordinary Linux CI, just as the package does on Amazon Linux.
export async function browserEnvironment() {
  const require = createRequire(import.meta.url);
  const packageRoot = join(dirname(require.resolve('@sparticuz/chromium')), '..');
  if (process.platform === 'linux') {
    await inflate(join(packageRoot, 'bin', 'al2023.tar.br'));
    setupLambdaEnvironment(join(tmpdir(), 'al2023', 'lib'));
  }
  return {
    executablePath: await chromium.executablePath(),
    args: [...chromium.args.filter((arg) => arg !== '--single-process'), '--enable-unsafe-swiftshader'],
  };
}
