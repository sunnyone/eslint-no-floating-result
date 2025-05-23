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
    return {
      'ExpressionStatement > CallExpression'(node: any) {
        const callee = node.callee;
        if (
          callee.type === 'Identifier' && 
          callee.name === 'doSomething'
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
          node.init.callee.name === 'doSomething' &&
          node.id.type === 'Identifier'
        ) {
          const variableName = node.id.name;
          const sourceCode = context.getSourceCode();
          const variable = sourceCode.getScope().variables.find(
            (v: any) => v.name === variableName
          );
          
          if (!variable) return;
          
          let typePropertyAccessed = false;
          for (const reference of variable.references) {
            if (reference.identifier === node.id) continue;
            
            const parent = reference.identifier.parent;
            if (
              parent &&
              parent.type === 'MemberExpression' &&
              parent.property &&
              parent.property.type === 'Identifier' &&
              parent.property.name === 'type'
            ) {
              typePropertyAccessed = true;
              break;
            }
          }
          
          if (!typePropertyAccessed) {
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
