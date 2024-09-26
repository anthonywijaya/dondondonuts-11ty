   // Function to track form start
   function trackFormStart() {
    gtag('event', 'form_start', {
      'event_category': 'Engagement',
      'event_label': 'Order Form'
    });
    fbq('trackCustom', 'FormStart', {formName: 'Order Form'});
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
  }