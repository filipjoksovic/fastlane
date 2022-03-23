let scart = JSON.parse(sessionStorage.getItem("cart"))
if(scart == null){
    scart = []
}

document.querySelector("#cartCounter").innerText = scart.length            
