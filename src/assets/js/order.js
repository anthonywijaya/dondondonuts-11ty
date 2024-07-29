function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const productPrices = [
    {name: "Glazed", price: 10000},
    {name: "Powder Sugar", price: 10000},
    {name: "Meses", price: 12000},
    {name: "Cheddar", price: 12000},
    {name: "Vanilla Milk", price: 12000},
    {name: "Cocoa Milk", price: 12000},
    {name: "Vanilla Cream", price: 15000},
    {name: "Cocoa Cream", price: 15000},
    {name: "Pistachio Cream", price: 18000},
    // Add other products as needed
];


const discountPrices = [
    { threshold: 6, discount: 10000 },
    { threshold: 12, discount: 25000 }
];

// function calculateDiscount(totalQuantity) {
//     let discount = 0;
//     discountPrices.forEach(d => {
//         if (totalQuantity >= d.threshold) {
//             discount += d.discount * Math.floor(totalQuantity / d.threshold);
//             totalQuantity %= d.threshold;
//         }
//     });
//     return discount;
// }

function calculateDiscount(totalQuantity) {
    let discount = 0;
    discountPrices.sort((a, b) => b.threshold - a.threshold); // Sort descending by threshold

    for (let d of discountPrices) {
        if (totalQuantity >= d.threshold) {
            discount += d.discount * Math.floor(totalQuantity / d.threshold);
            totalQuantity %= d.threshold;
        }
    }
    return discount;
}


function getSimilarity(a, b) {
    let cost = [];
    let m = a.length;
    let n = b.length;

    if (m == 0) return n;
    if (n == 0) return m;

    for (let i = 0; i <= m; i++) {
        cost[i] = [];
        cost[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
        cost[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            let substitutionCost;
            if (a[i - 1] == b[j - 1]) {
                substitutionCost = 0;
            } else {
                substitutionCost = 1;
            }
            cost[i][j] = Math.min(
                cost[i - 1][j] + 1,
                cost[i][j - 1] + 1,
                cost[i - 1][j - 1] + substitutionCost
            );
        }
    }

    return cost[m][n];
}

function findClosestProduct(name) {
    let closestProduct = null;
    let minDistance = Infinity;

    for (let product of productPrices) {
        let distance = getSimilarity(name.toLowerCase(), product.name.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closestProduct = product;
        }
    }

    return closestProduct;
}

function parseDate(dateStr) {
    const months = {
        "january": "Januari", "february": "Februari", "march": "Maret", "april": "April", "may": "Mei", "june": "Juni",
        "july": "Juli", "august": "Agustus", "september": "September", "october": "Oktober", "november": "November", "december": "Desember",
        "jan": "Januari", "feb": "Februari", "mar": "Maret", "apr": "April", "jun": "Juni", "jul": "Juli", "aug": "Agustus", "sep": "September", "oct": "Oktober", "nov": "November", "dec": "Desember",
        "januari": "Januari", "februari": "Februari", "maret": "Maret", "mei": "Mei", "juni": "Juni", "juli": "Juli", "agustus": "Agustus",
         "oktober": "Oktober", "desember": "Desember",
    };

    dateStr = dateStr.toLowerCase().replace(/,/g, '').trim();
    let day, month, year;

    const parts = dateStr.split(' ');

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!isNaN(part)) {
            if (day === undefined) {
                day = parseInt(part, 10);
            } else {
                year = parseInt(part, 10);
            }
        } else if (months[part]) {
            month = months[part];
        }
    }

    if (!year) {
        year = new Date().getFullYear();
    }

    return `${String(day).padStart(2, '0')} ${String(month)} ${year}`;
}

