import http from 'http'
import {Server as SockerIoServer} from 'socket.io'

export const initSocketServer = (server: http.Server) => {
    const io= new SockerIoServer(server);
    io.on("connection", (socket) => {
        console.log("user connected");

        socket.on("notification", (data) => {
            socket.emit("newNotification", data)
        })

        socket.on("disconnect", () => {
            console.log("user disconnected");
        })
    })
}