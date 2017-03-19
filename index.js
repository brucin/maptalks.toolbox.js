import * as maptalks from 'maptalks';

/**
 * @property {String} eventsToStop - prevent mouse event on this ui component.
 * @property {Boolean} [options.autoPan=false]  - set it to false if you don't want the map to do panning animation to fit the opened menu.
 * @property {String}  style  - default style for this ui component.
 * @property {Object[]|String|HTMLElement}  options.items   - html code or a html element is options.custom is true. Or a menu items array, containing: item objects, "-" as a splitor line
 * @memberOf ui.Toolbox
 * @instance
 */
const defaultOptions = {
    'eventsToStop' : 'mousedown dblclick click',
    'autoPan': false,
    'style': 'maptalks-toolbox',
    'vertical' : false,
    'items': []
};

export class Toolbox extends maptalks.ui.UIComponent {
    /**
     * Toolbox items is set to options.items or by setItems method. <br>
     * <br>
     * Normally items is a object array, containing: <br>
     * 1. item object: {'item': 'This is a menu text', 'click': function() {alert('oops! You clicked!');)}} <br>
     * 2. minus string "-", which will draw a splitor line on the menu. <br>
     * <br>
     * If options.custom is set to true, the menu is considered as a customized one. Then items is the customized html codes or HTMLElement. <br>
     * @param {Object} options - options defined in [ui.Menu]{@link ui.Menu#options}
     */
    constructor(options) {
        super(options);
    }

    _getClassName() {
        return 'Toolbox';
    }

    addTo(owner) {
        return maptalks.ui.UIComponent.prototype.addTo.apply(this, arguments);
    }

    /**
     * Set the items of the menu.
     * @param {Object[]|String|HTMLElement} items - items of the menu
     * return {ui.Menu} this
     * @example
     * menu.setItems([
     *      //return false to prevent event propagation
     *     {'item': 'Query', 'click': function() {alert('Query Clicked!'); return false;}},
     *     '-',
     *     {'item': 'Edit', 'click': function() {alert('Edit Clicked!')}},
     *     {'item': 'About', 'click': function() {alert('About Clicked!')}}
     * ]);
     */
    setItems(items) {
        this.options['items'] = items;
        return this;
    }

    /**
     * Get items of  the menu.
     * @return {Object[]|String|HTMLElement} - items of the menu
     */
    getItems() {
        return this.options['items'] || [];
    }


    /**
     * get pixel size of menu
     * @return {Size} size
     */
    getSize() {
        if (this._size) {
            return this._size.copy();
        } else {
            return null;
        }
    }

    buildOn() {
        var dom = maptalks.DomUtil.createEl('div');
        if (this.options['style']) {
            maptalks.DomUtil.addClass(dom, this.options['style']);
        }
        var items = this.options['items'];
        if (items && items.length > 0) {
            var maxWidth = 0, maxHeight = 0;
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
    }

    _getWidth() {
        var defaultWidth = 160;
        var width = this.options['width'];
        if (!width) {
            width = defaultWidth;
        }
        return width;
    }

    getEvents() {
        return {
            '_zoomstart _zoomend _movestart' : this.hide
        };
    }

    onDomRemove() {
        this._removeDomEvents(this._toolboxDom);
    }

    _removeDomEvents(dom) {
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

    }

    _removeEventsFromDom(dom) {
        maptalks.DomUtil.off(dom, 'click')
                 .off(dom, 'mouseover')
                 .off(dom, 'mouseout')
                 .off(dom, 'mousedown')
                 .off(dom, 'dblclick')
                 .off(dom, 'contextmenu');
        maptalks.DomUtil.removeDomNode(dom);
        dom = null;
    }

    _createMenuDom(options, tag) {
        var _menuDom = maptalks.DomUtil.createEl('span');
        if (tag) {
            _menuDom = maptalks.DomUtil.createEl(tag);
        }
        var width = options['width'] || 16;
        var height = options['height'] || 16;
        var vertical = options['vertical'];
        if (vertical === undefined || vertical == null) {
            vertical = false;
        }
        var block = 'inline-block';
        if (vertical) {
            block = 'block';
        }
        _menuDom.style.cssText = 'text-align:center;display:-moz-inline-box;display:' + block +
                               ';width:' + width + 'px;height:' + height + 'px;';

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
    }

    _addEventToMenuItem(_parentDom, options) {
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
    }

    _showDropMenu(parentDom, options) {
        if (options['children'] && options['children'].length > 0) {
            var offset = this._getDropdownMenuOffset(parentDom, options);
            var dom = parentDom.lastChild;
            dom.style.cssText = 'position: absolute; top:' + offset['top'] + 'px; left:' + offset['left'] + 'px;';
            this.fire('showmenuend');
        }
    }

    _getDropdownMenuOffset(_parentDom, options) {
        var children = options['children'];
        var height = 16, width = 16;
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                height += child['height'] || 0;
                width += child['width'] || 0;
            }
        }
        var docHeight = document.body.clientHeight;
        var docWidth = document.body.clientWidth;
        var parentHeight = _parentDom.clientHeight;
        var parentWidth = _parentDom.clientWidth;
        var point = maptalks.DomUtil.getPagePosition(_parentDom);
        var parentTop = point['y'];
        var parentLeft = point['x'];
        var vertical = options['vertical'];
        if (vertical === undefined || vertical == null) {
            vertical = false;
        }
        var dropMenuTop = parentHeight, dropMenuLeft = parentWidth;
        if (!vertical) { //垂直
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
    }

    _createDropMenu(_parentDom, options) {
        var vertical = options['vertical'];
        if (vertical === undefined || vertical == null) {
            vertical = false;
        }
        var style = 'position: absolute;';
        if (vertical) {
            style += 'left: -10000px;';
        } else {
            style += 'top: -10000px;';
        }
        return this._createDropMenuDom(_parentDom, options, style);
    }

    _createDropMenuDom(_parentDom, options, style) {
        var dom = _parentDom.children[1];
        if (dom) maptalks.DomUtil.removeDomNode(dom);
        var _dropdownMenu = maptalks.DomUtil.createElOn('ul', style);
        //构造下拉菜单
        var items = options['children'];
        if (items && items.length > 0) {
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                if (item['vertical'] === undefined) {
                    item['vertical'] = !(item['vertical'] || options['vertical']);
                }
                _dropdownMenu.appendChild(this._createMenuDom(item, 'li'));
            }
        }
        _parentDom.appendChild(_dropdownMenu);
        return _dropdownMenu;
    }

    _createIconDom(options) {
        var _spanDom = maptalks.DomUtil.createEl('span');
        var icon = options['icon'];
        var content = options['item'];
        var title = options['title'];
        var html = options['html'];
        if (icon) {
            var width = options['iconWidth'] || options['width'];
            var height = options['iconHeight'] || options['height'];
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
    }

}

Toolbox.mergeOptions(defaultOptions);

