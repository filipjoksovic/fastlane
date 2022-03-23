let cart = JSON.parse(sessionStorage.getItem("cart"))
if (cart == null) {
    cart = []
}
console.log(cart)
let inCart = []
let cartSum = 0
getProducts = async () => {
    await fetch("/getProducts").then(response => response.json()).then(data => {
        let productsInCart = []
        let products = data.products
        for (let i = 0; i < cart.length; i++) {
            for (let j = 0; j < products.length; j++) {
                if (cart[i] == products[j].id) {
                    productsInCart.push(products[j])
                }
            }
        }
        productsInCart.forEach(product => {
            let products = document.querySelector("#cartProducts")
            let container = document.createElement("div")
            let dataContainer = document.createElement("div")
            let colContainer = document.createElement("div")
            container.classList.add("card")
            colContainer.classList.add("col-md-4")


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
            addToCart.innerText = "Remove from cart"
            addToCart.addEventListener("click",function(){
                for(let i = 0; i < cart.length;i++){
                    if(cart[i] == product.id){
                        cart.splice(i,1)
                        location.reload()
                        break
                    }
                }
                sessionStorage.setItem("cart",JSON.stringify(cart))
            })

            discountedPrice.innerText = "$" + product.discounted_price + ".00"
            if (product.discountedPrice != null) {

            }
            dataContainer.appendChild(productName)
            if (product.discounted_price != null) {
                cartSum += product.discounted_price
                console.log("discounted_price: " + product.discounted_price)
                dataContainer.appendChild(discountedPrice)
                dataContainer.appendChild(price)

                price.classList.add("old-price")
            }
            else {
                cartSum += parseInt(product.price)
                console.log("price: " + product.price)

                discountedPrice.innerHTML = '-'
                dataContainer.appendChild(price)
                dataContainer.appendChild(discountedPrice)

            }   

            dataContainer.appendChild(addToCart)


            dataContainer.classList.add("text-center")
            body.appendChild(dataContainer)
            body.classList.add("dataholder")



            fetch(`/getProductImage/` + product.id).then(response => response.json()).then(data => {
                console.log(data)
                image.setAttribute("src", data.image)
                image.classList.add("thumbnail-custom")
                body.appendChild(image)
                console.log(product)
            })
            container.appendChild(body)
            colContainer.appendChild(container)
            products.appendChild(colContainer)
        })
        document.querySelector("#cartSum").innerText += " $" + cartSum + ".00"
        document.querySelector("#cart_sum").setAttribute("value",cartSum)

    })
}
getProducts()

function createOrder(){
    
    let cartInput = JSON.parse(sessionStorage.getItem("cart")).join(",")
    document.querySelector("#cart_items").setAttribute("value",cartInput)
    document.querySelector("#orderForm").submit()
    sessionStorage.removeItem("cart")
}