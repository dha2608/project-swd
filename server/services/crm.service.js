const Customer = require('../models/customer.model');
const TestDrive = require('../models/testDrive.model');
const Feedback = require('../models/feedback.model');
const Vehicle = require('../models/vehicle.model');
const User = require('../models/user.model');

async function findOrCreateCustomer(name, phone, email = null, dealerId = null) {
    try {
        const trimmedName = (name || '').trim();
        const normalizedPhone = (phone || '').toString().replace(/\D+/g, '');
        if (!trimmedName || trimmedName.length < 2) {
            const err = new Error('Tên khách hàng không hợp lệ (tối thiểu 2 ký tự)');
            err.statusCode = 400;
            throw err;
        }
        if (!/^0\d{9,10}$/.test(normalizedPhone)) {
            const err = new Error('Số điện thoại không hợp lệ');
            err.statusCode = 400;
            throw err;
        }
        const byPhone = await Customer.findOne({ phone: normalizedPhone });
        const byName = await Customer.findOne({ name: trimmedName });

        if (byPhone) {
            if (byName && byName._id.toString() !== byPhone._id.toString()) {
                const err = new Error('Tên hoặc số điện thoại đã tồn tại nhưng không khớp nhau');
                err.statusCode = 409;
                throw err;
            }
            if (byPhone.name !== trimmedName) {
                const err = new Error('Số điện thoại đã tồn tại hoặc không khớp với tên');
                err.statusCode = 409;
                throw err;
            }
            if (dealerId && byPhone.dealer && byPhone.dealer.toString() !== dealerId.toString()) {
                const err = new Error('Khách hàng này không thuộc quyền quản lý của bạn');
                err.statusCode = 403;
                throw err;
            }
            if (email && !byPhone.email) {
                byPhone.email = email;
                await byPhone.save();
            }
            return byPhone;
        }

        if (byName && !byPhone) {
            const err = new Error('Tên khách hàng đã tồn tại; số điện thoại phải trùng với hồ sơ hiện có');
            err.statusCode = 409;
            throw err;
        }

        const customer = new Customer({ 
            name: trimmedName, 
            phone: normalizedPhone,
            email,
            dealer: dealerId
        });
        await customer.save();
        return customer;
    } catch (error) {
        const err = new Error(error.message);
        err.statusCode = error.statusCode || 400;
        throw err;
    }
}

async function isSlotAvailable(vehicleId, scheduleDate, dealerId) {
    try {
        const oneHour = 60 * 60 * 1000;
        
        const slotStart = new Date(scheduleDate.getTime() - oneHour);
        const slotEnd = new Date(scheduleDate.getTime() + oneHour);

        const conflict = await TestDrive.findOne({
            vehicle: vehicleId,
            dealer: dealerId,
            status: { $in: ['PENDING', 'CONFIRMED'] }, 
            schedule: {
                $gte: slotStart,
                $lte: slotEnd   
            }
        });

        return !conflict;
    } catch (error) {
        throw new Error(`Lỗi kiểm tra khung giờ: ${error.message}`);
    }
}

