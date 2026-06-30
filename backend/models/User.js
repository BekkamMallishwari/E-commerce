/**
 * User Model with Validation and Sanitization
 * @module models/User
 */

const VALID_ROLES = ['user', 'admin', 'moderator'];

class User {
    constructor(user) {
        // Sanitize inputs
        const sanitizedEmail = this.sanitizeEmail(user.email);
        const sanitizedName = this.sanitizeName(user.name);

        // Validate required fields
        if (!sanitizedName || sanitizedName.length < 2) {
            throw new Error('Name must be at least 2 characters long');
        }

        if (!this.isValidEmail(sanitizedEmail)) {
            throw new Error('Invalid email format');
        }

        if (user.password && !this.isValidPassword(user.password)) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Validate role
        const role = user.role || 'user';
        if (!this.isValidRole(role)) {
            throw new Error(`Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`);
        }

        // Assign properties
        this.id = user.id;
        this.name = sanitizedName;
        this.email = sanitizedEmail;
        this.password = user.password; // Will be hashed before storage
        this.role = role;
        this.isActive = user.isActive !== undefined ? user.isActive : true;
        this.isVerified = user.isVerified !== undefined ? user.isVerified : false;
        this.createdAt = user.createdAt || new Date();
        this.updatedAt = user.updatedAt || new Date();
    }

    // ==================== VALIDATION METHODS ====================

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {boolean} True if valid
     */
    isValidPassword(password) {
        return password && password.length >= 8;
    }

    /**
     * Validate user role
     * @param {string} role - Role to validate
     * @returns {boolean} True if valid
     */
    isValidRole(role) {
        return VALID_ROLES.includes(role);
    }

    // ==================== SANITIZATION METHODS ====================

    /**
     * Sanitize email - trim and lowercase
     * @param {string} email - Email to sanitize
     * @returns {string} Sanitized email
     */
    sanitizeEmail(email) {
        if (!email) return '';
        return email.trim().toLowerCase();
    }

    /**
     * Sanitize name - trim and remove extra spaces
     * @param {string} name - Name to sanitize
     * @returns {string} Sanitized name
     */
    sanitizeName(name) {
        if (!name) return '';
        return name.trim().replace(/\s+/g, ' ');
    }

    // ==================== SECURITY METHODS ====================

    /**
     * Convert to JSON - Exclude sensitive data
     * @returns {Object} User object without password
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
            isActive: this.isActive,
            isVerified: this.isVerified,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    // ==================== UPDATE METHODS ====================

    /**
     * Safe update user data
     * @param {Object} updates - Fields to update
     * @returns {User} Updated user instance
     */
    update(updates) {
        const allowedFields = ['name', 'email', 'password', 'role', 'isActive', 'isVerified'];

        Object.keys(updates).forEach(key => {
            if (!allowedFields.includes(key)) {
                throw new Error(`Field '${key}' cannot be updated`);
            }
        });

        // Sanitize and validate before update
        if (updates.name) {
            updates.name = this.sanitizeName(updates.name);
            if (updates.name.length < 2) {
                throw new Error('Name must be at least 2 characters long');
            }
        }

        if (updates.email) {
            updates.email = this.sanitizeEmail(updates.email);
            if (!this.isValidEmail(updates.email)) {
                throw new Error('Invalid email format');
            }
        }

        if (updates.password) {
            if (!this.isValidPassword(updates.password)) {
                throw new Error('Password must be at least 8 characters long');
            }
        }

        if (updates.role) {
            if (!this.isValidRole(updates.role)) {
                throw new Error(`Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}`);
            }
        }

        // Apply updates
        if (updates.name) this.name = updates.name;
        if (updates.email) this.email = updates.email;
        if (updates.password) this.password = updates.password;
        if (updates.role) this.role = updates.role;
        if (updates.isActive !== undefined) this.isActive = updates.isActive;
        if (updates.isVerified !== undefined) this.isVerified = updates.isVerified;

        this.updatedAt = new Date();
        return this;
    }

    // ==================== STATUS METHODS ====================

    /**
     * Check if user is active (active + verified)
     * @returns {boolean} True if active and verified
     */
    isActiveUser() {
        return this.isActive === true && this.isVerified === true;
    }

    /**
     * Check if user has admin role
     * @returns {boolean} True if admin
     */
    isAdmin() {
        return this.role === 'admin';
    }

    /**
     * Check if user has moderator role
     * @returns {boolean} True if moderator
     */
    isModerator() {
        return this.role === 'moderator';
    }

    // ==================== STATIC METHODS ====================

    /**
     * Get all valid roles
     * @returns {Array} List of valid roles
     */
    static getValidRoles() {
        return [...VALID_ROLES];
    }

    /**
     * Check if a role is valid
     * @param {string} role - Role to check
     * @returns {boolean} True if valid
     */
    static isValidRoleStatic(role) {
        return VALID_ROLES.includes(role);
    }
}

module.exports = User;