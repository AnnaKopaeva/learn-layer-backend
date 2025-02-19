import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import User from "./models/User.js";

dotenv.config();

const getUserForRequest = async (req) => {
  const token = req.headers.authorization || "";
  if (token) {
    try {
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.SECRET_KEY
      );
      return await User.findByPk(decoded.userId);
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  }
  return null;
};

export async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    cache: "bounded",
    introspection: process.env.NODE_ENV !== "production",
  });

  await server.start();

  app.use(
    "/graphql",
    cors({
      origin: [process.env.DEV_CLIENT_URL, process.env.PROD_CLIENT_URL],
      credentials: true,
      methods: "*",
      allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin"],
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: await getUserForRequest(req),
      }),
    }),
    expressMiddleware(server)
  );

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}
