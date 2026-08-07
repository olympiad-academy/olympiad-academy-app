/**
 * TypeScript side of CSS Modules (D3): class lookups are plain strings.
 * The unit-test runner stubs these imports entirely (see test/helpers).
 */
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
