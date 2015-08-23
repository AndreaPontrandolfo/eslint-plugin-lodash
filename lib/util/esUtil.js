'use strict';
var _ = require('lodash');
var aliasMap = require('../util/aliases');

function isLodashCall(node) {
    return node && node.type === 'CallExpression' && _.get(node, 'callee.object.name') === '_';
}

function getMethodName(node) {
    return _.get(node, 'callee.property.name');
}

function isLodashChainStart(node) {
    return node && node.type === 'CallExpression' && node.callee.name === '_';
}

function isChainable(node) {
    return _.includes(aliasMap.CHAINABLE_ALIASES, getMethodName(node));
}

function getCaller(node) {
    return _.get(node, 'callee.object');
}

function isLodashWrapper(node) {
    if (isLodashChainStart(node)) {
        return true;
    }
    return node && node.type === 'CallExpression' && node.callee.type === 'MemberExpression' && isChainable(node) && isLodashWrapper(node.callee.object);
}

function getLodashIteratee(node) {
    if (isLodashCall(node)) {
        return node.arguments && node.arguments[1];
    } else if (isLodashWrapper(getCaller(node))) {
        return node.arguments && node.arguments[0];
    }
}

function getFirstFunctionLine(node) {
    return node && node.type === 'FunctionExpression' && _.get(node, 'body.body[0]');
}

/**
 * is member access that is not by index or by a variable e.g.
 *  a.b or a['b']
 *  but not:
 *  a[0], a[var], a[exp...]
 * @param node
 * @return {boolean}
 */
function isPropAccess(node) {
    return node &&
        (node.computed === false) ||
        (node.computed === true && node.property.type === 'Literal' && _.isString(node.property.value));
}

function isMemberExpOfArg(node, argName) {
    return node.type === 'MemberExpression' && node.object && node.object.name === argName && isPropAccess(node);
}

function getFirstParamName(func) {
    return _.get(func, 'params[0].name');
}

function isReturnStatement(exp) {
    return exp && exp.type === 'ReturnStatement';
}

module.exports = {
    isLodashCall: isLodashCall,
    getMethodName: getMethodName,
    isLodashChainStart: isLodashChainStart,
    isChainable: isChainable,
    isLodashWrapper: isLodashWrapper,
    getCaller: getCaller,
    isMemberExpOfArg: isMemberExpOfArg,
    getLodashIteratee: getLodashIteratee,
    getFirstFunctionLine: getFirstFunctionLine,
    getFirstParamName: getFirstParamName,
    isReturnStatement: isReturnStatement
};