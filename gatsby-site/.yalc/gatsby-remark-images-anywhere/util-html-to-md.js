"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parse5 = require("parse5");
exports.toMdNode = (node) => {
    const value = node.value;
    const parsed = parse5.parseFragment(value);
    const imgNode = parsed.childNodes.find(node => node.tagName === 'img');
    // not an img? don't touch it
    if (!imgNode)
        return null;
    const attrs = imgNode.attrs.reduce((acc, cur) => {
        const { name, value } = cur;
        acc[name] = value;
        return acc;
    }, {});
    // no src? don't touch it
    if (!attrs.src)
        return null;
    // store origin info & mutate node
    const original = Object.assign({}, node);
    node.type = 'image';
    node.value = '';
    node.url = attrs.src;
    node.title = attrs.title;
    node.alt = attrs.alt;
    node.data = {};
    node.data.original = original;
    return node;
};
