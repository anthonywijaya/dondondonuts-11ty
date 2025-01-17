// CryptoJS is loaded globally from the CDN
// import CryptoJS from 'crypto-js';

// Get pixel IDs from meta tags
const getMetaPixelId = () => document.querySelector('meta[name="meta-pixel-id"]')?.content;
const getTikTokPixelId = () => document.querySelector('meta[name="tiktok-pixel-id"]')?.content;

// Function to initialize tracking pixels
function initializePixels() {
  const metaPixelId = getMetaPixelId();
  const tikTokPixelId = getTikTokPixelId();

  console.log('Initializing pixels with:', {
    hasMeta: !!metaPixelId,
    hasTikTok: !!tikTokPixelId,
    tikTokId: tikTokPixelId // Log the actual TikTok ID for verification
  });

  // Initialize Meta Pixel only once
  if (typeof fbq !== 'undefined' && metaPixelId) {
    fbq('init', metaPixelId, {
      external_id: getPersistentUserId()
    });
    fbq('track', 'PageView');
  }

  // Initialize TikTok pixel
  if (tikTokPixelId) {
    // Load TikTok pixel script
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;
      var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

      // Initialize with the pixel ID
      ttq.load(tikTokPixelId);
      ttq.page();
    }(window, document, 'ttq');
  }
}

// Initialize pixels when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePixels);
} else {
  initializePixels();
}

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
  if (!user) return;

  const persistentUserId = getPersistentUserId();
  
  if (window.ttq) {
    ttq.identify({
      email: user.email ? hashData(user.email.trim().toLowerCase()) : undefined,
      phone_number: user.phone ? hashData(user.phone.trim()) : undefined,
      external_id: hashData(persistentUserId) // Hash the external_id as required
    });
  }

  // Update Meta user data without reinitializing
  if (typeof fbq !== 'undefined' && getMetaPixelId()) {
    fbq('setUserData', {
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
  const formStartId = `form_${Date.now()}`;
  
  gtag('event', 'form_start', {
    'event_category': 'Engagement',
    'event_label': 'Order Form'
  });
  
  fbq('trackCustom', 'FormStart', {
    formName: 'Order Form',
    content_id: formStartId
  });
  
  if (window.ttq) {
    ttq.track('StartCheckout', {
      content_id: formStartId
    });
  }

  // Server-side events
  sendServerEvent('meta', 'StartCheckout', { content_id: formStartId }, {});
  sendServerEvent('tiktok', 'StartCheckout', { content_id: formStartId }, {});
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
  // Validate required fields
  if (!orderDetails || !orderDetails.total || !orderDetails.items || orderDetails.items.length === 0) {
    console.warn('Tracking: Invalid order details provided');
    return;
  }

  const eventId = `order_${Date.now()}`;

  // TikTok Pixel - Place Order
  if (window.ttq) {
    ttq.track('PlaceAnOrder', {
      contents: orderDetails.items.map(item => ({
        content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
        content_type: 'product',
        content_name: item.item_name,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      value: Number(orderDetails.total),
      currency: 'IDR'
    });
  }

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
      content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      quantity: item.quantity,
      item_price: Number(item.price) || 0,
      price: (Number(item.price) || 0) * item.quantity  // Calculate total price for line item
    })),
    content_ids: orderDetails.items.map(item => 
      item.item_name.toLowerCase().replace(/\s+/g, '_')
    ),
    content_id: `order_${eventId}`
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
  
  // TikTok Server Event
  sendServerEvent('tiktok', 'PlaceAnOrder', {
    ...eventData,
    order_id: eventId
  }, {
    phone: orderDetails.phone
  });
}

// Function to track TikTok view content
function trackTikTokViewContent(flavor) {
  const contentId = flavor.name.toLowerCase().replace(/\s+/g, '_');
  
  if (window.ttq) {
    ttq.track('ViewContent', {
      contents: [{
        content_id: contentId,
        content_type: 'product', // Explicitly set as required
        content_name: flavor.name,
        price: Number(flavor.price) // Ensure it's a number
      }]
    });
  }

  // Meta Pixel
  fbq('track', 'ViewContent', {
    content_type: 'product',
    content_id: contentId,
    content_name: flavor.name,
    value: flavor.price,
    currency: 'IDR',
    contents: [{
      content_id: contentId,
      id: contentId,
      content_type: 'product',
      content_name: flavor.name,
      price: flavor.price,
      quantity: 1
    }]
  });

  // Meta Server Event
  sendServerEvent('meta', 'ViewContent', {
    content_type: 'product',
    content_id: contentId,
    content_name: flavor.name,
    value: flavor.price,
    currency: 'IDR',
    contents: [{
      content_id: contentId,
      id: contentId,
      content_type: 'product',
      content_name: flavor.name,
      price: flavor.price,
      quantity: 1
    }]
  }, {});

  // TikTok Server Event
  sendServerEvent('tiktok', 'ViewContent', {
    content_type: 'product',
    content_id: contentId,
    content_name: flavor.name,
    value: flavor.price,
    currency: 'IDR',
    contents: [{
      content_id: contentId,
      id: contentId,
      content_type: 'product',
      content_name: flavor.name,
      price: flavor.price,
      quantity: 1
    }]
  }, {});
}

// Function to track initiate checkout
function trackTikTokInitiateCheckout(orderDetails) {
  if (!orderDetails?.items?.length) return;

  if (window.ttq) {
    ttq.track('InitiateCheckout', {
      contents: orderDetails.items.map(item => ({
        content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
        content_type: 'product',
        content_name: item.item_name,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      value: Number(orderDetails.total),
      currency: 'IDR'
    });
  }
}

function trackTikTokPlaceOrder(orderDetails) {
  const orderId = `order_${Date.now()}`;
  if (window.ttq) {
    ttq.track('PlaceAnOrder', {
      content_id: orderId,
      contents: orderDetails.items.map(item => ({
        content_id: item.id || item.name.toLowerCase().replace(/\s+/g, '_'),
        content_type: 'product',
        content_name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      value: orderDetails.total,
      currency: 'IDR',
      order_id: orderId
    });
  }
}