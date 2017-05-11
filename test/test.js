describe('Toolbox', function () {
    var container,eventContainer;
    var map;
    var center = new maptalks.Coordinate(118.846825, 32.046534);
    var layer, marker;

    beforeEach(function () {
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        var option = {
            zoomAnimation: false,
            zoom: 15,
            center: center
        };
        map = new maptalks.Map(container, option);
        tile = new maptalks.TileLayer('tile', {

            urlTemplate:'/resources/tile.png',
            subdomains: [1, 2, 3]
        });
        layer = new maptalks.VectorLayer('vector').addTo(map);
        marker = new maptalks.Marker(center).addTo(layer);
        map.config('panAnimation', false);
        eventContainer = map._panels.canvasContainer;
    });

    afterEach(function () {
        maptalks.DomUtil.removeDomNode(container);
        document.body.innerHTML = '';
    });

    it('add toolbox to geometry', function () {
        var toolbox = new maptalks.Toolbox({
            autoPan: true,
            vertical : false,
            items: [{
                title: 'item1',
                click : function () { alert('click item1'); }
            },  {
                title: 'item2',
                click : function () { alert('click item2'); }
            }]
        });
        toolbox.addTo(marker);
        expect(toolbox.isVisible()).not.to.be.ok();
        toolbox.show();
        expect(toolbox.isVisible()).to.be.ok();
    });

    it('move geometry', function () {
        var toolbox = new maptalks.Toolbox({
            autoPan: true,
            vertical : false,
            items: [{
                title: 'item1',
                click : function () { alert('click item1'); }
            },  {
                title: 'item2',
                click : function () { alert('click item2'); }
            }]
        });
        toolbox.addTo(marker);
        dragGeometry(marker, true);
        expect(toolbox._coordinate).to.be.eql(marker.getCenter());
    });

    function dragGeometry(geometry, isMove) {
        var spy = sinon.spy();
        geometry.on('mousedown', spy);
        var domPosition = maptalks.DomUtil.getPagePosition(container);
        var point = map.coordinateToContainerPoint(geometry.getFirstCoordinate()).add(domPosition);
        happen.mousedown(eventContainer, {
            'clientX':point.x,
            'clientY':point.y
        });
        expect(spy.called).to.be.ok();
        if (isMove === undefined || isMove) {
            for (var i = 0; i < 10; i++) {
                happen.mousemove(document, {
                    'clientX':point.x + i,
                    'clientY':point.y + i
                });
            }
        }
        happen.mouseup(document);
    }

});
