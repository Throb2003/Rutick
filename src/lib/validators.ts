import Joi from 'joi';

export const validateRegistration = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('student', 'staff', 'admin').default('student').messages({
    'any.only': 'Role must be either: student, staff, or admin'
  }),
  universityId: Joi.string().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s-()]+$/).optional().messages({
    'string.pattern.base': 'Please enter a valid phone number'
  }),
  department: Joi.string().max(100).optional()
});

export const validateLogin = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const validateEventCreation = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title cannot exceed 200 characters'
  }),
  description: Joi.string().min(10).max(5000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 5000 characters'
  }),
  category: Joi.string().valid('academic', 'sports', 'cultural', 'social', 'conference').required().messages({
    'any.only': 'Category must be one of: academic, sports, cultural, social, conference',
    'any.required': 'Category is required'
  }),
  date: Joi.date().min('now').required().messages({
    'date.min': 'Event date must be in the future',
    'any.required': 'Event date is required'
  }),
  endDate: Joi.date().min(Joi.ref('date')).optional().messages({
    'date.min': 'End date must be after start date'
  }),
  venue: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Venue is required',
    'string.min': 'Venue must be at least 2 characters',
    'string.max': 'Venue cannot exceed 200 characters'
  }),
  capacity: Joi.number().min(1).required().messages({
    'number.min': 'Capacity must be at least 1',
    'any.required': 'Capacity is required'
  }),
  ticketTypes: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('free', 'vip', 'general', 'student').required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().min(1).required()
    })
  ).min(1).required().messages({
    'array.min': 'At least one ticket type is required',
    'any.required': 'Ticket types are required'
  }),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  requiresApproval: Joi.boolean().default(false),
  images: Joi.array().items(Joi.string().uri()).optional(),
  videos: Joi.array().items(Joi.string().uri()).optional()
});

export const validateEventUpdate = validateEventCreation.fork(
  ['title', 'description', 'category', 'date', 'venue', 'capacity', 'ticketTypes'],
  (schema) => schema.optional()
);

export const validateTicketPurchase = Joi.object({
  eventId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid event ID',
    'any.required': 'Event ID is required'
  }),
  ticketType: Joi.string().valid('free', 'vip', 'general', 'student').required().messages({
    'any.only': 'Ticket type must be one of: free, vip, general, student',
    'any.required': 'Ticket type is required'
  }),
  quantity: Joi.number().min(1).max(10).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Cannot purchase more than 10 tickets at once',
    'any.required': 'Quantity is required'
  })
});

export const validatePayment = Joi.object({
  ticketIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required().messages({
    'array.min': 'At least one ticket is required',
    'any.required': 'Ticket IDs are required'
  }),
  paymentMethod: Joi.string().valid('mpesa', 'card', 'cash').required().messages({
    'any.only': 'Payment method must be one of: mpesa, card, cash',
    'any.required': 'Payment method is required'
  }),
  phoneNumber: Joi.when('paymentMethod', {
    is: 'mpesa',
    then: Joi.string().pattern(/^\+?254[17]\d{8}$/).required().messages({
      'string.pattern.base': 'Please enter a valid M-Pesa phone number (e.g., +254712345678)',
      'any.required': 'Phone number is required for M-Pesa payments'
    }),
    otherwise: Joi.string().optional()
  })
});

export const validatePasswordReset = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)')).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'New password is required'
  })
});

export const validateForgotPassword = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  })
});