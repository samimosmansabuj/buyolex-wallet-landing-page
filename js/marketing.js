// ==================================================================================================
// *********//////////====Facebook Pixel and Event Tracking Function=====/////////////***************

function FacebookViewContentEvent(productName, productPrice, productIds) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'ViewContent', {
        content_ids: [String(productIds)],
        content_name: productName,
        content_type: 'product',
        value: parseFloat(productPrice || 0),
        currency: 'BDT'
    });
}
function FacebookAddToCartEvent(content_ids, content_name, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'AddToCart', {
        content_ids: [String(content_ids)],
        content_name: content_name,
        content_type: 'product',
        value: value,
        currency: 'BDT'
    });
}
function FacebookInitiateCheckEvent(contents, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'InitiateCheckout', {
        contents: contents,
        content_type: 'product',
        value: Number(value),
        currency: 'BDT'
    });
}
function FacebookPurchaseEvent(contents, value) {
    if (typeof fbq !== 'function') return;
    fbq('track', 'Purchase', {
        value: Number(value),
        currency: 'BDT',
        contents: contents,
        content_type: 'product',
        compared_product: 'recommended-banner-toys',
        delivery_category: 'home_delivery'
    });
}

// *********//////////=========================/////////////***************
// =========================================================================