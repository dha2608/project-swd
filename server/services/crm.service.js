const Customer = require('../models/customer.model');
const TestDrive = require('../models/testDrive.model');
const Feedback = require('../models/feedback.model');
// const Vehicle = require('../models/vehicle.model'); // Sẽ cần khi làm mục 1.a

/**
 * Logic cho "findOrCreateCustomer" (Thông điệp 3 trong Sơ đồ Tuần tự)
 */
async function findOrCreateCustomer(name, phone, email = null) {
    let customer = await Customer.findOne({ phone: phone });
    if (customer) {
        return customer; // Trả về khách hàng đã tìm thấy
    }
    // Nếu không, tạo mới
    customer = new Customer({ name, phone, email });
    await customer.save();
    return customer;
}

/**
 * Logic cho 1.c.2: Quản lý lịch hẹn lái thử
 * (Thông điệp 7: "bookSlot" trong Sơ đồ Tuần tự)
 */
async function bookTestDrive(requestData) {
    const { customerName, customerPhone, vehicleId, schedule } = requestData;

    // 1. Tìm hoặc tạo khách hàng (Msg 3)
    const customer = await findOrCreateCustomer(customerName, customerPhone);

    // 2. (Msg 8) Kiểm tra lịch (Giả định tạm thời)
    // const vehicle = await Vehicle.findById(vehicleId);
    // if (!vehicle) throw new Error('Vehicle not found'); // Sẽ kích hoạt khi có 1.a
    if (!vehicleId) throw new Error('Vehicle ID is required');

    // 3. Tạo TestDrive (Msg 9)
    const newTestDrive = new TestDrive({
        customer: customer._id,
        vehicle: vehicleId, // Sẽ dùng vehicle._id sau
        schedule: new Date(schedule),
        status: 'PENDING'
    });
    await newTestDrive.save();

    // 4. Cập nhật quan hệ (Map với thoi đặc Composition)
    customer.testDrives.push(newTestDrive._id);
    await customer.save();

    return newTestDrive;
}

/**
 * Logic cho 1.c.3: Ghi nhận khiếu nại
 */
async function logFeedback(requestData) {
    const { customerId, content } = requestData;

    // Giả định customerId được cung cấp (vì user đang đăng nhập)
    // Hoặc chúng ta có thể dùng logic findOrCreateCustomer
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new Error('Customer not found. Cannot log feedback.');
    }

    const newFeedback = new Feedback({
        customer: customer._id,
        content: content,
        status: 'OPEN'
    });
    await newFeedback.save();

    // Cập nhật quan hệ (Map với thoi đặc Composition)
    customer.feedbacks.push(newFeedback._id);
    await customer.save();

    return newFeedback;
}

module.exports = {
    bookTestDrive,
    logFeedback,
    findOrCreateCustomer
};