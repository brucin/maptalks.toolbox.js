describe('Toolbox', function () {
    var container;
    var map;
    var center = new maptalks.Coordinate(118.846825, 32.046534);
    var layer;
    var context = {};

    beforeEach(function() {
       var setups = commonSetupMap(center);
       container = setups.container;
       map = setups.map;
       context.map = map;
    });

    afterEach(function() {
        map.removeLayer(layer);
        removeContainer(container)
    });

    var geometries = genAllTypeGeometries();

    for (var i = 0; i < geometries.length; i++) {
        runTests.call(this, geometries[i], context);
    }

});

function runTests(target, _context) {
    var type;
    if (target instanceof maptalks.Geometry) {
        type = target.getType();
    } else {
        type = 'Map';
    }

    function before() {
        if (!(target instanceof maptalks.Geometry)) {
            return;
        }
        var map = _context.map;
        if (target.getLayer()) {target.remove();}
        map.removeLayer('vector');
        var layer = new maptalks.VectorLayer('vector');
        layer.addGeometry(target).addTo(map);
    }

    var items = [
        {item: 'item1', click: function(){}},
        '-',
        {item: 'item2', click: function(){}}
    ];

    function assertItems() {
        var itemEles = document.getElementsByTagName('li');
        expect(itemEles.length).to.be.eql(3);
        expect(itemEles[0].innerHTML).to.be.eql('item1');
        expect(itemEles[2].innerHTML).to.be.eql('item2');
    }

    function rightclick() {
        _context.map.setCenter(target.getFirstCoordinate());
        var eventContainer = _context.map._panels.canvasContainer;
        var domPosition = Z.DomUtil.getPagePosition(eventContainer);
        var point = _context.map.coordinateToContainerPoint(target.getFirstCoordinate()).add(domPosition);

        happen.click(eventContainer,{
            'clientX':point.x,
            'clientY':point.y,
            'button' : 2
        });

    }

    context('Type of ' + type, function() {
        it('setMenuAndOpen', function() {
            before();
            target.setMenu({
                items: items,
                width: 250
            });
            target.openMenu();
            assertItems();
            target.closeMenu();
            expect(target._menu._getDOM().style.display).to.be.eql('none');
        });

        it('get menu', function() {
            before();
            target.setMenu({
                items: items,
                width: 250
            });
            var items = target.getMenuItems();
            expect(items).to.be.eql(items);
        });

        it('remove menu', function() {
            before();
            target.setMenu({
                    items: items,
                    width: 250
                });
            target.removeMenu();
            expect(target.getMenuItems()).not.to.be.ok();
        });

        it('custom menu', function() {
            before();
            target.setMenu({
                    custom : true,
                    items: '<ul><li>item1</li><li>--</li><li>item2</li></ul>',
                    width: 250
                });
            target.openMenu();
            assertItems();
            target.closeMenu();
            expect(target._menu._getDOM().style.display).to.be.eql('none');
        });

        it('custom menu 2', function() {
            var ul = document.createElement('ul');
            var li1 = document.createElement('li');
            li1.innerHTML = 'item1';
            var li2 = document.createElement('li');
            li2.innerHTML = '--';
            var li3 = document.createElement('li');
            li3.innerHTML = 'item2';
            ul.appendChild(li1);
            ul.appendChild(li2);
            ul.appendChild(li3);
            before();
            target.setMenu({
                    custom : true,
                    items: ul,
                    width: 250
                });
            target.openMenu();
            assertItems();
            target.closeMenu();
            expect(target._menu._getDOM().style.display).to.be.eql('none');
        });

        it('setMenuItems', function() {
            before();
            target.setMenuItems(items);
            target.openMenu();
            assertItems();
            target.closeMenu();
            expect(target._menu._getDOM().style.display).to.be.eql('none');
        });

        it('openMenu with a coordinate', function() {
            before();
            target.setMenuItems(items);
            target.openMenu(target.getCenter());
            assertItems();
            target.closeMenu();
            expect(target._menu._getDOM().style.display).to.be.eql('none');
        });

        it('openMenu by click', function() {
            if (target instanceof Z.Sector) {
                return;
            }
            before();
            target.setMenu({
                    items: items,
                    width: 250
                });
            rightclick();
            assertItems();
            target.closeMenu();
            expect(target._menu._getDOM().style.display).to.be.eql('none');
        });

        it('callback will be called when item is clicked', function() {
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            before();
            target.setMenuItems([
                {item: 'item1', click: spy1},
                '-',
                {item: 'item2', click: spy2}
            ]);
            target.openMenu();
            var itemEles = document.getElementsByTagName('li');
            itemEles[0].click();
            expect(spy1.called).to.be.ok();
            target.openMenu();
            itemEles = document.getElementsByTagName('li');
            itemEles[2].click();
            expect(spy2.called).to.be.ok();

        });

    });
}
