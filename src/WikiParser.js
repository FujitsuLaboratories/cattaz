import React from 'react';
import Link from 'react-router-dom/Link';

import remark from 'remark';
import toHast from 'mdast-util-to-hast';
import toH from 'hast-to-hyperscript';

import clone from 'lodash/clone';
import repeat from 'lodash/repeat';

import Apps from './apps';
import AppContainer from './AppContainer';

const internalLink = /^[./]/;

export default class WikiParser {
  /**
   * Checks if position is inside region.
   * @param {!object} position line number and column number of the position. Both of them start from 1.
   * @param {!object} region position property of Unist.
   * @return {boolean} true if position is inside region.
   */
  static isInside(position, region) {
    if (position.line < region.start.line || region.end.line < position.line) return false;
    if (position.line === region.start.line && position.column < region.start.column) return false;
    if (position.line === region.end.line && position.column > region.end.column) return false;
    return true;
  }
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
    const cloned = clone(hast);
    cloned.children = hast.children.map(c => WikiParser.convertToCustomHast(c));
    cloned.properties = (cloned.properties && clone(cloned.properties)) || {};
    // Original Hast posirion will be lost in hyperscript.
    cloned.properties.position = JSON.stringify(hast.position);
    return cloned;
  }
  /**
   * Render custom Hast
   * @param {object} customHast
   * @param {object} ctx
   * @returns {React.Node}
   */
  static renderCustomHast(customHast, ctx = {}) {
    function h(name, properties, children) {
      if (name.indexOf('app:') === 0) {
        const appName = name.substring(4);
        const appComponent = Apps[appName];
        const position = JSON.parse(properties.position);
        let active = false;
        if (ctx.cursorPosition && WikiParser.isInside(ctx.cursorPosition, position)) {
          active = true;
        }
        if (appComponent) {
          const app = React.createElement(appComponent, {
            data: children[0],
            onEdit: ctx.onEdit,
            appContext: {
              language: appName,
              position,
            },
          });
          return React.createElement(AppContainer, { active }, app);
        }
        throw new Error('unknown app');
      }
      if (name === 'a' && internalLink.test(properties.href)) {
        const propsForLink = clone(properties);
        propsForLink.to = propsForLink.href;
        propsForLink.className = propsForLink.className ? `${propsForLink.className} md` : 'md';
        delete propsForLink.href;
        delete propsForLink.position;
        return React.createElement(Link, propsForLink, children);
      }
      const propsForElem = clone(properties);
      if (propsForElem) {
        propsForElem.className = propsForElem.className ? `${propsForElem.className} md` : 'md';
        const deeperMatch = children && children.find && children.find((c) => {
          if (!c.props) return false;
          if (!c.props.className) return false;
          return c.props.className.indexOf('active-') >= 0;
        });
        if (deeperMatch) {
          propsForElem.className += ' active-outer'; // must have 'md' class
        } else if (propsForElem.position) {
          const position = JSON.parse(properties.position);
          if (ctx.cursorPosition && WikiParser.isInside(ctx.cursorPosition, position)) {
            propsForElem.className += ' active-inner'; // must have 'md' class
          }
        }
        delete propsForElem.position;
      }
      return React.createElement(name, propsForElem, children);
    }

    let rootNode = customHast;
    if (rootNode.type === 'root') {
      rootNode = clone(rootNode);
      rootNode.type = 'element';
      rootNode.tagName = 'div';
    }
    return toH(h, rootNode);
  }
  /**
   * @param {!string} appText
   * @returns {string}
   */
  static removeLastNewLine(appText) {
    if (appText.length === 0) return appText;
    if (appText[appText.length - 1] !== '\n') return appText;
    return appText.substring(0, appText.length - 1);
  }
  /**
   * @param {!object} originalAppLocation The location (https://github.com/wooorm/unist#location) of fenced code block
   * @param {!string} appText
   * @returns {string}
   */
  static indentAppCode(originalAppLocation, appText) {
    if (originalAppLocation.start.column <= 1) return appText;
    const indent = repeat(' ', originalAppLocation.start.column - 1);
    return appText.split('\n').map(l => `${indent}${l}`).join('\n');
  }
  /**
   * @param {!string} startFencingStr
   * @param {!string} appText
   * @returns {string[]} Pair of extra fencing chars and original fencing chars
   */
  static getExtraFencingChars(startFencingStr, appText) {
    const originalFencing = startFencingStr.match(/[`~]{3,}/)[0];
    const fencingChar = originalFencing[0];
    const symbolCounter = new RegExp(`^\x20*(${fencingChar}{${originalFencing.length},})`);
    const maxSymbols = Math.max(...appText.split('\n').map((l) => {
      const match = l.match(symbolCounter);
      if (match) return match[1].length;
      return 0;
    }));
    const diffFencingLen = Math.max((maxSymbols - originalFencing.length) + 1, 0);
    return [repeat(fencingChar, diffFencingLen), originalFencing];
  }
  /**
   * @param {!string} originalText
   * @param {!object} originalAppLocation The location (https://github.com/wooorm/unist#location) of fenced code block
   * @param {!string} appLanguage
   * @param {!string} newAppText
   * @returns {string}
   */
  static replaceAppCode(originalText, originalAppLocation, appLanguage, newAppText) {
    const textBefore = originalText.substring(0, originalAppLocation.start.offset);
    const textAfter = originalText.substring(originalAppLocation.end.offset);
    const fencedText = originalText.substring(originalAppLocation.start.offset, originalAppLocation.end.offset);
    const startFencedStr = fencedText.substring(0, fencedText.search(/\r\n|\r|\n/));
    const [backticks, originalBackticks] = WikiParser.getExtraFencingChars(startFencedStr, newAppText);
    const endMarkIndentation = originalAppLocation.start.column - 1;
    const text = `${textBefore}${originalBackticks}${backticks}${appLanguage}
${WikiParser.indentAppCode(originalAppLocation, newAppText)}
${repeat(' ', endMarkIndentation)}${originalBackticks}${backticks}${textAfter}`;
    return text;
  }
}
