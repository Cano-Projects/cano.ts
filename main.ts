interface Buf {
    data: string,
}

interface Data {
    text: Buf,
    cursor: number,
}

let buffer: Data = {
    text: { data: "" },
    cursor: 0,
}

const insertIntoString = (str: string, value: string) => {
    str = str.slice(0, buffer.cursor) + value + str.slice(buffer.cursor)
    return str
}

const displayText = () => {
    let data_copy: string = insertIntoString(buffer.text.data, "&#818;")

    let text_p = document.getElementById("text")
    if(!text_p) {
        console.error("did not work")
        alert("FAILED")
    }
    text_p.innerHTML = data_copy
}

const insertText = (key: KeyboardEvent) => {
    let key_value = key.key
    switch(key.key) {
        case "Enter":
            key_value = "<br>" 
            break
        case "Backspace":
            if(buffer.cursor > 0) {
                buffer.text.data = buffer.text.data.slice(0, buffer.cursor-1) + buffer.text.data.slice(buffer.cursor)
                buffer.cursor--
            }
            displayText()
            return
        case "ArrowLeft":
            if(buffer.cursor > 0) buffer.cursor--
            displayText()
            return
        case "ArrowRight":
            if(buffer.cursor < buffer.text.data.length) buffer.cursor++
            displayText()
            return
    }

    buffer.text.data = insertIntoString(buffer.text.data, key_value)
    buffer.cursor += key_value.length
    displayText()

}

window.addEventListener(
    "keydown",               
    (key: KeyboardEvent) => {
        insertText(key)
    }
)
