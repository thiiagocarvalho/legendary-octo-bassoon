import { describe, expect, it } from 'vitest';
import { enrollmentStatusAfterApprovedPayment } from '../../server/services/enrollment-payment';

describe('enrollment payment status', () => {
  it('activates a pending enrollment after its first approved payment', () => {
    expect(enrollmentStatusAfterApprovedPayment('PENDING')).toBe('ACTIVE');
  });
});
