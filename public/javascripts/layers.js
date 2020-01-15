// CAPAS BASE Y ADICIONALES PARA VISUALIZAR EN EL EL CLIENTE

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
for (var z = 0; z < 22; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
};

var styleFunction = function (id) {
    return styles[id];
};

var tileGrid = new ol.tilegrid.WMTS({
    origin: ol.extent.getTopLeft(projectionExtent),
    resolutions: resolutions,
    matrixIds: matrixIds
});


// Layer for draw single vector features
const source = new ol.source.Vector;
var vectorLayer = new ol.layer.Vector({
    source: source
});

// var wmsSource = new TileWMS({
//     url: 'http://ows.mundialis.de/services/service?',
//     params: {'LAYERS': 'TOPO-OSM-WMS'},
//     crossOrigin: 'anonymous'
// });

var osm = new ol.layer.Tile({
    title: "OpenStreetMap",
    baseLayer: true,
    visible: false,
    source: new ol.source.OSM()
});


var pnoaWmts = new ol.layer.Tile({
    title: "PNOA Máxima Actualidad",
    baseLayer: true,
    opacity: 1,
    visible: true,
    source: new ol.source.WMTS({
        url: 'http://www.ign.es/wmts/pnoa-ma',
        layer: 'OI.OrthoimageCoverage',
        matrixSet: 'EPSG:3857',
        format: 'image/jpeg',
        projection: projection,
        tileGrid: tileGrid,
        style: 'default',
        wrapX: true
    })
});

//Capa ortofoto vuelo americano 1956-57 serie B
var americano = new ol.layer.Tile({
    title: "Americano serie B (1956-57)",
    baseLayer: false,
    preload: Infinity,
    visible: false,
    source: new ol.source.TileWMS(({
        url: 'http://www.ign.es/wms/pnoa-historico',
        params: {
            'LAYERS': 'AMS_1956-1957', 'VERSION': '1.3.0',
            'FORMAT': 'image/png', 'CRS': 'EPSG:3857'
        }
    }))
});

//Capa ortofoto vuelo interministerial 1973-86
var interministerial = new ol.layer.Tile({
    title: "Interministerial (1973-86)",
    baseLayer: false,
    preload: Infinity,
    visible: false,
    source: new ol.source.TileWMS(({
        url: 'http://www.ign.es/wms/pnoa-historico',
        params: {
            'LAYERS': 'Interministerial_1973-1986', 'VERSION': '1.3.0',
            'FORMAT': 'image/png', 'CRS': 'EPSG:3857'
        }
    }))
});

//Capa ortofoto vuelo OLISTAT 1997-98
var olistat = new ol.layer.Tile({
    title: "OLISTAT (1997-1998)",
    baseLayer: false,
    preload: Infinity,
    visible: false,
    source: new ol.source.TileWMS(({
        url: 'http://www.ign.es/wms/pnoa-historico',
        params: {
            'LAYERS': 'OLISTAT', 'VERSION': '1.3.0',
            'FORMAT': 'image/png', 'CRS': 'EPSG:3857'
        }
    }))
});

//Capa ortofoto vuelo SIGPAC 1997-2003
var sigpac = new ol.layer.Tile({
    title: "SIGPAC (1997-2003)",
    baseLayer: false,
    preload: Infinity,
    visible: false,
    source: new ol.source.TileWMS(({
        url: 'http://www.ign.es/wms/pnoa-historico',
        params: {
            'LAYERS': 'SIGPAC', 'VERSION': '1.3.0',
            'FORMAT': 'image/png', 'CRS': 'EPSG:3857'
        }
    }))
});

//Capa ortofoto vuelo PNOA 2004
var pnoa2006 = new ol.layer.Tile({
    title: "PNOA (2006)",
    baseLayer: false,
    preload: Infinity,
    visible: false,
    source: new ol.source.TileWMS(({
        url: 'http://www.ign.es/wms/pnoa-historico',
        params: {
            'LAYERS': 'PNOA2006', 'VERSION': '1.3.0',
            'FORMAT': 'image/png', 'CRS': 'EPSG:3857'
        }
    }))
});

var IGNBaseOrto = new ol.layer.Tile({
    title: "IGNBaseOrto",
    baseLayer: false,
    opacity: 1,
    visible: true,
    source: new ol.source.WMTS({
        url: 'http://www.ign.es/wmts/ign-base',
        layer: 'IGNBaseOrto',
        matrixSet: 'EPSG:3857',
        format: 'image/png',
        projection: projection,
        tileGrid: tileGrid,
        style: 'default',
        wrapX: true
    })
});
