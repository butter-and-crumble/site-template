var open = window.XMLHttpRequest.prototype.open;
var send = window.XMLHttpRequest.prototype.send;
const entryURL = '/api/commerce/shopping-cart/entries'

// Store product modifiers from date, time, and writing in local object
function storeProductModifiers(cartItem){
    cartItemID = cartItem.id
    itemModifiers = JSON.parse(window.localStorage.getItem('itemModifiers'))

    module.exports.productModifier.item = cartItem.itemId
    module.exports.productModifier.sku = cartItem.chosenVariant.sku

    itemModifiers[cartItemID] = module.exports.productModifier
    window.localStorage.setItem('itemModifiers',JSON.stringify(itemModifiers))
}

// Retrieve URL from XHR, to be used for cart item identification
function openReplacement(method, url, async, user, password) {
    this._url = url;
    return open.apply(this, arguments);
}

// Repalace XHR send with custom ready state change
function sendReplacement(data) {
    if(this.onreadystatechange) {
        this._onreadystatechange = this.onreadystatechange;
    }

    this.onreadystatechange = onReadyStateChangeReplacement;
    return send.apply(this, arguments);
}

// Store cart item info on final ready state
function onReadyStateChangeReplacement() {
    if(
        this._url.startsWith(entryURL) &&
        this.status === 200 &&
        this.readyState === 4
    ){
        cartItem = JSON.parse(this.response).newlyAdded
        storeProductModifiers(cartItem)
    }

    if(this._onreadystatechange) {
        return this._onreadystatechange.apply(this, arguments);
    }
}

module.exports = {
    productModifier: {
        item: null,
        sku: null,
        dateTime: {
            needed: false,
            value: null,
        },
        writing: {
            needed: false,
            value: null,
        }
    },
    listenForXHR() {
        window.XMLHttpRequest.prototype.open = openReplacement;
        window.XMLHttpRequest.prototype.send = sendReplacement;
    },
}
