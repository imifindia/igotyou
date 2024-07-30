const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const gioTagController = require('../controllers/gioTagController');
const gioValidator = require('../validators/GioTagValidator');

router.post('/users', userController.createUser);
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);


router.post(
    '/gioTags',
    gioValidator.newTagValidation,
    gioValidator.validate,
    gioTagController.createGioTag
);
router.get(
    '/gioTags',
    gioTagController.getGioTags
);
router.get(
    '/gioTags/:id',
    gioValidator.isIdMongoID,
    gioValidator.validate,
    gioTagController.getGioTag
);
const updatevalidations = gioValidator.isIdMongoID.concat(gioValidator.newTagValidation);
router.put(
    '/gioTags/:id',
    updatevalidations,
    gioValidator.validate,
    gioTagController.updateGioTag);



module.exports = router;