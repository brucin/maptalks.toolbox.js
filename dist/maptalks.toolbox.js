/*!
 * maptalks.toolbox v0.0.1
 * LICENSE : MIT
 * (c) 2016-2017 maptalks.org
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('maptalks')) :
	typeof define === 'function' && define.amd ? define(['exports', 'maptalks'], factory) :
	(factory((global.maptalks = global.maptalks || {}),global.maptalks));
}(this, (function (exports,maptalks) { 'use strict';

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * @property {String} eventsToStop - prevent mouse event on this ui component.
 * @property {Boolean} [options.autoPan=false]  - set it to false if you don't want the map to do panning animation to fit the opened menu.
 * @property {String}  style  - default style for this ui component.
 * @property {Boolean} [options.vertical=false] - vertical display toolbar.
 * @property {Object[]|String|HTMLElement}  options.items   - html code or a html element is options.custom is true. Or a menu items array, containing: item objects, "-" as a splitor line
 * @memberOf ui.Toolbox
 * @instance
 */
var defaultOptions = {
    'eventsToStop': 'mousedown dblclick click',
    'autoPan': false,
    'style': 'maptalks-toolbox',
    'vertical': false,
    'items': []
};

/**
 * @classdesc
 * Class for toolbox.
 * @category ui
 * @extends ui.UIComponent
 * @memberOf ui
 */
