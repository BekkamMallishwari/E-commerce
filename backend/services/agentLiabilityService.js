// backend/services/agentLiabilityService.js
const crypto = require('crypto');
const db = require('../config/db').promise;

// ============================================
// LIABILITY CONFIGURATION
// ============================================

const LIABILITY_CONFIG = {
    maxTransactionAmount: 50000,
    maxDiscountPercentage: 50,
    requireSignature: true,
    liabilityTiers: {
        FULL: { coverage: 100, premium: 0.05 },
        PARTIAL: { coverage: 50, premium: 0.025 },
        LIMITED: { coverage: 25, premium: 0.01 },
        NONE: { coverage: 0, premium: 0 }
    },
    insuranceReserve: 100000,
    fraudCoverage: 0.9
};

// ============================================
// AGENT LIABILITY SERVICE
// ============================================

class AgentLiabilityService {
    constructor() {
        this.agentRegistrations = new Map();
        this.liabilityRecords = new Map();
        this.insuranceClaims = new Map();
        this.authorizationSessions = new Map();
    }

    /**
     * Register an AI agent
     */
    async registerAgent(agentData) {
        const registration = {
            agentId: this.generateAgentId(),
            name: agentData.name,
            ownerId: agentData.ownerId,
            ownerType: agentData.ownerType || 'merchant',
            registeredAt: new Date().toISOString(),
            liabilityTier: agentData.liabilityTier || 'PARTIAL',
            insuranceActive: agentData.insuranceActive || false,
            maxTransactionLimit: agentData.maxTransactionLimit || LIABILITY_CONFIG.maxTransactionAmount,
            permissions: agentData.permissions || ['view', 'search'],
            status: 'active',
            publicKey: agentData.publicKey || null
        };

        await this.storeRegistration(registration);

        if (registration.insuranceActive) {
            await this.createInsurancePolicy(registration.agentId);
        }

        this.agentRegistrations.set(registration.agentId, registration);
        console.log(`✅ Agent registered: ${registration.agentId}`);
        return registration;
    }

    /**
     * Authorize an agent action
     */
    async authorizeAction(agentId, action, data) {
        const agent = await this.getAgent(agentId);
        if (!agent || agent.status !== 'active') {
            return { authorized: false, reason: 'Agent not found or inactive' };
        }

        // Check permissions
        if (!this.hasPermission(agent, action)) {
            return { authorized: false, reason: `Agent lacks permission for action: ${action}` };
        }

        // Check transaction limits
        if (action === 'purchase' && data.amount > agent.maxTransactionLimit) {
            return { authorized: false, reason: `Amount exceeds agent limit` };
        }

        // Create authorization signature
        const signature = await this.createAuthorizationSignature(agentId, action, data);

        // Assign liability
        const liability = await this.assignLiability(agentId, action, data);

        const authorization = {
            id: this.generateAuthorizationId(),
            agentId,
            action,
            data,
            signature,
            liability,
            timestamp: new Date().toISOString(),
            status: 'authorized'
        };

        await this.storeAuthorization(authorization);
        await this.logLiabilityAssignment(agentId, liability, authorization);

        return {
            authorized: true,
            signature,
            liability,
            authorizationId: authorization.id
        };
    }

    /**
     * Assign liability for an action
     */
    async assignLiability(agentId, action, data) {
        const agent = await this.getAgent(agentId);
        const tier = LIABILITY_CONFIG.liabilityTiers[agent.liabilityTier] || LIABILITY_CONFIG.liabilityTiers.PARTIAL;

        let liability = {
            agentId,
            action,
            tier: agent.liabilityTier,
            coverage: tier.coverage,
            amount: 0,
            liabilityAmount: 0,
            assignedTo: agent.ownerId,
            timestamp: new Date().toISOString()
        };

        // Calculate liability amount
        if (action === 'purchase' && data.amount) {
            liability.amount = data.amount;
            liability.liabilityAmount = (data.amount * tier.coverage) / 100;
        }

        // Apply insurance if active
        if (agent.insuranceActive) {
            const insurance = await this.getInsurancePolicy(agentId);
            if (insurance && insurance.active && insurance.remainingBalance >= liability.liabilityAmount) {
                liability.insuranceCoverage = liability.liabilityAmount * LIABILITY_CONFIG.fraudCoverage;
                liability.liabilityAmount -= liability.insuranceCoverage;
            }
        }

        return liability;
    }

