const robuxWorth = 0.0035;
let currency = "USD";

// TODO: make this a json file or something. maybe in the currency API
const currencySymbol = {
    'AUD': '\u0024', // Australian Dollar
    'USD': '\u0024', // United States Dollar
    'GBP': '\u00A3', // British Pound
    'EUR': '\u20AC', // Euro
    'JPY': '\u00A5', // Japanese Yen
    'CAD': '\u0024', // Canadian Dollar
    'CHF': '\u20A3', // Swiss Franc
    'CNY': '\u00A5', // Chinese Yuan (Renminbi)
    'INR': '\u20B9', // Indian Rupee
    'KRW': '\u20A9', // South Korean Won
    'BRL': '\u0052\u0024', // Brazilian Real (R$)
    'RUB': '\u20BD', // Russian Ruble
    'ZAR': '\u0052', // South African Rand
    'MXN': '\u0024', // Mexican Peso
    'NZD': '\u0024', // New Zealand Dollar
    'SGD': '\u0024', // Singapore Dollar
    'TRY': '\u20BA', // Turkish Lira
    'SEK': '\u006B\u0072', // Swedish Krona (kr)
    'NOK': '\u006B\u0072', // Norwegian Krone (kr)
    'DKK': '\u006B\u0072', // Danish Krone (kr)
};

document.addEventListener('DOMContentLoaded', function () {
    const convertButton = document.getElementById('convert-button');
    const convertCurrencyOption = document.getElementById('convert-currency');
    const output = document.getElementById("convert-output");
    const input = document.getElementById("convert-input");
    const currencyOption = document.getElementById('currency');
    const style = document.getElementById('layout');
    // const decimalEle = document.getElementById('decimal');
    const replaceBalance = document.getElementById('replace');
    const replaceElse = document.getElementById('replace-everything');
    const convertInput = document.getElementById('convert-input');

    let convertCurrency;
    let convertValue;

    populateCurrencyOptions("currency")
    populateCurrencyOptions("convert-currency");

    const checkInterval = setInterval(updateCheckboxes, 100);

    // Initialize currency and style from storage
    function updateCheckboxes() {
        if (replaceBalance && replaceElse) {
            // Elements exist, stop checking and update checkboxes
            clearInterval(checkInterval);

            // Initialize currency and style from storage
            browser.storage.local.get(['currency', 'style', 'decimal', 'replaceBalance', 'replaceElse', 'convertCurrency', 'convertAmount']).then(result => {
                if (currencyOption && convertCurrencyOption) {
                    currencyOption.value = result.currency || "USD";
                    convertCurrencyOption.value = result.convertCurrency || currencyOption.value;
                }

                if (convertInput) {
                    convertInput.value = result.convertAmount || "R$200"
                }

                if (style) {
                    style.value = result.style || "%robux% (%symbol%%worth%)";
                }

                // if (decimalEle) {
                //     decimalEle.value = result.decimal || "3";
                // }

                // Update checkbox states
                replaceBalance.checked = result.replaceBalance !== undefined ? result.replaceBalance : true;
                replaceElse.checked = result.replaceElse !== undefined ? result.replaceElse : true;

                // These dont fire unless put here :)
                replaceBalance.addEventListener('change', function () {
                    browser.storage.local.set({ 'replaceBalance': this.checked });
                });

                replaceElse.addEventListener('change', function () {
                    browser.storage.local.set({ 'replaceElse': this.checked });
                });

                convertInput.addEventListener('change', function () {
                    browser.storage.local.set({ 'convertAmount': this.value });
                });

                convertCurrencyOption.addEventListener('change', function () {
                    const newValue = convertCurrencyOption.value;
                    browser.storage.local.set({ 'convertCurrency': newValue });
                });
            }).catch(error => {
                console.error("Error retrieving data from storage:", error);
            });
        }
    }

    // Convert button click event
    convertButton.addEventListener('click', async function () {
        const convertCurrencyValue = convertCurrencyOption.value;

        if (convertCurrency !== convertCurrencyValue) {
            await fetchNewData().then(data => {
                convertValue = data[convertCurrencyValue.toLowerCase()];
                convertCurrency = convertCurrencyValue;
            })
        }

        const inputValue = input.value.replace(/[^0-9]/g, '');
        const round = Math.pow(10, 3);
        const formattedValue = Math.round(inputValue.toString().replace(/[^0-9]/g, '') * robuxWorth * round * convertValue) / round;
        output.value = `Worth: ${currencySymbol[convertCurrencyValue]}${formattedValue}`;
    });

    // Currency type change event
    currencyOption.addEventListener('change', function () {
        const newCurrency = currencyOption.value;
        browser.storage.local.set({ 'currency': newCurrency, 'value': -1 });
        currency = newCurrency;
    });

    // Style change event
    style.addEventListener('change', function () {
        const newStyle = style.value;
        browser.storage.local.set({ 'style': newStyle });
    });

    // Decimal change event
    // decimalEle.addEventListener('change', function () {
    //     const newDecimal = decimalEle.value;
    //     browser.storage.local.set({ 'decimal': newDecimal });
    // });
});

function populateCurrencyOptions(element) {
    const selectElement = document.getElementById(element);

    for (const [currencyCode, symbol] of Object.entries(currencySymbol)) {
        const option = document.createElement('option');
        option.value = currencyCode;
        option.textContent = `${currencyCode} (${symbol})`;
        selectElement.appendChild(option);
    }
}

async function fetchNewData() {
    const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json');
    if (!response.ok) alert(response.status)
    const data = await response.json();
    return data.usd;
}