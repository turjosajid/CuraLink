import React, { useState, useEffect } from 'react';
import './AppointmentSlotsModal.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '17:00';

const AppointmentSlotsModal = ({ show, onClose, onSave, initialSlots = [] }) => {
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        if (show) {
            const defaultSlots = DAYS.map(day => ({
                day,
                slots: []
            }));

            // Merge initial slots with default slots
            const mergedSlots = defaultSlots.map(defaultDay => {
                const existingDay = initialSlots.find(s => s.day === defaultDay.day);
                return existingDay || defaultDay;
            });

            setSlots(mergedSlots);
        }
    }, [show, initialSlots]);

    const addSlot = (dayIndex) => {
        const newSlots = [...slots];
        const daySlots = newSlots[dayIndex].slots;

        // Default time for new slot
        const newSlot = {
            startTime: DEFAULT_START_TIME,
            endTime: DEFAULT_END_TIME,
            isAvailable: true
        };

        // Check for overlapping slots
        const hasOverlap = daySlots.some(slot => {
            const newStart = new Date(`2000/01/01 ${newSlot.startTime}`);
            const newEnd = new Date(`2000/01/01 ${newSlot.endTime}`);
            const slotStart = new Date(`2000/01/01 ${slot.startTime}`);
            const slotEnd = new Date(`2000/01/01 ${slot.endTime}`);

            return (newStart < slotEnd && newEnd > slotStart);
        });

        if (hasOverlap) {
            alert('This time slot overlaps with an existing slot');
            return;
        }

        daySlots.push(newSlot);
        // Sort slots by start time
        daySlots.sort((a, b) => {
            return new Date(`2000/01/01 ${a.startTime}`) - new Date(`2000/01/01 ${b.startTime}`);
        });
        setSlots(newSlots);
    };

    const handleSlotChange = (dayIndex, slotIndex, field, value) => {
        try {
            const newSlots = [...slots];
            newSlots[dayIndex].slots[slotIndex] = {
                ...newSlots[dayIndex].slots[slotIndex],
                [field]: value
            };
            setSlots(newSlots);
        } catch (error) {
            console.error('Error updating slot:', error);
        }
    };

    const removeSlot = (dayIndex, slotIndex) => {
        const newSlots = [...slots];
        newSlots[dayIndex].slots.splice(slotIndex, 1);
        setSlots(newSlots);
    };

    const handleSave = () => {
        try {
            // Clean and validate slots
            const slotsToSave = slots.map(day => ({
                day: day.day,
                slots: day.slots.map(slot => ({
                    startTime: slot.startTime || DEFAULT_START_TIME,
                    endTime: slot.endTime || DEFAULT_END_TIME,
                    isAvailable: true
                }))
            })).filter(day => day.slots.length > 0);

            if (slotsToSave.length === 0) {
                alert('Please add at least one time slot');
                return;
            }

            onSave(slotsToSave);
        } catch (error) {
            console.error('Error processing slots:', error);
            alert('Error processing slots. Please try again.');
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Manage Appointment Slots</h2>
                
                {slots.map((day, dayIndex) => (
                    <div key={day.day} className="day-slots">
                        <h3>{day.day}</h3>
                        {day.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="slot-item">
                                <input
                                    type="time"
                                    value={slot.startTime}
                                    onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                                />
                                <span>to</span>
                                <input
                                    type="time"
                                    value={slot.endTime}
                                    onChange={(e) => handleSlotChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                                />
                                <button 
                                    className="remove-slot-btn"
                                    onClick={() => removeSlot(dayIndex, slotIndex)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button 
                            className="add-slot-btn"
                            onClick={() => addSlot(dayIndex)}
                        >
                            Add Slot
                        </button>
                    </div>
                ))}

                <div className="modal-actions">
                    <button onClick={handleSave} className="save-btn">
                        Save Slots
                    </button>
                    <button onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentSlotsModal;
