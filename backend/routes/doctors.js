// ...existing imports...

router.put('/:id/profile', auth, async (req, res) => {
    try {
        const { specialization, education } = req.body;
        const doctor = await Doctor.findByIdAndUpdate(
            req.params.id,
            {
                specialization,
                education
            },
            { new: true }  // This option returns the updated document
        ).select('-password');  // Exclude password from the response

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.json(doctor);
    } catch (error) {
        console.error('Error updating doctor profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get doctor's appointment slots
router.get('/:id/slots', auth, async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(doctor.appointmentSlots || []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointment slots' });
    }
});

// Update doctor's appointment slots
router.put('/:id/slots', auth, async (req, res) => {
    try {
        const { slots } = req.body;
        console.log('Received slots:', slots);

        if (!Array.isArray(slots)) {
            return res.status(400).json({
                message: 'Slots must be an array'
            });
        }

        // Validate and clean slots data
        const cleanedSlots = slots.map(day => ({
            day: day.day,
            slots: day.slots.map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                isAvailable: true
            }))
        }));

        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        doctor.appointmentSlots = cleanedSlots;
        await doctor.save();

        console.log('Updated doctor slots:', doctor.appointmentSlots);
        res.json(doctor.appointmentSlots);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            message: 'Error updating appointment slots',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// ...rest of the routes...
