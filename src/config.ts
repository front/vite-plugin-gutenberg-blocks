import { resolve, sep } from "node:path";
import iife from "rollup-plugin-iife";
/**
 * config
 *
 * Provides Vite config settings required to build Gutenberg blocks
 *
 * @see https://vitejs.dev/guide/api-plugin.html#config
 */

const normalizeArray = (source) => (Array.isArray(source) ? source : [source]);

export const config = ({ outDir = null, blockFile = null } = {}) => {
  const pwd = process.env.PWD;
  const block = pwd.split(sep).pop();

  const backendScriptPath = resolve(pwd, "src/index.jsx");

  let entry = [backendScriptPath];

  if (blockFile.script) {
    const scripts = normalizeArray(blockFile.script);
    
    scripts.forEach((script: string) => {
        entry.push(resolve(pwd, "src/" + script.replace("file:", "")));
      })
  }
  if (blockFile.viewScript) {
    const viewScripts = normalizeArray(blockFile.viewScript);

    viewScripts.filter((script) => script.startsWith("file")).forEach((script: string) => {
      entry.push(resolve(pwd, "src/" + script.replace("file:", "")));
    })
  }

  return {
    define: { "process.env.NODE_ENV": `"${process.env.NODE_ENV}"` },
    build: {
      outDir: outDir ? outDir + block : resolve(pwd, "../../../build/" + block),
      rollupOptions: {
        input: entry,
        plugins: [iife()],
        output: {
          entryFileNames: (file) => file.facadeModuleId.replace(pwd + "/src/", "").replace("jsx", 'js'),
          assetFileNames: '[name].[ext]'
        },
      },
      target: "esnext",
      minify: true,
      cssCodeSplit: true, // This option stops the default `styles.css` from being bundled
    },
  };
};
