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

// Function to track form start
function trackFormStart() {
  gtag('event', 'form_start', {
    'event_category': 'Engagement',
    'event_label': 'Order Form'
  });
  fbq('trackCustom', 'FormStart', {formName: 'Order Form'});
  
  if (window.ttq) {
    ttq.track('StartCheckout');
  }
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

  // Meta Pixel
  fbq('track', 'Purchase', {
    value: orderDetails.total,
    currency: 'IDR',
    content_type: 'product',
    contents: orderDetails.items.map(item => ({
      id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
      quantity: item.quantity,
      price: item.price
    })),
    content_ids: orderDetails.items.map(item => item.item_name.toLowerCase().replace(/\s+/g, '_')),
    user_data: {
      external_id: persistentUserId
    }
  });
  
  // TikTok
  if (window.ttq) {
    ttq.track('PlaceAnOrder', {
      contents: orderDetails.items.map(item => ({
        content_id: item.item_name.toLowerCase().replace(/\s+/g, '_'),
        content_type: 'product',
        content_name: item.item_name,
        quantity: item.quantity,
        price: item.price
      })),
      value: orderDetails.total,
      currency: 'IDR',
      order_id: eventId
    });
  }
}

// Add TikTok tracking functions
function trackTikTokViewContent(flavor) {
  const contentId = flavor.name.toLowerCase().replace(/\s+/g, '_');
  
  // Meta Pixel
  fbq('track', 'ViewContent', {
    content_type: 'product',
    content_ids: [contentId],
    content_name: flavor.name,
    value: flavor.price,
    currency: 'IDR'
  });

  // TikTok
  if (window.ttq) {
    ttq.track('ViewContent', {
      contents: [{
        content_id: contentId,
        content_type: 'product',
        content_name: flavor.name,
        price: flavor.price
      }],
      currency: 'IDR',
      value: flavor.price
    });
  }
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