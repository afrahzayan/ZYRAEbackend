const express = require("express");

const router = express.Router();

const {
  getAdminDashboard
} = require("../../controller/admin/dashboardController");

router.get("/", getAdminDashboard);

module.exports = router;