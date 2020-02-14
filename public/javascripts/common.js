// dibuja Point pasandole una geometria en geográficas
export function dibujaPosicion(coords) {
    var pointPos = new ol.geom.Point(toUtm(coords));
    vectorLayer.setSource(new ol.source.Vector());
    vectorLayer.getSource().addFeature(new ol.Feature({geometry: pointPos}));
}

export function toGeo(coords) {
    return ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
}

export function toUtm(coords) {
    return ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857');
}


