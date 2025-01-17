// For event deduplication
const sentEvents = new Set();

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

// Helper function to get common Meta parameters
function getMetaCommonParams(userData = {}) {
  return {
    action_source: 'website',
    event_source_url: window.location.href,
    event_time: Math.floor(Date.now() / 1000),
    user_data: {
      client_user_agent: navigator.userAgent,
      first_name: userData.firstName || undefined,
      last_name: userData.lastName || undefined,
      phone: userData.phone || undefined,
      client_ip_address: undefined, // This will be set server-side
      external_id: userData.external_id || getPersistentUserId(),
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc')
    }
  };
}

// Debug configuration
const DEBUG_MODE = {
  enabled: false,
  logPixel: true,    // Log pixel events
  logServer: true,   // Log server events
  logDedup: true,    // Log deduplication info
  logErrors: true    // Log validation errors
};

// Debug logging utility
function logTracking(platform, type, eventName, data) {
  if (!DEBUG_MODE.enabled) return;

  const timestamp = new Date().toISOString();
  const logStyles = {
    Meta: 'color: #0866FF', // Meta blue
    TikTok: 'color: #000000', // TikTok black
    error: 'color: #FF0000',
    dedup: 'color: #9B59B6',
    pixel: 'color: #27AE60',
    server: 'color: #E67E22'
  };

  console.groupCollapsed(
    `%c[${platform}] ${type} - ${eventName} (${timestamp})`,
    logStyles[platform]
  );
  
  switch (type) {
    case 'pixel':
      DEBUG_MODE.logPixel && console.log('Pixel Data:', data);
      break;
    case 'server':
      DEBUG_MODE.logServer && console.log('Server Event:', data);
      break;
    case 'dedup':
      DEBUG_MODE.logDedup && console.log('Deduplication:', data);
      break;
    case 'error':
      DEBUG_MODE.logErrors && console.error('Error:', data);
      break;
  }
  
  console.groupEnd();
}

// Track product view events
function trackProductView(product, userData = {}) {
  // Validate input
  if (!product?.name || !product?.price) {
    logTracking('Meta', 'error', 'ViewContent', {
      message: 'Invalid product data',
      product
    });
    return;
  }

  // Check if product has been viewed this session
  const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '{}');
  const contentId = product.name.toLowerCase().replace(/\s+/g, '_');
  
  if (viewedProducts[contentId]) {
    return; // Skip if already viewed in this session
  }

  // Mark product as viewed
  viewedProducts[contentId] = Date.now();
  localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts));

  // TikTok Pixel
  if (window.ttq) {
    ttq.track('ViewContent', {
      contents: [{
        content_id: contentId,
        content_type: 'product',
        content_name: product.name,
        price: Number(product.price)
      }]
    });
  }

  // Meta Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', 'ViewContent', {
      ...getMetaCommonParams(userData),
      content_type: 'product',
      content_id: product.name.toLowerCase().replace(/\s+/g, '_'),
      content_name: product.name,
      value: Number(product.price),
      currency: 'IDR'
    });
  }

  // TikTok Server Event
  sendServerEvent('tiktok', 'ViewContent', {
    content_type: 'product',
    content_id: contentId,
    content_name: product.name,
    value: Number(product.price),
    currency: 'IDR',
    contents: [{
      content_id: contentId,
      content_type: 'product',
      content_name: product.name,
      price: Number(product.price),
      quantity: 1
    }]
  }, {});

  // Meta Server Event
  sendServerEvent('meta', 'ViewContent', {
    ...getMetaCommonParams(userData),
    content_type: 'product',
    content_id: product.name.toLowerCase().replace(/\s+/g, '_'),
    content_name: product.name,
    value: Number(product.price),
    currency: 'IDR'
  });
}

