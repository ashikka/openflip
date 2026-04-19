/**
 * Proto generation script.
 *
 * Currently a no-op since we use hand-written TypeScript types that mirror
 * the Flipper protobuf schema. This is intentional — the Flipper proto schema
 * is stable and hand-written types give us better control and smaller bundle.
 *
 * If the schema changes significantly, we can switch to ts-proto or protobuf-ts
 * codegen by adding the proto/ submodule and generating from .proto files.
 */

console.log("[@openflip/flipper-rpc] Proto types are hand-written — no codegen needed.");
console.log("  Reference schema: https://github.com/flipperdevices/flipperzero-protobuf");
