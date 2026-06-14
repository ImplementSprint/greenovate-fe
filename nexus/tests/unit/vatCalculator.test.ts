import {
    calculateReceiptVAT,
    isVatExemptDiscountType,
    calculateTaxDiscountBreakdown,
} from '../../src/utils/vatCalculator';


describe('VAT Calculation Service (POS-008)', () => {
    it('calculates 12% inclusive VAT correctly for standard amounts', () => {
        const result = calculateReceiptVAT(112);

        expect(result.totalInclusive).toBe(112);
        expect(result.vatAmount).toBe(12);
        expect(result.vatExclusive).toBe(100);
    });

    it('calculates correctly with decimal totals (Penny Rounding Check)', () => {
        const result = calculateReceiptVAT(150.50);

        // (150.50 / 1.12) * 0.12 = 16.125 -> rounds to 16.13
        expect(result.totalInclusive).toBe(150.50);
        expect(result.vatAmount).toBe(16.13);
        // 150.50 - 16.13 = 134.37
        expect(result.vatExclusive).toBe(134.37);
    });

    it('EDGE CASE: handles zero totals safely', () => {
        const result = calculateReceiptVAT(0);

        expect(result.vatAmount).toBe(0);
        expect(result.vatExclusive).toBe(0);
    });

    it('EDGE CASE: handles negative inputs safely', () => {
        const result = calculateReceiptVAT(-50);

        expect(result.vatAmount).toBe(0);
        expect(result.vatExclusive).toBe(0);
    });
});

describe('isVatExemptDiscountType', () => {
    it('returns true for "senior" (lowercase)', () => {
        expect(isVatExemptDiscountType('senior')).toBe(true);
    });

    it('returns true for "Senior" (title case)', () => {
        expect(isVatExemptDiscountType('Senior')).toBe(true);
    });

    it('returns true for "Senior Citizen" (title case with space)', () => {
        expect(isVatExemptDiscountType('Senior Citizen')).toBe(true);
    });

    it('returns true for "senior citizen" (lowercase)', () => {
        expect(isVatExemptDiscountType('senior citizen')).toBe(true);
    });

    it('returns true for "SENIOR CITIZEN" (uppercase)', () => {
        expect(isVatExemptDiscountType('SENIOR CITIZEN')).toBe(true);
    });

    it('returns true for "pwd" (lowercase)', () => {
        expect(isVatExemptDiscountType('pwd')).toBe(true);
    });

    it('returns true for "PWD" (uppercase)', () => {
        expect(isVatExemptDiscountType('PWD')).toBe(true);
    });

    it('returns true for "Pwd" (mixed case)', () => {
        expect(isVatExemptDiscountType('Pwd')).toBe(true);
    });

    it('returns false for "none"', () => {
        expect(isVatExemptDiscountType('none')).toBe(false);
    });

    it('returns false for empty string', () => {
        expect(isVatExemptDiscountType('')).toBe(false);
    });

    it('returns false for null', () => {
        expect(isVatExemptDiscountType(null)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(isVatExemptDiscountType(undefined)).toBe(false);
    });

    it('returns false for an unrelated discount type', () => {
        expect(isVatExemptDiscountType('employee')).toBe(false);
    });
});

describe('calculateTaxDiscountBreakdown', () => {
    describe('standard (non-VAT-exempt) case', () => {
        it('returns correct breakdown with no discount', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 100,
                vat: 12,
            });

            expect(result.grossVatableSales).toBe(100);
            expect(result.vatableSales).toBe(100);
            expect(result.vatExemptSales).toBe(0);
            expect(result.vatAmount).toBe(12);
            expect(result.vatDeduction).toBe(0);
            expect(result.discountAmount).toBe(0);
            expect(result.totalDiscountAndDeduction).toBe(0);
            expect(result.totalDue).toBe(112);
            expect(result.isVatExempt).toBe(false);
        });

        it('applies a percentage discount correctly', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 100,
                vat: 12,
                discountType: 'employee',
                discountPercent: 20,
            });

            // 20% of 100 = 20
            expect(result.discountAmount).toBe(20);
            expect(result.totalDiscountAndDeduction).toBe(20);
            expect(result.totalDue).toBe(92); // 100 + 12 - 20
            expect(result.isVatExempt).toBe(false);
        });

        it('uses an explicit discountAmount when provided, ignoring discountPercent', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 200,
                vat: 24,
                discountType: 'promo',
                discountPercent: 50,
                discountAmount: 30,
            });

            // discountAmount=30 should override the percent calculation (50% of 200 = 100)
            expect(result.discountAmount).toBe(30);
            expect(result.totalDiscountAndDeduction).toBe(30);
            expect(result.totalDue).toBe(194); // 200 + 24 - 30
        });
    });

    describe('VAT-exempt case (senior / pwd)', () => {
        it('deducts VAT and zeroes vatAmount for "senior" discount type', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 100,
                vat: 12,
                discountType: 'senior',
                discountPercent: 20,
            });

            expect(result.isVatExempt).toBe(true);
            expect(result.vatAmount).toBe(0);
            expect(result.vatDeduction).toBe(12);
            expect(result.vatableSales).toBe(0);
            expect(result.vatExemptSales).toBe(100);
            // totalDiscountAndDeduction = discountAmount (20) + vatDeduction (12) = 32
            expect(result.discountAmount).toBe(20);
            expect(result.totalDiscountAndDeduction).toBe(32);
            // totalDue = max(0, 100 + 12 - 32) = 80
            expect(result.totalDue).toBe(80);
        });

        it('deducts VAT correctly for "PWD" discount type', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 200,
                vat: 24,
                discountType: 'PWD',
                discountPercent: 20,
            });

            expect(result.isVatExempt).toBe(true);
            expect(result.vatAmount).toBe(0);
            expect(result.vatDeduction).toBe(24);
            expect(result.discountAmount).toBe(40); // 20% of 200
            expect(result.totalDiscountAndDeduction).toBe(64); // 40 + 24
            expect(result.totalDue).toBe(160); // 200 + 24 - 64
        });
    });

    describe('edge cases', () => {
        it('handles zero subtotal without throwing', () => {
            const result = calculateTaxDiscountBreakdown({ subtotal: 0, vat: 0 });

            expect(result.grossVatableSales).toBe(0);
            expect(result.totalDue).toBe(0);
            expect(result.discountAmount).toBe(0);
        });

        it('clamps negative subtotal to zero', () => {
            const result = calculateTaxDiscountBreakdown({ subtotal: -50, vat: 0 });

            expect(result.grossVatableSales).toBe(0);
            expect(result.totalDue).toBe(0);
        });

        it('clamps negative discountAmount to zero', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 100,
                vat: 12,
                discountAmount: -20,
            });

            expect(result.discountAmount).toBe(0);
            expect(result.totalDue).toBe(112);
        });

        it('clamps totalDue to zero when discount exceeds subtotal+vat', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 50,
                vat: 6,
                discountAmount: 999,
            });

            expect(result.totalDue).toBe(0);
        });

        it('defaults discountType to "none" and discountPercent to 0 when omitted', () => {
            const result = calculateTaxDiscountBreakdown({ subtotal: 100, vat: 12 });

            expect(result.isVatExempt).toBe(false);
            expect(result.discountAmount).toBe(0);
        });

        it('handles null discountType as non-exempt', () => {
            const result = calculateTaxDiscountBreakdown({
                subtotal: 100,
                vat: 12,
                discountType: null,
            });

            expect(result.isVatExempt).toBe(false);
            expect(result.vatAmount).toBe(12);
        });
    });
});
