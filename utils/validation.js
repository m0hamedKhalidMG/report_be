const Joi = require('joi');

const validateRegisterInput = (data) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    second_name: Joi.string().required(),
    last_name: Joi.string().required(),
    national_id: Joi.string().required(),
    phone_number: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    password_check: Joi.string().valid(Joi.ref('password')).required(),
    postal_code: Joi.string().required(),
    birthday: Joi.date().required()
  });

  return schema.validate(data);
};
const validateReportInput = (data) => {
    const schema = Joi.object({
      location: Joi.string().required(),
      latitude: Joi.number().min(-90).max(90),
      longitude: Joi.number().min(-180).max(180),
      crime_type: Joi.string().required(),
      description: Joi.string().required(),
      report_time: Joi.date().required(),
      reporter_name: Joi.string().allow('').optional(),
      reporter_contact: Joi.string().allow('').optional()
    });
  
    return schema.validate(data, { abortEarly: false });
  };

  const validateUserUpdate = (data) => {
    const schema = Joi.object({
      first_name: Joi.string().min(2).max(50),
      second_name: Joi.string().min(2).max(50),
      last_name: Joi.string().min(2).max(50),
      national_id: Joi.string().pattern(/^[0-9]+$/),
      phone_number: Joi.string().pattern(/^\+?[0-9]+$/),
      email: Joi.string().email(),
      password: Joi.string().min(8),
      postal_code: Joi.string().pattern(/^[0-9]+$/),
      birthday: Joi.date().max('now')
    }).min(1); // At least one field required
  
    return schema.validate(data, { abortEarly: false });
  };



  const lawyerRegistrationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.email': 'Please enter a valid email',
        'string.empty': 'Email is required'
      }),
    password: Joi.string().min(8).required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.empty': 'Password is required'
      })
  });
  
  const validateLawyerRegistration = (data) => {
    return lawyerRegistrationSchema.validate(data, { abortEarly: false });
  };



module.exports = { validateRegisterInput,validateReportInput ,validateLawyerRegistration ,validateUserUpdate,lawyerRegistrationSchema};
