# Requires checking the property of a CheckedResult type (no-floating-result)

This rule enforces that properties of `CheckedResult` types are checked.

## Rule Details

This rule aims to ensure that when using a `CheckedResult` type, the specified property is always checked.

Examples of **incorrect** code for this rule:

```ts
function doSomething(): CheckedResult<Foo, "type"> {
  // ...
}

// Bad - property is not checked
function lintErrorSample() {
  doSomething();  // typeをチェックしていない
}
```

Examples of **correct** code for this rule:

```ts
function doSomething(): CheckedResult<Foo, "type"> {
  // ...
}

// Good - property is checked
function lintSuccessSample() {
  const result = doSomething();
  if (result.type === 'success') { // typeをチェックしている
    console.log("Success!");
  }
}
```

## When Not To Use It

If you don't need to enforce checking properties of result types, you can disable this rule.
