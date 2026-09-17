import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

import Payment from "../models/Payment.js";

const router = express.Router();
dotenv.config();

// Initialize Razorpay
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
const razorpay =
    razorpayKeyId && razorpayKeySecret
        ? new Razorpay({
              key_id: razorpayKeyId,
              key_secret: razorpayKeySecret,
          })
        : null;

// Test route to verify the router is working
router.get("/test", (req, res) => {
    res.json({ message: "Razorpay routes are working" });
});

// Create order route
router.post("/create-order", async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(500).json({
                success: false,
                message:
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.",
            });
        }

        // Extract the order details
        const { amount, currency, receipt, notes } = req.body;

        // Create order options
        const options = {
            amount: parseInt(amount),
            currency: currency || "INR",
            receipt,
            notes,
            payment_capture: 1, // Auto capture payment
        };

        // Add detailed order information
        if (notes && notes.items) {
            options.notes = {
                ...notes,
                items_summary: notes.items, // This will be visible in Razorpay dashboard
            };
        }

        const order = await razorpay.orders.create(options);

        res.json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Error creating order",
            error: error.message,
        });
    }
});
// Verify payment route
router.post("/verify-payment", async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(500).json({
                success: false,
                message:
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderDetails,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details",
            });
        }

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest("hex");

        const receivedSignature = Buffer.from(razorpay_signature);
        const expectedSignature = Buffer.from(expectedSign);
        const signaturesMatch =
            receivedSignature.length === expectedSignature.length &&
            crypto.timingSafeEqual(receivedSignature, expectedSignature);

        if (!signaturesMatch) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        if (payment.status !== "captured") {
            return res.status(400).json({
                success: false,
                message: `Payment is not captured (status: ${payment.status})`,
            });
        }

        const existingPayment = await Payment.findOne({
            paymentId: razorpay_payment_id,
        });

        if (existingPayment) {
            return res.json({
                success: true,
                message: "Payment was already verified",
                paymentId: existingPayment._id,
            });
        }

        const newPayment = new Payment({
            user: orderDetails._id,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: payment.amount,
            currency: payment.currency,
            status: "SERVICE_BOOKED",
            method: payment.method,
            items: orderDetails.items,
            summary: orderDetails.summary,
            customerDetails: orderDetails.customerDetails,
            location: orderDetails.location || {
                address: "",
                latitude: null,
                longitude: null,
            },
            attempts: payment.count,
        });

        await newPayment.save();

        res.json({
            success: true,
            message: "Payment verified and saved successfully",
            paymentId: newPayment._id,
        });
    } catch (error) {
        console.error("Error in verify-payment:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Add new route to get user bookings
router.get("/bookings/:user", async (req, res) => {
    try {
        const bookings = await Payment.find({
            user: req.params.user,
        }).sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error: error.message,
        });
    }
});

export default router;
