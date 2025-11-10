export type CityKey = 'Helsingborg' | 'Stockholm' | 'Göteborg' | 'Malmö';

export const CITY_COORDS: Record<CityKey, {lat:number; lng:number}> = {
  Helsingborg: { lat: 56.0467, lng: 12.6944 },
  Stockholm:   { lat: 59.334591, lng: 18.063240 },
  Göteborg:    { lat: 57.708870, lng: 11.974560 },
  Malmö:       { lat: 55.604981, lng: 13.003822 },
};
