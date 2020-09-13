var open = window.XMLHttpRequest.prototype.open;
var send = window.XMLHttpRequest.prototype.send;
const removalURL = '/api/commerce/cart/items/'

// Remove product modifiers of specific cart item, based on cart item ID
function removeProductModifier(itemID){
    itemModifiers = JSON.parse(window.localStorage.getItem('itemModifiers'))

    if (itemID in itemModifiers) {
        delete itemModifiers[itemID]
    }

    window.localStorage.setItem('itemModifiers',JSON.stringify(itemModifiers))
}

// Retrieve URL and method from XHR, to be used for cart item identification
function openReplacement(method, url, async, user, password) {
    this._url = url;
    this._method = method;
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

// Send cart item id of object to be removed
function onReadyStateChangeReplacement() {
    if(
        this._url.startsWith(removalURL) &&
        this.status === 200 &&
        this.readyState === 4 &&
        this._method === "DELETE"
    ){
        cartItemID = this._url.replace(removalURL,'')
        removeProductModifier(cartItemID)
    }

    if(this._onreadystatechange) {
        return this._onreadystatechange.apply(this, arguments);
    }
}

module.exports = {
    listenForXHR() {
        window.XMLHttpRequest.prototype.open = openReplacement;
        window.XMLHttpRequest.prototype.send = sendReplacement;
    },
}
