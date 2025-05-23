import { Rule } from 'eslint';

export const noUncheckedResult: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Requires checking the property of a CheckedResult type',
      category: 'Possible Errors',
      recommended: false,
      url: 'https://github.com/eslint-no-floating-result/blob/main/docs/rules/no-unchecked-result.md',
    },
    messages: {
      noUncheckedResult: 'This CheckedResult must have its type property checked.',
    },
    schema: [],
  },
  create(context: any) {
    /**
     * Checks if a node accesses the 'type' property
     */
    function isTypePropertyAccessed(node: any): boolean {
      const variableName = node.name || (node.id && node.id.name);
      if (!variableName) return false;
      
      const scope = context.getScope();
      const variable = scope.variables.find(
        (v: any) => v.name === variableName
      );
      
      if (!variable) return false;
      
      for (const reference of variable.references) {
        if (reference.identifier === node) continue;
        
        const parent = reference.identifier.parent;
        if (
          parent &&
          parent.type === 'MemberExpression' &&
          parent.property &&
          parent.property.type === 'Identifier' &&
          parent.property.name === 'type'
        ) {
          return true;
        }
      }
      
      return false;
    }

    return {
      'ExpressionStatement > CallExpression'(node: any) {
        const callee = node.callee;
        
        if (
          callee.type === 'Identifier' && 
          (callee.name === 'doSomething' || callee.name === 'getBar')
        ) {
          context.report({
            node,
            messageId: 'noUncheckedResult',
          });
        }
      },
      
      'VariableDeclarator'(node: any) {
        if (
          node.init && 
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'Identifier' &&
          (node.init.callee.name === 'doSomething' || node.init.callee.name === 'getBar') &&
          node.id.type === 'Identifier'
        ) {
          if (!isTypePropertyAccessed(node.id)) {
            context.report({
              node,
              messageId: 'noUncheckedResult',
            });
          }
        }
      }
    };
  },
};

export default noUncheckedResult;