async function bookTestDrive(requestData) {
    const { customerId, customerName, customerPhone, customerEmail, vehicleId, schedule, dealerId } = requestData;
    try {
        console.info('[CRM] Booking attempt', {
            dealerId,
            vehicleId,
            customerId: customerId || null,
            customerName: customerName || null,
            customerPhone: customerPhone || null,
            schedule
        });

        const actor = await User.findById(dealerId);
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            console.warn('[CRM] Vehicle not found', { vehicleId, dealerId, actorRole: actor?.role });
            const err = new Error('Xe không tồn tại');
            err.statusCode = 404;
            throw err;
        }

        if (actor && ['DealerStaff', 'DealerManager'].includes(actor.role)) {
            if (!vehicle.dealer || vehicle.dealer.toString() !== dealerId.toString()) {
                console.warn('[CRM] Unauthorized vehicle access', {
                    dealerId,
                    actorRole: actor.role,
                    vehicleDealer: vehicle.dealer ? vehicle.dealer.toString() : null,
                    vehicleId
                });
                const err = new Error('Xe không thuộc quyền quản lý của bạn');
                err.statusCode = 403;
                throw err;
            }
        }

        const dealerRef = vehicle.dealer;

        if (vehicle.status !== 'AVAILABLE') {
            console.warn('[CRM] Vehicle not available', { vehicleId, status: vehicle.status });
            const err = new Error('Xe hiện không có sẵn để đặt lịch lái thử');
            err.statusCode = 409;
            throw err;
        }

        const scheduleDate = new Date(schedule);
        
        if (scheduleDate <= new Date()) {
            console.warn('[CRM] Invalid schedule date', { schedule: scheduleDate.toISOString() });
            const err = new Error('Ngày hẹn phải là ngày trong tương lai');
            err.statusCode = 400;
            throw err;
        }

        const hour = scheduleDate.getHours();
        if (hour < 8 || hour >= 18) {
            const err = new Error('Lịch hẹn chỉ trong khung giờ 08:00-18:00');
            err.statusCode = 400;
            throw err;
        }
        if (scheduleDate.getDay() === 0) {
            const err = new Error('Không nhận lịch hẹn vào Chủ nhật');
            err.statusCode = 400;
            throw err;
        }

        let customer;
        if (customerId) {
            customer = await Customer.findById(customerId);
            if (!customer) {
                console.warn('[CRM] Customer not found', { customerId });
                if (customerName && customerPhone) {
                    customer = await findOrCreateCustomer(customerName, customerPhone, customerEmail, dealerRef);
                } else {
                    const err = new Error('Khách hàng không tồn tại');
                    err.statusCode = 404;
                    throw err;
                }
            }
            if (customer.dealer && dealerRef && customer.dealer.toString() !== dealerRef.toString()) {
                console.warn('[CRM] Customer dealer mismatch', {
                    customerDealer: customer.dealer ? customer.dealer.toString() : null,
                    vehicleDealer: dealerRef ? dealerRef.toString() : null
                });
                const err = new Error('Khách hàng này không thuộc quyền quản lý của đại lý sở hữu xe');
                err.statusCode = 403;
                throw err;
            }
            if (!customer.email && customerEmail) {
                customer.email = customerEmail;
                await customer.save();
            }
        } else {
            customer = await findOrCreateCustomer(customerName, customerPhone, customerEmail, dealerRef);
        }

        const sevenDaysAgo = new Date(scheduleDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const sameModelVehicles = await Vehicle.find({ model: vehicle.model }, '_id');
        const sameModelVehicleIds = sameModelVehicles.map(v => v._id);
        if (sameModelVehicleIds.length > 0) {
            const existingSameModelRecent = await TestDrive.findOne({
                customer: customer._id,
                vehicle: { $in: sameModelVehicleIds },
                schedule: { $gte: sevenDaysAgo, $lt: scheduleDate }
            });
            if (existingSameModelRecent) {
                const err = new Error('Khách hàng chỉ được thử lại cùng mẫu xe sau 7 ngày');
                err.statusCode = 409;
                throw err;
            }
        }

        const dayStart = new Date(scheduleDate);
        dayStart.setHours(0,0,0,0);
        const dayEnd = new Date(scheduleDate);
        dayEnd.setHours(23,59,59,999);
        const existingSameDay = await TestDrive.findOne({
            customer: customer._id,
            dealer: dealerRef,
            status: { $in: ['PENDING', 'CONFIRMED'] },
            schedule: { $gte: dayStart, $lte: dayEnd }
        });
        if (existingSameDay) {
            const err = new Error('Khách hàng đã có lịch hẹn trong ngày này. Vui lòng chọn ngày khác.');
            err.statusCode = 409;
            throw err;
        }
        const isAvailable = await isSlotAvailable(vehicleId, scheduleDate, dealerRef);
        if (!isAvailable) {
            console.warn('[CRM] Time slot conflict', {
                vehicleId,
                dealer: dealerRef ? dealerRef.toString() : null,
                schedule: scheduleDate.toISOString()
            });
            const err = new Error('Khung giờ này cho xe đã chọn đã có người đặt. Vui lòng chọn giờ khác.');
            err.statusCode = 409;
            throw err;
        }

        const newTestDrive = new TestDrive({
            customer: customer._id,
            vehicle: vehicleId,
            dealer: dealerRef,
            schedule: scheduleDate,
            status: 'PENDING',
            notes: requestData.notes || ''
        });
        
        await newTestDrive.save();

        customer.testDrives.push(newTestDrive._id);
        await customer.save();

        await newTestDrive.populate([
            { path: 'customer', select: 'name phone email' },
            { path: 'vehicle', select: 'model brand year color' }
        ]);

        console.info('[CRM] Test drive created', {
            testDriveId: newTestDrive._id.toString(),
            dealer: dealerRef ? dealerRef.toString() : null,
            vehicleId,
            customerId: customer._id.toString(),
            schedule: scheduleDate.toISOString()
        });
        return newTestDrive;
    } catch (error) {
        console.error('[CRM] Booking error', { message: error.message, statusCode: error.statusCode, vehicleId, dealerId });
        throw error;
    }
}

