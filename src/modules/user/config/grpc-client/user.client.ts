import path from "path"
import 'dotenv/config';
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader" 
import { ProtoGrpcType } from "../../../../../proto/user"




const packageDef = protoLoader.loadSync(path.resolve(__dirname, '../proto/user.proto'))
const grpcObject = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

const UserClient = new grpcObject.user_package.User(
    `user-service:${process.env.USER_GRPC_PORT}`, grpc.credentials.createInsecure()
)

export{UserClient}

// dns:///grpc-server:9000