// Track checkout initiation
function trackInitiateCheckout(orderDetails, userData = {}) {
  // Validate input and prevent duplicate events
  if (!orderDetails?.items?.length || hasInitiatedCheckout) {
    return;
  }

  hasInitiatedCheckout = true;
  const eventId = `checkout_${Date.now()}`;
  const total = Number(orderDetails.total);

  // TikTok Pixel
  if (window.ttq) {
    ttq.track('InitiateCheckout', {
      contents: orderDetails.items.map(item => ({
        content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
        content_type: 'product',
        content_name: item.item_name,
        quantity: Number(item.quantity),
        price: Number(item.price)
      })),
      value: total,
      currency: 'IDR'
    });
  }

  // Meta Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', 'InitiateCheckout', {
      ...getMetaCommonParams(userData),
      content_type: 'product',
      contents: orderDetails.items.map(item => ({
        id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
        quantity: Number(item.quantity),
        item_price: Number(item.price)
      })),
      value: Number(orderDetails.total),
      currency: 'IDR'
    });
  }

  // Google Analytics
  gtag('event', 'begin_checkout', {
    currency: 'IDR',
    value: total,
    items: orderDetails.items.map(item => ({
      item_name: item.item_name,
      quantity: Number(item.quantity),
      price: Number(item.price)
    }))
  });

  // TikTok Server Event
  sendServerEvent('tiktok', 'InitiateCheckout', {
    content_type: 'product',
    contents: orderDetails.items.map(item => ({
      content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      content_type: 'product',
      content_name: item.item_name,
      quantity: Number(item.quantity),
      price: Number(item.price)
    })),
    value: total,
    currency: 'IDR'
  }, {});

  // Meta Server Event
  sendServerEvent('meta', 'InitiateCheckout', {
    ...getMetaCommonParams(userData),
    content_type: 'product',
    contents: orderDetails.items.map(item => ({
      id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      quantity: Number(item.quantity),
      item_price: Number(item.price)
    })),
    value: Number(orderDetails.total),
    currency: 'IDR'
  });
}

// Track form start
function trackFormStart(userData = {}) {
  if (typeof fbq !== 'undefined') {
    fbq('trackCustom', 'FormStart', {
      ...getMetaCommonParams(userData),
      formName: 'Order Form'
    });
  }

  sendServerEvent('meta', 'FormStart', {
    ...getMetaCommonParams(userData),
    formName: 'Order Form'
  });
}

// // Track purchase
// function trackPurchase(orderDetails, userData = {}) {
//   const eventId = `order_${Date.now()}`;

//   if (typeof fbq !== 'undefined') {
//     fbq('track', 'Purchase', {
//       ...getMetaCommonParams(userData),
//       content_type: 'product',
//       contents: orderDetails.items.map(item => ({
//         id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
//         quantity: Number(item.quantity),
//         item_price: Number(item.price)
//       })),
//       content_ids: orderDetails.items.map(item => 
//         item.item_name.toLowerCase().replace(/\s+/g, '_')
//       ),
//       value: Number(orderDetails.total),
//       currency: 'IDR',
//       event_id: eventId
//     });
//   }

//   sendServerEvent('meta', 'Purchase', {
//     ...getMetaCommonParams(userData),
//     content_type: 'product',
//     contents: orderDetails.items.map(item => ({
//       id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
//       quantity: Number(item.quantity),
//       item_price: Number(item.price)
//     })),
//     content_ids: orderDetails.items.map(item => 
//       item.item_name.toLowerCase().replace(/\s+/g, '_')
//     ),
//     value: Number(orderDetails.total),
//     currency: 'IDR',
//     event_id: eventId
//   });
// }

