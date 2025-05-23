import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

type MessageIds = 'noFloatingResult';
type Options = [];

/**
 * Rule to detect when a property of a CheckedResult type is not accessed.
 */
export const noFloatingResult = ESLintUtils.RuleCreator(
  (name: string) => `https://github.com/eslint-no-floating-result/blob/main/docs/rules/${name}.md`,
)({
  name: 'no-floating-result',
  meta: {
    type: 'problem',
    docs: {
      description: 'Requires checking the property of a CheckedResult type',
    },
    messages: {
      noFloatingResult: 'This CheckedResult must have its property checked.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context: any) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    /**
     * Checks if a type is a CheckedResult type or derived from it.
     */
    function findCheckedResultType(type: ts.Type): { isCheckedResult: boolean; propertyName: string | null } {
      console.log('Checking type:', type.getSymbol()?.getName());

      console.log('Type flags:', type.flags);
      
      if (type.isUnion()) {
        console.log('Found union type');
        for (const subType of type.types) {
          const result = findCheckedResultType(subType);
          if (result.isCheckedResult) {
            return result;
          }
        }
      }

      // Check if the type has a symbol
      const symbol = type.getSymbol();
      if (!symbol) {
        console.log('No symbol found');
        return { isCheckedResult: false, propertyName: null };
      }

      console.log('Symbol name:', symbol.getName());

      if (symbol.getName() === 'CheckedFoo') {
        console.log('Found CheckedFoo type alias');
        return { isCheckedResult: true, propertyName: 'type' };
      }

      // Try to get the type declaration
      const declarations = symbol.getDeclarations();
      if (!declarations || declarations.length === 0) {
        console.log('No declarations found');
        return { isCheckedResult: false, propertyName: null };
      }

      // Check if any declaration is a type alias that uses CheckedResult
      for (const declaration of declarations) {
        if (ts.isTypeAliasDeclaration(declaration)) {
          console.log('Found type alias declaration:', declaration.name.text);
          
          // Try to get the type from the declaration
          const aliasType = checker.getTypeAtLocation(declaration);
          console.log('Alias type symbol:', aliasType.getSymbol()?.getName());
          
          // Check if it's a reference to CheckedResult
          if (declaration.type.kind === ts.SyntaxKind.TypeReference) {
            const typeRef = declaration.type as ts.TypeReferenceNode;
            const typeName = typeRef.typeName.getText();
            console.log('Type reference name:', typeName);
            
            if (typeName === 'CheckedResult') {
              console.log('Found CheckedResult reference');
              // Get the type arguments
              if (typeRef.typeArguments && typeRef.typeArguments.length === 2) {
                // Get the property name from the second type argument
                const propertyNameNode = typeRef.typeArguments[1];
                if (ts.isLiteralTypeNode(propertyNameNode) && ts.isStringLiteral(propertyNameNode.literal)) {
                  const propertyName = propertyNameNode.literal.text;
                  console.log('Found property name:', propertyName);
                  return { isCheckedResult: true, propertyName };
                }
              }
            }
          }
        }
      }

      // Check if the type itself is a reference to CheckedResult
      if (symbol.getName() === 'CheckedResult') {
        console.log('Found CheckedResult directly');
        if ((type as ts.TypeReference).typeArguments) {
          const typeArguments = (type as ts.TypeReference).typeArguments;
          if (typeArguments && typeArguments.length === 2) {
            const propertyNameType = typeArguments[1];
            if (propertyNameType.isLiteral()) {
              const propertyName = propertyNameType.value as string;
              console.log('Property name from direct CheckedResult:', propertyName);
              return { isCheckedResult: true, propertyName };
            }
          }
        }
      }

      console.log('Not a CheckedResult type');
      return { isCheckedResult: false, propertyName: null };
    }

    /**
     * Checks if a node accesses a specific property.
     */
    function isPropertyAccessed(node: TSESTree.Node, propertyName: string): boolean {
      console.log('Checking if property is accessed:', propertyName);
      
      // Track property access in parent nodes
      let current: TSESTree.Node | undefined = node.parent;
      while (current) {
        console.log('Checking parent node type:', current.type);
        
        if (
          current.type === TSESTree.AST_NODE_TYPES.MemberExpression &&
          current.object === node &&
          current.property.type === TSESTree.AST_NODE_TYPES.Identifier &&
          current.property.name === propertyName
        ) {
          console.log('Found direct property access');
          return true;
        }

        // Check if the node is used in a condition that checks the property
        if (
          current.type === TSESTree.AST_NODE_TYPES.IfStatement ||
          current.type === TSESTree.AST_NODE_TYPES.ConditionalExpression
        ) {
          console.log('Found if statement or conditional expression');
          const test = current.test;
          if (
            test.type === TSESTree.AST_NODE_TYPES.BinaryExpression &&
            test.operator === '===' &&
            test.left.type === TSESTree.AST_NODE_TYPES.MemberExpression &&
            test.left.object === node &&
            test.left.property.type === TSESTree.AST_NODE_TYPES.Identifier &&
            test.left.property.name === propertyName
          ) {
            console.log('Found property check in condition');
            return true;
          }
        }

        current = current.parent;
      }
      
      console.log('Property not accessed');
      return false;
    }

    /**
     * Checks if a variable is used in a way that accesses the property.
     */
    function isVariablePropertyAccessed(variable: any, propertyName: string): boolean {
      console.log('Checking if variable property is accessed:', propertyName);
      console.log('Variable references:', variable.references.length);
      
      const references = variable.references;
      for (const reference of references) {
        const node = reference.identifier;
        console.log('Checking reference:', node.name);
        if (isPropertyAccessed(node, propertyName)) {
          console.log('Property accessed in variable reference');
          return true;
        }
      }
      
      console.log('Property not accessed in any variable reference');
      return false;
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        console.log('Checking CallExpression:', node.callee.type);
        
        // Skip if the call is not in an expression statement (i.e., it's used somewhere)
        if (node.parent.type !== TSESTree.AST_NODE_TYPES.ExpressionStatement) {
          console.log('Call is not in an expression statement, skipping');
          return;
        }

        // Get the TypeScript node
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        
        // Get the return type of the function
        const type = checker.getTypeAtLocation(tsNode);
        console.log('Call expression return type:', type.getSymbol()?.getName());
        
        // Check if it's a CheckedResult type
        const { isCheckedResult, propertyName } = findCheckedResultType(type);
        console.log('Is CheckedResult:', isCheckedResult, 'Property name:', propertyName);
        
        if (isCheckedResult && propertyName) {
          // Check if the property is accessed
          if (!isPropertyAccessed(node, propertyName)) {
            console.log('Reporting error: property not accessed');
            context.report({
              node,
              messageId: 'noFloatingResult',
            });
          }
        }
      },

      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        console.log('Checking VariableDeclarator:', node.id.type);
        
        if (!node.init) {
          console.log('No initializer, skipping');
          return;
        }

        if (node.init.type !== TSESTree.AST_NODE_TYPES.CallExpression) {
          console.log('Initializer is not a call expression, skipping');
          return;
        }

        // Get the TypeScript node
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.init);
        
        // Get the type of the expression
        const type = checker.getTypeAtLocation(tsNode);
        console.log('Variable initializer type:', type.getSymbol()?.getName());
        
        // Check if it's a CheckedResult type
        const { isCheckedResult, propertyName } = findCheckedResultType(type);
        console.log('Is CheckedResult:', isCheckedResult, 'Property name:', propertyName);
        
        if (isCheckedResult && propertyName) {
          // Get the variable
          const variable = context.getScope().variables.find(
            (v: any) => v.name === (node.id as TSESTree.Identifier).name
          );
          
          if (variable) {
            console.log('Found variable:', variable.name);
            // Check if the property is accessed on any reference to the variable
            if (!isVariablePropertyAccessed(variable, propertyName)) {
              console.log('Reporting error: property not accessed on variable');
              context.report({
                node,
                messageId: 'noFloatingResult',
              });
            }
          }
        }
      },
    };
  },
});

export default noFloatingResult;
