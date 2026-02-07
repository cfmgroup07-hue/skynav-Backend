import Flight from '../models/Flight.js';

const searchFlights = async (req, res) => {
    try {
        const { from, to } = req.query;
        const query = { isActive: true };
        if (from) query.from = new RegExp(`^${from}`, 'i');
        if (to) query.to = new RegExp(`^${to}`, 'i');

        const flights = await Flight.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, flights });
    } catch (error) {
        console.error('Search flights error:', error);
        res.status(500).json({ success: false, message: 'Server error while searching flights' });
    }
};

const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        if (!flight) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }
        res.status(200).json({ success: true, flight });
    } catch (error) {
        console.error('Get flight error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching flight' });
    }
};

const createFlight = async (req, res) => {
    try {
        const flight = await Flight.create(req.body);
        res.status(201).json({ success: true, flight });
    } catch (error) {
        console.error('Create flight error:', error);
        res.status(500).json({ success: false, message: 'Server error while creating flight' });
    }
};

const updateFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!flight) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }
        res.status(200).json({ success: true, flight });
    } catch (error) {
        console.error('Update flight error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating flight' });
    }
};

const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        if (!flight) {
            return res.status(404).json({ success: false, message: 'Flight not found' });
        }
        res.status(200).json({ success: true, message: 'Flight deleted' });
    } catch (error) {
        console.error('Delete flight error:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting flight' });
    }
};

export { searchFlights, getFlightById, createFlight, updateFlight, deleteFlight };
