/*
 * FB Inbox Viewer - Web application allow fetch and display all Facebook inbox messages
 * Copyright (C) 2014  Tuan Ha
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

Array.prototype.forEachEnd = function(fun /*, thisArg */) {
    "use strict";

    if (this === void 0 || this === null) throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function") throw new TypeError();

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = len - 1; i >= 0; i--) {
        if (i in t) fun.call(thisArg, t[i], i, t);
    }
};

function cloneJSON(j) {
    return JSON.parse(JSON.stringify(j));
}

function $id(id) {
    return document.getElementById(id);
}

function $createElement(tagName) {
    return document.createElement(tagName);
}

function $setText(node, text) {
    if(text != null) {
        node.textContent = text;
    }
}

function $setSafeHTMLText(node, text) {
    if(text != null) {
        node.innerHTML = text;
    }
}
