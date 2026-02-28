// Validation Middleware

// Validate Email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Password
function validatePassword(password) {
    return password && password.length >= 6;
}

// Validate Required Fields
function validateRequired(fields, body) {
    const errors = [];
    fields.forEach(field => {
        if (!body[field] || body[field].toString().trim() === '') {
            errors.push(`${field} is required`);
        }
    });
    return errors;
}

// Sanitize String
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
}

// Validation Middleware for Registration
function validateRegistration(req, res, next) {
    const { fullName, email, password } = req.body;
    const errors = [];

    // Check required fields
    if (!fullName || fullName.trim() === '') {
        errors.push('Full name is required');
    }

    if (!email || email.trim() === '') {
        errors.push('Email is required');
    } else if (!validateEmail(email)) {
        errors.push('Invalid email format');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (!validatePassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // Sanitize inputs
    req.body.fullName = sanitizeString(fullName);
    req.body.email = sanitizeString(email.toLowerCase());
    if (req.body.phone) {
        req.body.phone = sanitizeString(req.body.phone);
    }

    next();
}

// Validation Middleware for Trip Creation
function validateTripCreation(req, res, next) {
    const { title, originAddress, destinationAddress, departureDate, departureTime, maxCompanions } = req.body;
    const errors = [];

    // Check required fields
    if (!title || title.trim() === '') {
        errors.push('Trip title is required');
    }

    if (!originAddress || originAddress.trim() === '') {
        errors.push('Origin address is required');
    }

    if (!destinationAddress || destinationAddress.trim() === '') {
        errors.push('Destination address is required');
    }

    if (!departureDate) {
        errors.push('Departure date is required');
    } else {
        const depDate = new Date(departureDate);
        if (depDate < new Date()) {
            errors.push('Departure date cannot be in the past');
        }
    }

    if (!departureTime) {
        errors.push('Departure time is required');
    }

    if (maxCompanions && (maxCompanions < 1 || maxCompanions > 10)) {
        errors.push('Maximum companions must be between 1 and 10');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    // Sanitize string inputs
    req.body.title = sanitizeString(title);
    req.body.originAddress = sanitizeString(originAddress);
    req.body.destinationAddress = sanitizeString(destinationAddress);
    if (req.body.description) {
        req.body.description = sanitizeString(req.body.description);
    }

    next();
}

// Error Handler Middleware
function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error
    let status = 500;
    let message = 'Internal server error';

    // Specific error handling
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation error';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
    } else if (err.name === 'NotFoundError') {
        status = 404;
        message = 'Resource not found';
    } else if (err.message) {
        message = err.message;
    }

    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// Not Found Handler
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
}

// Request Logger
function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
}

module.exports = {
    validateRegistration,
    validateTripCreation,
    errorHandler,
    notFoundHandler,
    requestLogger,
    validateEmail,
    validatePassword,
    sanitizeString
};
