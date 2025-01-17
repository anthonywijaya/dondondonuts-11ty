const axios = require('axios');
const crypto = require('crypto-js');

// Helper function to hash user data
function hashData(data) {
  if (!data) return undefined;
  return crypto.SHA256(data.trim().toLowerCase()).toString();
}

exports.handler = async (event) => {
  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Log incoming request
  console.log('TikTok Events API Request:', {
    method: event.httpMethod,
    headers: event.headers,
    path: event.path,
    body: event.body ? JSON.parse(event.body) : null
  });

  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { 
      eventName, 
      properties,
      userData,
      eventId
    } = JSON.parse(event.body);

    // Log parsed data
    console.log('Parsed request data:', {
      eventName,
      properties,
      userData: { ...userData, phone: userData.phone ? 'REDACTED' : undefined },
      eventId
    });

    // Prepare user data with proper hashing
    const hashedUserData = {
      external_id: userData.external_id,
      phone_number: userData.phone ? hashData(userData.phone) : undefined,
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      user_agent: event.headers['user-agent'],
      ttclid: userData.ttclid
    };

    // Log hashed user data
    console.log('Hashed user data:', {
      ...hashedUserData,
      phone_number: hashedUserData.phone_number ? 'HASHED' : undefined
    });

    // Convert timestamp to microseconds and ensure it's a string
    const timestamp = (Date.now() * 1000).toString();

    // Prepare event data
    const eventRequest = {
      pixel_code: process.env.TIKTOK_PIXEL_ID,
      event: eventName,
      event_id: eventId,
      timestamp: timestamp,
      context: {
        user: {
          external_id: hashData(userData.external_id),
          phone_number: userData.phone ? hashData(userData.phone.trim()) : undefined,
          ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
          user_agent: event.headers['user-agent'],
          ttclid: userData.ttclid
        },
        page: {
          url: event.headers.referer || 'https://dondondonuts.id'
        }
      },
      properties: {
        currency: 'IDR',
        value: Number(properties?.value) || 0,
        contents: properties?.contents?.map(item => ({
          content_id: item.content_id || item.id,
          content_type: 'product',
          content_name: item.content_name || item.name,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price || item.item_price || 0)
        })) || [],
        content_type: 'product'
      }
    };

    // Log event request
    console.log('TikTok API request:', {
      ...eventRequest,
      pixel_code: 'REDACTED'
    });

    // Send to TikTok Events API
    try {
      const response = await axios.post(
        'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
        eventRequest,
        {
          headers: {
            'Access-Token': process.env.TIKTOK_ACCESS_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('TikTok Events API Success:', {
        eventName,
        eventId,
        response: response.data
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ success: true, response: response.data })
      };
    } catch (error) {
      console.error('TikTok Events API Error:', {
        error: error.message,
        eventName,
        eventId,
        response: error.response?.data,
        request: {
          ...eventRequest,
          pixel_code: 'REDACTED'
        }
      });

      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false, 
          error: error.message,
          details: error.response?.data || 'No additional details',
          request: {
            ...eventRequest,
            pixel_code: 'REDACTED'
          }
        })
      };
    }
  } catch (error) {
    console.error('TikTok Events API Processing Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Error processing request'
      })
    };
  }
}; 