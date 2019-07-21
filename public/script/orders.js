let count = 1;

function resetOrder() {
    return {
        productCount : 1,
        totalValueBeforeGST : 0.00,
        totalGST: 0.00,
        sgst: 0.00,
        cgst: 0.00,
        roundOff: 0.00,
        totalBeforeRoundOff: 0.00,
        totalAfterRoundOff: 0.00
    };
};

let order = resetOrder();

function toggleDivDisplay(element, div){
    const displaySettings = document.getElementById(div).style.display;
    let display = "";
    if(displaySettings === "none"){
        display = "block";
    } else {
        display = "none";
    }
    document.getElementById(div).style.display = display;
    if(element.innerHTML.indexOf("+")==0){
        element.innerHTML = element.innerHTML.replace("+", "-");
    } else {
        element.innerHTML = element.innerHTML.replace("-", "+");
    }
}

function setOrderSummaryDisplay(productList){
    order = resetOrder();
    productList.forEach(product => {
        order.sgst += parseFloat(product.sgstAmt);
        order.cgst += parseFloat(product.cgstAmt);
        order.totalGST = (order.sgst + order.cgst);
        order.totalValueBeforeGST = (parseFloat(order.totalValueBeforeGST) + parseFloat(product.qty) * parseFloat(product.rate)).toFixed(2);
        order.totalBeforeRoundOff = (parseFloat(order.totalValueBeforeGST) + order.totalGST).toFixed(2);
        order.totalAfterRoundOff = Math.round(order.totalBeforeRoundOff).toFixed(2);
        order.roundOff = (parseFloat(order.totalAfterRoundOff)-parseFloat(order.totalBeforeRoundOff)).toFixed(2)
    });
    document.getElementById("order_summary").value = JSON.stringify(order);
    document.getElementById("sgst").innerHTML = order.sgst.toFixed(2);
    document.getElementById("cgst").innerHTML = order.cgst.toFixed(2);
    document.getElementById("totalGST").innerHTML = parseFloat(order.totalGST).toFixed(2);
    document.getElementById("totalValueBeforeGST").innerHTML = parseFloat(order.totalValueBeforeGST).toFixed(2);
    document.getElementById("totalAfterRoundOff").innerHTML = parseFloat(order.totalAfterRoundOff).toFixed(2);
    document.getElementById("totalBeforeRoundOff").innerHTML = parseFloat(order.totalBeforeRoundOff).toFixed(2);
    document.getElementById("roundOff").innerHTML = order.roundOff;
}

function removeProduct(count){
    const hsnToRemove = document.getElementById("hsn_"+count).innerHTML;
    document.getElementById('product_'+count).remove();
    const productList = JSON.parse(document.getElementById("productJSON").value);
    const newProductList = productList.filter(product => product.hsn !== hsnToRemove);
    document.getElementById("productJSON").value = JSON.stringify(newProductList);
    setOrderSummaryDisplay(newProductList);
}

function addHTMLString(data, count){
    let htmlString = 
    '<div class ="summary-box" id="product_'+count+'">'+
        '<div id="remove_'+count+'" class="right underline" onClick="removeProduct('+count+');">Remove</div>'+
        '<br><div class="hsn-qty">'+
        '<div class="inline">HSN: <span id="hsn_'+count+'">${HSN}</span></div>'+
        '<div class="inline right">Qty: ${Qty}</div>'+
        '</div><div class="product-details"><div class="product-name">'+
        '<b>${productName}</b></div><div class="inline">'+
        'GST: ${GST}</div><div class="inline right"> Rate:'+
        '${rate}</div></div><br><div class="tax-total"><div>SGST :'+
        '${sgst}</div><div>CSGST: ${cgst}</div><br>'+
        '<div>Total: ${total}</div></div></div>';
    htmlString = htmlString.replace("${HSN}", data.hsn);
    htmlString = htmlString.replace("${productName}", data.productName);
    htmlString = htmlString.replace("${Qty}", data.qty);
    htmlString = htmlString.replace("${GST}", data.gstPercent);
    htmlString = htmlString.replace("${rate}", data.rate);
    htmlString = htmlString.replace("${sgst}", data.sgstAmt);
    htmlString = htmlString.replace("${cgst}", data.cgstAmt);
    htmlString = htmlString.replace("${total}", data.total);
    addProductJSON(data);
    let htmlElement = document.getElementById("productList").innerHTML;
    htmlElement = htmlElement + htmlString;
    document.getElementById("productList").innerHTML = htmlElement;
}

function addProductJSON(product){
    let products = [];
    let productJSON = document.getElementById("productJSON").value;
    if(productJSON === ""){
        products.push(product);
    }else{
        products = JSON.parse(productJSON);
        products.push(product);
    }
    document.getElementById("productJSON").value = JSON.stringify(products);
    setOrderSummaryDisplay(JSON.parse(document.getElementById("productJSON").value));
}

function removeProductFromJSON(productToRemove){
    let productJSON = document.getElementById("productJSON").value;
    let products = productJSON.find(product => {
        return product.hsn !== productToRemove.hsn;
    });
    document.getElementById("productJSON").value = products;
}

function calculateTax(){
    const rate = document.getElementById("rate").value;
    const qty = document.getElementById("qty").value;
    const gstPercent = document.getElementById("gstPercent").value;
    document.getElementById("sgstAmt").value= (qty*rate*((gstPercent/2)/100)).toFixed(2);
    document.getElementById("cgstAmt").value= (qty*rate*((gstPercent/2)/100)).toFixed(2);
    document.getElementById("total").value= (qty*rate*((gstPercent/2)/100)*2 + qty*rate).toFixed(2);
}

function formProductData(){
    const hsn = document.getElementById("hsn").value;
    const productName = document.getElementById("productName").value;
    const qty = document.getElementById("qty").value;
    const rate = document.getElementById("rate").value;
    const gstPercent = document.getElementById("gstPercent").value;
    const cgstAmt = document.getElementById("cgstAmt").value;
    const sgstAmt = document.getElementById("sgstAmt").value;
    const total = document.getElementById("total").value;
    const productData = {
        hsn,
        productName,
        qty,
        rate,
        gstPercent,
        cgstAmt,
        sgstAmt,
        total
    };
    addHTMLString(productData, order.productCount++);
    toggleDivDisplay(document.getElementById('products_add'),'productForm');
}