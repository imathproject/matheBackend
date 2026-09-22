const TestimonialService = require("../services/testimonialService");
const { tryCatch } = require("../utils/tryCatch");

const findAll = tryCatch(async (req, res) => {
  const testimonials = await TestimonialService.getAll();
  return res.status(200).json({ elements: testimonials });
});

const findValidated = tryCatch(async (req, res) => {
  const testimonials = await TestimonialService.getValidatedTestimonials();
  return res.status(200).json({ elements: testimonials });
});

const findByUserId = tryCatch(async (req, res) => {
  const testimonial = await TestimonialService.getTestimonialByUser(req.user);
  return res.status(200).json({ elements: testimonial });
});

const findById = tryCatch(async (req, res) => {
  const testimonial = await TestimonialService.findById(req.params.id);
  return res.status(200).json({ elements: testimonial });
});

const addTestimonial = tryCatch(async (req, res) => {
  const userID = req.user;
  const testimonial = await TestimonialService.addTestimonial(userID, req);
  return res.status(200).json({ elements: testimonial });
});

const validateTestimonial = tryCatch(async (req, res) => {
  const updateTestimonial = await TestimonialService.validateTestimonial(req);
  return res.status(200).json({ elements: updateTestimonial });
});

const deleteTestimonial = tryCatch(async (req, res) => {
  const deleteTestimonial = await TestimonialService.deleteById(req.params.id);
  return res.status(200).json({ elements: deleteTestimonial });
});

const updateStatus = tryCatch(async (req, res) => {
  const deleteTestimonial = await TestimonialService.updateStatus(req);
  return res.status(200).json({ elements: deleteTestimonial });
});

module.exports = {
  findAll,
  findByUserId,
  addTestimonial,
  validateTestimonial,
  deleteTestimonial,
  findValidated,
  findById,
  updateStatus,
};
