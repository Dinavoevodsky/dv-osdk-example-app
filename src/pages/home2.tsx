import React, { useEffect, useState, useRef } from 'react';
import { ErrorVisitor, ListObjectsError, Page, Result, isErr, isOk, visitError } from "@dv-osdk-revised-app/sdk";
import { UnitImdb } from "@dv-osdk-revised-app//sdk/ontology/objects";
import * as maptalks from 'maptalks';
import { client } from '../utils/client';

import './home.scss';

const defaultZoom = 4;
const selectedZoom = 13;

export const HomePage: React.FC = () => {
  const [objectList, setObjectList] = useState<
    { status: 'loading' } | { status: 'loaded'; value: UnitImdb[] } | { status: 'failed_loading'; msg: string }
  >({ status: 'loading' });

  const getData = React.useCallback(async () => {
    const result: Result<Page<UnitImdb>, ListObjectsError> = await client.ontology.objects.UnitImdb.page({
      pageSize: 10,
    });
    const units = await client.ontology.objects.UnitImdb.all();
    console.log('units: ', units);

    console.log('API response:', result);
    if (isOk(result)) {
      setObjectList({ value: result.value.data, status: 'loaded' });
    } else if (isErr(result)) {
      const visitor: ErrorVisitor<ListObjectsError, void> = {
        ObjectTypeNotFound: err => {
          setObjectList({ status: 'failed_loading', msg: `Object type ${err.objectType} was not found` });
        },
        default: () => {
          setObjectList({ status: 'failed_loading', msg: 'failed loading object type' });
        },
      };
      visitError(result.error, visitor);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const [selectedUnit, setSelectedUnit] = useState<UnitImdb | null>(null);

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maptalks.Map | null>(null);
  const markersLayerRef = useRef<maptalks.Layer | null>(null);

    const initMap = () => {
        console.log('Initializing map...');
        if (mapContainer.current) {
        mapRef.current = new maptalks.Map(mapContainer.current, {
            center: [55.7558, 37.6173],
            zoom: defaultZoom,
            baseLayer: new maptalks.TileLayer('base', {
            urlTemplate: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGluYXZvZSIsImEiOiJjbHc1b2x0ajkxb3FpMmlwN3oxcmY4d3RsIn0.2AItbtPCkdMNsSyRBBmhTg',
            subdomains: ['a', 'b', 'c'],
            attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>, &copy; <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> contributors'
            })
        });
    
        // Then add the markersLayer
        markersLayerRef.current = new maptalks.VectorLayer('markers').addTo(mapRef.current);
        }
    };

  const fitMapToBounds = () => {
  if (objectList.status === 'loaded' && mapRef.current) {
    const latLngs = objectList.value
      .filter(object => object.latLong && object.latLong.length === 2)
      .map(object => object.latLong as [number, number]);
    if (latLngs.length > 0) {
      const extents = latLngs.map(coords => new maptalks.Coordinate(coords));
      const extent = new maptalks.Extent(extents).expand(1.2); // Add a 20% buffer around the extent
      mapRef.current.fitExtent(extent, 0); // Pass 0 as the zoomOffset
    }
  }
};


  const renderMarkers = () => {
    if (objectList.status === 'loaded' && mapRef.current && markersLayerRef.current) {
      (markersLayerRef.current as maptalks.VectorLayer).clear();
      objectList.value.forEach(object => {
        if (object.latLong && object.latLong.length === 2) {
          const marker = new maptalks.Marker(object.latLong, {
            properties: {
              id: object.__primaryKey,
            },
            symbol: {
              markerType: 'ellipse',
              markerWidth: 8,
              markerHeight: 8,
              markerFill: 'red',
              markerLineColor: 'white',
              markerLineWidth: 1,
            },
          }).addTo(markersLayerRef.current as maptalks.VectorLayer);

          if (selectedUnit && selectedUnit.__primaryKey === object.__primaryKey) {
            marker.updateSymbol({
              markerType: 'pin',
              markerWidth: 24,
              markerHeight: 24,
              markerFill: 'rgba(255, 0, 0, 0.8)',
              markerLineColor: '#000',
              markerLineWidth: 1,
            });
          }
        }
      });
    }
  };
  
  useEffect(() => {
    if (mapContainer.current) {
      initMap();
      renderMarkers();
    }
  }, [mapContainer]);
  
  useEffect(() => {
    renderMarkers();
  }, [objectList, selectedUnit]);

  const selectUnit = (unit: UnitImdb) => {
    setSelectedUnit(unit);
    if (mapRef.current && unit.latLong && unit.latLong.length === 2) {
      mapRef.current.animateTo({
        center: unit.latLong,
        zoom: selectedZoom,
      });
    }
  };

  return (
    <div className="home">
      <h1>Dina's OSDK App</h1>
      <div className="content">
        <div className="object-list">
          {objectList.status === 'loading' && <div>Loading…</div>}
          {objectList.status === 'loaded' && (
            <ul>
              {objectList.value.map(object => (
                <li
                  key={object.__primaryKey}
                  className={`card${selectedUnit && selectedUnit.__primaryKey === object.__primaryKey ? ' selected' : ''}`}
                  onClick={() => selectUnit(object)}
                >
                  <h2>{object.unitName}</h2>
                  <p>Affiliation: {object.affiliation}</p>
                  <p>Category: {object.category}</p>
                  <p>Country: {object.country}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
  
        <div id="map" ref={mapContainer}></div> 
      </div>
    </div>
  );
};
