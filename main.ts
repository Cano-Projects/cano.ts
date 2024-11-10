interface Buf {
    data: string,
}

interface Row {
    start: number,
    end: number,
}

enum Mode {
    NORMAL = 0,
    INSERT,
}

interface Data {
    text: Buf,
    rows: Row[],
    cursor: number,
    focus: boolean,
    mode: Mode,
}

let buffer: Data = {
    text: { data: "" },
    rows: [{ start: 0, end: 0 }],
    cursor: 0,
    focus: true,
    mode: Mode.NORMAL,
}
	
let load_input = null

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

const handleLoad = async () => {
	console.log("loading file...")
    let filenameElem = <HTMLInputElement> document.getElementById("load")
    let filename = filenameElem.files[0]	
	const blob = new Blob([filename], { type: "text/plain" })
	const url = URL.createObjectURL(blob)
	const text = await new Response(blob).text()
	buffer.cursor = 0
	buffer.text.data = text
	console.log(buffer.text.data, buffer.text.data.length)
	bufferCalculateRows()
	displayText()
	filenameElem.value = null
}


window.addEventListener("mousemove", function(e) {
    const canvas = document.getElementById("text")
    var rect = canvas.getBoundingClientRect()
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

const displayMode = () => {
    let canvas = <HTMLCanvasElement> document.getElementById("text")
    if(!canvas) {
        console.error("did not work")
        alert("FAILED")
    }
    let ctx = canvas.getContext("2d") 
    ctx.font = "24px Courier New"
    ctx.fillStyle = "white"
    ctx.fillText(Mode[buffer.mode], 10, canvas.height-10)
}

const displayText = () => {
    let canvas = <HTMLCanvasElement> document.getElementById("text")
    if(!canvas) {
        console.error("did not work")
        alert("FAILED")
    }
    let ctx = canvas.getContext("2d") 
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = "24px Courier New"
    ctx.fillStyle = "white"
    for(let i = 0; i < buffer.rows.length; i++) {
        for(let j = buffer.rows[i].start; j < buffer.rows[i].end; j++) {
            if(buffer.text.data[j] == undefined)
                continue
            ctx.fillText(buffer.text.data[j], (j-buffer.rows[i].start)*15, i*24)
        }
        if(buffer.cursor >= buffer.rows[i].start && buffer.cursor <= buffer.rows[i].end) {
            ctx.globalAlpha = 0.5 
            if(buffer.cursor-buffer.rows[i].start == 0) 
                ctx.fillRect((buffer.cursor-buffer.rows[i].start)*15, (i-1)*24, 15, 24)
            else
                ctx.fillRect((buffer.cursor-buffer.rows[i].start-1)*15, (i-1)*24, 15, 24)
            ctx.globalAlpha = 1.0 
        }
    }
    displayMode()
}

const cursor_up = () => {
    let row = getCurrentRow()
    if(row > 0) {
        let cur = buffer.rows[row]
        let offset = buffer.cursor - cur.start 
        buffer.cursor = buffer.rows[row-1].start + offset
        if(buffer.cursor > buffer.rows[row-1].end) {
            buffer.cursor = buffer.rows[row-1].end;
        }
    }
    displayText()
}

const cursor_down = () => {
    let row = getCurrentRow()
    if(row+1 < buffer.rows.length) {
		if(row == 0) row = 1
        let cur = buffer.rows[row]
        let offset = buffer.cursor - cur.start 
        buffer.cursor = buffer.rows[row+1].start + offset
        if(buffer.cursor > buffer.rows[row+1].end) {
            buffer.cursor = buffer.rows[row+1].end;
        }
    }
    displayText()
}

const cursor_left = () => {
    if(buffer.cursor > 0) buffer.cursor--
    displayText()
}

const cursor_right = () => {
    if(buffer.cursor < buffer.text.data.length) buffer.cursor++
    displayText()
}

const handle_normal_keys = (key: KeyboardEvent) => {
    switch(key.key) {
        case "i":
            buffer.mode = Mode.INSERT
            break
        case "ArrowLeft":
        case "h":
            cursor_left()
            break
        case "ArrowDown":
        case "j":
            cursor_down()
            break
        case "ArrowUp":
        case "k":
            cursor_up()
            break
        case "ArrowRight":
        case "l":
            cursor_right()
            break
    }

    return ""
}

const handle_insert_keys = (key: KeyboardEvent) => {
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
            return ""
        case "Escape":
            buffer.mode = Mode.NORMAL
            return ""
        case "Shift":
            return
        case "ArrowLeft":
            cursor_left()
            return
        case "ArrowRight":
            cursor_right()
            return
        case "ArrowUp":
            cursor_up()
        return
        case "ArrowDown": {
            cursor_down()
        } return
    }
    return key_value
}

const insertText = (key: KeyboardEvent) => {
    let key_value = key.key
    switch(buffer.mode) {
        case Mode.NORMAL:
            key_value = handle_normal_keys(key)
            break
        case Mode.INSERT:
            key_value = handle_insert_keys(key)
            break 
    }
    if(key_value.length !== 0) {
        buffer.text.data = insertIntoString(buffer.text.data, key_value)
        buffer.cursor += key_value.length
        bufferCalculateRows()
    }
    displayText()
}

window.addEventListener(
    "keydown",               
    (key: KeyboardEvent) => {
        if(buffer.focus)
            insertText(key)
    }
)

const main = () => {
    displayMode()
	load_input = document.getElementById("load")
	load_input.addEventListener("change", (_) => handleLoad())
}

window.addEventListener("load", (_) => main())
