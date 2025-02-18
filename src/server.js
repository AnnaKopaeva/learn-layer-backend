import { ApolloServer } from "apollo-server";
import jwt from "jsonwebtoken";
import typeDefs from "./schema.js";
import resolvers from "./resolvers.js";
import User from "./models/User.js";
import dotenv from "dotenv";

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

export const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = await getUser(token);
      return { user };
    },
    cors: {
      origin: [process.env.DEV_CLIENT_URL, process.env.PROD_CLIENT_URL],
      credentials: true,
    },
  });

  server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
  });
};
