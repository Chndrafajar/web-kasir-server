import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    noTransaksi: {
      type: String,
      unique: true,
    },
    items: [
      {
        menuId: {
          type: mongoose.ObjectId,
          ref: "Menu",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalQuantity: {
      type: Number,
      required: true,
    },
    bayar: {
      type: Number,
      required: true,
    },
    kembalian: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware untuk menghasilkan noTransaksi secara otomatis
orderSchema.pre("save", async function (next) {
  if (!this.noTransaksi) {
    try {
      // Cari nomor transaksi terakhir
      const lastOrder = await this.constructor.findOne({}, { noTransaksi: 1 }, { sort: { createdAt: -1 } });
      if (lastOrder && lastOrder.noTransaksi) {
        // Ambil nomor terakhir dan tambahkan 1
        const lastNumber = parseInt(lastOrder.noTransaksi, 10);
        this.noTransaksi = (lastNumber + 1).toString().padStart(3, "0");
      } else {
        // Jika tidak ada order sebelumnya, mulai dari "001"
        this.noTransaksi = "001";
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const orderModel = mongoose.model("Order", orderSchema);

export default orderModel;
