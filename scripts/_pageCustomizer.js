const productModifier = require('./productModifierModule.js')
const cartRemoval = require('./cartRemovalModule.js')
const cartModifier = require('./cartModifierModule.js')

var href = window.location.href
var path = window.location.pathname

// Initialize item modifier storage if undefined
if (window.localStorage.getItem('itemModifiers') === null) {
    window.localStorage.setItem('itemModifiers',JSON.stringify({}))
}

// Retrieve JSON-T data from current page
if(window.location.href.endsWith('/')){
    var url = href + '?format=json-pretty'
} else {
    var url = href + '/?format=json-pretty'
}

// Handle cart page JSON-T rejection, otherwise, initialize regularly
if(!path.startsWith('/cart')){
    $.getJSON( url, function( data ) {
        initalizePage(data);
    });
} else {
    if(path.startsWith('/cart')){
        // cartModifier.listenForXHR()
        cartRemoval.listenForXHR()
    }
}

// Initialize specific product pages
function initalizePage(data){
    if(path.startsWith('/cakes/') || path.startsWith('/sourdough/') ){
        productModifier.initModifiers(data)
    }
}

// TODO:
// ADD: Pickup and writing info to cart items
// ADD: More form validation for add to cart button