function parseOrderText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const receiverName = lines[0].split(':')[1].trim();
    const phoneNumber = lines[1].split(':')[1].trim();
    const deliveryDateStr = lines[2].split(':')[1].trim();
    const deliveryDate = parseDate(deliveryDateStr);
    const orderLines = lines.slice(4); // Skip to the order items

    const order = orderLines.map(line => {
        let count = 1; // Default count
        let name = line;
        let notes = "";

        // Check if line contains a count at the beginning or end
        if (line.match(/^(\d+)\s/)) {
            // Count at the beginning
            const match = line.match(/^(\d+)\s(.+)/);
            count = parseInt(match[1]);
            name = toTitleCase(match[2].trim());
        } else if (line.match(/\s(\d+)$/)) {
            // Count at the end
            const match = line.match(/(.+)\s(\d+)$/);
            count = parseInt(match[2]);
            name = toTitleCase(match[1].trim());
        } else if (line.startsWith('-') || line.match(/^\d*\s?-?\s?/)) {
            // Handle lines starting with '-' or a single number
            name = toTitleCase(line.replace(/^\d*\s?-?\s?/, '').trim());
        }
        // Check for product notes in parentheses
        const noteMatch = name.match(/(.+?)\s*\((.+)\)$/);
        if (noteMatch) {
            name = noteMatch[1].trim();
            notes = noteMatch[2].trim();
        }


        const closestProduct = findClosestProduct(name);
        const price = closestProduct ? closestProduct.price : 0; // Get price from products or default to 0 if not found
        return { name: closestProduct ? closestProduct.name : name, count, price, notes };
    }).filter(item => item.name); // Ensure item has a name

    return { receiverName, phoneNumber, deliveryDate, order };
}
// function parseOrderText(text) {
//     const lines = text.split('\n').map(line => line.trim()).filter(line => line);
//     const receiverName = lines[0].split(':')[1].trim();
//     const phoneNumber = lines[1].split(':')[1].trim();
//     const deliveryDateStr = lines[2].split(':')[1].trim();
//     const deliveryDate = parseDate(deliveryDateStr);
//     const orderLines = lines.slice(4); // Skip the "Pesanan:" line and the empty line

    // const order = orderLines.map(line => {
    //     const match = line.match(/(\d+)\s(.+)/);
    //     if (match) {
    //         const count = parseInt(match[1]);
    //         const name = toTitleCase(match[2].trim());
    //         // Assuming a fixed price for demonstration purposes; update this as needed
    //         let closestProduct = findClosestProduct(name);
    //         const price = productPrices[closestProduct] || 0; // Get price from productPrices or default to 0 if not found
    //         return { name: closestProduct, count, price };
    //     }
    // }).filter(item => item);

    // const order = orderLines.map(line => {
    //     if (line.startsWith('-') || line.match(/1\s.+|.+\s1/)) {
    //         const name = toTitleCase(line.replace('-', '').replace('1', '').trim());
    //         const closestProduct = findClosestProduct(name);
    //         const price = productPrices[closestProduct] || 0; // Get price from products or default to 0 if not found
    //         return { name: closestProduct, count: 1, price };
    //     } else {
    //         const match = line.match(/(\d+)\s(.+)/);
    //         if (match) {
    //             const count = parseInt(match[1]);
    //             const name = toTitleCase(match[2].trim());
    //             const closestProduct = findClosestProduct(name);
    //             const price = productPrices[closestProduct] || 0; // Get price from products or default to 0 if not found
    //             return { name: closestProduct, count, price };
    //         }
    //     }
    // }).filter(item => item);

    // const order = orderLines.map(line => {
    //     let count = 1; // Default count
    //     let name;

    //     // Check if line contains a count at the beginning or end
    //     if (line.match(/^(\d+)\s/)) {
    //         // Count at the beginning
    //         const match = line.match(/^(\d+)\s(.+)/);
    //         count = parseInt(match[1]);
    //         name = toTitleCase(match[2].trim());
    //     } else if (line.match(/\s(\d+)$/)) {
    //         // Count at the end
    //         const match = line.match(/(.+)\s(\d+)$/);
    //         count = parseInt(match[2]);
    //         name = toTitleCase(match[1].trim());
    //     } else if (line.startsWith('-') || line.match(/^\d*\s?-?\s?/)) {
    //         // Handle lines starting with '-' or a single number
    //         name = toTitleCase(line.replace(/^\d*\s?-?\s?/, '').trim());
    //     }

    //     const closestProduct = findClosestProduct(name);
    //     const price = productPrices[closestProduct] || 0; // Get price from products or default to 0 if not found
    //     return { name: closestProduct.name, count, price };
    // }).filter(item => item);
// }