/*jslint browser: true, continue: true, eqeq: true, plusplus: true, vars: true, white: true */

var FlattrLoader = (function() {
	"use strict";

var FlattrLoader = {

	instance: false,
	queryString: false,
	validParams: ['mode', 'https', 'uid', 'category', 'button', 'language', 'html5-key-prefix', 'popout'],
	validButtonParams: ['uid', 'owner', 'category', 'button', 'language', 'hidden', 'tags', 'title', 'url', 'description','revsharekey', 'popout'],
	options: {},
	POPOUT_WIDTH: 401,
	POPOUT_HEIGHT: 230,
	TIMEOUT: 1500,

	createIframe: function(data) {

		var compact = (data.button == 'compact')
			, iframe = document.createElement('iframe');

		iframe.setAttribute('src', ( this.getParam('https') == 1 ? 'https' : 'http' ) +'://'+ this.getParam('domain', 'api.flattr.com') + '/button/view/?'+ this.encodeData(data));
		iframe.setAttribute('class', 'FlattrButton');
		iframe.setAttribute('width', (compact == true ? 110 : 55) );
		iframe.setAttribute('height', (compact == true ? 20 : 62) );
		iframe.setAttribute('frameBorder', 0);
		iframe.setAttribute('scrolling', 'no');
		iframe.setAttribute('border', 0);
		iframe.setAttribute('marginHeight', 0);
		iframe.setAttribute('marginWidth', 0);
		iframe.setAttribute('allowTransparency', 'true');
		iframe.data = data;

		if (data.popout != 0) {
			iframe.onmouseover = function() {
				if (this.popoutIframe === undefined) {
					FlattrLoader.removeAllOpenPopoutIframes();
					FlattrLoader.showPopoutForButton(this);

					this.popoutIframe.onmouseover = function() {
						if (this.timeout) {
							clearTimeout(this.timeout);
							this.timeout = undefined;
						}
					};

					this.popoutIframe.onmouseout = function() {
						if (this.parentNode) { // abort when onmouseout is called because the popout was removed
							this.timeout = setTimeout(function() {
								if (iframe.popoutIframe) {
									FlattrLoader.removePopoutForButton(iframe);
								}
							}, FlattrLoader.TIMEOUT);
						}
					};
				}
			};

			iframe.onmouseout = function() {
				if (this.popoutIframe) {
					this.popoutIframe.timeout = setTimeout(function() {
						if (iframe.popoutIframe) {
							FlattrLoader.removePopoutForButton(iframe);
						}
					}, FlattrLoader.TIMEOUT);
				}
			};
		}

		return iframe;
	},

	getAbsolutePositionForElement: function(elem) {
		var offset = {
			x: 0,
			y: 0
		};

		if (elem.offsetParent) {
			do {
				offset.x += elem.offsetLeft;
				offset.y += elem.offsetTop;
				elem = elem.offsetParent;
			} while (elem);
		}

		return offset;
	},

	showPopoutForButton: function(buttonIframe) {
		var dir;
		var yDir = 's';
		var xDir = 'e';

		var windowWidth = window.innerWidth !== undefined ? window.innerWidth : document.documentElement.clientWidth;
		var windowHeight = window.innerHeight !== undefined ? window.innerHeight : document.documentElement.clientHeight;

		var offset = this.getAbsolutePositionForElement(buttonIframe);

		if (offset.x > (windowWidth/2)) {
			xDir = 'w';
		}

		if ((offset.y + Number(buttonIframe.height) + this.POPOUT_HEIGHT) > windowHeight) {
			yDir = 'n';
		}

		dir = yDir + xDir;

		buttonIframe.data.dir = dir;
		buttonIframe.popoutIframe = this.createPopoutIframe(buttonIframe.data);

		if (xDir === 'w') {
			buttonIframe.popoutIframe.style.left = (Number(offset.x) - Number(this.POPOUT_WIDTH) + Number(buttonIframe.width)) + 'px';
		} else if (xDir === 'e') {
			buttonIframe.popoutIframe.style.left = offset.x + 'px';
		}

		if (yDir === 'n') {
			buttonIframe.popoutIframe.style.top = (Number(offset.y) - Number(this.POPOUT_HEIGHT)) + 'px';
		} else if (yDir === 's') {
			buttonIframe.popoutIframe.style.top = (Number(offset.y) + Number(buttonIframe.height)) + 'px';
		}

		document.querySelector('body').appendChild(buttonIframe.popoutIframe);
	},

	createPopoutIframe: function (data) {
		var popout = document.createElement('iframe');

		popout.setAttribute('src', ( this.getParam('https') == 1 ? 'https' : 'http' ) + '://'+ this.getParam('domain', 'api.flattr.com') + '/button/popout/?'+ this.encodeData(data));
		popout.setAttribute('frameBorder', 0);
		popout.setAttribute('allowTransparency', 'true');
		popout.setAttribute('style', 'position: absolute; display:block; z-index: 9999;');
		popout.setAttribute('width', this.POPOUT_WIDTH);
		popout.setAttribute('height', this.POPOUT_HEIGHT);

		return popout;
	},

	removePopoutForButton: function(buttonIframe) {
		if (buttonIframe.popoutIframe.timeout) {
			clearTimeout(buttonIframe.popoutIframe.timeout);
		}
		buttonIframe.popoutIframe.parentNode.removeChild(buttonIframe.popoutIframe);
		buttonIframe.popoutIframe = undefined;
	},

	removeAllOpenPopoutIframes: function() {
		var iframes = document.querySelectorAll('iframe.FlattrButton');
		var i;
		var iframe;
		for (i = 0; i < iframes.length; i += 1) {
			iframe = iframes[i];
			if (iframe.popoutIframe) {
				this.removePopoutForButton(iframe);
			}
		}
	},

	reshowAllOpenPopoutIframes: function() {
		var iframes = document.querySelectorAll('iframe.FlattrButton');
		var i;
		var iframe;
		for (i = 0; i < iframes.length; i += 1) {
			iframe = iframes[i];
			if (iframe.popoutIframe) {
				this.removePopoutForButton(iframe);
				this.showPopoutForButton(iframe);
			}
		}
	},

	encodeData: function(data) {
		var prop, value, result = '';

		for (prop in data) {
			if (data.hasOwnProperty(prop)) {
				value = data[prop];

				if (prop == 'description') {
					value = this.stripTags(value, '<br>');
					if (value.length > 1000) {
						value = value.substring(0, 1000);
					}
				}

				value = value.replace(/^\s+|\s+$/g, '').replace(/\s{2,}|\t+/g, ' ');
				result += prop + '=' + encodeURIComponent(value) + '&';
			}
		}

		return result;
	},

	getParam: function (key, defaultValue)
	{
		if (typeof this.options[key] !== 'undefined') {
			return this.options[key];
		}
		return defaultValue;
	},

	init: function() {
		var i, instance, src, re, result, pos, qs, params, pair, j, addEventListener, eventName
			, scripts = document.getElementsByTagName("script");

		try
		{
			for (i = (scripts.length - 1); i >= 0; i--) {
				instance = scripts[ i ];

				if (!instance.hasAttribute('src')) {
					continue;
				}

				// Can't use getAttribute() as it doesn't return absolute URL:s and the path could be relative to the current protocol
				src = instance.src;
				re = new RegExp('^(http(?:s?))://(api\\.(?:.*\\.?)flattr\\.(?:com|dev))', 'i');

				result = src.match(re);
				if (result) {

					this.options.domain = result[2].toString();
					this.options.https  = (result[1].toString() == 'https' ? 1 : 0);

					pos = src.indexOf('?');
					if (pos) {
						qs = src.substring(++pos);
						params = qs.split("&");
						for (j = 0; j < params.length; j++) {
							pair = params[j].split("=");
							if (this.validParam(pair[0], this.validParams)) {
								this.options[pair[0]] = pair[1];
							}
						}
					}

					this.instance = instance;
					break;
				}

			}
		}
		catch(e)
		{
			// ge fel
		}

		// Listen to messages and show popups
		if (window.addEventListener !== undefined) {
			addEventListener = window.addEventListener;
			eventName = 'message';
		} else {
			addEventListener = window.attachEvent; // IE < 9
			eventName = 'onmessage';
		}

		addEventListener(eventName, function (event) {
			var data;
			try {
				data = JSON.parse(event.data);
			} catch (e) {
				data = {};
			}

			if (data.flattr_button_event === 'popout_close_button_clicked') {
				FlattrLoader.removeAllOpenPopoutIframes();
			} else if (data.flattr_button_event === 'click_successful') {
				FlattrLoader.reshowAllOpenPopoutIframes();
			}
		}, false);

		switch(this.getParam('mode', 'manual')) {

			case 'direct':
				this.render();
				break;

			case 'auto':
			case 'automatic':
					var that = this;

					this.domReady(function() {
						that.setup();
					});
				break;

			case 'manual':
			default:
		}

		return this;
	},

	loadButton: function(elm) {
		var prop, i, pair, pairKey, field
			, data = {}
			, dataValue = null;

		for (prop in this.options) {
			if (this.options.hasOwnProperty(prop) && this.validParam(prop, this.validButtonParams)) {
				data[prop] = this.options[prop];
			}
		}

		// We want to resolve relative URL:s and getAttribute() don't do that
		if (elm.href) {
			data.url = elm.href;
		}

		if (elm.getAttribute('title')) {
			data.title = elm.getAttribute('title');
		}

		if (elm.getAttribute('lang')) {
			data.language = elm.getAttribute('lang');
		}

		if (elm.innerHTML) {
			data.description = elm.innerHTML;
		}

		if ( ((dataValue = elm.getAttribute('rev')) !== null && (dataValue.substring(0, 6) == 'flattr')) ||
				((dataValue = elm.getAttribute('rel')) !== null && (dataValue.substring(0, 6) == 'flattr')) ) {

			dataValue = dataValue.substring(7).split(';');
			for (i = 0; i < dataValue.length; i++) {
				pair = dataValue[i].split(":");
				pairKey = pair.shift();

				if (this.validParam(pairKey, this.validButtonParams)) {
					data[pairKey] = pair.join(':');
				}
			}
		}
		else
		{
			for (field in this.validButtonParams) {
				if (this.validButtonParams.hasOwnProperty(field) && (dataValue = elm.getAttribute(this.getParam('html5-key-prefix', 'data-flattr') + '-' + this.validButtonParams[field])) !== null ) {
					data[this.validButtonParams[field]] = dataValue;
				}
			}
		}

		this.replaceWith(elm, this.createIframe(data));
	},

	render: function(options, target, position) {

		var prop, data = {};
		for (prop in this.options) {
			if (this.options.hasOwnProperty(prop) && this.validParam(prop, this.validButtonParams)) {
				data[prop] = this.options[prop];
			}
		}

		try
		{
			if (options) {
				for (prop in options) {
					if (options.hasOwnProperty(prop) && this.validParam(prop, this.validButtonParams)) {
						data[prop] = options[prop];
					}
				}
			} else {

				if (window.flattr_uid) { data.uid = window.flattr_uid; }
				if (window.flattr_url) { data.url = window.flattr_url; }
				if (window.flattr_btn) { data.button = window.flattr_btn; }
				if (window.flattr_hide) { data.hidden = (window.flattr_hide == true ? 1 : 0); }
				if (window.flattr_cat) { data.category = window.flattr_cat; }
				if (window.flattr_tag) { data.tags = window.flattr_tag; }
				if (window.flattr_lng) { data.language = window.flattr_lng; }
				if (window.flattr_tle) { data.title = window.flattr_tle; }
				if (window.flattr_dsc) { data.description = window.flattr_dsc; }

			}

			var frame = this.createIframe(data);

			if (target) {

				if (typeof(target) == 'string') {
					target = document.getElementById(target);
				}

				switch(position) {
					case 'before':
							target.parentNode.insertBefore(frame, target);
						break;
					case 'replace':
							this.replaceWith(target, frame);
						break;
					case 'append':
					default:
							target.appendChild(frame);
						break;
				}

			} else if (this.getParam('mode', 'manual') == 'direct') {
				this.replaceWith(this.instance, this.createIframe(data));
			}

		}
		catch(e)
		{
			// ge fel
		}

	},

	replaceWith: function (old, content)
	{
		if (typeof content == 'string') {
			if (typeof document.documentElement.outerHTML !== 'undefined') {
				old.outerHTML = content;
			} else {
				var range = document.createRange();
				range.selectNode(old);
				content = range.createContextualFragment(content);

				old.parentNode.replaceChild(content, old);
			}
		}

		var parent = old.parentNode;
		parent.replaceChild(content, old);
	},

	setup: function() {
		var tmp, i, btns;
		if (document.querySelectorAll) {
			try {
				btns = document.querySelectorAll('a.FlattrButton');
			} catch (e) {}
		}
		if (btns == undefined) {
			btns = [];
			tmp = document.getElementsByTagName('a');
			for(i = (tmp.length - 1); i >= 0 ; i--) {
				if (/FlattrButton/.test(tmp[i].className)) {
					btns[btns.length] = tmp[i];
				}
			}
		}
		for(i = (btns.length - 1); i >= 0 ; i--) {
			this.loadButton(btns[i]);
		}
	},

	stripTags: function(str, allowed_tags) {

		var key = ''
			, allowed = false
			, matches = []
			, allowed_array = []
			, allowed_tag = ''
			, i = 0
			, k = ''
			, html = ''
			, replacer = function (search, replace, str) {
				return str.split(search).join(replace);
			};

		// Build allowed tags associative array
		if (allowed_tags) {
			allowed_array = allowed_tags.match(/([a-zA-Z0-9]+)/gi);
		}

		str += '';

		// Match tags
		matches = str.match(/(<\/?[\S][^>]*>)/gi);

		// Go through all HTML tags
		for (key in matches) {
			if (matches.hasOwnProperty(key)) {
				if (isNaN(key)) {
						// IE7 Hack
						continue;
				}

				// Save HTML tag
				html = matches[key].toString();

				// Is tag not in allowed list? Remove from str!
				allowed = false;

				// Go through all allowed tags
				for (k in allowed_array) {
					if (allowed_array.hasOwnProperty(k)) {
						// Init
						allowed_tag = allowed_array[k];
						i = -1;

						if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+'>');}
						if (i != 0) { i = html.toLowerCase().indexOf('<'+allowed_tag+' ');}
						if (i != 0) { i = html.toLowerCase().indexOf('</'+allowed_tag)	 ;}

						// Determine
						if (i == 0) {
								allowed = true;
								break;
						}
					}
				}

				if (!allowed) {
						str = replacer(html, "", str); // Custom replace. No regexing
				}
			}
		}

		return str;
	},

	validParam: function(key, arr) {
		var i;

		for (i = 0; i < arr.length; i++) {
			if ( arr[i] == key ) {
				return true;
			}
		}

		return false;
	}

};
return FlattrLoader;
}());

// From https://github.com/ded/domready
!function(a,b){function m(a){l=1;while(a=c.shift())a()}var c=[],d,e,f=!1,g=b.documentElement,h=g.doScroll,i="DOMContentLoaded",j="addEventListener",k="onreadystatechange",l=/^loade|c/.test(b.readyState);b[j]&&b[j](i,e=function(){b.removeEventListener(i,e,f),m()},f),h&&b.attachEvent(k,d=function(){/^c/.test(b.readyState)&&(b.detachEvent(k,d),m())}),a.domReady=h?function(b){self!=top?l?b():c.push(b):function(){try{g.doScroll("left")}catch(c){return setTimeout(function(){a.domReady(b)},50)}b()}()}:function(a){l?a():c.push(a)}}(FlattrLoader,document);

FlattrLoader.init();
