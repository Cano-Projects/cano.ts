interface Buf {
    data: string,
}

interface Row {
    start: number,
    end: number,
}

interface Data {
    text: Buf,
    rows: Row[],
    cursor: number,
}

let buffer: Data = {
    text: { data: "" },
    rows: [{ start: 0, end: 0 }],
    cursor: 0,
}

const insertIntoString = (str: string, value: string) => {
    str = str.slice(0, buffer.cursor) + value + str.slice(buffer.cursor)
    return str
}

const bufferCalculateRows = (buf: Data) => {
    buf.rows.length = 1
    let start = 0
    for(let i = 0; i < buf.text.data.length; i++) {
        if(buffer.text.data[i] == "\n") {
            buf.rows.push({start: start, end: i})
            start = i + 1
        }
    }
    buf.rows.push({start: start, end: buf.text.data.length})
}

const displayText = () => {
    let canvas = <HTMLCanvasElement> document.getElementById("text")
    if(!canvas) {
        console.error("did not work")
        alert("FAILED")
    }
    let ctx = canvas.getContext("2d") 
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "24px sans-serif"
    for(let i = 0; i < buffer.rows.length; i++) {
        for(let j = buffer.rows[i].start; j < buffer.rows[i].end; j++) {
            ctx.fillText(buffer.text.data[j], (j-buffer.rows[i].start)*20, i*24)
        }
        if(buffer.cursor >= buffer.rows[i].start && buffer.cursor <= buffer.rows[i].end) {
            ctx.globalAlpha = 0.5 
            ctx.fillRect((buffer.cursor-buffer.rows[i].start-1)*20, (i-1)*24, 20, 24)
            ctx.globalAlpha = 1.0 
        }
    }
}

const insertText = (key: KeyboardEvent) => {
    let key_value = key.key
    switch(key.key) {
        case "Enter":
            key_value = "\n" 
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
    bufferCalculateRows(buffer)
    displayText()
}

window.addEventListener(
    "keydown",               
    (key: KeyboardEvent) => {
        insertText(key)
    }
)
