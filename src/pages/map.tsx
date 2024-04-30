// import React from 'react';
// import GoogleMapReact from 'google-map-react';

// const Map = ({ locations }) => {
//   const renderMarkers = (map, maps) => {
//     const markers = locations.map((location, index) => {
//       return new maps.Marker({
//         position: { lat: location.lat, lng: location.lng },
//         map,
//         title: `Marker ${index + 1}`
//       });
//     });

//     return markers;
//   };

//   return (
//     <div style={{ height: '400px', width: '100%' }}>
//       <GoogleMapReact
//         bootstrapURLKeys={{ key: 'YOUR_API_KEY' }}
//         defaultCenter={{ lat: locations[0].lat, lng: locations[0].lng }}
//         defaultZoom={10}
//         onGoogleApiLoaded={({ map, maps }) => renderMarkers(map, maps)}
//       />
//     </div>
//   );
// };

// export default Map