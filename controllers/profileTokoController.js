import profileTokoModel from "../models/profileTokoModel.js";

//create
export const createProfileToko = async (req, res) => {
  try {
    // Cek apakah sudah ada data profileToko
    const existingProfile = await profileTokoModel.findOne();
    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists. You can only edit the existing profile.",
      });
    }

    const { name, alamat } = req.body;

    // Cek apakah file gambar disertakan
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Mengubah file gambar menjadi base64
    const imgProfile = req.file.buffer.toString("base64");

    // Membuat data baru untuk profileToko
    const newProfileToko = new profileTokoModel({
      imgProfile,
      name,
      alamat,
    });

    // Simpan data ke database
    await newProfileToko.save();

    res.status(201).json({
      message: "Profile Toko created successfully",
      data: newProfileToko,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create profile", error: error.message });
  }
};

//edit
export const editProfileToko = async (req, res) => {
  try {
    const { name, alamat } = req.body;

    // Cek apakah ada data profileToko
    const existingProfile = await profileTokoModel.findOne();
    if (!existingProfile) {
      return res.status(404).json({
        message: "No profile found. Please create a profile first.",
      });
    }

    // Cek apakah file gambar disertakan
    let imgProfile = existingProfile.imgProfile; // Pertahankan gambar lama jika tidak ada file baru
    if (req.file) {
      imgProfile = req.file.buffer.toString("base64"); // Update dengan gambar baru
    }

    // Update data profileToko
    existingProfile.name = name || existingProfile.name;
    existingProfile.alamat = alamat || existingProfile.alamat;
    existingProfile.imgProfile = imgProfile;

    // Simpan perubahan ke database
    await existingProfile.save();

    res.status(200).json({
      message: "Profile Toko updated successfully",
      data: existingProfile,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

//get
export const getProfileToko = async (req, res) => {
  try {
    // Mengambil data profileToko yang pertama (karena hanya ada satu profil)
    const profile = await profileTokoModel.findOne();

    // Jika tidak ditemukan profil, kirimkan pesan error
    if (!profile) {
      return res.status(404).json({ message: "Profile Toko not found. Please create a profile." });
    }

    // Kirimkan data profil
    res.status(200).json({
      message: "Profile Toko fetched successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};
