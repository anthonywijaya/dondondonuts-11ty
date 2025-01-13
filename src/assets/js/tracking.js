// CryptoJS is loaded globally from the CDN
// import CryptoJS from 'crypto-js';

// Initialize Meta Pixel
fbq('init', '1064819841680904');
fbq('track', 'PageView');

// Function to hash data using SHA-256
function hashData(data) {
  return CryptoJS.SHA256(data).toString();
}

// Function to identify user with PII
function identifyUser(user) {
  if (window.ttq) {
    ttq.identify({
      email: user.email ? hashData(user.email) : undefined,
      phone_number: user.phone ? hashData(user.phone) : undefined,
      external_id: user.id ? hashData(user.id) : undefined
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
  
  // Add TikTok tracking
  trackTikTokInitiateCheckout(orderDetails);
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
  gtag('event', 'purchase', {
    'transaction_id': Date.now().toString(),
    'value': orderDetails.total,
    'currency': 'IDR',
    'items': orderDetails.items
  });
  fbq('track', 'Purchase', {
    value: orderDetails.total,
    currency: 'IDR',
  });
  
  // Add TikTok tracking
  trackTikTokPlaceOrder(orderDetails);
}

// Add TikTok tracking functions
function trackTikTokViewContent(flavor) {
  if (window.ttq) {
    ttq.track('ViewContent', {
      contents: [{
        content_id: flavor.id,
        content_type: 'product',
        content_name: flavor.name,
        price: flavor.price
      }],
      currency: 'IDR'
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