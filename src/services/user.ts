import { User } from "@/db/models/user";

const getAllUsers = async () => {
  const users = await User.find({ deleted: false });

  return users;
};

const UserService = {
  getAllUsers,
};

export default UserService;