// Function to track order submission
function trackOrderSubmission(orderDetails) {
  if (!orderDetails?.items?.length) return;

  const userData = {
    phone: orderDetails.phone
  };

  // Meta event data
  const metaEventData = {
    ...getMetaCommonParams(userData),
    content_type: 'product',
    contents: orderDetails.items.map(item => ({
      id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      quantity: Number(item.quantity),
      item_price: Number(item.price)
    })),
    content_ids: orderDetails.items.map(item => 
      item.item_name.toLowerCase().replace(/\s+/g, '_')
    ),
    value: Number(orderDetails.total),
    currency: 'IDR'
  };

  // TikTok event data
  const tiktokEventData = {
    contents: orderDetails.items.map(item => ({
      content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      content_type: 'product',
      content_name: item.item_name,
      quantity: Number(item.quantity),
      price: Number(item.price)
    })),
    value: Number(orderDetails.total),
    currency: 'IDR'
  };

  // Track with deduplication
  trackMetaEvent('Purchase', metaEventData);
  trackTikTokEvent('PlaceAnOrder', tiktokEventData);

  // Google Analytics (no deduplication needed as it's only client-side)
  if (typeof gtag === 'function') {
    gtag('event', 'purchase', {
      transaction_id: `ga_${Date.now()}`,
      value: Number(orderDetails.total),
      currency: 'IDR',
      items: orderDetails.items.map(item => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        price: Number(item.price)
      }))
    });
  }
}

// Helper function for deduplication
function trackMetaEvent(eventName, eventData, shouldSendServer = true) {
  const eventId = `meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const eventKey = `${eventName}_${eventId}`;

  // Log deduplication check
  logTracking('Meta', 'dedup', eventName, {
    eventKey,
    isDuplicate: sentEvents.has(eventKey)
  });

  if (sentEvents.has(eventKey)) {
    return;
  }

  sentEvents.add(eventKey);

  // Client-side pixel
  if (typeof fbq !== 'undefined') {
    const pixelData = {
      ...eventData,
      event_id: eventId
    };
    logTracking('Meta', 'pixel', eventName, pixelData);
    fbq('track', eventName, pixelData);
  }

  // Server-side event
  if (shouldSendServer) {
    const serverData = {
      ...eventData,
      event_id: eventId
    };
    logTracking('Meta', 'server', eventName, serverData);
    sendServerEvent('meta', eventName, serverData);
  }

  setTimeout(() => {
    sentEvents.delete(eventKey);
    logTracking('Meta', 'dedup', eventName, {
      message: 'Event cleared from deduplication cache',
      eventKey
    });
  }, 3600000);
}

// Helper function for TikTok deduplication
function trackTikTokEvent(eventName, eventData, shouldSendServer = true) {
  const eventId = `tiktok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const eventKey = `${eventName}_${eventId}`;

  // Log deduplication check
  logTracking('TikTok', 'dedup', eventName, {
    eventKey,
    isDuplicate: sentEvents.has(eventKey)
  });

  if (sentEvents.has(eventKey)) {
    return;
  }

  sentEvents.add(eventKey);

  // Client-side pixel
  if (window.ttq) {
    const pixelData = {
      ...eventData,
      event_id: eventId
    };
    logTracking('TikTok', 'pixel', eventName, pixelData);
    ttq.track(eventName, pixelData);
  }

  // Server-side event
  if (shouldSendServer) {
    const serverData = {
      ...eventData,
      event_id: eventId
    };
    logTracking('TikTok', 'server', eventName, serverData);
    sendServerEvent('tiktok', eventName, serverData);
  }

  setTimeout(() => {
    sentEvents.delete(eventKey);
    logTracking('TikTok', 'dedup', eventName, {
      message: 'Event cleared from deduplication cache',
      eventKey
    });
  }, 3600000);
}

// Add debug controls to window for easy toggling
window.debugTracking = {
  enable: () => {
    DEBUG_MODE.enabled = true;
    console.log('🔍 Tracking debug mode enabled');
  },
  disable: () => {
    DEBUG_MODE.enabled = false;
    console.log('🔍 Tracking debug mode disabled');
  },
  setOptions: (options) => {
    Object.assign(DEBUG_MODE, options);
    console.log('🔧 Debug options updated:', DEBUG_MODE);
  }
};