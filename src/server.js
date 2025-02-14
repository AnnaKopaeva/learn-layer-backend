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
      console.log("SECRET_KEY", process.env.SECRET_KEY);
      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.SECRET_KEY
      );
      console.log("decoded", decoded);
      return await User.findByPk(decoded.userId);
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  }
  return null;
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || "";
    const user = await getUser(token);
    return { user };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
