// CryptoJS is loaded globally from the CDN
// import CryptoJS from 'crypto-js';

// Initialize Meta Pixel
fbq('init', '1064819841680904');
fbq('track', 'PageView');

// Function to hash data using SHA-256
function hashData(data) {
  return CryptoJS.SHA256(data).toString();
}

// Function to generate or retrieve persistent user ID
function getPersistentUserId() {
  let userId = localStorage.getItem('dondon_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('dondon_user_id', userId);
  }
  return userId;
}

// Function to identify user with PII
function identifyUser(user) {
  const persistentUserId = getPersistentUserId();
  
  if (window.ttq) {
    ttq.identify({
      email: user.email ? hashData(user.email) : undefined,
      phone_number: user.phone ? hashData(user.phone) : undefined,
      external_id: persistentUserId
    });
  }

  // Also identify with Meta
  if (typeof fbq !== 'undefined') {
    fbq('init', '1064819841680904', {
      external_id: persistentUserId
    });
  }
}

// Example user data (replace with actual data)
const user = {
  email: 'anthony.fengshen@gmail.com',
  phone: '081293456458',
  id: 'anthony.fengshen6458'
};

// Call identifyUser on pages where PII data is expected
identifyUser(user);

// Function to send server-side events
async function sendServerEvent(platform, eventName, eventData = {}, userData = {}) {
  const eventId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const endpoint = platform === 'meta' ? 'meta-conversions' : 'tiktok-events';
    
    // Ensure default values for properties
    const properties = {
      currency: 'IDR',
      value: eventData.value || 0,
      contents: eventData.contents || [],
      content_type: 'product',
      ...eventData
    };

    const response = await fetch(`/.netlify/functions/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        properties,
        userData: {
          ...userData,
          external_id: getPersistentUserId(),
          fbc: getCookie('_fbc'),
          fbp: getCookie('_fbp'),
          ttclid: getCookie('ttclid')
        },
        eventId
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
    }
  } catch (error) {
    console.error(`${platform} server event error:`, error);
  }
}

// Helper to get cookies
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return undefined;
}

// Function to track form start
function trackFormStart() {
  gtag('event', 'form_start', {
    'event_category': 'Engagement',
    'event_label': 'Order Form'
  });
  
  fbq('trackCustom', 'FormStart', {
    formName: 'Order Form'
  });
  
  if (window.ttq) {
    ttq.track('StartCheckout');
  }

  // Server-side events
  sendServerEvent('meta', 'StartCheckout', {});
  sendServerEvent('tiktok', 'StartCheckout', {});
}

// Function to track "Need Help" button click
function trackNeedHelp() {
  gtag('event', 'contact', {
    'event_category': 'Engagement',
    'event_label': 'Need Help'
  });
  fbq('trackCustom', 'Contact', {type: 'Need Help'});
}

// Function to track order submission
function trackOrderSubmission(orderDetails) {
  const eventId = `order_${Date.now()}`;
  const persistentUserId = getPersistentUserId();

  // Google Analytics
  gtag('event', 'purchase', {
    transaction_id: eventId,
    value: orderDetails.total,
    currency: 'IDR',
    items: orderDetails.items.map(item => ({
      item_name: item.item_name,
      quantity: item.quantity,
      price: item.price
    }))
  });

  // Prepare common event data
  const eventData = {
    value: orderDetails.total,
    currency: 'IDR',
    contents: orderDetails.items.map(item => ({
      id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      quantity: item.quantity,
      price: item.price
    })),
    content_ids: orderDetails.items.map(item => 
      item.item_name.toLowerCase().replace(/\s+/g, '_')
    )
  };

  // Meta Pixel
  fbq('track', 'Purchase', {
    ...eventData,
    content_type: 'product'
  });

  // Meta Server Event
  sendServerEvent('meta', 'Purchase', eventData, {
    phone: orderDetails.phone
  });
  
  // TikTok Pixel
  if (window.ttq) {
    ttq.track('PlaceAnOrder', {
      contents: eventData.contents,
      value: eventData.value,
      currency: 'IDR',
      order_id: eventId
    });
  }

  // TikTok Server Event
  sendServerEvent('tiktok', 'PlaceAnOrder', {
    ...eventData,
    order_id: eventId
  }, {
    phone: orderDetails.phone
  });
}

// Add TikTok tracking functions
function trackTikTokViewContent(flavor) {
  const contentId = flavor.name.toLowerCase().replace(/\s+/g, '_');
  const eventData = {
    content_type: 'product',
    content_ids: [contentId],
    content_name: flavor.name,
    value: flavor.price,
    currency: 'IDR',
    contents: [{
      content_id: contentId,
      content_type: 'product',
      content_name: flavor.name,
      price: flavor.price
    }]
  };
  
  // Meta Pixel
  fbq('track', 'ViewContent', eventData);

  // Meta Server Event
  sendServerEvent('meta', 'ViewContent', eventData, {});

  // TikTok Pixel
  if (window.ttq) {
    ttq.track('ViewContent', {
      contents: eventData.contents,
      currency: 'IDR',
      value: flavor.price
    });
  }

  // TikTok Server Event
  sendServerEvent('tiktok', 'ViewContent', eventData, {});
}

function trackTikTokInitiateCheckout(orderDetails) {
  if (window.ttq) {
    ttq.track('InitiateCheckout', {
      contents: orderDetails.items.map(item => ({
        content_id: item.id,
        content_type: 'product', 
        content_name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      value: orderDetails.total,
      currency: 'IDR'
    });
  }
}

function trackTikTokPlaceOrder(orderDetails) {
  if (window.ttq) {
    ttq.track('PlaceAnOrder', {
      contents: orderDetails.items.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      value: orderDetails.total,
      currency: 'IDR'
    });
  }
}