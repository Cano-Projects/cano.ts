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
    focus: boolean,
}

let buffer: Data = {
    text: { data: "" },
    rows: [{ start: 0, end: 0 }],
    cursor: 0,
    focus: true,
}

const handleSave = () => {
    let filenameElem = <HTMLInputElement> document.getElementById("filename")
    let filename = filenameElem.value
    const a = document.createElement("a")
    const file = new Blob([buffer.text.data], { type: "text/plain" })
    const link = URL.createObjectURL(file)
    a.href = link
    a.download = filename
    a.click()
    URL.revokeObjectURL(link)
}

window.addEventListener("mousemove", function(e) {
    const canvas = document.getElementById("text")
    var rect = canvas.getBoundingClientRect()
    console.log(rect.top, e.clientY)
    if(e.clientX > rect.left && e.clientY > rect.top && e.clientX < rect.right && e.clientY < rect.bottom)
        buffer.focus = true 
    else
        buffer.focus = false 
});

const insertIntoString = (str: string, value: string) => {
    str = str.slice(0, buffer.cursor) + value + str.slice(buffer.cursor)
    return str
}

const getCurrentRow = (): number => {
    for(let i = 0; i < buffer.rows.length; i++) {
        if(buffer.cursor >= buffer.rows[i].start && buffer.cursor <= buffer.rows[i].end) {
            return i;
        }
    }
}

const bufferCalculateRows = () => {
    buffer.rows.length = 1
    let start = 0
    for(let i = 0; i < buffer.text.data.length; i++) {
        if(buffer.text.data[i] == "\n") {
            buffer.rows.push({start: start, end: i})
            start = i + 1
        }
    }
    buffer.rows.push({start: start, end: buffer.text.data.length})
}

const displayText = () => {
    let canvas = <HTMLCanvasElement> document.getElementById("text")
    if(!canvas) {
        console.error("did not work")
        alert("FAILED")
    }
    let ctx = canvas.getContext("2d") 
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "normal 24px Verdana"
    ctx.fillStyle = "white"
    for(let i = 0; i < buffer.rows.length; i++) {
        for(let j = buffer.rows[i].start; j < buffer.rows[i].end; j++) {
            if(buffer.text.data[j] == undefined)
                continue
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
        case "Shift":
            return
        case "ArrowLeft":
            if(buffer.cursor > 0) buffer.cursor--
            displayText()
            return
        case "ArrowRight":
            if(buffer.cursor < buffer.text.data.length) buffer.cursor++
            displayText()
            return
        case "ArrowUp": {
            let row = getCurrentRow()
            if(row > 0) {
                let cur = buffer.rows[row]
                let offset = buffer.cursor - cur.start 
                buffer.cursor = buffer.rows[row-1].start + offset
            }
            displayText()
        } return
        case "ArrowDown": {
            let row = getCurrentRow()
            if(row < buffer.rows.length) {
                let cur = buffer.rows[row]
                let offset = buffer.cursor - cur.start 
                buffer.cursor = buffer.rows[row+1].start + offset
            }
            displayText()
        } return
    }

    buffer.text.data = insertIntoString(buffer.text.data, key_value)
    buffer.cursor += key_value.length
    bufferCalculateRows()
    displayText()
}

window.addEventListener(
    "keydown",               
    (key: KeyboardEvent) => {
        if(buffer.focus)
            insertText(key)
    }
)
