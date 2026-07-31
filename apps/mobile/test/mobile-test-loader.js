import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve as resolvePath } from "node:path";
import { URL, fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const reactNativeMockUrl = new URL("./react-native-test-mock.js", import.meta.url).href;
const sourceExtensionsForRelativeImports = [".ts", ".tsx", ".mts", ".cts"];

function isRelativeFileImport(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function sourceBasePathForRelativeTypeScriptImport(specifier, parentUrl) {
  if (parentUrl === undefined || !parentUrl.startsWith("file:")) {
    return null;
  }
  if (!isRelativeFileImport(specifier) || specifier.endsWith("/")) {
    return null;
  }

  const parentDirectory = dirname(fileURLToPath(parentUrl));
  const requestedPath = resolvePath(parentDirectory, specifier);

  if (specifier.endsWith(".js")) {
    return requestedPath.slice(0, -".js".length);
  }
  if (extname(requestedPath) === "") {
    return requestedPath;
  }

  return null;
}

function remapRelativeImportToTypeScriptSource(specifier, parentUrl) {
  const sourceBasePath = sourceBasePathForRelativeTypeScriptImport(specifier, parentUrl);
  if (sourceBasePath === null) return null;

  for (const extension of sourceExtensionsForRelativeImports) {
    const candidatePath = `${sourceBasePath}${extension}`;
    if (existsSync(candidatePath)) return pathToFileURL(candidatePath).href;
  }

  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "react-native") {
    return { url: reactNativeMockUrl, shortCircuit: true };
  }

  const remappedUrl = remapRelativeImportToTypeScriptSource(specifier, context.parentURL);
  if (remappedUrl !== null) return { url: remappedUrl, shortCircuit: true };

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (/\.(?:ts|tsx|mts|cts)$/u.test(url)) {
    const source = await readFile(fileURLToPath(url), "utf8");
    const transpiled = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ES2022,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: fileURLToPath(url),
    });

    return { format: "module", source: transpiled.outputText, shortCircuit: true };
  }

  return nextLoad(url, context);
}
