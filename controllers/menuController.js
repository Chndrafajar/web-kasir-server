import menuModel from "../models/menuModel.js";
import slugify from "slugify";

//create
export const createMenuController = async (req, res) => {
  try {
    const { title, slug, desc, price, category } = req.body;

    const userId = req.user._id;

    //validasi
    if (!title) {
      return res.status(400).send({
        message: "title are required",
      });
    }
    if (!desc) {
      return res.status(400).send({
        message: "desc are required",
      });
    }
    if (!price) {
      return res.status(400).send({
        message: "price are required",
      });
    }
    if (!category) {
      return res.status(400).send({
        message: "category are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imgUrl = req.file.buffer.toString("base64");

    const menu = await new menuModel({
      title,
      slug: slugify(title),
      desc,
      price,
      category,
      imgUrl,
      userId,
    }).save();

    res.status(201).send({
      success: true,
      message: "menu created successfully",
      menu,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error in created menu",
        error,
      });
  }
};

//edit
export const editMenuController = async (req, res) => {
  try {
    const { title, slug, desc, price, category } = req.body;
    const { id } = req.params;
    const userId = req.user._id;

    // Validasi
    if (!title) {
      return res.status(400).send({
        message: "Title is required",
      });
    }
    if (!desc) {
      return res.status(400).send({
        message: "Description is required",
      });
    }
    if (!price) {
      return res.status(400).send({
        message: "Price is required",
      });
    }
    if (!category) {
      return res.status(400).send({
        message: "Category is required",
      });
    }

    // Ambil data menu yang ada
    const existingMenu = await menuModel.findById(id);

    if (!existingMenu) {
      return res.status(404).send({
        message: "Menu not found",
      });
    }

    // Jika ada file gambar yang diunggah, konversi ke base64
    let imgUrl = existingMenu.imgUrl; // Gunakan gambar yang sudah ada
    if (req.file) {
      imgUrl = req.file.buffer.toString("base64");
    }

    // Update menu
    const updateMenu = await menuModel.findByIdAndUpdate(
      id,
      {
        title,
        slug: slugify(title),
        desc,
        price,
        category,
        imgUrl,
        userId,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Menu updated successfully",
      menu: updateMenu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating menu",
      error,
    });
  }
};

//get data
export const getAllMenuController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const menu = await menuModel
      .find({})
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("category");

    const totalData = await menuModel.countDocuments();

    res.status(200).send({
      success: true,
      message: "All menu list",
      menu,
      totalData,
      totalPages: Math.ceil(totalData / options.limit),
      currentPage: options.page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in menu",
    });
  }
};

// get by category
export const getMenuByCategoryController = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const menu = await menuModel
      .find({ category: categoryId })
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("category");

    const totalData = await menuModel.countDocuments({ category: categoryId });

    res.status(200).send({
      success: true,
      message: "Menu list by category",
      menu,
      totalData,
      totalPages: Math.ceil(totalData / options.limit),
      currentPage: options.page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching menu by category",
    });
  }
};

export const countMenuInCategory = async (categoryId) => {
  try {
    const count = await menuModel.countDocuments({ category: categoryId });
    return count;
  } catch (error) {
    console.log(error);
    throw new Error("Error in counting menu in category");
  }
};

// Di dalam file backend Anda
export const getMenuCountByCategoryController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const count = await countMenuInCategory(categoryId);

    res.status(200).send({
      success: true,
      message: "Menu count by category",
      count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in counting menu by category",
    });
  }
};

// get by id
export const getMenuByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await menuModel.findById(id).populate("category");

    if (!menu) {
      return res.status(404).send({
        success: false,
        message: "Menu not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get menu successfully",
      menu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching menu",
    });
  }
};

//get by category
export const getMenuByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const menu = await menuModel.find({ category: category });

    if (menu.length === 0) {
      return res.status(400).json({ message: "Tidak ada jobs yang ditemukan untuk kategori ini" });
    }

    res.status(200).json({
      success: true,
      message: "Get menu by category successfully",
      menu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching menu by category",
    });
  }
};

//delete
export const deleteMenuController = async (req, res) => {
  const { id } = req.params;

  try {
    const menu = await menuModel.findByIdAndDelete(id);

    if (!menu) {
      return res.status(404).send({
        success: false,
        message: "Menu not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Menu deleted successfully",
      menu,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in deleting menu",
    });
  }
};
