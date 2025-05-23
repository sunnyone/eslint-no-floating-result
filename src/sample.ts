import { CheckedResult } from './types';

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

// Should pass lint
function lintSuccessSample() {
    const result = doSomething();
    if (result.type === 'success') { // type is checked
      console.log("Success!");
    }
}

// Should fail lint
function lintErrorSample() {
   doSomething();  // type is not checked
}
