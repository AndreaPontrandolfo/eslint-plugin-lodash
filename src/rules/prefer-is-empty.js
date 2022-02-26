/**
 * @fileoverview Rule to prefer isEmpty over manual checking for length value.
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const getDocsUrl = require('../util/getDocsUrl')

module.exports = {
    meta: {
        type: 'problem',
        schema: [],
        docs: {
            url: getDocsUrl('prefer-is-empty')
        },
        fixable: 'code'
    },

    create(context) {
        const {getLodashContext} = require('../util/lodashUtil')
        const lodashContext = getLodashContext(context)

        function getTextOfNode(node) {
            if (node) {
                if (node.type === 'Identifier') {
                    return node.name
                }
                return context.getSourceCode().getText(node)
            }
        }        

        const visitors = lodashContext.getImportVisitors()
        visitors.BinaryExpression = function (node) {
            if (node.operator === '===') {
                const leftExpressionMember = node.left.property.name 
                const rightExpressionMember = node.right.value
                if (leftExpressionMember === 'length' && rightExpressionMember === 0) {
                    const subjectObject = node.left.object
                    context.report({node, message: 'Prefer isEmpty over manually checking for length value.', fix(fixer) {
                        return fixer.replaceText(node, `isEmpty(${getTextOfNode(subjectObject)})`)
                    }})
                }
            } 
            if (node.operator === '>') {
                const leftExpressionMember = node.left.property.name 
                const rightExpressionMember = node.right.value
                if (leftExpressionMember === 'length' && rightExpressionMember === 0) {
                    const subjectObject = node.left.object
                    context.report({node, message: 'Prefer isEmpty over manually checking for length value.', fix(fixer) {
                        return fixer.replaceText(node, `!isEmpty(${getTextOfNode(subjectObject)})`)
                    }})
                } 
            }            
        }
        return visitors
    }
}
