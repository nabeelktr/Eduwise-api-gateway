import path from "path"
import 'dotenv/config';
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader" 
import { ProtoGrpcType } from "../../../../../proto/auth"




const packageDef = protoLoader.loadSync(path.resolve(__dirname, '../proto/auth.proto'))
const grpcObject = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

const AuthClient = new grpcObject.authpackage.Auth(
    `0.0.0.0:${process.env.AUTH_GRPC_PORT}`, grpc.credentials.createInsecure()
)

export{AuthClient}