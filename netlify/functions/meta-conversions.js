const axios = require('axios');
const crypto = require('crypto-js');

// Helper function to hash user data
function hashData(data) {
  if (!data) return undefined;
  return crypto.SHA256(data.trim().toLowerCase()).toString();
}

exports.handler = async (event) => {
  // Add debug logging at the start
  console.log('Environment variables check:', {
    hasPixelId: !!process.env.META_PIXEL_ID,
    hasAccessToken: !!process.env.META_API_ACCESS_TOKEN,
    pixelIdValue: process.env.META_PIXEL_ID // Be careful not to log the actual access token
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { eventName, properties = {}, userData = {}, eventId } = JSON.parse(event.body);
    
    // Log the request data
    console.log('Received request:', {
      eventName,
      eventId,
      propertiesSample: properties ? 'exists' : 'missing',
      userDataSample: userData ? 'exists' : 'missing'
    });

    // Ensure we have default values for required fields
    const eventData = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      user_data: {
        external_id: userData.external_id,
        client_ip_address: event.headers['x-forwarded-for']?.split(',')[0].trim() || event.headers['client-ip'],
        client_user_agent: event.headers['user-agent'],
        fbp: userData.fbp,
        fbc: userData.fbc
      },
      custom_data: {
        currency: properties.currency || 'IDR',
        value: Number(properties.value) || 0,
        content_type: properties.content_type || 'product',
        contents: Array.isArray(properties.contents) ? properties.contents.map(item => ({
          id: String(item.id),
          quantity: Number(item.quantity),
          item_price: Number(item.item_price)
        })) : []
      },
      action_source: 'website'
    };

    // Add debug logging
    console.log('Contents data:', JSON.stringify(eventData.custom_data.contents));

    const eventRequest = {
      data: [eventData],
      access_token: process.env.META_API_ACCESS_TOKEN
    };

    console.log('Meta API request:', {
      ...eventRequest,
      access_token: 'REDACTED'
    });

    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.META_PIXEL_ID}/events`,
      eventRequest
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: response.data })
    };

  } catch (error) {
    console.error('Meta Conversions API Error:', error);
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