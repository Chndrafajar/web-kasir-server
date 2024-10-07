import orderModel from "../models/orderModel.js";
import ExcelJS from "exceljs";
import fs from "fs";
// Fungsi untuk membuat order baru
export const createOrderController = async (req, res) => {
  try {
    const { items, totalQuantity, totalPrice, bayar, kembalian } = req.body;
    const userId = req.user._id; // Mengambil userId dari user yang sedang login

    // Validasi input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items harus berupa array dan tidak boleh kosong" });
    }

    if (!totalQuantity || typeof totalQuantity !== "number" || totalQuantity <= 0) {
      return res.status(400).json({ message: "Quantity harus berupa angka positif" });
    }

    if (!totalPrice || typeof totalPrice !== "number" || totalPrice <= 0) {
      return res.status(400).json({ message: "Total price harus berupa angka positif" });
    }

    if (!bayar || typeof bayar !== "number" || bayar <= 0) {
      return res.status(400).json({ message: "Bayar harus berupa angka positif" });
    }

    if (!kembalian || typeof kembalian !== "number") {
      return res.status(400).json({ message: "Kembalian harus berupa angka" });
    }

    // Validasi setiap item dalam array items
    const validatedItems = items.map((item) => {
      if (!item._id || !item.quantity) {
        throw new Error("Setiap item harus memiliki _id dan quantity");
      }
      return { menuId: item._id, quantity: item.quantity };
    });

    // Membuat order baru
    const newOrder = new orderModel({
      items: validatedItems,
      totalQuantity,
      totalPrice,
      userId, // Menambahkan userId ke dalam order
      bayar, // Menambahkan bayar ke dalam order
      kembalian, // Menambahkan kembalian ke dalam order
    });

    // Menyimpan order ke database
    await newOrder.save();

    res.status(201).json({ message: "Order berhasil dibuat", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat membuat order", error: error.message });
  }
};

//get data

export const getAllOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, selectedDate, userId, sort = "desc", search = "" } = req.query; // Tambahkan userId
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Deklarasi filter awal
    const filter = {};

    if (search) {
      filter.$or = [
        { noTransaksi: { $regex: search, $options: "i" } },
        // Tambahkan field lain yang ingin Anda cari di sini
      ];
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00`),
        $lt: new Date(`${endDate}T23:59:59`),
      };
    } else if (selectedDate) {
      const startOfDay = new Date(`${selectedDate}T00:00:00`);
      const endOfDay = new Date(`${selectedDate}T23:59:59`);
      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter berdasarkan userId (jika dikirimkan)
    if (userId) {
      filter.userId = userId; // Menambahkan filter userId
    }

    // Mengambil data order dengan filter dan pagination
    const orders = await orderModel
      .find(filter)
      .sort({ createdAt: sortOrder }) // Urutkan berdasarkan createdAt secara descending
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("userId");

    const totalData = await orderModel.countDocuments(filter);

    res.status(200).send({
      success: true,
      message: "All order list",
      orders,
      totalData,
      totalPages: Math.ceil(totalData / options.limit),
      currentPage: options.page,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil order", error: error.message });
  }
};

//by  user id
export const getAllOrdersByUserController = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, selectedDate, sort = "desc", search = "" } = req.query;
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Menggunakan userId dari user yang sedang login
    const userId = req.user._id;

    const filter = { userId };

    if (search) {
      filter.$or = [{ noTransaksi: { $regex: search, $options: "i" } }];
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    // Membuat filter berdasarkan userId dan rentang tanggal atau tanggal tunggal
    if (startDate && endDate) {
      // Filter berdasarkan range tanggal (awal dan akhir hari)
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00`),
        $lt: new Date(`${endDate}T23:59:59`),
      };
    } else if (selectedDate) {
      // Filter berdasarkan satu tanggal
      const startOfDay = new Date(`${selectedDate}T00:00:00`);
      const endOfDay = new Date(`${selectedDate}T23:59:59`);
      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Logging untuk memastikan filter benar
    console.log("Filter:", filter);

    // Mengambil orders dari database berdasarkan filter dan mengurutkan berdasarkan createdAt (descending)
    const orders = await orderModel
      .find(filter)
      .sort({ createdAt: sortOrder }) // Urutkan berdasarkan createdAt secara descending
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("userId");

    const totalData = await orderModel.countDocuments(filter);

    res.status(200).send({
      success: true,
      message: "All order list",
      orders,
      totalData,
      totalPages: Math.ceil(totalData / options.limit), // Menghitung total halaman
      currentPage: options.page,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil order", error: error.message });
  }
};

export const getOrdersById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await orderModel
      .findById(orderId)
      .populate("userId") // Populate userId
      .populate({
        path: "items",
        populate: {
          path: "menuId",
          model: "Menu", // Ganti dengan nama model yang sesuai
        },
      });

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "order not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get order Successfully",
      order,
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

//download laporan
export const getDownloadLaporanExcel = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, selectedDate, userId, sort = "desc", search = "" } = req.query; // Tambahkan userId
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Deklarasi filter awal
    const filter = {};

    if (search) {
      filter.$or = [
        { noTransaksi: { $regex: search, $options: "i" } },
        // Tambahkan field lain yang ingin Anda cari di sini
      ];
    }

    const sortOrder = sort === "asc" ? 1 : -1;

    // Filter berdasarkan tanggal
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(`${startDate}T00:00:00`),
        $lt: new Date(`${endDate}T23:59:59`),
      };
    } else if (selectedDate) {
      const startOfDay = new Date(`${selectedDate}T00:00:00`);
      const endOfDay = new Date(`${selectedDate}T23:59:59`);
      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Filter berdasarkan userId (jika dikirimkan)
    if (userId) {
      filter.userId = userId; // Menambahkan filter userId
    }

    // Mengambil data order dengan filter dan pagination
    const orders = await orderModel
      .find(filter)
      .sort({ createdAt: sortOrder }) // Urutkan berdasarkan createdAt secara descending
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("userId");

    const totalData = await orderModel.countDocuments(filter);

    // Membuat file Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Orders");

    // Menambahkan header kolom
    worksheet.columns = [
      { header: "No Transaksi", key: "noTransaksi", width: 15 },
      { header: "Kasir", key: "userId", width: 25 },
      { header: "Quantity", key: "totalQuantity", width: 20 },
      { header: "Price", key: "totalPrice", width: 20 },
      { header: "Bayar", key: "bayar", width: 20 },
      { header: "Kembali", key: "kembalian", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
      // Tambahkan kolom lain sesuai kebutuhan
    ];

    // Menambahkan data ke dalam worksheet
    orders.forEach((order) => {
      worksheet.addRow({
        noTransaksi: order.noTransaksi,
        userId: order.userId ? order.userId.username : "",
        totalQuantity: order.totalQuantity,
        totalPrice: formatRupiah(order.totalPrice),
        bayar: formatRupiah(order.bayar),
        kembalian: formatRupiah(order.kembalian),
        createdAt: order.createdAt,
        // Tambahkan field lain sesuai kebutuhan
      });
    });

    // Menyimpan file Excel
    const filePath = "./orders.xlsx";
    await workbook.xlsx.writeFile(filePath);

    // Mengirimkan file Excel sebagai respons
    res.download(filePath, "orders.xlsx", (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).json({ message: "Terjadi kesalahan saat mengirim file Excel", error: err.message });
      }

      // Hapus file setelah dikirim
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil order", error: error.message });
  }
};

//format rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}
