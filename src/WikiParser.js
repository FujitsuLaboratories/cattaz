import React from 'react';
import remark from 'remark';
import toHast from 'mdast-util-to-hast';
import toH from 'hast-to-hyperscript';

import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';

import Apps from './apps';

export default class WikiParser {
  /**
   * Parse Markdown string to hast
   * @param {!string} markdown
   * @returns {object} Hast object
   */
  static parseToHast(markdown) {
    const mdast = remark().parse(markdown);
    const hast = toHast(mdast);
    return hast;
  }
  /**
   * Convert fenced code block in hast to application
   * @param {!object} hast Hast object
   * @return {object} Hast object
   */
  static convertToCustomHast(hast) {
    if (hast.type === 'text') return hast;
    if (hast.tagName === 'pre') {
      const codeNode = hast.children[0];
      const htmlClasses = codeNode.properties.className;
      const language = (htmlClasses && htmlClasses[0].substring(9 /* length of 'language-' */)) || null;
      if (language in Apps) {
        const codeText = codeNode.children[0].value;
        return {
          type: 'element',
          tagName: `app:${language}`,
          properties: {
            // Original Hast posirion will be lost in hyperscript.
            // It must be a string?
            position: JSON.stringify(hast.position),
          },
          // Hast position
          position: hast.position,
          children: [{
            type: 'text',
            value: codeText,
          }],
        };
      }
    }
    const newChildren = hast.children.map(c => WikiParser.convertToCustomHast(c));
    if (!isEqual(newChildren, hast.children)) {
      const cloned = clone(hast);
      cloned.children = newChildren;
      return cloned;
    }
    return hast;
  }
  /**
   * Render custom Hast
   * @param {object} customHast
   * @param {object} ctx
   * @returns {React.Node}
   */
  static renderCustomHast(customHast, ctx = {}) {
    function h(name, props, children) {
      if (name.indexOf('app:') === 0) {
        const appName = name.substring(4);
        const appComponent = Apps[appName];
        if (appComponent) {
          return React.createElement(appComponent, {
            data: children[0],
            onEdit: ctx.onEdit,
            // It is not actually react props
            // eslint-disable-next-line react/prop-types
            position: JSON.parse(props.position),
          });
        }
        throw new Error('unknown app');
      }
      return React.createElement(name, props, children);
    }

    let rootNode = customHast;
    if (rootNode.type === 'root') {
      rootNode = clone(rootNode);
      rootNode.type = 'element';
      rootNode.tagName = 'div';
    }
    return toH(h, rootNode);
  }
}
