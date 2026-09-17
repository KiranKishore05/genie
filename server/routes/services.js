// routes/services.js
import express from "express";
import Service from "../models/Service.js";
import ServiceDetail from "../models/ServiceDetail.js";
import { servicesData } from "../data/servicesData.js";
import { servicesDetailsData } from "../data/servicesDetailsData.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const services = await Service.find().sort({ order: 1 });

        if (services.length > 0) {
            return res.json(services);
        }

        return res.json(servicesData);
    } catch (error) {
        res.json(servicesData);
    }
});

router.get("/:serviceName/details", async (req, res) => {
    try {
        const serviceDetail = await ServiceDetail.findOne({
            serviceName: req.params.serviceName,
        });

        if (serviceDetail) {
            return res.json(serviceDetail);
        }

        const fallbackDetails = servicesDetailsData[req.params.serviceName];

        if (fallbackDetails) {
            return res.json(fallbackDetails);
        }

        res.status(404).json({ message: "Service details not found" });
    } catch (error) {
        const fallbackDetails = servicesDetailsData[req.params.serviceName];

        if (fallbackDetails) {
            return res.json(fallbackDetails);
        }

        res.status(500).json({ message: "Error fetching service details" });
    }
});

export default router;