    /**
     * Handle a liability claim
     */
    async handleLiabilityClaim(claimData) {
        const claim = {
            id: this.generateClaimId(),
            agentId: claimData.agentId,
            authorizationId: claimData.authorizationId,
            amount: claimData.amount,
            reason: claimData.reason,
            evidence: claimData.evidence || [],
            status: 'pending',
            createdAt: new Date().toISOString(),
            resolvedAt: null,
            resolution: null
        };

        const auth = await this.getAuthorization(claimData.authorizationId);
        if (!auth) {
            claim.status = 'rejected';
            claim.resolution = 'Authorization not found';
            return claim;
        }

        const liability = auth.liability;
        if (claim.amount > liability.liabilityAmount) {
            claim.status = 'rejected';
            claim.resolution = 'Claim amount exceeds liability coverage';
            return claim;
        }

        // Process with insurance
        const agent = await this.getAgent(claimData.agentId);
        if (agent.insuranceActive) {
            const insurance = await this.getInsurancePolicy(agent.agentId);
            if (insurance && insurance.active && insurance.remainingBalance >= claim.amount) {
                claim.insuranceUsed = claim.amount;
                await this.deductInsurance(agent.agentId, claim.amount);
                claim.status = 'resolved';
                claim.resolution = 'Paid by insurance';
                claim.resolvedAt = new Date().toISOString();
            }
        }

        await this.storeClaim(claim);
        return claim;
    }

    /**
     * Create insurance policy
     */
    async createInsurancePolicy(agentId) {
        const policy = {
            id: this.generatePolicyId(),
            agentId,
            createdAt: new Date().toISOString(),
            active: true,
            balance: LIABILITY_CONFIG.insuranceReserve,
            remainingBalance: LIABILITY_CONFIG.insuranceReserve,
            claims: 0,
            totalPaid: 0
        };

        await this.storeInsurancePolicy(policy);
        return policy;
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    async getAgent(agentId) {
        if (this.agentRegistrations.has(agentId)) {
            return this.agentRegistrations.get(agentId);
        }
        try {
            const [rows] = await db.query(
                'SELECT * FROM agent_liability_registrations WHERE agent_id = ?',
                [agentId]
            );
            if (rows.length > 0) {
                const agent = rows[0];
                agent.permissions = JSON.parse(agent.permissions);
                this.agentRegistrations.set(agentId, agent);
                return agent;
            }
        } catch (error) {
            console.error('Get agent error:', error);
        }
        return null;
    }

    hasPermission(agent, action) {
        const requiredPermissions = {
            'view': ['view'],
            'search': ['view', 'search'],
            'purchase': ['purchase', 'view', 'search'],
            'refund': ['refund', 'purchase', 'view', 'search'],
            'discount': ['discount', 'purchase', 'view', 'search']
        };
        const required = requiredPermissions[action] || ['view'];
        return required.some(perm => agent.permissions.includes(perm));
    }

    async createAuthorizationSignature(agentId, action, data) {
        const secret = process.env.AGENT_AUTH_SECRET || 'default_secret';
        const payload = `${agentId}:${action}:${JSON.stringify(data)}:${Date.now()}`;
        return crypto.createHmac('sha256', secret).update(payload).digest('hex');
    }

    generateAgentId() {
        return `AGT_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    generateAuthorizationId() {
        return `AUTH_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    generateClaimId() {
        return `CLM_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    generatePolicyId() {
        return `POL_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    // ============================================
    // DATABASE OPERATIONS
    // ============================================

    async storeRegistration(registration) {
        await db.query(
            `INSERT INTO agent_liability_registrations 
             (agent_id, name, owner_id, owner_type, liability_tier, 
              insurance_active, max_transaction_limit, permissions, status, 
              public_key, registered_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                registration.agentId,
                registration.name,
                registration.ownerId,
                registration.ownerType,
                registration.liabilityTier,
                registration.insuranceActive ? 1 : 0,
                registration.maxTransactionLimit,
                JSON.stringify(registration.permissions),
                registration.status,
                registration.publicKey,
                registration.registeredAt
            ]
        );
    }

    async storeAuthorization(authorization) {
        await db.query(
            `INSERT INTO agent_authorizations 
             (id, agent_id, action, data, signature, liability, status, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                authorization.id,
                authorization.agentId,
                authorization.action,
                JSON.stringify(authorization.data),
                authorization.signature,
                JSON.stringify(authorization.liability),
                authorization.status,
                authorization.timestamp
            ]
        );
    }

    async getAuthorization(authId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM agent_authorizations WHERE id = ?',
                [authId]
            );
            if (rows.length > 0) {
                return {
                    ...rows[0],
                    data: JSON.parse(rows[0].data),
                    liability: JSON.parse(rows[0].liability)
                };
            }
        } catch (error) {
            console.error('Get authorization error:', error);
        }
        return null;
    }

    async logLiabilityAssignment(agentId, liability, authorization) {
        await db.query(
            `INSERT INTO liability_assignments 
             (agent_id, authorization_id, action, amount, liability_amount, 
              tier, coverage, assigned_to, timestamp)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                agentId,
                authorization.id,
                authorization.action,
                liability.amount || 0,
                liability.liabilityAmount || 0,
                liability.tier,
                liability.coverage,
                liability.assignedTo
            ]
        );
    }

    async getInsurancePolicy(agentId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM agent_insurance_policies WHERE agent_id = ? AND active = 1',
                [agentId]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Get insurance error:', error);
            return null;
        }
    }

    async storeInsurancePolicy(policy) {
        await db.query(
            `INSERT INTO agent_insurance_policies 
             (id, agent_id, created_at, active, balance, remaining_balance, 
              premium, claims, total_paid)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                policy.id,
                policy.agentId,
                policy.createdAt,
                policy.active ? 1 : 0,
                policy.balance,
                policy.remainingBalance,
                policy.premium,
                policy.claims,
                policy.totalPaid
            ]
        );
    }

