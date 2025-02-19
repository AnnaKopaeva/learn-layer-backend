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

const getUser = async (token) => {
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
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = await getUser(token);
      return { user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    cache: "bounded",
  });

  await server.start();

  app.use(
    "/graphql",
    cors({
      credentials: true,
      methods: "*",
      allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin"],
      origin: (origin, callback) => {
        if (
          [process.env.DEV_CLIENT_URL, process.env.PROD_CLIENT_URL].includes(
            origin
          )
        ) {
          callback(null, origin);
        }
      },
    }),
    express.json(),
    expressMiddleware(server)
  );

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}