async function getTestDrives(filters = {}, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        
        const query = {};
        if (filters.dealerId) query.dealer = filters.dealerId;
        if (filters.status) query.status = filters.status;
        if (filters.customerPhone) {
            const customers = await Customer.find({ phone: filters.customerPhone }, '_id');
            query.customer = { $in: customers.map(c => c._id) };
        }

        const [testDrives, total] = await Promise.all([
            TestDrive.find(query)
                .populate('customer', 'name phone email')
                .populate('vehicle', 'model brand year color price')
                .populate('dealer', 'name email')
                .sort({ schedule: -1 })
                .skip(skip)
                .limit(limit),
            TestDrive.countDocuments(query)
        ]);

        return {
            testDrives,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách lịch hẹn: ${error.message}`);
    }
}

async function updateTestDriveStatus(testDriveId, status, dealerId) {
    try {
        const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        
        if (!validStatuses.includes(status)) {
            const err = new Error('Trạng thái không hợp lệ');
            err.statusCode = 400;
            throw err;
        }

        const testDrive = await TestDrive.findOne({ _id: testDriveId, dealer: dealerId });
        if (!testDrive) {
            const err = new Error('Lịch hẹn không tồn tại hoặc không thuộc quyền quản lý của bạn');
            err.statusCode = 404;
            throw err;
        }

        const allowedTransitions = {
            PENDING: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['COMPLETED', 'CANCELLED'],
            COMPLETED: [],
            CANCELLED: []
        };
        const current = testDrive.status;
        if (!allowedTransitions[current].includes(status)) {
            const err = new Error(`Không thể chuyển từ trạng thái ${current} sang ${status}`);
            err.statusCode = 400;
            throw err;
        }

        testDrive.status = status;
        await testDrive.save();

        await testDrive.populate([
            { path: 'customer', select: 'name phone email' },
            { path: 'vehicle', select: 'model brand year color' }
        ]);

        return testDrive;
    } catch (error) {
        throw error;
    }
}

async function logFeedback(requestData) {
    try {
        const { customerId, customerName, customerPhone, content, type = 'GENERAL', dealerId } = requestData;

        let customer;
        if (customerId) {
            customer = await Customer.findById(customerId);
            if (!customer) {
                if (customerName && customerPhone) {
                    customer = await findOrCreateCustomer(customerName, customerPhone, null, dealerId);
                } else {
                    const err = new Error('Khách hàng không tồn tại');
                    err.statusCode = 404;
                    throw err;
                }
            }

            if (customer.dealer && customer.dealer.toString() !== dealerId.toString()) {
                const err = new Error('Khách hàng này không thuộc quyền quản lý của bạn');
                err.statusCode = 403;
                throw err;
            }
        } else {
            customer = await findOrCreateCustomer(customerName, customerPhone, null, dealerId);
        }

        const newFeedback = new Feedback({
            customer: customer._id,
            dealer: dealerId,
            content: content,
            type: type,
            status: 'OPEN'
        });
        
        await newFeedback.save();

        customer.feedbacks.push(newFeedback._id);
        await customer.save();

        await newFeedback.populate('customer', 'name phone email');

        return newFeedback;
    } catch (error) {
        throw error;
    }
}

async function getFeedback(filters = {}, page = 1, limit = 10) {
    try {
        const skip = (page - 1) * limit;
        
        const query = {};
        if (filters.dealerId) query.dealer = filters.dealerId;
        if (filters.status) query.status = filters.status;

        const [feedback, total] = await Promise.all([
            Feedback.find(query)
                .populate('customer', 'name phone email')
                .populate('dealer', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Feedback.countDocuments(query)
        ]);

        return {
            feedback,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách phản hồi: ${error.message}`);
    }
}

