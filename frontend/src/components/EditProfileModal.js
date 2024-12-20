import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

const EditProfileModal = ({ show, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        specialization: '',
        education: [{ degree: '', institution: '', year: '' }]
    });

    useEffect(() => {
        if (show) {
            setFormData({
                specialization: initialData.specialization || '',
                education: initialData.education?.length > 0 
                    ? initialData.education 
                    : [{ degree: '', institution: '', year: '' }]
            });
        }
    }, [show, initialData]);

    const handleAddEducation = () => {
        setFormData({
            ...formData,
            education: [...formData.education, { degree: '', institution: '', year: '' }]
        });
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const handleSave = () => {
        // Validate data
        if (!formData.specialization.trim()) {
            alert('Please enter specialization');
            return;
        }

        const validEducation = formData.education.filter(edu => 
            edu.degree.trim() && edu.institution.trim() && edu.year.trim()
        );

        if (validEducation.length === 0) {
            alert('Please enter at least one complete education record');
            return;
        }

        // Send only valid education entries
        const dataToSave = {
            ...formData,
            education: validEducation
        };

        onSave(dataToSave);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Profile</h2>
                
                <div className="form-group">
                    <label>Specialization</label>
                    <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        placeholder="Enter your specialization"
                    />
                </div>

                <div className="form-group">
                    <label>Education</label>
                    {formData.education.map((edu, index) => (
                        <div key={index} className="education-fields">
                            <input
                                type="text"
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Institution"
                                value={edu.institution}
                                onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Year"
                                value={edu.year}
                                onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={handleAddEducation} className="add-education-btn">
                        Add More Education
                    </button>
                </div>

                <div className="modal-actions">
                    <button onClick={handleSave} className="save-btn">
                        Save Changes
                    </button>
                    <button onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;
