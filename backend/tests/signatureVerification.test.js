// backend/tests/signatureVerification.test.js
const { verifyClaudeSignature, generateClaudeSignature } = require('../utils/signatureVerification');

describe('Signature Verification Tests', () => {
    const secret = 'test_secret';
    const testBody = { productId: '123', quantity: 1 };
    
    test('Should verify valid signature', () => {
        const signature = generateClaudeSignature(testBody, secret);
        const isValid = verifyClaudeSignature(signature, testBody, secret);
        expect(isValid).toBe(true);
    });
    
    test('Should reject invalid signature', () => {
        const isValid = verifyClaudeSignature('invalid', testBody, secret);
        expect(isValid).toBe(false);
    });
    
    test('Should reject tampered body', () => {
        const signature = generateClaudeSignature(testBody, secret);
        const tamperedBody = { ...testBody, quantity: 999 };
        const isValid = verifyClaudeSignature(signature, tamperedBody, secret);
        expect(isValid).toBe(false);
    });
});