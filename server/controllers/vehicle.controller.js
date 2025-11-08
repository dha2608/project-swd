const Vehicle = require('../models/vehicle.model');

const getVehicles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, brand, model } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (status) query.status = status;
        if (brand) query.brand = new RegExp(brand, 'i');
        if (model) query.model = new RegExp(model, 'i');

        if (['DealerStaff', 'DealerManager'].includes(req.user.role)) {
            query.dealer = req.user.id;
        }

        const [vehicles, total] = await Promise.all([
            Vehicle.find(query)
                .populate('dealer', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Vehicle.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe thành công',
            data: vehicles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getVehicleById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = { _id: id };
        if (['DealerStaff', 'DealerManager'].includes(req.user.role)) {
            query.dealer = req.user.id;
        }

        const vehicle = await Vehicle.findOne(query).populate('dealer', 'name email');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Xe không tồn tại hoặc bạn không có quyền truy cập'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin xe thành công',
            data: vehicle
        });
    } catch (error) {
        next(error);
    }
};

const createVehicle = async (req, res, next) => {
    try {
        const vehicleData = {
            ...req.body,
            dealer: req.user.id // Gán xe cho dealer hiện tại
        };

        const vehicle = await Vehicle.create(vehicleData);

        res.status(201).json({
            success: true,
            message: 'Tạo xe mới thành công',
            data: vehicle
        });
    } catch (error) {
        next(error);
    }
};

const updateVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const query = { _id: id };
        if (['DealerStaff', 'DealerManager'].includes(req.user.role)) {
            query.dealer = req.user.id;
        }

        const vehicle = await Vehicle.findOneAndUpdate(
            query,
            updateData,
            { new: true, runValidators: true }
        ).populate('dealer', 'name email');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Xe không tồn tại hoặc bạn không có quyền cập nhật'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật xe thành công',
            data: vehicle
        });
    } catch (error) {
        next(error);
    }
};

const deleteVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;

        const query = { _id: id };
        if (['DealerStaff', 'DealerManager'].includes(req.user.role)) {
            query.dealer = req.user.id;
        }

        const vehicle = await Vehicle.findOneAndDelete(query);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Xe không tồn tại hoặc bạn không có quyền xóa'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa xe thành công',
            data: vehicle
        });
    } catch (error) {
        next(error);
    }
};

const getAvailableVehicles = async (req, res, next) => {
    try {
        const { brand, model } = req.query;
        
        const query = { status: 'AVAILABLE' };
        if (brand) query.brand = new RegExp(brand, 'i');
        if (model) query.model = new RegExp(model, 'i');

        if (req.user && ['DealerStaff', 'DealerManager'].includes(req.user.role)) {
            query.dealer = req.user.id;
        }

        const vehicles = await Vehicle.find(query)
            .select('model brand year color price batteryCapacity range features images')
            .populate('dealer', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe có sẵn thành công',
            data: vehicles
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles
};