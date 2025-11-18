import { Client } from '@googlemaps/google-maps-services-js';
import logger from '../utils/logger';
import { GeoLocation } from '../types';

const client = new Client({});

export interface GeocodingResult {
  formattedAddress: string;
  location: GeoLocation;
}

export const geocodeAddress = async (address: string): Promise<GeocodingResult> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const response = await client.geocode({
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const result = response.data.results[0];
    const location = result.geometry.location;

    return {
      formattedAddress: result.formatted_address,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
    };
  } catch (error) {
    logger.error('Google Maps Geocoding error:', );
    throw new Error('Failed to geocode address');
  }
};

export const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    const response = await client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK' || !response.data.results || response.data.results.length === 0) {
      throw new Error(`Reverse geocoding failed: ${response.data.status}`);
    }

    return response.data.results[0].formatted_address;
  } catch (error) {
    logger.error('Google Maps Reverse Geocoding error:');
    throw new Error('Failed to reverse geocode coordinates');
  }
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

