(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./cartModifierModule.js":3,"./cartRemovalModule.js":4,"./productModifierModule.js":5}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var open = window.XMLHttpRequest.prototype.open;
var send = window.XMLHttpRequest.prototype.send;
const shoppingCart = '/api/commerce/cart/items/'

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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
const cartEntry = require('./cartEntryModule.js')

//// Scheduling Modification
var needsDateTime = false;
var hasValidDateTime = false;

// Pickup time availability by day of the week
const timeAvailability = [
    //Sunday
    {},
    // Monday
    {min:"8:00", max:"15:00"},
    // Tuesday
    {min:"8:00", max:"15:00"},
    // Wedneday
    {min:"8:00", max:"15:00"},
    // Thursday
    {min:"8:00", max:"15:00"},
    // Friday
    {min:"8:00", max:"15:00"},
    // Saturday
    {min:"8:00", max:"11:00"},
]

// Create time flatpickr with time availability
function setTimePicker(day){
    timeConfig = {
        disableMobile: true,
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        minTime: timeAvailability[day].min,
        maxTime: timeAvailability[day].max,
        defaultDate: "11:00"
    }
    flatpickr("#time-picker", timeConfig);
}

// Create date flatpickr with blackout dates from admin dashboard
function createDateConfig(blackout){
    const blackoutStart = new Date(blackout.start.seconds * 1000)
    const blackoutEnd = new Date(blackout.end.seconds * 1000)
    return {
        onChange: function(selectedDates, dateStr, instance) {
            $('#time-picker').val('')
            setTimePicker(selectedDates[0].getDay())
        },
        altInput: true,
        altFormat: "F j, Y",
        dateFormat: "Y-m-d",
        disableMobile: true,
        "disable": [
            function(date) {
                return (
                    date.getDay() === 0 ||
                    (date >= blackoutStart && date <= blackoutEnd) ||
                    date < new Date().addDays(-1)
                )
            }
        ],
        "locale": {
            "firstDayOfWeek": 0
        }
    }
}


// Trigger validation event on date or time change
function trackDateTimeChange(){
    $(document).ready(function(){
        $('#date-picker').change(function(){
            validatePickup()
        })
        $('#time-picker').change(function(){
            validatePickup()
        })
    })
}

// Ensure date and time are non-empty and push changes to cartEntry
// Toggles cart button class based on validation
function validatePickup(){
    var dateValue = $('#date-picker').val()
    var timeValue = $('#time-picker').val()
    hasValidDateTime = !(dateValue === '' || timeValue === '')
    cartEntry.productModifier.dateTime.needed = needsDateTime
    cartEntry.productModifier.dateTime.value = {
        date: dateValue,
        time: timeValue
    }
    toggleSchedulingClass()
}

// Get inventory blackout date from item id
// If no blackout date, use current day plus one
async function setInventoryDateTime(itemID){
    try {
        var db = firebase.firestore();
        var docRef = db.collection("blackouts").doc(itemID);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                dateConfig = createDateConfig(doc.data())
                flatpickr("#date-picker", dateConfig);
            } else {
                noBlackout = {
                    start: new Date().addDays(-1).getTime(),
                    end: new Date().addDays(-1).getTime()
                }
                dateConfig = createDateConfig(noBlackout)
                flatpickr("#date-picker", dateConfig);

            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    } catch(e) {
        console.log(e.message)
    }
}

// Change add to cart button styling based on scheduling input validation
function toggleSchedulingClass(){
    if(needsDateTime && hasValidDateTime || !needsDateTime){
        $('.sqs-add-to-cart-button').removeClass('needs-scheduling')
        $('.sqs-add-to-cart-button-inner').text('Add To Cart')
    } else {
        $('.sqs-add-to-cart-button').addClass('needs-scheduling')
        $('.sqs-add-to-cart-button-inner').text('Complete Details')
    }
}

//// Writing Modification
var needsWriting = false;
var hasValidWriting = false;

// Trigger validation event on writing field changes
// This is based on writing option being selected
function trackWritingChange(){
    $(document).ready(function(){
        $("select[data-variant-option-name='Chocolate Writing']").change(function(){
            option = $(this).children("option:selected").val()
            if(option == "Custom Writing") {
                needsWriting = true
                toggleWritingClass()
                $('#writing-field').change(function(){
                    validateWriting()
                })
                $('#custom-writing-header').show()
                $('#writing-field').show()
            } else {
                needsWriting = false
                toggleWritingClass()
                cartEntry.productModifier.writing.needed = needsWriting
                cartEntry.productModifier.writing.value = null
                $('#custom-writing-header').hide()
                $('#writing-field').hide()
            }
        });
    });
}

// Ensure writing field is non-empty and push changes to cartEntry
// Toggles cart button class based on validation
function validateWriting(){
    var writingValue = $('#writing-field').val()
    hasValidWriting = writingValue !== ''
    cartEntry.productModifier.writing.needed = needsWriting
    cartEntry.productModifier.writing.value = writingValue
    toggleWritingClass()
}

// Change add to cart button styling based on writing input validation
function toggleWritingClass(){
    if(needsWriting && hasValidWriting || !needsWriting){
        $('.sqs-add-to-cart-button').removeClass('needs-writing')
        $('.sqs-add-to-cart-button-inner').text('Add To Cart')
    } else {
        $('.sqs-add-to-cart-button').addClass('needs-writing')
        $('.sqs-add-to-cart-button-inner').text('Complete Details')
    }
}

module.exports = {
    // Initialize product modifiers based on scheduler and writinng tags
    initModifiers(data){
        try {
            $(document).ready(function(){
                productTags = data.item.tags
                if(productTags.includes('scheduler') || productTags.includes('writable')){
                    cartEntry.listenForXHR(data.item)
                }
                // If product has scheduler tag, add date and time flatpickr
                // pull blackout date from firebase
                if (productTags.includes('scheduler')) {
                    $('.sqs-add-to-cart-button').addClass('needs-scheduling')
                    $( '<div class="custom-input-header">Select Pickup Date</div>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    $( '<input id="date-picker" class="custom-input" readonly="readonly" placeholder="Date..."></input>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    $( '<input id="time-picker" class="custom-input" readonly="readonly" placeholder="Time..."></input>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    setInventoryDateTime(data.item.id)
                    needsDateTime = true
                    toggleSchedulingClass()
                    trackDateTimeChange()
                }
                // If product has writing tag, add writing text field
                if (productTags.includes('writable')) {
                    $('.sqs-add-to-cart-button')[0].classList.add('needs-writing')
                    writingSelector = $('.variant-option').has("[data-variant-option-name='Chocolate Writing']")
                    $( '<textarea placeholder="Enter Writing..." id="writing-field" class="custom-input"></textarea>').insertAfter(writingSelector);
                    $('#custom-writing-header').hide()
                    $('#writing-field').hide()
                    toggleWritingClass()
                    trackWritingChange()
                }
            })
        } catch(e) {
            console.log(e.message)
        }
    }
}

},{"./cartEntryModule.js":2}]},{},[1]);
