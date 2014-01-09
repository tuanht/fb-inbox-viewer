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

//     // FB.Event.subscribe('auth.authResponseChange', function(response) {
//     //     if (response.status === 'connected') {
//     //         callbackLogged();
//     //     } else if (response.status === 'not_authorized') {
//     //         callbackLogin();
//     //     } else {
//     //         callbackLogin();
//     //     }
//     // });
// };

FacebookController = $class(BaseController, {
    LOGIN_STATUS_CONNECTED: "connected",
    LOGIN_STATUS_NOT_AUTHORIZED: "not_authorized",

    init: function() {
        this.parent();
        var self = this;
        FB.getLoginStatus(function(response) {
            if (response.status === self.LOGIN_STATUS_CONNECTED) {
                self.logged(response);
                //var uid = response.authResponse.userID;
                //var accessToken = response.authResponse.accessToken;
            } else if (response.status ===  self.LOGIN_STATUS_NOT_AUTHORIZED) {
                self.loginRequire();
            } else {
                self.loginRequire();
            }
        });
    },

    getView: function() {
        return new FacebookView();
    },

    logged: function(response) {
        var self = this;

        console.log('Welcome!  Fetching your information.... ');

        FB.api('/me', function(response) {
            console.log('Good to see you, ' + response.name + '.');
            
            self.view.updateLogoutButton(response.name);

            fbcloud.MessageControl = new MessageController(response.id, response.name);
            FB.api('/me/inbox', function(response) {
                fbcloud.MessageControl.createModel(response);
                fbcloud.MessageControl.view.updateView("user-list");
                fbcloud.MessageControl.view.updateProfilePictureView();
            });
        });
    },

    loginRequire: function() {
        this.view.updateLoginButton();
    },

    doLogin: function() {
        FB.login(null, {
            scope: 'email,,read_stream,publish_stream,read_mailbox'
        });
    }
});

FacebookView = $class(BaseView, {

    updateLogoutButton: function(fbName) {
        var node = $id("login");
        node.appendChild(document.createTextNode("Logged as " + fbName + " "));

        var a = $createElement("a");
        a.setAttribute("href", "#");
        a.appendChild(document.createTextNode("Logout"));
        a.addEventListener("click", function() {
            FB.logout();
        });

        node.appendChild(a);
    },

    updateLoginButton: function() {
        var self = this;

        var node = $id("login");

        var a = $createElement("a");
        a.setAttribute("href", "#");
        a.appendChild(document.createTextNode("Login"));
        a.addEventListener("click", function() {
            self.ctrl.doLogin();
        });

        node.appendChild(a);
    }
});


// function callbackFeed(res) {
//     var node = "", data = null;
//     for (var i = 0; i < res.data.length; i++) {
//         data = res.data[i];

//         node += "<article>";
//         node += data.created_time + "<br>";
        
//         if (data.message) node += data.message.replace(/(\r\n|\n|\r)/gm, "<br>");
//         else if (data.story) node += data.story.replace(/(\r\n|\n|\r)/gm, "<br>");

//         if (data.type == "link") node += '<br><a href="' + data.link + '">Link</a>';

//         node += "</article>";
//     }
//     document.getElementById("content").innerHTML = node;
// }

function buttonAPI() {
    // FB.api('/me/feed', { limit: 20 }, function(response) {
    //   callbackFeed(response);
    // });

    // var body = 'Hello from Facebook Javascript SDK';
    // FB.api('/me/feed', 'post', { message: body }, function(response) {
    //     if (!response || response.error) {
    //         alert('Error occured');
    //     } else {
    //         alert('Post ID: ' + response.id);
    //     }
    // });

    FB.api('/me/inbox', function(response) {
        msg.createModel(response);
        msg.view.updateView("user-list");
    });

    // FB.ui({
    //     method: 'feed',
    //     name: 'Facebook Dialogs',
    //     link: 'https://developers.facebook.com/docs/dialogs/',
    //     picture: 'http://fbrell.com/f8.jpg',
    //     caption: 'Reference Documentation',
    //     description: 'Dialogs provide a simple, consistent interface for applications to interface with users.'
    // }, function(response) {
    //     if (response && response.post_id) {
    //         alert('Post was published.');
    //     } else {
    //         alert('Post was not published.');
    //     }
    // });
}
