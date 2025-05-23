# eslint-plugin-no-floating-result

ESLint plugin to detect unchecked result properties.

## Installation

```bash
npm install --save-dev eslint-plugin-no-floating-result
```

## Usage

Add to your ESLint configuration:

```js
{
  "plugins": ["no-floating-result"],
  "rules": {
    "no-floating-result/no-unchecked-result": "error"
  }
}
```

## Rules

### no-unchecked-result

This rule enforces that properties of `CheckedResult` types are checked.

Example:

```typescript
import { CheckedResult } from 'eslint-no-floating-result';

type FooSuccess = { type: "success" };
type FooError = { type: "error" };

type Foo = FooSuccess | FooError;
type Result = CheckedResult<Foo, "type">;

function doSomething(): Result {
  if (Math.random() > 0.5) {
    return {type: 'success'};
  }
  return {type: 'error'};
}

// Good - property is checked
function lintSuccessSample() {
  const result = doSomething();
  if (result.type === 'success') {
    console.log("Success!");
  }
}

// Bad - property is not checked
function lintErrorSample() {
  doSomething();
}
```