async function updateFeedbackStatus(feedbackId, status, resolution, dealerId) {
    try {
        const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
        
        if (!validStatuses.includes(status)) {
            const err = new Error('Trạng thái không hợp lệ');
            err.statusCode = 400;
            throw err;
        }

        const feedback = await Feedback.findOne({ _id: feedbackId, dealer: dealerId });
        if (!feedback) {
            const err = new Error('Phản hồi không tồn tại hoặc không thuộc quyền quản lý của bạn');
            err.statusCode = 404;
            throw err;
        }

        if ((status === 'RESOLVED' || status === 'CLOSED') && !resolution) {
            const err = new Error('Vui lòng cung cấp phương án xử lý khi chuyển trạng thái sang đã xử lý/đóng');
            err.statusCode = 400;
            throw err;
        }

        const allowedTransitions = {
            OPEN: ['IN_PROGRESS', 'CLOSED'],
            IN_PROGRESS: ['RESOLVED', 'CLOSED'],
            RESOLVED: ['CLOSED'],
            CLOSED: []
        };
        const current = feedback.status;
        if (!allowedTransitions[current].includes(status)) {
            const err = new Error(`Không thể chuyển từ trạng thái ${current} sang ${status}`);
            err.statusCode = 400;
            throw err;
        }

        feedback.status = status;
        if (resolution) {
            feedback.resolution = resolution;
        }
        if (status === 'RESOLVED') {
            feedback.resolvedAt = new Date();
        }
        if (status === 'CLOSED' && !feedback.resolvedAt) {
            feedback.resolvedAt = new Date();
        }
        
        await feedback.save();

        await feedback.populate('customer', 'name phone email');

        return feedback;
    } catch (error) {
        throw error;
    }
}

async function getCRMStatistics(dealerId) {
    try {
        const [
            totalCustomers,
            totalTestDrives,
            totalFeedback,
            pendingTestDrives,
            openFeedback,
            completedTestDrivesThisMonth
        ] = await Promise.all([
            Customer.countDocuments({ dealer: dealerId }),
            TestDrive.countDocuments({ dealer: dealerId }),
            Feedback.countDocuments({ dealer: dealerId }),
            TestDrive.countDocuments({ dealer: dealerId, status: 'PENDING' }),
            Feedback.countDocuments({ dealer: dealerId, status: 'OPEN' }),
            TestDrive.countDocuments({
                dealer: dealerId,
                status: 'COMPLETED',
                createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            })
        ]);

        const upcomingTestDrives = await TestDrive.find({
            dealer: dealerId,
            status: { $in: ['PENDING', 'CONFIRMED'] },
            schedule: { $gte: new Date() }
        })
        .populate('customer', 'name phone')
        .populate('vehicle', 'model brand')
        .sort({ schedule: 1 })
        .limit(5);

        return {
            overview: {
                totalCustomers,
                totalTestDrives,
                totalFeedback,
                pendingTestDrives,
                openFeedback
            },
            performance: {
                completedTestDrivesThisMonth,
                conversionRate: totalCustomers > 0 ? ((completedTestDrivesThisMonth / totalCustomers) * 100).toFixed(1) : 0
            },
            upcomingTestDrives
        };
    } catch (error) {
        throw new Error(`Lỗi khi lấy thống kê: ${error.message}`);
    }
}

module.exports = {
    bookTestDrive,
    getTestDrives,
    updateTestDriveStatus,
    logFeedback,
    getFeedback,
    updateFeedbackStatus,
    getCRMStatistics
};

async function getCustomers(dealerId) {
    try {
        const customers = await Customer.find({ dealer: dealerId })
            .select('name phone email');
        return customers;
    } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách khách hàng: ${error.message}`);
    }
}

module.exports.getCustomers = getCustomers;