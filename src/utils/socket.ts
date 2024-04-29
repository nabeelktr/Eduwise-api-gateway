import http from "http";
import { Server as SockerIoServer } from "socket.io";
import { UserClient } from "../modules/user/config/grpc-client/user.client";
import "dotenv/config"

export const initSocketServer = (server: http.Server) => {
  const io = new SockerIoServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
  });
  io.on("connection", (socket) => {
    console.log("user connected");

    socket.on("notification", (data) => {
      io.emit("newNotification", data);
    });

    socket.on("startStream", (data) => {
      UserClient.GetUser({ id: data.instructorId }, (err, result) => {
        io.emit("joinStream", {
          courses: result?.courses,
          streamId: data.callid,
        });
      });
    });

    socket.on("sendMessage", (datas) => {
      io.emit("recieveMessage", datas);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};
