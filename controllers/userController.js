import { comparePassword, hashPassword } from "../helpers/authHelpers.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const registerUserController = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    //validasi
    if (!username || !password || !role) {
      return res.status(400).send({
        message: "Username, password and role are required",
      });
    }

    //periksa user yang ada
    const existingUser = await userModel.findOne({ username });

    //user sudah ada
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already register, please login",
      });
    }

    //daftarkan user
    const hashedPassword = await hashPassword(password);

    //simpan data user
    const user = await new userModel({
      username,
      password: hashedPassword,
      role,
    }).save();

    res.status(201).send({
      success: true,
      message: "user registered successfully",
      user,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error in register user",
        error,
      });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { username, password } = req.body;

    //validasi
    if (!username || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid username or password",
      });
    }

    //check user
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Username is not registered",
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(200).send({
        success: false,
        message: "Invalid password",
      });
    }

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        username: user.username,
        role: user.role,
        token: user.token,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//test controller
export const testController = async (req, res) => {
  res.send("Protected Routes");
};

export const editUserController = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari parameter URL
    const { username, password, role } = req.body;

    //validasi
    if (!username || !role) {
      return res.status(400).send({
        message: "Username and role are required",
      });
    }

    //periksa user yang ada berdasarkan ID
    const existingUser = await userModel.findById(id);

    // Jika user tidak ada
    if (!existingUser) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Jika password diisi, maka update password setelah di-hash
    if (password) {
      const hashedPassword = await hashPassword(password);
      existingUser.password = hashedPassword;
    }

    // Update field lain
    existingUser.username = username;
    existingUser.role = role;

    // Simpan perubahan user
    const updatedUser = await existingUser.save();

    res.status(200).send({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error in updating user",
        error,
      });
  }
};

//get all
export const getUserController = async (req, res) => {
  try {
    const user = await userModel.find({}).sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All user list",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in user",
    });
  }
};
export const getUserAllController = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "desc", search = "" } = req.query; // Default values: page 1, limit 10, sort desc, search ''
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Build the query for search
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } }, // Case-insensitive search for name
      ];
    }

    // Determine the sort order
    const sortOrder = sort === "asc" ? 1 : -1;

    const users = await userModel
      .find(query)
      .sort({ createdAt: sortOrder })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const totalData = await userModel.countDocuments(query); // Get total user count based on the query

    res.status(200).send({
      success: true,
      message: "All user list",
      users,
      totalData,
      totalPages: Math.ceil(totalData / options.limit), // Calculate total pages
      currentPage: options.page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in user",
    });
  }
};

//get data by id
// get user by ID
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari parameter route

    const user = await userModel.findById(id); // Mencari pengguna berdasarkan ID

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get User Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching user",
    });
  }
};

//delete user
// Delete user by ID
export const deleteUserController = async (req, res) => {
  const { id } = req.params; // Get the user ID from request parameters

  try {
    const user = await userModel.findByIdAndDelete(id); // Delete user by ID

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "User deleted successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting user",
    });
  }
};
