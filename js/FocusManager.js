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

FocusManager = $class(Object, {
    currentFocus: null,

    onClick: function(node) {
        if (this.currentFocus) this.currentFocus.className = "";
        this.currentFocus = node;
        node.className = "focus";

        fbcloud.MessageControl.view.updateMessageView(node.getAttribute("thread-id"));
    }
});

FocusManager.eventListener = function(node, ctrl) {
    return function() {
        ctrl.onClick(node);
    }
}

var focusManager = new FocusManager();
