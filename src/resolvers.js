import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Card from "./models/Card.js";

const resolvers = {
  Query: {
    users: async () => await User.findAll(),
    userCards: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      if (!user.id) throw new Error("User ID is missing");
      return await Card.findAll({ where: { userId: user.id } });
    },
    userCardById: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      if (!user.id) throw new Error("User ID is missing");
      const card = await Card.findOne({ where: { id, userId: user.id } });
      if (!card) throw new Error("Card not found");
      return card;
    },
  },
  Mutation: {
    register: async (_, { username, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({ username, password: hashedPassword });
      if (!user) throw new Error("User don't created");
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
      return { token, user };
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ where: { username } });
      if (!user) throw new Error("User not found");
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Invalid password");
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
      return { token, user };
    },
    createCard: async (_, { title, content }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      if (!user.id) throw new Error("User ID is missing");
      const card = await Card.create({ title, content, userId: user.id });
      return card;
    },
    updateCard: async (_, { id, title, content }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      if (!user.id) throw new Error("User ID is missing");
      const card = await Card.findOne({ where: { id, userId: user.id } });
      if (!card) throw new Error("Card not found");
      const updatedCard = await card.update({ title, content });
      return updatedCard;
    },
    deleteCard: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      if (!user.id) throw new Error("User ID is missing");
      const card = await Card.findOne({ where: { id, userId: user.id } });
      if (!card) throw new Error("Card not found");
      await card.destroy();
      return card;
    },
  },
};

export default resolvers;