    async deductInsurance(agentId, amount) {
        const policy = await this.getInsurancePolicy(agentId);
        if (policy) {
            policy.remainingBalance -= amount;
            policy.claims += 1;
            policy.totalPaid += amount;
            await db.query(
                `UPDATE agent_insurance_policies 
                 SET remaining_balance = ?, claims = ?, total_paid = ? 
                 WHERE id = ?`,
                [policy.remainingBalance, policy.claims, policy.totalPaid, policy.id]
            );
        }
    }

    async storeClaim(claim) {
        await db.query(
            `INSERT INTO liability_claims 
             (id, agent_id, authorization_id, amount, reason, evidence, 
              status, created_at, resolved_at, resolution, insurance_used, 
              liability_amount, liable_party)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                claim.id,
                claim.agentId,
                claim.authorizationId,
                claim.amount,
                claim.reason,
                JSON.stringify(claim.evidence),
                claim.status,
                claim.createdAt,
                claim.resolvedAt || null,
                claim.resolution || null,
                claim.insuranceUsed || 0,
                claim.liabilityAmount || 0,
                claim.liableParty || null
            ]
        );
    }

    // ============================================
    // STATISTICS
    // ============================================

    async getStatistics() {
        try {
            const [stats] = await db.query(
                `SELECT 
                    COUNT(*) as total_agents,
                    SUM(CASE WHEN insurance_active = 1 THEN 1 ELSE 0 END) as insured_agents,
                    COUNT(DISTINCT owner_id) as unique_owners,
                    AVG(max_transaction_limit) as avg_credit
                 FROM agent_liability_registrations
                 WHERE status = 'active'`
            );

            const [claims] = await db.query(
                `SELECT 
                    COUNT(*) as total_claims,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_claims,
                    SUM(amount) as total_claimed,
                    SUM(liability_amount) as total_liability
                 FROM liability_claims
                 WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)`
            );

            return { agents: stats[0], claims: claims[0] };
        } catch (error) {
            console.error('Statistics error:', error);
            return null;
        }
    }
}

module.exports = new AgentLiabilityService();