# Requires checking the property of a CheckedResult type (no-unchecked-result)

This rule enforces that the property of a `CheckedResult` type is accessed.

## Rule Details

This rule aims to prevent bugs by ensuring that the property of a `CheckedResult` type is accessed.

Examples of **incorrect** code for this rule:

```typescript
import { CheckedResult } from 'eslint-plugin-no-floating-result';

type FooSuccess = { type: "success" };
type FooError = { type: "error" };

type Foo = FooSuccess | FooError;
export type CheckedFoo = CheckedResult<Foo, "type">;

function doSomething(): CheckedFoo {
  if (Math.random() > 0.5) {
     return {type: 'success'};
  }
  return {type: 'error'};
}

// Invalid - type is not checked
function lintErrorSample() {
   doSomething();
}
```

Examples of **correct** code for this rule:

```typescript
import { CheckedResult } from 'eslint-plugin-no-floating-result';

type FooSuccess = { type: "success" };
type FooError = { type: "error" };

type Foo = FooSuccess | FooError;
export type CheckedFoo = CheckedResult<Foo, "type">;

function doSomething(): CheckedFoo {
  if (Math.random() > 0.5) {
     return {type: 'success'};
  }
  return {type: 'error'};
}

// Valid - type is checked
function lintSuccessSample() {
    const result = doSomething();
    if (result.type === 'success') {
      console.log("Success!");
    }
}
```

## When Not To Use It

If you don't want to enforce checking the property of a `CheckedResult` type, you can disable this rule.
