import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    //validasi
    if (!name) {
      return res.status(400).send({
        message: "name are required",
      });
    }

    //periksa Category yang ada
    const existingCategory = await categoryModel.findOne({ name });

    //Category sudah ada
    if (existingCategory) {
      return res.status(200).send({
        success: false,
        message: "Already category",
      });
    }

    // Cek apakah file gambar disertakan
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Mengubah file gambar menjadi base64
    const imgUrl = req.file.buffer.toString("base64");

    //simpan data category
    const category = await new categoryModel({
      name,
      imgUrl,
      userId,
    }).save();

    res.status(201).send({
      success: true,
      message: "category created successfully",
      category,
    });
  } catch (error) {
    console.log(error),
      res.status(500).send({
        success: false,
        message: "Error in created category",
        error,
      });
  }
};

//edit
export const editCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params; // Mengambil ID kategori dari parameter URL
    const userId = req.user._id;
    // Validasi
    if (!name) {
      return res.status(400).send({
        message: "Name is required",
      });
    }

    // Periksa apakah kategori dengan ID tersebut ada
    const existingCategory = await categoryModel.findById(id);

    // Jika kategori tidak ditemukan
    if (!existingCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Periksa apakah ada file gambar yang diunggah
    let imgUrl = existingCategory.imgUrl; // Gunakan gambar yang sudah ada sebagai default
    if (req.file) {
      // Mengubah file gambar menjadi base64 jika ada file yang diunggah
      imgUrl = req.file.buffer.toString("base64");
    }

    // Update data kategori
    const updatedCategory = await categoryModel.findByIdAndUpdate(
      id,
      { name, imgUrl, userId },
      { new: true } // Untuk mendapatkan data kategori yang sudah diupdate
    );

    res.status(201).send({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating category",
      error,
    });
  }
};

//delete
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID kategori dari parameter URL

    // Periksa apakah kategori dengan ID tersebut ada
    const existingCategory = await categoryModel.findById(id);

    // Jika kategori tidak ditemukan
    if (!existingCategory) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }

    // Hapus kategori
    await categoryModel.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting category",
      error,
    });
  }
};

//get all
export const getAllCategoryController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default values: page 1, limit 10
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const category = await categoryModel
      .find({})
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit);

    const totalData = await categoryModel.countDocuments(); // Get total category count

    res.status(200).send({
      success: true,
      message: "All category list",
      category,
      totalData,
      totalPages: Math.ceil(totalData / options.limit), // Calculate total pages
      currentPage: options.page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in category",
    });
  }
};

export const getCategoryByIdController = async (req, res) => {
  try {
    const { id } = req.params; // Ambil ID dari parameter route

    const category = await categoryModel.findById(id); // Mencari category berdasarkan ID

    if (!category) {
      return res.status(404).send({
        success: false,
        message: "category not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get category Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in fetching category",
    });
  }
};
