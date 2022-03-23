
let availableProducts = []


window.onload = () => {
    fetch("/getProducts").then(response => response.json()).then(data => {
        let products = data.products
        if (localStorage.getItem("products") != products) {
            localStorage.setItem("products", JSON.stringify(products))
        }
    })
    handleProducts()
}

fetch("/getCategories").then(response => response.json()).then(data => {
    let categories = document.getElementById("categories")
    data.categories.forEach(element => {
        let option = document.createElement("option")
        option.setAttribute("value", element.id)
        option.innerHTML = element.name
        categories.appendChild(option)
    })
})
function handleProducts() {
    // fetch("/getProducts").then(response => response.json()).then(data => {
    let products = JSON.parse(localStorage.getItem("products"))
    let products_table = document.querySelector("#products-table")

    // console.log(products)
    products.forEach(product => {

        let row = document.createElement("tr")

        let idCell = document.createElement("td");
        idCell.innerHTML = product.id

        let categoryCell = document.createElement("td")
        categoryCell.innerHTML = product.category_name

        let nameCell = document.createElement("td");
        nameCell.innerHTML = product.name

        let descriptionCell = document.createElement("td");
        descriptionCell.innerHTML = product.description

        let priceCell = document.createElement("td");
        priceCell.innerHTML = product.price

        row.appendChild(idCell)


        fetch(`/getProductImage/` + product.id).then(response => response.json()).then(data => {
            product.image = data.image
            let imageCell = document.createElement("td")
            let image = document.createElement("img")
            image.setAttribute("src", product.image)
            image.classList.add("table-thumbnail")

            imageCell.appendChild(image)

            row.appendChild(imageCell)
        })
        row.appendChild(categoryCell)
        row.appendChild(nameCell)
        row.appendChild(descriptionCell)
        row.appendChild(priceCell)
        products_table.appendChild(row)
    })
    // })
}
function displayProducts() {
    products = JSON.parse(localStorage.getItem("products"))
    let products_table = document.querySelector("#products-table")

    console.log(products)
    products.forEach(product => {

        let row = document.createElement("tr")

        let idCell = document.createElement("td");
        idCell.innerHTML = product.id

        let categoryCell = document.createElement("td")
        categoryCell.innerHTML = product.category_name

        let nameCell = document.createElement("td");
        nameCell.innerHTML = product.name

        let descriptionCell = document.createElement("td");
        descriptionCell.innerHTML = product.description

        let priceCell = document.createElement("td");
        priceCell.innerHTML = product.price

        row.appendChild(idCell)


        fetch(`/getProductImage/` + product.id).then(response => response.json()).then(data => {
            product.image = data.image
            let imageCell = document.createElement("td")
            let image = document.createElement("img")
            image.setAttribute("src", product.image)
            image.classList.add("table-thumbnail")

            imageCell.appendChild(image)

            row.appendChild(imageCell)
        })
        row.appendChild(categoryCell)
        row.appendChild(nameCell)
        row.appendChild(descriptionCell)
        row.appendChild(priceCell)
        products_table.appendChild(row)
    })
}

function fillProducts() {
    availableProducts = JSON.parse(localStorage.getItem("products"))
    let productList = document.querySelector("#product-list")
    if (productList.children.length > 1) {
        return
    }
    availableProducts.forEach(product => {
        let checkBox = document.createElement("input")
        checkBox.type = "checkbox"
        checkBox.id = `pr-${product.id}`
        checkBox.value = product.id

        let label = document.createElement("label");
        label.innerText = " " + product.name + " "
        label.setAttribute("for", `pr-${product.id}`)
        let container = document.createElement("div");
        container.classList.add("form-group")
        container.append(checkBox)
        container.append(label);
        productList.append(container)
    })
    console.log(availableProducts)
}
function addToDiscount() {
    $("#exampleModal").modal('hide')
    let container = document.querySelector("#product-list")
    let checkBoxes = container.querySelectorAll('input[type=checkbox]:checked')
    console.log(checkBoxes)
    let checkedValues = []
    checkBoxes.forEach(checkBox=>{
        checkedValues.push(checkBox.value)
    })
    document.querySelector("#products").value = checkedValues.join(",")
}