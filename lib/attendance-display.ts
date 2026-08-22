export function attendanceButtonClass(currentStatus: string, buttonStatus: 'PRESENT' | 'ABSENT') {
  if (currentStatus === buttonStatus) {
    return buttonStatus === 'PRESENT'
      ? 'bg-emerald-700 text-white'
      : 'bg-red-700 text-white';
  }

  return 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100';
}
