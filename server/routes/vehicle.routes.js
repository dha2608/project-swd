const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles
} = require('../controllers/vehicle.controller');
const {
    validateVehicleRules,
    validate
} = require('../middleware/validation.middleware');

const router = express.Router();

router.get('/available', protect, authorize('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), getAvailableVehicles);

router.use(protect);

router.get('/', authorize('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), getVehicles);
router.get('/:id', authorize('DealerStaff', 'DealerManager', 'EVMStaff', 'Admin'), getVehicleById);
router.post('/', authorize('DealerManager', 'Admin'), validateVehicleRules, validate, createVehicle);
router.put('/:id', authorize('DealerManager', 'Admin'), validateVehicleRules, validate, updateVehicle);
router.delete('/:id', authorize('DealerManager', 'Admin'), deleteVehicle);

module.exports = router;