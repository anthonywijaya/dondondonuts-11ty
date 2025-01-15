const axios = require('axios');
const crypto = require('crypto-js');

// Helper function to hash user data
function hashData(data) {
  if (!data) return undefined;
  return crypto.SHA256(data.trim().toLowerCase()).toString();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { 
      eventName, 
      properties,
      userData,
      eventId
    } = JSON.parse(event.body);

    // Prepare user data with proper hashing
    const hashedUserData = {
      external_id: userData.external_id,
      phone_number: userData.phone ? hashData(userData.phone) : undefined,
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      user_agent: event.headers['user-agent'],
      ttclid: userData.ttclid
    };

    // Prepare event data
    const eventRequest = {
      pixel_code: process.env.TIKTOK_PIXEL_ID,
      event: eventName,
      event_id: eventId,
      timestamp: Date.now(),
      context: {
        user: hashedUserData,
        page: {
          url: event.headers.referer || 'https://dondondonuts.id'
        }
      },
      properties: {
        currency: properties.currency || 'IDR',
        value: properties.value,
        contents: properties.contents,
        content_type: 'product'
      }
    };

    // Send to TikTok Events API
    const response = await axios.post(
      'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
      eventRequest,
      {
        headers: {
          'Access-Token': process.env.TIKTOK_API_ACCESS_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, response: response.data })
    };
  } catch (error) {
    console.error('TikTok Events API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.response?.data || 'No additional details'
      })
    };
  }
}; 