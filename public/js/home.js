let category_filter = []
let discount_filter = []
window.onload = () => {
    fetch("/getProducts").then(response => response.json()).then(data => {
        let products = data.products
        if (localStorage.getItem("products") != products) {
            localStorage.setItem("products", JSON.stringify(products))
        }
    })
    handleProducts()
}


function handleProducts() {
    let products = JSON.parse(localStorage.getItem("products"))

    //handle by category
    console.log(category_filter)
    console.log(products)

    if (category_filter.length > 0) {
        for (let i = products.length - 1; i >= 0; i--) {
            if (!category_filter.includes(products[i].category)) {
                console.log('here')
                products.splice(i, 1)
            }
        }
    }
    if (discount_filter.length > 0) {
        for (let i = products.length - 1; i >= 0; i--) {
            if (!discount_filter.includes(products[i].discount_name)) {
                console.log('here')
                products.splice(i, 1)
            }
        }
    }
    console.log(products)

    let productsContainer = document.querySelector("#products")
    productsContainer.innerHTML = ""
    if(products.length == 0){
        productsContainer.innerHTML = `<h2 class = 'text-center'>¯\\_(ツ)_/¯ <br> Whew...Such empty. Try checking your filters out</h2>`
    }
    products.forEach(product => {
        console.log(product)
        let container = document.createElement("div")
        let dataContainer = document.createElement("div")
        container.classList.add("card")
        container.classList.add("col-md-4")

        let image = document.createElement("img")
        let body = document.createElement("div")
        body.classList.add("card-body")
        let productName = document.createElement("h5")
        productName.innerHTML = product.name
        let price = document.createElement("p")
        price.classList.add("price")
        price.innerText = "$" + product.price + ".00"
        let discountedPrice = document.createElement("p")
        let addToCart = document.createElement("button")
        addToCart.classList.add("neumorphic")
        addToCart.classList.add("w-100")
        addToCart.classList.add("p-2")


        addToCart.classList.add("btn")
        addToCart.innerText = "Add to cart"

        discountedPrice.innerText = "$" + product.discounted_price + ".00"
        if (product.discountedPrice != null) {

        }
        dataContainer.appendChild(productName)
        if (product.discounted_price != null) {
            dataContainer.appendChild(discountedPrice)
            dataContainer.appendChild(price)

            price.classList.add("old-price")
        }
        else {
            discountedPrice.innerHTML = '-'
            dataContainer.appendChild(price)
            dataContainer.appendChild(discountedPrice)

        }
        let discountEnds = document.createElement("p")
        discountEnds.innerHTML = "Discount ends: " + product.discount_ends

        if (product.discount_ends != undefined) {
            let timeRemaining = getRemainingTime(product.discount_ends)
            let discountInterval
            if (timeRemaining.seconds > 0) {
                discountInterval = setInterval(() => {
                    let timeRemaining = getRemainingTime(product.discount_ends)
                    discountEnds.innerHTML = timeRemaining.days + " days , " + timeRemaining.hours + " hours and " + timeRemaining.seconds + " seconds"

                }, 1000);
                dataContainer.appendChild(discountEnds)
            }
            else {
                discountEnds.innerHTML = "-"
                dataContainer.appendChild(discountEnds)
                clearInterval(discountInterval)

            }
        }
        else {
            discountEnds.innerHTML = "-"
            dataContainer.appendChild(discountEnds)

        }
        addToCart.addEventListener("click", function () {
            let cart = []
            try {
                cart = JSON.parse(sessionStorage.getItem("cart"))
                if (cart == null) {
                    cart = []
                }
            }
            catch (err) {
                cart = []
            }
            console.log(cart)
            cart.push(product.id)
            sessionStorage.setItem("cart", JSON.stringify(cart))
            document.querySelector("#cartCounter").innerText = cart.length
        })
        dataContainer.appendChild(addToCart)


        dataContainer.classList.add("text-center")
        body.appendChild(dataContainer)
        body.classList.add("dataholder")



        fetch(`/getProductImage/` + product.id).then(response => response.json()).then(data => {
            // console.log(data)
            image.setAttribute("src", data.image)
            image.setAttribute("data-bs-modal","modal")
            image.setAttribute("data-bs-target","#staticBackdrop")
            image.classList.add("thumbnail-custom")
            image.addEventListener("click",function(){
                $("#staticBackdrop").modal('show')
                document.querySelector("#mTitle").innerText = product.name
                document.querySelector("#modalImage").setAttribute("src",data.image)
                document.querySelector("#modalDescription").innerText = product.description

            })
            body.appendChild(image)
            // console.log(product)
        })
        container.appendChild(body)
        productsContainer.appendChild(container)
    })
    // })
}
function getRemainingTime(date) {
    let t = Date.parse(date) - Date.parse(new Date());
    let seconds = Math.floor((t / 1000) % 60);
    let minutes = Math.floor((t / 1000 / 60) % 60);
    let hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    let days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
        'total': t,
        'days': days,
        'hours': hours,
        'minutes': minutes,
        'seconds': seconds
    };
}
function filterCategory(cat_id) {
    if (category_filter.includes(cat_id)) {
        category_filter.splice(category_filter.indexOf(cat_id), 1)
    }
    else {
        category_filter.push(cat_id)
    }
    handleProducts()
}
function filterDiscount(name) {
    if (discount_filter.includes(name)) {
        discount_filter.splice(discount_filter.indexOf(name), 1)
    }
    else {
        discount_filter.push(name)
    }
    handleProducts()
}
