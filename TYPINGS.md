# Type declarations

The package bundles `types/index.d.ts`; consumers do not need `@types/nodegit`.
The declarations also work when Studio installs the tarball under the `nodegit`
dependency name. This does not require publishing another types package.

## Sources of truth

Run `npm run generate:types` after changing a typing source. Commit `types/` with
its sources; do not edit generated declarations. CI regenerates and compares them.
Generation does not compile or load the native addon.

- The exact development dependency `@types/nodegit@0.28.9` supplies declarations
  for APIs not yet migrated. Its MIT license is included in `types/LICENSE`.
  This is a compatibility baseline, not evidence that every inherited signature
  matches the newer libgit2. No separate DefinitelyTyped fork is needed.
- `generate/output/idefs.json`, produced by the existing binding generator,
  supplies current constant names/values and selected native method signatures.
  `generate/input/typings.json` lists the methods migrated so far and deprecated
  constant aliases implemented by the JavaScript extensions.
- Handwritten C++ methods can declare their JavaScript contract next to their
  implementation with `// @nodegit-type Owner#method(...): Result;` for instance
  methods, or `Owner.method(...)` for static methods. Refer to other exported types
  through `Git.Type`. Add the source file to `manualSources`. These annotations
  generate declarations; TypeScript cannot check their C++ implementation.
- Checked JavaScript helpers use inline JSDoc. Their declarations are emitted by
  TypeScript and used directly for the public methods. `types/native.d.ts`
  describes the methods before convenience wrappers replace them. The explicit
  cast at the extension boundary reflects that initialization order.

Constants are declared as readonly runtime objects, not ambient const enums.
Their property values retain numeric literal types, and member type spellings
such as `Diff.FORMAT.PATCH` are retained through type-only aliases. Value aliases use the binding
metadata's enum/mask classification; masks accept numeric flag combinations.
Legacy constant aliases are retained where the JavaScript layer implements them.
Obsolete upstream declarations without runtime counterparts are omitted.

## Initial coverage and expansion

The first migration generates all binding constants, native Patch methods,
Diff.toBuf, DiffHunk accessors, selected Merge methods, Graph reachability/counts,
and Index conflict queries. Manual
contracts cover Patch.convenientFromDiff and ConvenientPatch text/statistics.
Merge and Graph convenience helpers are checked with strict `checkJs`; the rest
of the JavaScript layer remains on the upstream declaration baseline.

To migrate another native method, add it to `nativeMethods`; unsupported type
conversions fail generation and must be mapped explicitly. The conversions must
match the binding templates, including output parameters, multiple-output objects,
GitBuf-to-string conversion, nullability, and Promise wrappers. Explicit nullable
outputs are marked `isNullable` in the binding descriptor. An implementation marked manual
needs an inline contract rather than an inferred signature.

To migrate a JavaScript helper, document its real arguments and result in JSDoc,
export the helper from its extension module, add the module to
`tsconfig.types.json`, and list its public methods in `javascriptMethods`. Those
internal exports make declaration emission possible; the NodeGit root API stays
unchanged. Keep helpers' imports of public types relative to `../types`.

## Checks

`npm run test:types` regenerates declarations, checks opted-in JavaScript, and
compiles positive and negative API examples with strict checking,
`isolatedModules`, and library checking enabled. TypeScript currently provides
both checking and declaration emission; no second linter is needed for this work.

`npm run test:package` also compiles the examples against an isolated installation
of the actual tarball, without the upstream type package or checkout path aliases.
Native runtime assertions verify the key contracts that a declaration checker
must otherwise trust. Release/Studio integration should remove Studio's NodeGit
typing patch and ambient augmentation before testing the bundled declarations.
