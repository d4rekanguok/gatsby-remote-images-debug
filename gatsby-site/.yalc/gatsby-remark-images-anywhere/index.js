"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
const path = require("path");
const select = require("unist-util-select");
const util_download_image_1 = require("./util-download-image");
const util_html_to_md_1 = require("./util-html-to-md");
const defaultMarkup = ({ src }) => `<img class="gatsby-remark-images-extra" src="${src}"/>`;
const addImage = async ({ markdownAST: mdast, markdownNode, actions, store, files, getNode, createNodeId, reporter, cache, pathPrefix, }, pluginOptions) => {
    const { plugins, staticDir = 'static', createMarkup = defaultMarkup, sharpMethod = 'fluid' } = pluginOptions, imageOptions = __rest(pluginOptions, ["plugins", "staticDir", "createMarkup", "sharpMethod"]);
    if (['fluid', 'fixed', 'resize'].indexOf(sharpMethod) < 0) {
        reporter.panic(`'sharpMethod' only accepts 'fluid', 'fixed' or 'resize', got ${sharpMethod} instead.`);
    }
    const { touchNode, createNode } = actions;
    // gatsby parent file node of this markdown node
    const dirPath = getNode(markdownNode.parent).dir;
    const { directory } = store.getState().program;
    const imgNodes = select.selectAll('image[url]', mdast);
    const htmlImgNodes = select.selectAll('html', mdast)
        .map(node => util_html_to_md_1.toMdNode(node))
        .filter(node => !!node);
    imgNodes.push(...htmlImgNodes);
    const processPromises = imgNodes.map(async (node) => {
        const url = node.url;
        if (!url)
            return;
        let gImgFileNode;
        if (url.startsWith('http')) {
            // handle remote path
            gImgFileNode = await util_download_image_1.downloadImage({
                id: markdownNode.id,
                url,
                store,
                getNode,
                touchNode,
                cache,
                createNode,
                createNodeId,
                reporter,
            });
        }
        else {
            // handle relative path (./image.png, ../image.png)
            let filePath;
            if (url[0] === '.')
                filePath = path.join(dirPath, url);
            // handle path returned from netlifyCMS & friends (/assets/image.png)
            else
                filePath = path.join(directory, staticDir, url);
            gImgFileNode = files.find(fileNode => (fileNode.absolutePath && fileNode.absolutePath === filePath));
        }
        if (!gImgFileNode)
            return;
        const imageResult = await util_download_image_1.processImage({
            file: gImgFileNode,
            reporter,
            cache,
            pathPrefix,
            sharpMethod,
            imageOptions,
        });
        if (!imageResult)
            return;
        // mutate node
        const data = Object.assign({ title: node.title, alt: node.alt, originSrc: node.url }, imageResult);
        node.type = 'html';
        node.value = createMarkup(data);
        return null;
    });
    return Promise.all(processPromises);
};
module.exports = addImage;
