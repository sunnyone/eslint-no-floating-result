import { RuleTester } from 'eslint';
import { noUncheckedResult } from '../../src/rules/no-unchecked-result';

const ruleTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run('no-unchecked-result', noUncheckedResult, {
  valid: [
    {
      code: `
        import { CheckedResult } from '../../src/types';
        
        type FooSuccess = { type: "success" };
        type FooError = { type: "error" };
        
        type Foo = FooSuccess | FooError;
        type CheckedFoo = CheckedResult<Foo, "type">;
        
        function doSomething(): CheckedFoo {
          if (Math.random() > 0.5) {
             return {type: 'success'};
          }
          return {type: 'error'};
        }
        
        function lintSuccessSample() {
            const result = doSomething();
            if (result.type === 'success') { // type is checked
              console.log("Success!");
            }
        }
      `,
      filename: 'test.ts',
    },
    {
      code: `
        import { CheckedResult } from '../../src/types';
        
        type FooSuccess = { type: "success" };
        type FooError = { type: "error" };
        
        type Foo = FooSuccess | FooError;
        type CheckedFoo = CheckedResult<Foo, "type">;
        
        function doSomething(): CheckedFoo {
          if (Math.random() > 0.5) {
             return {type: 'success'};
          }
          return {type: 'error'};
        }
        
        function lintSuccessSample2() {
            const result = doSomething();
            switch (result.type) {
              case 'success':
                console.log("Success!");
                break;
              case 'error':
                console.log("Error!");
                break;
            }
        }
      `,
      filename: 'test.ts',
    },
  ],
  invalid: [
    {
      code: `
        import { CheckedResult } from '../../src/types';
        
        type FooSuccess = { type: "success" };
        type FooError = { type: "error" };
        
        type Foo = FooSuccess | FooError;
        type CheckedFoo = CheckedResult<Foo, "type">;
        
        function doSomething(): CheckedFoo {
          if (Math.random() > 0.5) {
             return {type: 'success'};
          }
          return {type: 'error'};
        }
        
        function lintErrorSample() {
           doSomething();  // type is not checked
        }
      `,
      filename: 'test.ts',
      errors: [
        {
          messageId: 'noUncheckedResult',
        },
      ],
    },
  ],
});
