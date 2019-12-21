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
let productCount = order.productCount;

function printUrl(orderNumber){
    const url = location.href + "/print?orderNumber=" + orderNumber;
    location.href = url;
}

function toggleDivDisplay(div){
    const displaySettings = document.getElementById(div).style.display;
    let display = "";
    if(displaySettings === "none"){
        display = "block";
    } else {
        display = "none";
    }
    document.getElementById(div).style.display = display;
}

function setOrderSummaryDisplay(productList){
    order = resetOrder();
    order.productCount = productCount;
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

function editProduct(count){
    resetProductForm();
    const hsn  = document.getElementById("hsn_"+count).innerHTML;
    const qty  = document.getElementById("qty_"+count).innerHTML;
    const productName = document.getElementById("name_"+count).innerHTML;
    const rate = document.getElementById("rate_"+count).innerHTML;
    document.getElementById("hsn").value = hsn;
    document.getElementById("productName").value = productName;
    document.getElementById("qty").value = qty;
    document.getElementById("rate").value = rate;
    document.getElementById("serial").value = count;
    document.getElementById('edit').style.display = "block";
    document.getElementById('add').style.display = "none";
    togglePlus('products_add');
    toggleDivDisplay('productForm');
    document.getElementById("rate").focus();
}

function addHTMLString(data, count){
    let htmlString = 
    '<div class ="summary-box" id="product_'+count+'">'+
        '<div>'+
        '<span id="edit_'+count+'" class="underline" onClick="editProduct('+count+');">Edit</span>'+
        '<span id="remove_'+count+'" class="right underline" onClick="removeProduct('+count+');">Remove</span>'+
        '</div>'+
        '<br><div class="hsn-qty">'+
        '<div class="inline">HSN: <span id="hsn_'+count+'">${HSN}</span></div>'+
        '<div class="inline right">Qty: <span id="qty_'+count+'">${Qty}</span></div>'+
        '</div><div class="product-details"><div class="product-name">'+
        '<b><span id="name_'+count+'">${productName}</span></b></div><div class="inline">'+
        'GST: <span id="gst_'+count+'">${GST}</span></div><div class="inline right"> Rate:'+
        '<span id="rate_'+count+'">${rate}</span></div></div><br><div class="tax-total"><div>SGST :'+
        '<span id="sgst_'+count+'">${sgst}</span></div><div>CSGST: <span id="cgst_'+count+'">${cgst}'+
        '</span></div><br>'+
        '<div>Total: <span id="total_'+count+'">${total}</span></div></div></div>';
    htmlString = htmlString.replace("${HSN}", data.hsn);
    htmlString = htmlString.replace("${productName}", data.productName);
    htmlString = htmlString.replace("${Qty}", data.qty);
    htmlString = htmlString.replace("${GST}", data.gstPercent);
    htmlString = htmlString.replace("${rate}", data.rate);
    htmlString = htmlString.replace("${sgst}", data.sgstAmt);
    htmlString = htmlString.replace("${cgst}", data.cgstAmt);
    htmlString = htmlString.replace("${total}", data.total);
    data.serial = count;
    addProductJSON(data, count);
    return htmlString;
}

function addProductJSON(product, count){
    let products = [];
    let productJSON = document.getElementById("productJSON").value;
    if(productJSON === ""){
        products.push(product);
    }else{
        products = JSON.parse(productJSON);
        let arrayIndex = -1, serial = 0;
        products.forEach((itm, index) => {
            if(itm.serial == count) { arrayIndex = index; serial = itm.serial; }
        });
        if(arrayIndex != -1){
            product.serial = serial;
            products.splice(arrayIndex, 1);
        }
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

function togglePlus(element='products_add') {
    element = document.getElementById(element);
    if(element.innerHTML.indexOf("+")==0){
        element.innerHTML = element.innerHTML.replace("+", "-");
    } else {
        element.innerHTML = element.innerHTML.replace("-", "+");
    }
}

function addProducts(element) {
    toggleDivDisplay('productForm');
    togglePlus();
    resetProductForm();
    document.getElementById("add").style.display = "block";
    document.getElementById("edit").style.display = "none";
}

function resetProductForm(){
    document.getElementById('hsn').value='';
    document.getElementById('productName').value='';
    document.getElementById('qty').value='';
    document.getElementById('rate').value='';
    document.getElementById('sgstAmt').value='';
    document.getElementById('cgstAmt').value='';
    document.getElementById('total').value='';
}

function calculateTax(){
    const rate = document.getElementById("rate").value;
    const qty = document.getElementById("qty").value;
    const gstPercent = document.getElementById("gstPercent").value;
    document.getElementById("sgstAmt").value= (qty*rate*((gstPercent/2)/100)).toFixed(2);
    document.getElementById("cgstAmt").value= (qty*rate*((gstPercent/2)/100)).toFixed(2);
    document.getElementById("total").value= (qty*rate*((gstPercent/2)/100)*2 + qty*rate).toFixed(2);
}

function updateProductData(){
    const product = getProductData();
    console.log(product);
    addProductJSON(product,product.serial);
    let count = product.serial;
    document.getElementById("hsn_"+count).innerHTML = product.hsn;
    document.getElementById("qty_"+count).innerHTML = product.qty;
    document.getElementById("name_"+count).innerHTML = product.productName;
    document.getElementById("rate_"+count).innerHTML = product.rate;
    document.getElementById("gst_"+count).innerHTML = product.gstPercent;
    document.getElementById("sgst_"+count).innerHTML = product.sgstAmt;
    document.getElementById("cgst_"+count).innerHTML = product.cgstAmt;
    document.getElementById("total_"+count).innerHTML = product.total;
    togglePlus();
    toggleDivDisplay('productForm');
}



function getProductData() {
    const hsn = document.getElementById("hsn").value;
    const productName = document.getElementById("productName").value;
    const qty = document.getElementById("qty").value;
    const rate = document.getElementById("rate").value;
    const gstPercent = document.getElementById("gstPercent").value;
    const cgstAmt = document.getElementById("cgstAmt").value;
    const sgstAmt = document.getElementById("sgstAmt").value;
    const total = document.getElementById("total").value;
    const serial = document.getElementById("serial").value;
    const productData = {
        hsn,
        productName,
        qty,
        rate,
        gstPercent,
        cgstAmt,
        sgstAmt,
        total,
        serial
    };
    return productData;
}

function formProductData(){
    const htmlString = addHTMLString(getProductData(), productCount++);
    togglePlus();
    toggleDivDisplay('productForm');
    let htmlElement = document.getElementById("productList").innerHTML;
    htmlElement = htmlElement + htmlString;
    document.getElementById("productList").innerHTML = htmlElement;
}