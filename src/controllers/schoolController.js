const { validationResult } = require('express-validator');
const SchoolModel = require('../models/schoolModel');
const { haversineDistance } = require('../utils/distance');


const addSchool = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const { name, address, latitude, longitude } = req.body;

  try {

    const duplicate = await SchoolModel.findDuplicate(name.trim(), address.trim());
    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'A school with this name and address already exists.',
      });
    }


    const school = await SchoolModel.create({
      name: name.trim(),
      address: address.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    });

    return res.status(201).json({
      success: true,
      message: 'School added successfully.',
      data: school,
    });
  } catch (error) {
    console.error('[addSchool] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
    });
  }
};


const listSchools = async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }

  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  try {

    const schools = await SchoolModel.findAll();

    if (schools.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No schools found.',
        data: [],
        meta: { total: 0, userLocation: { latitude: userLat, longitude: userLon } },
      });
    }


    const schoolsWithDistance = schools
      .map((school) => ({
        ...school,
        distance_km: haversineDistance(userLat, userLon, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    return res.status(200).json({
      success: true,
      message: 'Schools retrieved and sorted by proximity.',
      data: schoolsWithDistance,
      meta: {
        total: schoolsWithDistance.length,
        userLocation: { latitude: userLat, longitude: userLon },
      },
    });
  } catch (error) {
    console.error('[listSchools] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'An internal server error occurred. Please try again later.',
    });
  }
};

module.exports = { addSchool, listSchools };
