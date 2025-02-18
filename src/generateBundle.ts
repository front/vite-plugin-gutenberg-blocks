import { generateFileHash, generatePhpAssetFile } from "./utils";
import type { SourceMap } from "node:module";
import type { OutputOptions, PluginContext } from "rollup";

export type EmittedAsset = {
	type: "asset";
	name?: string;
	needsCodeReference?: boolean;
	fileName?: string;
	source?: string | Uint8Array;
};

type AssetInfo = {
	fileName: string;
	name?: string;
	needsCodeReference: boolean;
	source: string | Uint8Array;
	type: "asset";
	code: string;
	imports: string[];
};

type ChunkInfo = {
	code: string;
	dynamicImports: string[];
	exports: string[];
	facadeModuleId: string | null;
	fileName: string;
	implicitlyLoadedBefore: string[];
	imports: string[];
	importedBindings: { [imported: string]: string[] };
	isDynamicEntry: boolean;
	isEntry: boolean;
	isImplicitEntry: boolean;
	map: SourceMap | null;
	modules: {
		[id: string]: {
			renderedExports: string[];
			removedExports: string[];
			renderedLength: number;
			originalLength: number;
			code: string | null;
		};
	};
	moduleIds: string[];
	name: string;
	referencedFiles: string[];
	type: "chunk";
};

/**
 * generateBundle
 *
 * Wordpress blocks wont be detected unless an `index.asset.php` file is generated for each one which
 * tells WP information about versioning and dependencies.
 *
 * This function maps the imports from the @wordpress namespace, generates a version hash and then
 * emits the required php file into the build folder
 *
 * @see https://rollupjs.org/plugin-development/#generatebundle
 */
export function generateBundle(
	this: PluginContext,
	options: OutputOptions,
	bundle: { [fileName: string]: ChunkInfo | AssetInfo }
) {	
	Object.values(bundle).map((file) => {
		if (!file.code || !file.imports) return;

		const fileName = file.name;
		const hash = generateFileHash(file.code);
		
		const fileImports = file.imports.map((i) => {
			return i.replace(/^@wordpress\//, "wp-");
		});

		if(!!fileName){
			this.emitFile({
				type: "asset",
				fileName: fileName + ".asset.php",
				source: generatePhpAssetFile(fileImports, hash),
			} satisfies EmittedAsset);
		}
	
	});	
}
