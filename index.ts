import express from "express"
import WebSocket from "ws"
import http from "http"
import fs from "fs"

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

const PORT = process.env.PORT || 3000

app.use(express.static("public"))

let writeStream: fs.WriteStream;

wss.on("connection", (ws) => {

    writeStream.write(`Client connected via WebSocket at ${new Date().toLocaleString()}\n\n`)

    const songName = "starboy"
    const filePath = `./audio/${songName}.mp3`
    const fileSizeInBytes = fs.statSync(filePath).size

    // Write to the log file that the user has requested the songName
    writeStream.write(`User requested the song ${songName}.mp3\n\n`)

    // Write the file specifics, such as size and path
    writeStream.write(`File path: ${filePath}\n`)
    writeStream.write(`File size: ${fileSizeInBytes} bytes\n\n`)

    // Create a read stream to read the audio file
    const audioStream = fs.createReadStream(filePath)

    // Log that an audio stream has been created
    writeStream.write(`Audio stream created.\n\n`)
    writeStream.write(`Sending audio data...\n\n`)

    // Count Chunks sent to the client
    let chunkCount = 0

    audioStream.on("data", (chunk) => {
        // Send the chunk of audio data to the client
        ws.send(chunk)

        // Add to the chunk count
        chunkCount++
    })

    audioStream.on("end", () => {
        // Send an empty buffer signifiying the end of the audioStream
        ws.send(Buffer.alloc(0))
        
        // Log the number of chunks sent to the client
        writeStream.write(`Sent ${chunkCount} chunks to the client\n\n`)

        // Log that the audio stream has ended along with the time that it ended
        writeStream.write(`Audio stream ended at ${new Date().toLocaleString()}\n\n`)
    })

    ws.on("close", () => {
        // Destroy the audio stream when the client disconnects
        audioStream.destroy()

        // Log that the client has disconnected
        writeStream.write(`Client disconnected at ${new Date().toLocaleString()}\n`)
    })
})

server.listen(PORT, () => {
    // Initialize the log file

    // Get the logs folder, if it does not exist, create it
    if (!fs.existsSync("./logs")) {
        fs.mkdirSync("./logs")
    }

    // Create a write stream to write the logs to a file with the given timestamp
    writeStream = fs.createWriteStream(`./logs/log-${new Date().toISOString()}.txt`)
})

server.on("close", () => {
    // Log that the server is closing
    writeStream.write(`Server closing at ${new Date().toISOString()}\n`)

    // Close the write stream when the server closes
    writeStream.close()
})