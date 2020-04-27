var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},_extends=Object.assign||function(t){for(var i=1;i<arguments.length;i++){var e=arguments[i];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n])}return t},PNotifyDesktop=function(i){"use strict";i=i&&i.__esModule?i.default:i;var A=void 0,s=window.Notification,a=function(t,i,e,n){return(a="Notification"in window?function(t,i,e,n){var o=new s(t,i);return"NotificationEvent"in window?(o.addEventListener("notificationclick",e),o.addEventListener("close",n)):"addEventListener"in o?(o.addEventListener("click",e),o.addEventListener("close",n)):(o.onclick=e,o.onclose=n),o}:"mozNotification"in navigator?function(t,i,e,n){var o=navigator.mozNotification.createNotification(t,i.body,i.icon).show();return o.onclick=e,o.onclose=n,o}:"webkitNotifications"in window?function(t,i,e,n){var o=window.webkitNotifications.createNotification(i.icon,t,i.body);return o.onclick=e,o.onclose=n,o}:function(t,i,e,n){return null})(t,i,e,n)};var e,t={initModule:function(t){var o=this;this.set(t);var s=this.get()._notice;this.set({_oldAnimation:s.get().animation}),s.on("state",function(t){var i=t.changed,e=t.current,n=t.previous;i.animation&&(void 0===n.animation||"none"!==e.animation||"none"===n.animation&&e.animation!==o.get()._oldAnimation)&&o.set({_oldAnimation:e.animation}),i._animatingClass&&(""===e._animatingClass||0!==A&&o.get().fallback||!o.get().desktop||s.set({_animatingClass:""}))}),this.get().desktop&&(0===(A=i.modules.Desktop.checkPermission())?(s.set({animation:"none"}),s.addModuleClass("ui-pnotify-desktop-hide"),this.genNotice()):this.get().fallback||s.set({autoDisplay:!1}))},update:function(){var t=this.get()._notice;if(0!==A&&this.get().fallback||!this.get().desktop)return t.set({animation:this.get()._oldAnimation}),void t.removeModuleClass("ui-pnotify-desktop-hide");t.set({animation:"none"}),t.addModuleClass("ui-pnotify-desktop-hide"),this.genNotice()},beforeOpen:function(){if(this.get().desktop&&0!==A&&i.modules.Desktop.permission(),(0===A||!this.get().fallback)&&this.get().desktop){var t=this.get()._desktop;t&&"show"in t&&(this.get()._notice.set({_moduleIsNoticeOpen:!0}),t.show())}},beforeClose:function(){if((0===A||!this.get().fallback)&&this.get().desktop){var t=this.get()._desktop;t&&"close"in t&&(t.close(),this.get()._notice.set({_moduleIsNoticeOpen:!1}))}},genNotice:function(){var t=this.get(),i=t._notice,e=t.icon;if(null===e)switch(i.get().type){case"error":this.set({_icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gQJATQg7e6HvQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABr0lEQVRYw8WXu0oDQRSGv7hRSFYrLTTWKihaqUgUJO+gphBLL1jYpPSCVcAggpWthYhC7Ows9An0IbSPkMRCw8ZmFuI6yczs9cAPuzNz5v92brtrESxGARtokkCcAg2hk7jNl4G2R/m4zFPAiwTgWdRFHnmJuaulOAAaPQDqUZvv9DB3tR0lwIcGwHtU5uca5q4qYZvngJbHpAZ8CtU8dS1gLEyAisegBGTFKWiL65KnzVlY5uOSId6VtNuTtMupOu/TAHiQlNmSskHNXCOAGWBeUp7VhFoApoMAXAOWJoCszBJ9+ALY6vL0JiPgjsKmKUAaOOoBZwIAcNxlJLsCrAOTIQJMAWu62y4LOIqT7lGS96TIcYCMDkBZ46h1gB+PHI28ssq8X/G6DaqG8Piz2DrjVjGXbtSBy46F5QAHwJAizwZugKKscs7gSaqS/KpB/qxsFxwafhf6Odb/eblJi8BGwJdW26BtURxQpMU83hmaDQsNiPtvYMSwj3tgAqDgYzU7wJdHjo9+CgBvEW47lV5Tgj5DMtG0xIfESkIAF+522gdWxTzGEX3i9+6KpOMXF5UBt0NKJCAAAAAASUVORK5CYII="});break;case"success":this.set({_icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gQJATQPRj+65AAAAdBJREFUWMPtlzsvRFEQx3+7HmEjoiYKolVJJDRqnS8ggvVIVEQhCIUsEYJGCEH2E4h4FPREaLTbEo1IEJXHrmY2GTf33nPuY7ud5OTenTMz//89Z86ZWShLWf5LB3AOfACFiOMF2AkC3qOc88BXxFEAxlX8ftGdaNCEen8H6oFHYBR4FocwkpTngzzHgF01fwL0aYcp9fVtMW/rsMcWXWijK1Hexgye9smRT6CxaHgjytMYwccNSXqoja9FeVbiZS+OVaeDiUBLAPAJA/i2m5MXgRSQk7llC/DBMOBeBGqAe0eAjQhfvurH3EmgQk6EW6CVEHt+ZFo6J4EU8OoTcF35jhnAl2wSx20LFgyB1yyOWtY2c72ScMAAkPeZy6g4zUBdGAIAcyEq4Z7y7xbdTFgCACMBwPVJqVDHeNqvaplkH5i0sNuUwmaNkQxww20ZSOy7gFvX7SAk0i76jPQQlJoAwAEwq35ngfmwVatSdUMArZZ+K9JQ1Bp6iGqgSt7f/AIOqSzujLEn6AV+JG6zm4HuCZ+AJuAbWAQu5aIJu7JDck0ngDugC/j1c2qPqR13jpxuvWyS8liY/kQcean/lX6ACQ99DdAQYe+Lf0zylMUgf7qDKgzv284QAAAAAElFTkSuQmCC"});break;case"info":this.set({_icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gQJATQ09zRTwAAAAdxJREFUWMPtl88rRFEUxz8zBolRCgsrpOym8TMSO2WplLKwUrKi/B0W7JSFmhVLNlhSlLKx8CtRGpEsJpofpZk3Nkc9b968e++8mdlw6vTeu/edc773nl/3wl+ngOH/zUAf0AN0AmEgB7wCD8AtcFMJoM3ADpAHLHk62RIwL8B0uQwHgXVRnDfkS2DSj/EW4K0Ew05eLMV4O/CuUJwEUvJUgdgwMd4IpBUKl13kVG6aL+ZjJ20DDQqQXy5jKYVMDBhVrb5f069LLrKfGnInqh040HRTvsTAHgei9oGQ7X0YaNNUNCdFKChgQvKtQ1vAkNvEahlSToez9oXad2BCA30ceHZxRxMQMShuvZLmv+hOA32/h+KUwS7MugVhqwb6Go+5nEEwht0ABDUEzyXdFsrQYwqMJjTbdxio9Qkg6QbgvkpnkLw0uQIAZ1UCYNkXawdw4qPCmVBcuADAMZCpAoCVYr3AKtYyHZSWauakjMx50TWwrzJw6lFARjQOt3se8jM6W9TloSCqIb9bRHbN5Fg+KkEZcow/Ak+KFBsD6h3jR8CUabAMlqn7xfxEbAdwWKLhhO3sGPCbOsNSvSyF0Z/5TaCuEleziLhmAOiWG1NWrmZXwIVU1A/+SZO+AcgLC4wt0zD3AAAAAElFTkSuQmCC"});break;case"notice":default:this.set({_icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gQJATM4scOJLAAAAcxJREFUWMPtljtLA0EQx3+J0QRfnYqCiCA+MERBrIwgFtoFbMTOR61i5QcQBdEihZWNoEWwsNAvkMJeBLHRQtHC0iIP4utOmw2cx97d7l2SRgcGbufmv/Pf2dmdhb8uIR+YJqAPaBff30AeeAHuxLgqMgRkgS/AAEybGuLfEdBcycCTwKVYmY5mgO6gwdd8BLaqAST9Bs8EDG7VTd3gex4TbgEjwKjQOHDugZlRDb7sMZEJpCS4bYVMJOygsG1cB+wqHN0Gib1RYXFpLwL74nx7Sb3EFlXATQNjTgRagA3FbZIRiCliT5wITGgUaRACA0CPjMC4xtUcDUAgDAzLCCQ0MhALQCAE9MoIdGkQCJIBgE4ZgWiNMvDL10qgUMMMFGQEnjQmkLXbVg38s8y4qtFcTCAnHiJ5oKiJnSoHjVgIXAmHkGIl5yy+YcWruIy9dvqpupIDCfZWEXvh1gsWFVfxIbG9a3RbRwJnYiuqJYfAqxsBgBWFiQyJzfTAlIB1uzEicbwBFoBTl8lSwINoSuXKjrv4F4FBh61zlKUKvgn7/e5ZEngMEDgLdFSieHaAT42LpgTMVbqC24B54Bi4twV9E6cnDcw6PFj+RSo/l6rlSlldhx4AAAAASUVORK5CYII="})}else!1===e?this.set({_icon:null}):this.set({_icon:e});var n=this.get().tag;this.get()._tag&&null===n||this.set({_tag:null===n?"PNotify-"+Math.round(1e6*Math.random()):n});var o={body:this.get().text||i.get().text,tag:this.get()._tag};i.get().hide||(o.requireInteraction=!0),null!==this.get()._icon&&(o.icon=this.get()._icon),Object.apply(o,this.get().options);var s=a(this.get().title||i.get().title,o,function(){i.fire("click",{target:s})},function(){i.close()});i.set({_moduleIsNoticeOpen:!0}),this.set({_desktop:s}),!("close"in s)&&"cancel"in s&&(s.close=function(){s.cancel()})}};function n(){var t=function(t){return document.createElement(t)}("style");t.id="svelte-xbgnx4-style",t.textContent="[ui-pnotify].ui-pnotify-desktop-hide.ui-pnotify{left:-10000px !important;display:none !important}",function(t,i){t.appendChild(i)}(document.head,t)}function o(t){!function(t,i){t._handlers=l(),t._slots=l(),t._bind=i._bind,t._staged={},t.options=i,t.root=i.root||t,t.store=i.store||t.root.store,i.root||(t._beforecreate=[],t._oncreate=[],t._aftercreate=[])}(this,t),this._state=r(_extends({_notice:null,_options:{}},i.modules.Desktop.defaults),t.data),this._intro=!0,document.getElementById("svelte-xbgnx4-style")||n(),this._fragment=(this._state,{c:c,m:c,p:c,d:c}),t.target&&(this._fragment.c(),this._mount(t.target,t.anchor))}function c(){}function r(t,i){for(var e in i)t[e]=i[e];return t}function l(){return Object.create(null)}function g(t){for(;t&&t.length;)t.shift()()}return r(o.prototype,{destroy:function(t){this.destroy=c,this.fire("destroy"),this.set=c,this._fragment.d(!1!==t),this._fragment=null,this._state={}},get:function(){return this._state},fire:function(t,i){var e=t in this._handlers&&this._handlers[t].slice();if(!e)return;for(var n=0;n<e.length;n+=1){var o=e[n];if(!o.__calling)try{o.__calling=!0,o.call(this,i)}finally{o.__calling=!1}}},on:function(t,i){var e=this._handlers[t]||(this._handlers[t]=[]);return e.push(i),{cancel:function(){var t=e.indexOf(i);~t&&e.splice(t,1)}}},set:function(t){if(this._set(r({},t)),this.root._lock)return;!function(t){t._lock=!0,g(t._beforecreate),g(t._oncreate),g(t._aftercreate),t._lock=!1}(this.root)},_set:function(t){var i=this._state,e={},n=!1;for(var o in t=r(this._staged,t),this._staged={},t)this._differs(t[o],i[o])&&(e[o]=n=!0);if(!n)return;this._state=r(r({},i),t),this._recompute(e,this._state),this._bind&&this._bind(e,this._state);this._fragment&&(this.fire("state",{changed:e,current:this._state,previous:i}),this._fragment.p(e,this._state),this.fire("update",{changed:e,current:this._state,previous:i}))},_stage:function(t){r(this._staged,t)},_mount:function(t,i){this._fragment[this._fragment.i?"i":"m"](t,i||null)},_differs:function(t,i){return t!=t?i==i:t!==i||t&&"object"===(void 0===t?"undefined":_typeof(t))||"function"==typeof t}}),r(o.prototype,t),o.prototype._recompute=c,(e=o).key="Desktop",e.defaults={desktop:!1,fallback:!0,icon:null,tag:null,title:null,text:null,options:{}},e.init=function(t){return new e({target:document.body})},e.permission=function(){void 0!==s&&"requestPermission"in s?s.requestPermission():"webkitNotifications"in window&&window.webkitNotifications.requestPermission()},e.checkPermission=function(){return void 0!==s&&"permission"in s?"granted"===s.permission?0:1:"webkitNotifications"in window&&0==window.webkitNotifications.checkPermission()?0:1},A=e.checkPermission(),i.modules.Desktop=e,o}(PNotify);
//# sourceMappingURL=PNotifyDesktop.js.map