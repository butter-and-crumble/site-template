(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const productModifier = require('./productModifierModule.js')
const cartRemoval = require('./cartRemovalModule.js')

var href = window.location.href
var path = window.location.pathname

if (window.localStorage.getItem('itemModifiers') === null) {
    window.localStorage.setItem('itemModifiers',JSON.stringify({}))
}

if(window.location.href.endsWith('/')){
    var url = href + '?format=json-pretty'
} else {
    var url = href + '/?format=json-pretty'
}

if(!path.startsWith('/cart')){
    $.getJSON( url, function( data ) {
        initalizePage(data);
    });
} else {
    if(path.startsWith('/cart')){
        cartRemoval.listenForXHR()
    }
}

function initalizePage(data){
    if(path.startsWith('/products/')){
        productModifier.initModifiers(data)
    }

    if(path === '/'){
    }

}

},{"./cartRemovalModule.js":3,"./productModifierModule.js":4}],2:[function(require,module,exports){
var open = window.XMLHttpRequest.prototype.open;
var send = window.XMLHttpRequest.prototype.send;
var dateTimeModifier = { needed:false, value:{} };
var writingModifier = { needed:false, value:{} };
productModifier = { dateTime:null, wrting:null };

function storeProductModifiers(cartItem){
    cartItemID = cartItem.id
    itemModifiers = JSON.parse(window.localStorage.getItem('itemModifiers'))

    productModifier.item = cartItem.itemId
    productModifier.sku = cartItem.chosenVariant.sku

    if(dateTimeModifier.needed){
        productModifier.dateTime = dateTimeModifier.value
    }
    if(writingModifier.needed){
        productModifier.wrting = writingModifier.value
    }
    itemModifiers[cartItemID] = productModifier
    window.localStorage.setItem('itemModifiers',JSON.stringify(itemModifiers))
}

module.exports = {
    setDateTimeModifier(needed,value){
        dateTimeModifier.needed = needed
        dateTimeModifier.value = value
    },
    setWritingModifier(needed,value){
        writingModifier.needed = needed
        writingModifier.value = value
    },
    listenForXHR() {
        var entriesURL = '/api/commerce/shopping-cart/entries'

        function openReplacement(method, url, async, user, password) {
            this._url = url;
            return open.apply(this, arguments);
        }

        function sendReplacement(data) {
            if(this.onreadystatechange) {
                this._onreadystatechange = this.onreadystatechange;
            }

            this.onreadystatechange = onReadyStateChangeReplacement;
            return send.apply(this, arguments);
        }

        function onReadyStateChangeReplacement() {
            if(
                this._url.startsWith(entriesURL) &&
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

        window.XMLHttpRequest.prototype.open = openReplacement;
        window.XMLHttpRequest.prototype.send = sendReplacement;
    },
}



// ID from Entry: 5f5166a7ee9c5051818f00c9
// Cart Item ID:  5f5166a7ee9c5051818f00c9

},{}],3:[function(require,module,exports){
var open = window.XMLHttpRequest.prototype.open;
var send = window.XMLHttpRequest.prototype.send;

function removeProductModifier(itemID){
    itemModifiers = JSON.parse(window.localStorage.getItem('itemModifiers'))

    if (itemID in itemModifiers) {
        delete itemModifiers[itemID]
    }

    window.localStorage.setItem('itemModifiers',JSON.stringify(itemModifiers))
}

module.exports = {

    listenForXHR() {
        var entriesURL = '/api/commerce/cart/items/'

        function openReplacement(method, url, async, user, password) {
            this._url = url;
            this._method = method;
            return open.apply(this, arguments);
        }

        function sendReplacement(data) {
            if(this.onreadystatechange) {
                this._onreadystatechange = this.onreadystatechange;
            }

            this.onreadystatechange = onReadyStateChangeReplacement;
            return send.apply(this, arguments);
        }

        function onReadyStateChangeReplacement() {
            if(
                this._url.startsWith(entriesURL) &&
                this.status === 200 &&
                this.readyState === 4 &&
                this._method === "DELETE"
            ){
                cartItemID = this._url.replace(entriesURL,'')
                removeProductModifier(cartItemID)
            }

            if(this._onreadystatechange) {
                return this._onreadystatechange.apply(this, arguments);
            }
        }

        window.XMLHttpRequest.prototype.open = openReplacement;
        window.XMLHttpRequest.prototype.send = sendReplacement;
    },
}

},{}],4:[function(require,module,exports){
const cartEntry = require('./cartEntryModule.js')

var needsDateTime = false;
var needsWriting = false;
var hasValidDateTime = false;
var hasValidWriting = false;
var blackoutDate;

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

function setTimePicker(day){
    timeConfig = {
        onOpen: function(){
            console.log("Date Open!")
            document.getElementsByClassName('flatpickr-hour')[0].type = 'tel'
            document.getElementsByClassName('flatpickr-minute')[0].type = 'tel'
        },
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

function createDateConfig(blackoutDate){
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
                return (date.getDay() === 0 || date < blackoutDate);
            }
        ],
        "locale": {
            "firstDayOfWeek": 0
        }
    }
}

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

function validatePickup(){
    var dateValue = $('#date-picker').val()
    var timeValue = $('#time-picker').val()
    hasValidDateTime = !(dateValue === '' || timeValue === '')
    cartEntry.setDateTimeModifier(needsDateTime,{date: dateValue, time:timeValue})
    toggleCartButtonFunction()
}

function trackWritingChange(){
    $(document).ready(function(){
        selector = document.getElementsByClassName('variant-select-wrapper')[0].children[0]
        $(selector).change(function(){
            selection = $(this).children("option:selected").val()
            if(selection == "Custom Writing") {
                needsWriting = true
                toggleCartButtonFunction()
                $('#writing-field').change(function(){
                    validateWriting()
                })
                $('#custom-writing-header').show()
                $('#writing-field').show()
            } else {
                needsWriting = false
                toggleCartButtonFunction()
                cartEntry.setWritingModifier(needsWriting, null)
                $('#custom-writing-header').hide()
                $('#writing-field').hide()
            }
        });
    });
}

function validateWriting(){
    var writingValue = $('#writing-field').val()
    hasValidWriting = writingValue !== ''
    cartEntry.setWritingModifier(needsWriting, writingValue)
    toggleCartButtonFunction()
}

function toggleCartButtonFunction(){
    if(needsDateTime && needsWriting && hasValidDateTime && hasValidWriting){
        $('.sqs-add-to-cart-button')[0].classList.remove('disabled-cart-button')
        $('.sqs-add-to-cart-button-inner').text('Add To Cart')
    } else if (needsDateTime && !needsWriting && hasValidDateTime){
        $('.sqs-add-to-cart-button')[0].classList.remove('disabled-cart-button')
        $('.sqs-add-to-cart-button-inner').text('Add To Cart')
    } else if (!needsDateTime && needsWriting && hasValidWriting) {
        $('.sqs-add-to-cart-button')[0].classList.remove('disabled-cart-button')
        $('.sqs-add-to-cart-button-inner').text('Add To Cart')
    } else {
        $('.sqs-add-to-cart-button')[0].classList.add('disabled-cart-button')
        $('.sqs-add-to-cart-button-inner').text('Complete Details')
    }
}

async function setInventoryDateTime(itemID){
    try {
        var db = firebase.firestore();
        var docRef = db.collection("blackouts").doc(itemID);

        docRef.get().then(function(doc) {
            if (doc.exists) {
                dateConfig = createDateConfig(doc.data().date.toDate())
                flatpickr("#date-picker", dateConfig);
            } else {
                cutOff = new Date()
                cutOff.setDate(cutOff.getDate() + 1);
                dateConfig = createDateConfig(cutOff)
                flatpickr("#date-picker", dateConfig);

            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
    } catch(e) {
        console.log(e.message)
    }
}



module.exports = {
    initModifiers(data){
        try {
            $(document).ready(function(){
                console.log(data)
                productTags = data.item.tags
                if(productTags.includes('scheduler') || productTags.includes('writable')){
                    $('.sqs-add-to-cart-button')[0].classList.add('disabled-cart-button')
                    cartEntry.listenForXHR(data.item)
                }
                if (productTags.includes('scheduler')) {
                    $( '<div class="custom-input-header">Select Pickup Date</div>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    $( '<input id="date-picker" class="custom-input" readonly="readonly" placeholder="Date..."></input>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    $( '<input id="time-picker" class="custom-input" readonly="readonly" placeholder="Time..."></input>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    setInventoryDateTime(data.item.id)
                    needsDateTime = true
                    toggleCartButtonFunction()
                    trackDateTimeChange()
                }

                if (productTags.includes('writable')) {
                    $( '<div id="custom-writing-header" class="custom-input-header">Chocolate Writing</div>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    $( '<textarea id="writing-field" class="custom-input"></textarea>').insertBefore( ".sqs-add-to-cart-button-wrapper" );
                    $('#custom-writing-header').hide()
                    $('#writing-field').hide()
                    toggleCartButtonFunction()
                    trackWritingChange()
                }
            })
        } catch(e) {
            console.log(e.message)
        }
    }
}

},{"./cartEntryModule.js":2}]},{},[1]);