var Toolbox = function (_maptalks$ui$UICompon) {
    _inherits(Toolbox, _maptalks$ui$UICompon);

    /**
     * Toolbox items is set to options.items or by setItems method. <br>
     * <br>
     * @param {Object} options - options defined in [ui.Toolbox]{@link ui.Toolbox#options}
     */
    function Toolbox(options) {
        _classCallCheck(this, Toolbox);

        return _possibleConstructorReturn(this, _maptalks$ui$UICompon.call(this, options));
    }

    Toolbox.prototype._getClassName = function _getClassName() {
        return 'Toolbox';
    };

    Toolbox.prototype.addTo = function addTo(owner) {
        var _this2 = this;

        if (owner instanceof maptalks.Geometry) {
            owner.on('positionchange', function () {
                _this2._coordinate = owner.getCenter();
            });
            this._coordinate = owner.getCenter();
        }
        return maptalks.ui.UIComponent.prototype.addTo.apply(this, arguments);
    };

    /**
     * Set the items of the toolbox.
     * @param {Object[]|String|HTMLElement} items - items of the toolbox
     * return {ui.Toolbox} this
     */


    Toolbox.prototype.setItems = function setItems(items) {
        this.options['items'] = items;
        return this;
    };

    /**
     * Get items of the toolbox.
     * @return {Object[]|String|HTMLElement} - items of the toolbox
     */


    Toolbox.prototype.getItems = function getItems() {
        return this.options['items'] || [];
    };

    /**
     * get pixel size of toolbox
     * @return {Size} size
     */


    Toolbox.prototype.getSize = function getSize() {
        if (this._size) {
            return this._size.copy();
        } else {
            return null;
        }
    };

    Toolbox.prototype.buildOn = function buildOn() {
        var dom = maptalks.DomUtil.createEl('div');
        if (this.options['style']) {
            maptalks.DomUtil.addClass(dom, this.options['style']);
        }
        var items = this.options['items'];
        if (items && items.length > 0) {
            var maxWidth = 0,
                maxHeight = 0;
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                if (!item['hidden']) {
                    item['vertical'] = item['vertical'] || this.options['vertical'];
                    var menuDom = this._createMenuDom(item);
                    dom.appendChild(menuDom);
                    maxWidth += (item['width'] || 0) + 4;
                    maxHeight += (item['height'] || 0) + 2;
                }
            }
            if (this.options['vertical']) {
                dom.style.height = maxHeight + 'px';
            } else {
                dom.style.width = maxWidth + 'px';
            }
        }
        this._toolboxDom = dom;
        return dom;
    };

    Toolbox.prototype._getWidth = function _getWidth() {
        var defaultWidth = 160;
        var width = this.options['width'];
        if (!width) {
            width = defaultWidth;
        }
        return width;
    };

    Toolbox.prototype.getEvents = function getEvents() {
        return {
            '_zoomstart _zoomend _movestart': this.hide
        };
    };

    Toolbox.prototype.onDomRemove = function onDomRemove() {
        this._removeDomEvents(this._toolboxDom);
    };

    Toolbox.prototype._removeDomEvents = function _removeDomEvents(dom) {
        if (!dom) return;
        var children = dom.childNodes;
        for (var i = 0, len = children.length; i < len; i++) {
            var node = children[i];
            if (node && node.childNodes.length > 0) {
                this._removeDomEvents(node);
            } else {
                this._removeEventsFromDom(node);
            }
        }
    };

    Toolbox.prototype._removeEventsFromDom = function _removeEventsFromDom(dom) {
        maptalks.DomUtil.off(dom, 'click').off(dom, 'mouseover').off(dom, 'mouseout').off(dom, 'mousedown').off(dom, 'dblclick').off(dom, 'contextmenu');
        maptalks.DomUtil.removeDomNode(dom);
        dom = null;
    };

    Toolbox.prototype._createMenuDom = function _createMenuDom(options, tag) {
        var _menuDom = maptalks.DomUtil.createEl('span');
        if (tag) {
            _menuDom = maptalks.DomUtil.createEl(tag);
        }
        var width = options['width'] || 16,
            height = options['height'] || 16,
            vertical = options['vertical'] || defaultOptions['vertical'],
            block = 'inline-block';
        if (vertical) {
            block = 'block';
        }
        _menuDom.style.cssText = 'text-align:center;display:-moz-inline-box;display:' + block + ';width:' + width + 'px;height:' + height + 'px;';

        maptalks.DomUtil.addClass(_menuDom, 'maptalks-toolbox-button');

        _menuDom.appendChild(this._createIconDom(options));

        if (options['click']) {
            maptalks.DomUtil.on(_menuDom, 'click', options['click'], this);
        }
        if (options['mouseover']) {
            maptalks.DomUtil.on(_menuDom, 'mouseover', options['mouseover'], this);
        }
        if (options['mouseout']) {
            maptalks.DomUtil.on(_menuDom, 'mouseout', options['mouseout'], this);
        }
        if (options['mousedown']) {
            maptalks.DomUtil.on(_menuDom, 'mousedown', options['mousedown'], this);
        }
        if (options['mouseup']) {
            maptalks.DomUtil.on(_menuDom, 'mouseup', options['mouseup'], this);
        }
        this._addEventToMenuItem(_menuDom, options);
        var me = this;
        var trigger = options['trigger'] || 'click';
        if (trigger === 'click') {
            maptalks.DomUtil.on(_menuDom, 'click', function () {
                me._showDropMenu(_menuDom, options);
            }, this);
        } else if (trigger === 'mouseover') {
            maptalks.DomUtil.on(_menuDom, 'mouseover', function () {
                me._showDropMenu(_menuDom, options);
            }, this);
        }
        return _menuDom;
    };

    Toolbox.prototype._addEventToMenuItem = function _addEventToMenuItem(_parentDom, options) {
        if (options['children'] && options['children'].length > 0) {
            var me = this;
            var _dropdownMenu = me._createDropMenu(_parentDom, options);
            var trigger = options['trigger'];
            if (trigger === 'click') {
                maptalks.DomUtil.on(_parentDom, 'click', function () {
                    maptalks.DomUtil.setStyle(_dropdownMenu, 'display : block');
                }, this);
                maptalks.DomUtil.on(_dropdownMenu, 'mouseover', function () {
                    maptalks.DomUtil.setStyle(_dropdownMenu, 'display : block');
                }, this);
            } else if (trigger === 'mouseover') {
                maptalks.DomUtil.on(_parentDom, 'mouseover', function () {
                    maptalks.DomUtil.setStyle(_dropdownMenu, 'display : block');
                }, this);
            }
            maptalks.DomUtil.on(_parentDom, 'mouseout', function () {
                maptalks.DomUtil.setStyle(_dropdownMenu, 'display : none');
                _dropdownMenu.style.cssText = 'position: absolute; top: -10000px; left: -10000px;';
            }, this);
            maptalks.DomUtil.on(_dropdownMenu, 'mouseout mouseup', function () {
                maptalks.DomUtil.setStyle(_dropdownMenu, 'display : none');
                _dropdownMenu.style.cssText = 'position: absolute; top: -10000px; left: -10000px;';
            }, this);
        }
    };

    Toolbox.prototype._showDropMenu = function _showDropMenu(parentDom, options) {
        if (options['children'] && options['children'].length > 0) {
            var offset = this._getDropdownMenuOffset(parentDom, options);
            var dom = parentDom.lastChild;
            dom.style.cssText = 'position: absolute; top:' + offset['top'] + 'px; left:' + offset['left'] + 'px;';
            this.fire('showmenuend');
        }
    };

    Toolbox.prototype._getDropdownMenuOffset = function _getDropdownMenuOffset(_parentDom, options) {
        var children = options['children'];
        var height = 16,
            width = 16;
        if (children && children.length > 0) {
            for (var i = 0, len = children.length; i < len; i++) {
                var child = children[i];
                height += child['height'] || 0;
                width += child['width'] || 0;
            }
        }
        var docHeight = document.body.clientHeight,
            docWidth = document.body.clientWidth,
            parentHeight = _parentDom.clientHeight,
            parentWidth = _parentDom.clientWidth;
        var point = maptalks.DomUtil.getPagePosition(_parentDom),
            parentTop = point['y'],
            parentLeft = point['x'];
        var vertical = options['vertical'];
        if (vertical === undefined || vertical == null) {
            vertical = false;
        }
        var dropMenuTop = parentHeight,
            dropMenuLeft = parentWidth;
        if (!vertical) {
            //垂直
            if (parentTop + parentHeight + height > docHeight) {
                dropMenuTop = -height + parentHeight / 2;
            } else {
                dropMenuTop = parentHeight;
            }
            dropMenuLeft = _parentDom.offsetLeft;
        } else {
            if (parentLeft + parentWidth + width > docWidth) {
                dropMenuLeft = -(parentWidth * 3 / 2 + width);
            } else {
                dropMenuLeft = parentWidth;
            }
            dropMenuTop = _parentDom.offsetTop;
        }
        return { 'top': dropMenuTop, 'left': dropMenuLeft };
    };

    Toolbox.prototype._createDropMenu = function _createDropMenu(_parentDom, options) {
        var vertical = options['vertical'] || defaultOptions['vertical'];
        var style = 'position: absolute;';
        if (vertical) {
            style += 'left: -10000px;';
        } else {
            style += 'top: -10000px;';
        }
        return this._createDropMenuDom(_parentDom, options, style);
    };

    Toolbox.prototype._createDropMenuDom = function _createDropMenuDom(_parentDom, options, style) {
        var dom = _parentDom.children[1];
        if (dom) maptalks.DomUtil.removeDomNode(dom);
        var _dropdownMenu = maptalks.DomUtil.createElOn('ul', style);
        //create drop menu.
        var items = options['children'];
        if (items && items.length > 0) {
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                if (!item['vertical']) {
                    item['vertical'] = !(item['vertical'] || options['vertical']);
                }
                _dropdownMenu.appendChild(this._createMenuDom(item, 'li'));
            }
        }
        _parentDom.appendChild(_dropdownMenu);
        return _dropdownMenu;
    };

    Toolbox.prototype._createIconDom = function _createIconDom(options) {
        var _spanDom = maptalks.DomUtil.createEl('span');
        var icon = options['icon'],
            content = options['item'],
            title = options['title'],
            html = options['html'];
        if (icon) {
            var width = options['iconWidth'] || options['width'],
                height = options['iconHeight'] || options['height'];
            var _imgDom = maptalks.DomUtil.createEl('img');
            _imgDom.src = icon;
            _imgDom.border = 0;
            _imgDom.width = width;
            _imgDom.height = height;
            if (title) {
                _imgDom.title = title;
            }
            _spanDom.appendChild(_imgDom);
            if (content) {
                if (html) {
                    if (typeof content === 'string') {
                        _spanDom.innerText = content;
                    } else {
                        _spanDom.appendChild(content);
                    }
                } else {
                    _spanDom.innerText = content;
                }
            }
            return _spanDom;
        } else {
            if (content) {
                if (typeof content === 'string') {
                    _spanDom.innerText = content;
                } else {
                    _spanDom.appendChild(content);
                }
            }
            if (html) {
                _spanDom.appendChild(content);
            }
            return _spanDom;
        }
    };

    return Toolbox;
}(maptalks.ui.UIComponent);

Toolbox.mergeOptions(defaultOptions);

exports.Toolbox = Toolbox;

Object.defineProperty(exports, '__esModule', { value: true });

})));
