/**
 * @fileoverview no unselected prisma query
 * @author Instituto J&F
 */
'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow unselected Prisma queries',
      category: 'Possible Errors',
    },
    fixable: null, // or "code" or "whitespace"
  },

  create: function (context) {
    return {
      CallExpression(node) {
        if (
          [
            'findFirst',
            'findFirstOrThrow',
            'findMany',
            'findUnique',
            'findUniqueOrThrow',
            'create',
            'update',
            'upsert',
            'delete',
          ].includes(node?.callee?.property?.name) &&
          node?.callee?.type === 'MemberExpression' &&
          (node?.callee?.object?.object?.property?.name == 'prismaService' ||  
          node?.callee?.object?.object?.property?.name == 'uow') 
          &&
          !node.arguments.some(
            (arg) =>
              arg.type === 'ObjectExpression' &&
              (arg.properties.some((prop) => prop.key?.name === 'select') ||
                arg.properties.some((prop) => prop.key?.name === 'include')),
          )
        ) {
          context.report({
            node,
            message: 'Prisma query without select or include clause',
          });
        }
      },
    };
  },
};
