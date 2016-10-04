import remark from 'remark';
import toHast from 'mdast-util-to-hast';

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
  static renderCustomHast(customHast) {
    // TODO
    return {};
  }
}
