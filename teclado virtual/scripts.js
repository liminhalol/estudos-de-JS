const teclado = document.querySelector(".teclado")
const entrada = document.querySelector(".entrada")
const teclas = [
    ["''", '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', "backspace"], // Primeira fileira (números e símbolos)
    ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '´', '['], // Segunda fileira (letras)
    ['caps','a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '~', ']'], // Terceira fileira (letras)
    ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', ';','/', 'shift'] // Quarta fileira (letras)
]

const teclasEspeciais = ['tab', 'caps', 'shift', "backspace"] 


for (const fileira of teclas){
    const fileiraTeclas = document.createElement("div")
    fileiraTeclas.classList.add("fileira-teclas")
    teclado.append(fileiraTeclas)

    for(const tecla of fileira){
        const teclaEl = document.createElement("button")
        teclaEl.innerHTML = tecla
        teclaEl.classList.add("tecla")

        fileiraTeclas.appendChild(teclaEl)
        switch(tecla){
            case "tab": 
                teclaEl.classList.add("tab")
                break
            case "caps":
                teclaEl.classList.add("caps")
                break
            case "shift":
                teclaEl.classList.add("shift")
                break
            case "backspace":
                teclaEl.classList.add("backspace")
                break
            }
    }
}

let caps = false;
let shift = false;
teclado.addEventListener("click",function(e){
    const tecla = e.target
    const teclaV = tecla.textContent // tecla valor

    if(!tecla.classList.contains("tecla")) return
    switch (teclaV) {
        case "backspace":
            entrada.value = entrada.value.slice(0, -1)
            break;

        case "caps":
            caps = shift ? caps : !caps 
            break
            
        case "shift":
            caps = shift ? caps : !caps 
            shift = !shift
            break
            
        default:
            entrada.value += caps ? tecla.textContent.toUpperCase() : tecla.textContent
            caps = (shift && caps) ? false : caps ? true : false
            shift = false


            break;
    }
})