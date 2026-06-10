import { app } from "./app.js";

let port = process.env.PORT || 7000;

const startServer = () => {
    app?.listen(port, () => {
        console.log(`Server running on port ${port}`)
    })   
}

startServer()