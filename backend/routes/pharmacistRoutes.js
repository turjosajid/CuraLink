const express = require('express');
const { registerPharmacist, getPharmacistProfile, updatePharmacistProfile, updateInventory, getInventory, notifyUnavailableMedications, addDrugToInventory, removeDrugFromInventory } = require('../controllers/pharmacistController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All pharmacist routes require authentication
router.use(protect);

router.post('/register', registerPharmacist);
router.get('/profile', getPharmacistProfile);
router.patch('/profile', updatePharmacistProfile);
router.put('/inventory', updateInventory);
router.get('/inventory', getInventory);
router.post('/notifications', notifyUnavailableMedications);
router.post('/inventory/add', addDrugToInventory);
router.delete('/inventory/remove/:drugId', removeDrugFromInventory);

module.exports = router;
