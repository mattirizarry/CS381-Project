# CS 381 Project - Matthew Irizarry

**Presentation Link** 
https://docs.google.com/presentation/d/1XFjKbxXNz3_NAdhTda__w_dXQCmoBtM4EizKGoZYLTA/edit?usp=sharing

This project was supposed to be a much more complicated project, but due to the time constraints of this class and others, I decided to focus on the functionality instead of the user interface.

## Six Attributes

This section covers the six attributes that are required as part of the project.

### Three Mandatory

#### Socket Programming Using a High Level Language

I implemented sockets using WebSockets in TypeScript. This was done using the `express` and `ws` library. 

1. We create a web socket server with the following code

```typescript
const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
```

2. We listen for incoming connections

```typescript
wss.on("connection", (ws) => {
    // ... logic for the connections can be seen in `index.ts`
})
```

3. We create an audio stream processed from the `audio/starboy.mp3` file

```typescript
const audioStream = fs.createReadStream(filePath)
```

4. We pipe the audio stream to the WebSocket

```typescript
audioStream.on("data", (chunk) => {
    // Send the chunk of audio data to the client
    ws.send(chunk)

    // Add to the chunk count
    chunkCount++
})
```

5. Once the audio stream is done, we close the connection

```typescript
audioStream.on("end", () => {
    // Send an empty buffer signifiying the end of the audioStream
    ws.send(Buffer.alloc(0))
    
    // Log the number of chunks sent to the client
    writeStream.write(`Sent ${chunkCount} chunks to the client\n\n`)

    // Log that the audio stream has ended along with the time that it ended
    writeStream.write(`Audio stream ended at ${new Date().toLocaleString()}\n\n`)
})
```

6. We listen for the client to close the connection

```typescript
ws.on("close", () => {
    // Destroy the audio stream when the client disconnects
    audioStream.destroy()

    // Log that the client has disconnected
    writeStream.write(`Client disconnected at ${new Date().toLocaleString()}\n`)
})
```

#### Process to Process Communication

This section covers the process to process communication that is required as part of the project. The above code covers the server side, so this shows how the client connects via a web socket.

1. We create a web socket connection to the server

```typescript
const ws = new WebSocket("ws://localhost:3000")
```

2. We listen for incoming audio data

```typescript
ws.binaryType = "arraybuffer"

let audioChunks = []

ws.onmessage = (event) => {
    if (event.data instanceof ArrayBuffer) {
        const receivedData = new Uint8Array(event.data)
        if (receivedData.length > 0) {
            audioChunks.push(receivedData)
            console.log(
                `Received audio data chunk (${receivedData.length} bytes).`,
            )
        } else {
            console.log("Received empty audio data chunk.")

            const audioBlob = new Blob(audioChunks, {
                type: "audio/mp3",
            })
            const audioUrl = URL.createObjectURL(audioBlob)

            audioPlayer.src = audioUrl
        }
    }
}
```

3. We listen for the connection to close

```typescript
ws.onclose = () => {
    console.log("WebSocket connection closed.")
}
```

#### TCP or UDP Sockets

With WebSockets, we are using TCP sockets. According to https://datatracker.ietf.org/doc/html/rfc6455, WebSockets are built on top of TCP sockets.

> ...The protocol consists of an opening handshake
   followed by basic message framing, layered over TCP...

### Three Optional

#### Input from a database, keyboard or file

This section covers the input from a file that is required as part of the project. The file is `audio/starboy.mp3`.

The file is read using the following code

```typescript
const songName = "starboy"
const filePath = `./audio/${songName}.mp3`

const audioStream = fs.createReadStream(filePath)
```

#### Output to a database, screen or file

This section covers the output to a file that is required as part of the project. The file is `logs/**`.

Each time the server starts, it creates a new log file with the current date and time. The log file is written to using the following code

```typescript
writeStream = fs.createWriteStream(`./logs/log-${new Date().toISOString()}.txt`)

writeStream.write(`Client connected via WebSocket at ${new Date().toLocaleString()}\n\n`)

writeStream.write(`User requested the song ${songName}.mp3\n\n`)

writeStream.write(`File path: ${filePath}\n`)

writeStream.write(`File size: ${fileSizeInBytes} bytes\n\n`)

writeStream.write(`Audio stream created.\n\n`)

writeStream.write(`Sending audio data...\n\n`)

writeStream.write(`Sent ${chunkCount} chunks to the client\n\n`)

writeStream.write(`Audio stream ended at ${new Date().toLocaleString()}\n\n`)

writeStream.write(`Client disconnected at ${new Date().toLocaleString()}\n`)

writeStream.write(`Server closing at ${new Date().toISOString()}\n`)

writeStream.close()
```

#### Client/Server or Peer to Peer

This section covers the client/server communication that is required as part of the project. In this project, we have demonstratively gone with a client/server architecture. The server is responsible for sending the audio data to the client. The client is responsible for receiving the audio data and playing it. The server is also responsible for logging the events that occur during the connection.

## Running the Project

This section covers how to run the project.

### Prerequisites

1. Node.js
2. `pnpm`

### Steps

1. Clone the repository

```bash
git clone
```

2. Install the dependencies

```bash
pnpm install
```

3. Start the server

```bash
pnpm start
```

4. Open the client at https://localhost:3000
