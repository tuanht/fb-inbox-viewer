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

MessageController = $class(BaseController, {
    id: null,
    name: "",

    init: function(id, name) {
        this.parent();
        this.id = id;
        this.name = name;
    },

    getView: function() {
        return new MessageView();
    },

    createModel: function(res) {
        this.model = new Array();

        res.data.forEach(function(element, index, array) {
            this.model.push({
                threadId: element.id,
                to: element.to.data,
                paging: element.comments.paging,
                comments: new Array()
            });

            element.comments.data.forEach(function(e, i, a) {
                this.model[index].comments.push(cloneJSON(e));
            }, this);

            // Get avatar image link from API
            this.model[index].to.forEach(function(e, i, a) {
                if (e.id == this.id) {
                    //Current user
                    return;
                }

                FB.api('/' + e.id + '?fields=picture', this.profilePictureCallback(index, i));
            }, this);
        }, this);
    },

    getNext: function(url, modelIndex) {
        var self = this;
        $.get(url, function(response, textStatus, jqXHR) {
            if (textStatus == "success") {
                if (response.data.length == 0) {
                    // Get all complete
                    self.view.updateProgress(self.model[modelIndex].comments.length, true);
                    return;
                }

                var tempModel = new Array();

                response.data.forEachEnd(function(e, i, a) {
                    var c = cloneJSON(e);

                    this.model[modelIndex].comments.unshift(c);
                    tempModel.unshift(c);
                }, self);

                self.model[modelIndex].paging.next = new String(response.paging.next).toString();
                self.view.insertMessageView(tempModel, modelIndex);

                //Get more
                // setTimeout(function() {
                //     self.getNext(self.model[modelIndex].paging.next, modelIndex);
                // }, 1100);
            }
        });
    },

    profilePictureCallback: function(modelIndex, toIndex) {
        var self = this;
        return function(response) {
            self.model[modelIndex].to[toIndex].pictureUrl = response.picture.data.url;
            self.model[modelIndex].to[toIndex].pictureIsSilhouette = response.picture.data.is_silhouette;
        };
    },

    isAllProfilePictureUpdateComplete: function() {
        return this.model.every(function(element, index, array) {
            var res = element.to.every(function(e, i, a) {
                if (e.id != this.id && !e.pictureUrl) {
                    // Break
                    return false;
                }
                return true;
            }, this);

            return res;
        }, this);
    },

    getThreadIndex: function(threadId) {
        var i = -1;

        this.model.every(function(element, index, array) {
            if (threadId == element.threadId) {
                i = index;
                return false;
            }
            return true
        });

        return i;
    }
});

MessageView = $class(BaseView, {

    updateView: function(mainNodeId) {
        var mainNode = $id(mainNodeId);
        mainNode.innerHTML = "";
        var ul = $createElement("ul");
        var li = null;

        this.ctrl.model.forEach(function(element, index, array) {
            li = $createElement("li");

            var div = $createElement("div");
            div.className = "thread-name";
            $setText(div, this.getToLabel(element.to));

            li.appendChild(div);

            li.setAttribute("thread-id", element.threadId);
            li.setAttribute("to-id", this.getToId(element.to));
            li.addEventListener("click", FocusManager.eventListener(li, fbcloud.FocusControl));

            ul.appendChild(li);
        }, this);

        mainNode.appendChild(ul);
    },

    updateProfilePictureView: function() {
        if (!this.ctrl.isAllProfilePictureUpdateComplete()) {
            // Waiting for get profile picture complete
            var self = this;
            setTimeout(function() {
                self.updateProfilePictureView();
            }, 1000);
            return;
        }

        var ul = $id("user-list").children[0];
        if (ul) {
            for (var i = 0; i < ul.children.length; i++) {
                var li = ul.children[i];

                var toId = li.getAttribute("to-id").split(",");
                var thread = this.ctrl.model[
                    this.ctrl.getThreadIndex(li.getAttribute("thread-id"))];

                if (toId.length == 1) {
                    // single chat
                    li.insertBefore(
                        this.getSingleProfilePictureImgTag(thread.to),
                        li.children[0]);
                } else {
                    // group chat
                    li.insertBefore(
                        this.getMultiProfilePictureDivTag(thread.to),
                        li.children[0]);
                }
            }
        }
    },

    getSingleProfilePictureImgTag: function(to) {
        var img = null;

        to.every(function(e, i, a) {
            if (e.id != this.ctrl.id) {
                img = $createElement("img");
                img.src = e.pictureUrl;
                img.className = "large";
                return false;
            }
            return true;
        }, this);

        if (!img) {
            // default profile picture
        }

        return img;
    },

    getMultiProfilePictureDivTag: function(to) {
        var div = $createElement("div");
        div.className = "pgrouper";

        to.every(function(e, i, a) {
            if (e.id != this.ctrl.id) {
                var img = $createElement("img");
                img.src = e.pictureUrl;
                img.className = "small";
                div.appendChild(img);
            }

            if (div.children.length >= 4) return false;

            return true;
        }, this);

        return div;
    },

    getToLabel: function(to) {
        var str = "";
        var count = 0, maxCount = 2;

        to.every(function(element, index, array) {
            if (element.id != this.ctrl.id) {
                if (++count <= maxCount) {
                    str += element.name + ", ";
                } else {
                    str = str.substr(0, str.length - maxCount) +" and " +
                        (to.length - 1 - maxCount) + " other peoples";
                    return false; // Break the loop
                }
            }
            return true;
        }, this);

        if (count <= maxCount) return str.substr(0, str.length - maxCount);
        return str;
    },

    getToId: function(to) {
        var str = "";

        to.forEach(function(element, index, array) {
            if (element.id != this.ctrl.id) {
                str += element.id + ",";
            }
        }, this);

        return str.substr(0, str.length - 1);
    },

    updateMessageView: function(threadId) {
        var index = this.ctrl.getThreadIndex(threadId);

        if (index == -1) return;

        var thread = this.ctrl.model[index];

        var msgNode = $id("message-list");
        msgNode.innerHTML = "";

        thread.comments.forEach(function(e, i, a) {
            if (e.from.name == "") {
                // User has left conversation
                return;
            }

            msgNode.appendChild(this.createMessageLine(e.from.name, e.message));
        }, this);

        this.ctrl.getNext(thread.paging.next, index);
    },

    insertMessageView: function(comments, modelIndex) {
        var self = this;
        var msgNode = $id("message-list");
        var firstNode = msgNode.children[0];

        comments.forEachEnd(function(element, index, array) {
            firstNode = msgNode.insertBefore(
                this.createMessageLine(element.from.name, element.message),
                firstNode);
        }, this);

        this.updateProgress(this.ctrl.model[modelIndex].comments.length, false);
    },

    updateProgress: function(num, isComplete) {
        var node = $id("progress");
        node.className = "";

        if (isComplete) {
            node.innerHTML = "Download " + num + " completed";
        } else {
            node.innerHTML = "Downloaded " + num + "...";
        }
    },

    createMessageLine: function(name, body) {
        var p = $createElement("p");

        var strong = $createElement("strong");
        strong.appendChild(document.createTextNode(name + ": "));
        p.appendChild(strong);

        var span = $createElement("span");
        span.innerHTML = body ? body.replace(/(\r\n|\n|\r)/gm, "<br>") : "";
        p.appendChild(span);

        return p;
    }
});
