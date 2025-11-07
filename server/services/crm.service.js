const Customer = require('../models/customer.model');
const TestDrive = require('../models/testDrive.model');
const Feedback = require('../models/feedback.model');

async function findOrCreateCustomer(name, phone) {
    let customer = await Customer.findOne({ phone: phone });
    if (!customer) {
        customer = new Customer({ name, phone });
        await customer.save();
    }
    return customer;
}
async function bookTestDrive(requestData) {
    const { customerName, customerPhone, vehicleId, schedule } = requestData;
    const scheduleDate = new Date(schedule);
    const customer = await findOrCreateCustomer(customerName, customerPhone);


    const isAvailable = await isSlotAvailable(vehicleId, scheduleDate);
    if (!isAvailable) {

        throw new Error('Khung giờ này cho xe đã chọn đã có người đặt. Vui lòng chọn giờ khác.');
    }


    const newTestDrive = new TestDrive({
        customer: customer._id,
        vehicle: vehicleId,
        schedule: scheduleDate,
        status: 'PENDING'
    });
    

    await newTestDrive.save();


    customer.testDrives.push(newTestDrive._id);
    await customer.save();

    return newTestDrive;
}


async function isSlotAvailable(vehicleId, scheduleDate) {
    const oneHour = 60 * 60 * 1000;
    
    const slotStart = new Date(scheduleDate.getTime() - oneHour);
    const slotEnd = new Date(scheduleDate.getTime() + oneHour);

    const conflict = await TestDrive.findOne({
        vehicle: vehicleId,
        status: { $in: ['PENDING', 'CONFIRMED'] }, 
        schedule: {
            $gte: slotStart,
            $lte: slotEnd   
        }
    });

    return !conflict;
}


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