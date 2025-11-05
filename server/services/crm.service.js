const Customer = require('../models/customer.model');
const TestDrive = require('../models/testDrive.model');
const Feedback = require('../models/feedback.model');
// Giả định chúng ta sẽ sớm có Vehicle model
// const Vehicle = require('../models/vehicle.model'); 

// Thông điệp 3: findOrCreateCustomer
async function findOrCreateCustomer(name, phone) {
    let customer = await Customer.findOne({ phone: phone });
    if (!customer) {
        customer = new Customer({ name, phone });
        await customer.save();
    }
    return customer;
}

// Chức năng 1.c.2: Đặt lịch hẹn
async function bookTestDrive(requestData) {
    const { customerName, customerPhone, vehicleId, schedule } = requestData;

    // 1. (Msg 3) Tìm hoặc tạo Customer
    const customer = await findOrCreateCustomer(customerName, customerPhone);

    // 2. (Msg 8) Kiểm tra lịch (Giả định tạm thời là OK)
    // const vehicle = await Vehicle.findById(vehicleId);
    // if (!vehicle) throw new Error('Vehicle not found');
    
    // 3. (Msg 9) Tạo TestDrive
    const newTestDrive = new TestDrive({
        customer: customer._id,
        vehicle: vehicleId, // Sẽ thay bằng vehicle._id
        schedule: new Date(schedule),
        status: 'PENDING'
    });
    await newTestDrive.save();

    // 4. Cập nhật quan hệ
    customer.testDrives.push(newTestDrive._id);
    await customer.save();

    return newTestDrive;
}

// Chức năng 1.c.3: Ghi nhận khiếu nại
async function logFeedback(requestData) {
    const { customerId, content } = requestData;

    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new Error('Customer not found');
    }

    const newFeedback = new Feedback({
        customer: customer._id,
        content: content
    });
    await newFeedback.save();

    customer.feedbacks.push(newFeedback._id);
    await customer.save();

    return newFeedback;
}

module.exports = {
    bookTestDrive,
    logFeedback
};