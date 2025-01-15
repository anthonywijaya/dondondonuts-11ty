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
      eventData, 
      userData,
      eventId 
    } = JSON.parse(event.body);

    // Prepare user data with proper hashing
    const hashedUserData = {
      external_id: userData.external_id,
      ph: userData.phone ? hashData(userData.phone) : undefined,
      client_ip_address: event.headers['x-forwarded-for'] || event.headers['client-ip'],
      client_user_agent: event.headers['user-agent'],
      fbc: userData.fbc,
      fbp: userData.fbp
    };

    // Prepare event data
    const eventRequest = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user_data: hashedUserData,
        custom_data: {
          currency: eventData.currency || 'IDR',
          value: eventData.value,
          content_ids: eventData.content_ids,
          contents: eventData.contents,
          content_type: 'product'
        },
        action_source: 'website'
      }],
      access_token: process.env.META_API_ACCESS_TOKEN
    };

    // Send to Meta Conversions API
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.META_PIXEL_ID}/events`,
      eventRequest
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, response: response.data })
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