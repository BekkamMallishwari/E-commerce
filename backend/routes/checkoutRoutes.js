// backend/routes/checkoutRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { validateDiscountMiddleware } = require('../middleware/discountValidator');

// Apply discount validation to checkout
router.post(
    '/checkout',
    authMiddleware,
    validateDiscountMiddleware,
    async (req, res) => {
        try {
            const { items, shippingAddress } = req.body;
            const { finalDiscount, appliedRules } = req.validatedDiscount;
            const orderTotal = req.validatedOrderTotal;

            // Calculate final total
            const shippingCost = calculateShipping(shippingAddress);
            const tax = calculateTax(orderTotal);
            const finalTotal = orderTotal + shippingCost + tax - finalDiscount;

            // Process order with validated discount
            const order = await processOrder({
                userId: req.user.id,
                items,
                shippingAddress,
                discount: finalDiscount,
                total: finalTotal,
                appliedRules
            });

            res.status(201).json({
                success: true,
                message: 'Order placed successfully',
                orderId: order.id,
                discount: finalDiscount,
                originalTotal: orderTotal,
                finalTotal,
                appliedRules
            });
        } catch (error) {
            console.error('Checkout error:', error);
            res.status(500).json({
                success: false,
                error: 'Order processing failed'
            });
        }
    }
);

module.exports = router;