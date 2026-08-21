import { describe, expect, it } from 'vitest';
import { removeStudentMessage } from '../../lib/student-message-list';

describe('removeStudentMessage', () => {
  it('removes only the selected message from the visible list', () => {
    expect(removeStudentMessage([{ id: 'one' }, { id: 'two' }], 'one')).toEqual([{ id: 'two' }]);
  });
});
