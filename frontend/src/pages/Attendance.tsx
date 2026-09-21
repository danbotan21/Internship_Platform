import { useState, useEffect } from 'react'
import {
  Clock,
  LogIn,
  LogOut,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Umbrella,
  Users,
  UserCheck,
  ClipboardList,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Check,
  X,
  Timer,
  TrendingUp,
  Calendar,
  FileText,
} from 'lucide-react'
import { useUserRole } from '../context/UserRoleContext'
import { CustomSelect } from '../components/CustomSelect'

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus = 'Present' | 'Late' | 'Absent' | 'Leave'
type LeaveType = 'Annual' | 'Sick' | 'Remote' | 'Other'
type LeaveRequestStatus = 'Pending' | 'Approved' | 'Rejected'

interface AttendanceRecord {
  id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  hours: number | null
  status: AttendanceStatus
}

interface LeaveRequest {
  id: string
  internName?: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveRequestStatus
  submittedDate: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  { id: 'a1', date: '2026-09-19', checkIn: '09:02', checkOut: '17:05', hours: 483, status: 'Present' },
  { id: 'a2', date: '2026-09-18', checkIn: '09:34', checkOut: '17:10', hours: 456, status: 'Late' },
  { id: 'a3', date: '2026-09-17', checkIn: '08:58', checkOut: '17:02', hours: 484, status: 'Present' },
  { id: 'a4', date: '2026-09-16', checkIn: null, checkOut: null, hours: null, status: 'Absent' },
  { id: 'a5', date: '2026-09-15', checkIn: null, checkOut: null, hours: null, status: 'Leave' },
  { id: 'a6', date: '2026-09-12', checkIn: '09:00', checkOut: '17:00', hours: 480, status: 'Present' },
  { id: 'a7', date: '2026-09-11', checkIn: '09:15', checkOut: '17:20', hours: 485, status: 'Late' },
  { id: 'a8', date: '2026-09-10', checkIn: '08:55', checkOut: '17:05', hours: 490, status: 'Present' },
  { id: 'a9', date: '2026-09-09', checkIn: '09:00', checkOut: '17:00', hours: 480, status: 'Present' },
  { id: 'a10', date: '2026-09-08', checkIn: null, checkOut: null, hours: null, status: 'Leave' },
]

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'lr1', type: 'Annual', startDate: '2026-09-15', endDate: '2026-09-15', reason: 'Personal appointment', status: 'Approved', submittedDate: '2026-09-13' },
  { id: 'lr2', type: 'Sick', startDate: '2026-09-08', endDate: '2026-09-08', reason: 'Feeling unwell', status: 'Approved', submittedDate: '2026-09-08' },
  { id: 'lr3', type: 'Remote', startDate: '2026-09-22', endDate: '2026-09-23', reason: 'Working from home this week', status: 'Pending', submittedDate: '2026-09-20' },
]

const MENTOR_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: 'mlr1', internName: 'Ana Ionescu', type: 'Sick', startDate: '2026-09-22', endDate: '2026-09-22', reason: 'Not feeling well, doctor appointment in the morning', status: 'Pending', submittedDate: '2026-09-21' },
  { id: 'mlr2', internName: 'Mihai Popa', type: 'Annual', startDate: '2026-09-25', endDate: '2026-09-26', reason: 'Family event out of town', status: 'Pending', submittedDate: '2026-09-20' },
  { id: 'mlr3', internName: 'Elena Dumitrescu', type: 'Remote', startDate: '2026-09-23', endDate: '2026-09-24', reason: 'Internet issues at the office location, working remotely', status: 'Approved', submittedDate: '2026-09-19' },
  { id: 'mlr4', internName: 'Andrei Marin', type: 'Other', startDate: '2026-09-18', endDate: '2026-09-18', reason: 'University exam', status: 'Rejected', submittedDate: '2026-09-16' },
]

interface MentorAttendanceRow {
  id: string
  internName: string
  date: string
  checkIn: string | null
  checkOut: string | null
  hours: number | null
  status: AttendanceStatus
}

const MENTOR_ATTENDANCE_ROWS: MentorAttendanceRow[] = [
  { id: 'm1', internName: 'Ana Ionescu', date: '2026-09-21', checkIn: '09:05', checkOut: null, hours: null, status: 'Present' },
  { id: 'm2', internName: 'Mihai Popa', date: '2026-09-21', checkIn: '09:42', checkOut: null, hours: null, status: 'Late' },
  { id: 'm3', internName: 'Elena Dumitrescu', date: '2026-09-21', checkIn: null, checkOut: null, hours: null, status: 'Absent' },
  { id: 'm4', internName: 'Andrei Marin', date: '2026-09-21', checkIn: '08:58', checkOut: null, hours: null, status: 'Present' },
  { id: 'm5', internName: 'Roxana Ene', date: '2026-09-21', checkIn: null, checkOut: null, hours: null, status: 'Leave' },
  { id: 'm6', internName: 'Ana Ionescu', date: '2026-09-20', checkIn: '09:01', checkOut: '17:00', hours: 479, status: 'Present' },
  { id: 'm7', internName: 'Mihai Popa', date: '2026-09-20', checkIn: '09:00', checkOut: '17:05', hours: 485, status: 'Present' },
  { id: 'm8', internName: 'Elena Dumitrescu', date: '2026-09-20', checkIn: '09:10', checkOut: '17:00', hours: 470, status: 'Late' },
  { id: 'm9', internName: 'Andrei Marin', date: '2026-09-20', checkIn: null, checkOut: null, hours: null, status: 'Absent' },
  { id: 'm10', internName: 'Roxana Ene', date: '2026-09-20', checkIn: '08:55', checkOut: '17:10', hours: 495, status: 'Present' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function now() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// Returns total minutes worked
function calcHours(checkIn: string, checkOut: string): number {
  const [ih, im] = checkIn.split(':').map(Number)
  const [oh, om] = checkOut.split(':').map(Number)
  return (oh * 60 + om) - (ih * 60 + im)
}

// Formats total minutes as "8h 3m" or "8h"
function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function autoStatus(checkIn: string): AttendanceStatus {
  const [h, m] = checkIn.split(':').map(Number)
  const total = h * 60 + m
  return total <= 9 * 60 + 15 ? 'Present' : 'Late'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, { icon: React.ReactNode; cls: string }> = {
    Present: { icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Late: { icon: <AlertCircle className="w-3.5 h-3.5" />, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    Absent: { icon: <XCircle className="w-3.5 h-3.5" />, cls: 'bg-red-50 text-red-700 border-red-200' },
    Leave: { icon: <Umbrella className="w-3.5 h-3.5" />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  }
  const { icon, cls } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {icon}{status}
    </span>
  )
}

function LeaveStatusBadge({ status }: { status: LeaveRequestStatus }) {
  const map: Record<LeaveRequestStatus, string> = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status]}`}>
      {status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
      {status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
      {status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
      {status}
    </span>
  )
}

function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const map: Record<LeaveType, string> = {
    Annual: 'bg-violet-50 text-violet-700 border-violet-200',
    Sick: 'bg-rose-50 text-rose-700 border-rose-200',
    Remote: 'bg-sky-50 text-sky-700 border-sky-200',
    Other: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${map[type]}`}>
      {type}
    </span>
  )
}

// ─── Intern View ──────────────────────────────────────────────────────────────

function InternView() {
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [todayStatus, setTodayStatus] = useState<AttendanceStatus>('Absent')
  const [historyTab, setHistoryTab] = useState<'Week' | 'Month'>('Week')
  const [leaveType, setLeaveType] = useState<string>('Annual')
  const [leaveStart, setLeaveStart] = useState('')
  const [leaveEnd, setLeaveEnd] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS)
  const [currentTime, setCurrentTime] = useState(now())

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(now()), 10000)
    return () => clearInterval(t)
  }, [])

  const handleCheckIn = () => {
    const t = now()
    setCheckIn(t)
    setTodayStatus(autoStatus(t))
  }

  const handleCheckOut = () => {
    const t = now()
    setCheckOut(t)
  }

  const workedHours = checkIn && checkOut ? calcHours(checkIn, checkOut) : null

  const handleLeaveSubmit = () => {
    if (!leaveStart || !leaveEnd || !leaveReason.trim()) return
    const newReq: LeaveRequest = {
      id: `lr-${Date.now()}`,
      type: leaveType as LeaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: 'Pending',
      submittedDate: new Date().toISOString().slice(0, 10),
    }
    setLeaveRequests([newReq, ...leaveRequests])
    setLeaveStart('')
    setLeaveEnd('')
    setLeaveReason('')
  }

  const presentCount = MOCK_ATTENDANCE_RECORDS.filter(r => r.status === 'Present').length
  const lateCount = MOCK_ATTENDANCE_RECORDS.filter(r => r.status === 'Late').length
  const absentCount = MOCK_ATTENDANCE_RECORDS.filter(r => r.status === 'Absent').length
  const leaveCount = MOCK_ATTENDANCE_RECORDS.filter(r => r.status === 'Leave').length

  const weekRecords = MOCK_ATTENDANCE_RECORDS.slice(0, 5)
  const monthRecords = MOCK_ATTENDANCE_RECORDS

  const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0c382b] flex items-center gap-2.5">
          <Clock className="w-7 h-7 text-[#1b5e3a]" />
          Attendance
        </h1>
        <p className="text-sm text-gray-500 mt-1">Track your daily check-ins, working hours and leave requests.</p>
      </div>



      {/* Check-In / Check-Out Widget */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Date & Live Clock */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Today</p>
              <p className="text-base sm:text-lg font-semibold text-gray-900">{todayStr}</p>
              <div className="flex items-center gap-2 mt-2">
                <Timer className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-mono font-medium text-gray-600">{currentTime}</span>
                <span className="ml-2">
                  {checkIn && <StatusBadge status={todayStatus} />}
                  {!checkIn && <span className="text-xs text-gray-400 font-medium">Not checked in yet</span>}
                </span>
              </div>
            </div>

            {/* Times & Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Check-In info */}
              <div className="text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Check-in</p>
                <p className="text-xl font-bold text-gray-900 font-mono">{checkIn ?? '—'}</p>
              </div>
              {/* Arrow */}
              <div className="hidden sm:flex items-center text-gray-300 text-2xl font-light">→</div>
              {/* Check-Out info */}
              <div className="text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Check-out</p>
                <p className="text-xl font-bold text-gray-900 font-mono">{checkOut ?? '—'}</p>
              </div>
              {/* Hours */}
              <div className="text-center">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Hours</p>
                <p className="text-xl font-bold text-gray-900">{workedHours != null ? formatMinutes(workedHours) : '—'}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  id="check-in-btn"
                  type="button"
                  disabled={!!checkIn}
                  onClick={handleCheckIn}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs
                    ${checkIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-white cursor-pointer hover:shadow-md'
                    }`}
                  style={!checkIn ? { backgroundColor: '#FF7A00' } : undefined}
                >
                  <LogIn className="w-4 h-4" />
                  Check In
                </button>
                <button
                  id="check-out-btn"
                  type="button"
                  disabled={!checkIn || !!checkOut}
                  onClick={handleCheckOut}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs
                    ${!checkIn || checkOut
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#ff5500] hover:bg-[#e64d00] text-white cursor-pointer hover:shadow-md'
                    }`}
                >
                  <LogOut className="w-4 h-4" />
                  Check Out
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {checkIn && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>Daily progress (8h target)</span>
                <span>{workedHours != null ? `${Math.min(Math.round((workedHours / 480) * 100), 100)}%` : 'In progress…'}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${workedHours != null ? Math.min((workedHours / 480) * 100, 100) : 30}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#0c382b] flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Attendance History
          </h2>
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['Week', 'Month'] as const).map(tab => (
              <button
                key={tab}
                id={`history-tab-${tab.toLowerCase()}`}
                type="button"
                onClick={() => setHistoryTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer
                  ${historyTab === tab ? 'bg-white text-[#0c382b] shadow-xs' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Check-in</th>
                <th className="px-6 py-3 text-left">Check-out</th>
                <th className="px-6 py-3 text-left">Hours</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(historyTab === 'Week' ? weekRecords : monthRecords).map(record => (
                <tr key={record.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-gray-800">{formatDate(record.date)}</td>
                  <td className="px-6 py-3.5 font-mono text-gray-600">{record.checkIn ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-3.5 font-mono text-gray-600">{record.checkOut ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-3.5 text-gray-600">
                    {record.hours != null ? formatMinutes(record.hours) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5"><StatusBadge status={record.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Request Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Submit Form */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0c382b] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submit Leave Request
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Leave Type</label>
              <CustomSelect
                value={leaveType}
                onChange={setLeaveType}
                options={[
                  { value: 'Annual', label: 'Annual Leave' },
                  { value: 'Sick', label: 'Sick Leave' },
                  { value: 'Remote', label: 'Remote Work' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">From</label>
                <input
                  id="leave-start-date"
                  type="date"
                  value={leaveStart}
                  onChange={e => setLeaveStart(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">To</label>
                <input
                  id="leave-end-date"
                  type="date"
                  value={leaveEnd}
                  onChange={e => setLeaveEnd(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Reason</label>
              <textarea
                id="leave-reason"
                rows={3}
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                placeholder="Briefly describe the reason for your request…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition resize-none"
              />
            </div>

            <button
              id="submit-leave-btn"
              type="button"
              onClick={handleLeaveSubmit}
              disabled={!leaveStart || !leaveEnd || !leaveReason.trim()}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all
                ${leaveStart && leaveEnd && leaveReason.trim()
                  ? 'bg-[#ff5500] hover:bg-[#e64d00] text-white cursor-pointer shadow-xs hover:shadow-md'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
          </div>
        </div>

        {/* Previous Requests */}
        <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs p-6 space-y-4">
          <h2 className="text-base font-bold text-[#0c382b] flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            My Requests
          </h2>

          {leaveRequests.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No requests submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {leaveRequests.map(req => (
                <div key={req.id} className="border border-gray-100 rounded-xl p-4 space-y-2 hover:border-gray-200 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <LeaveTypeBadge type={req.type} />
                      <span className="text-xs text-gray-500">
                        {formatDate(req.startDate)}{req.startDate !== req.endDate ? ` → ${formatDate(req.endDate)}` : ''}
                      </span>
                    </div>
                    <LeaveStatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{req.reason}</p>
                  <p className="text-[11px] text-gray-400">Submitted {formatDate(req.submittedDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Mentor View ──────────────────────────────────────────────────────────────

function MentorView() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDate, setFilterDate] = useState('All')
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MENTOR_LEAVE_REQUESTS)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 6

  const todayRows = MENTOR_ATTENDANCE_ROWS.filter(r => r.date === '2026-09-21')
  const presentToday = todayRows.filter(r => r.status === 'Present').length
  const absentToday = todayRows.filter(r => r.status === 'Absent').length
  const lateToday = todayRows.filter(r => r.status === 'Late').length
  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending').length

  const uniqueDates = [...new Set(MENTOR_ATTENDANCE_ROWS.map(r => r.date))].sort().reverse()

  const filtered = MENTOR_ATTENDANCE_ROWS.filter(row => {
    const matchSearch = !searchQuery || row.internName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'All' || row.status === filterStatus
    const matchDate = filterDate === 'All' || row.date === filterDate
    return matchSearch && matchStatus && matchDate
  })

  const totalPages = Math.ceil(filtered.length / rowsPerPage)
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleApprove = (id: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r))
  }
  const handleReject = (id: string) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0c382b] flex items-center gap-2.5">
          <UserCheck className="w-7 h-7 text-[#1b5e3a]" />
          Team Attendance
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your interns' attendance and manage leave requests.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1e3a2c]/10 flex items-center justify-center text-[#1e3a2c] shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{todayRows.length}</p>
            <p className="text-xs font-medium text-gray-500">Total interns</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{presentToday + lateToday}</p>
            <p className="text-xs font-medium text-gray-500">Present today</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{absentToday}</p>
            <p className="text-xs font-medium text-gray-500">Absent today</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            <p className="text-xs font-medium text-gray-500">Pending requests</p>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#0c382b] flex items-center gap-2 shrink-0 mr-auto">
            <TrendingUp className="w-5 h-5" />
            Attendance Log
          </h2>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 gap-2 min-w-[180px]">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                id="mentor-search-input"
                type="text"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                placeholder="Search intern…"
                className="bg-transparent text-xs text-gray-800 placeholder-gray-400 outline-none w-full"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="w-36">
              <CustomSelect
                size="sm"
                value={filterStatus}
                onChange={v => { setFilterStatus(v); setCurrentPage(1) }}
                options={[
                  { value: 'All', label: 'Status: All' },
                  { value: 'Present', label: 'Present' },
                  { value: 'Late', label: 'Late' },
                  { value: 'Absent', label: 'Absent' },
                  { value: 'Leave', label: 'Leave' },
                ]}
              />
            </div>

            {/* Date filter */}
            <div className="w-40">
              <CustomSelect
                size="sm"
                value={filterDate}
                onChange={v => { setFilterDate(v); setCurrentPage(1) }}
                options={[
                  { value: 'All', label: 'Date: All' },
                  ...uniqueDates.map(d => ({ value: d, label: formatDate(d) })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-6 py-3 text-left">Intern</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Check-in</th>
                <th className="px-6 py-3 text-left">Check-out</th>
                <th className="px-6 py-3 text-left">Hours</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1e3a2c]/10 flex items-center justify-center text-[#1e3a2c] text-xs font-bold shrink-0">
                        {row.internName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-gray-800">{row.internName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-gray-600">{formatDate(row.date)}</td>
                  <td className="px-6 py-3.5 font-mono text-gray-600">{row.checkIn ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-3.5 font-mono text-gray-600">{row.checkOut ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-3.5 text-gray-600">{row.hours != null ? formatMinutes(row.hours) : <span className="text-gray-300">—</span>}</td>
                  <td className="px-6 py-3.5"><StatusBadge status={row.status} /></td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No records match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer
                    ${p === currentPage ? 'bg-[#1e3a2c] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Request Queue */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#0c382b] flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Leave Requests
          </h2>
          {pendingRequests > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingRequests} pending
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-50">
          {leaveRequests.map(req => (
            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start sm:items-center gap-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#1e3a2c]/10 flex items-center justify-center text-[#1e3a2c] text-xs font-bold shrink-0">
                  {req.internName?.split(' ').map(n => n[0]).join('') ?? 'ME'}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{req.internName}</span>
                    <LeaveTypeBadge type={req.type} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(req.startDate)}{req.startDate !== req.endDate ? ` → ${formatDate(req.endDate)}` : ''}
                    {' · '}Submitted {formatDate(req.submittedDate)}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-lg">{req.reason}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 sm:pl-4">
                {req.status === 'Pending' ? (
                  <>
                    <button
                      id={`approve-btn-${req.id}`}
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      id={`reject-btn-${req.id}`}
                      type="button"
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                ) : (
                  <LeaveStatusBadge status={req.status} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Attendance() {
  const { role } = useUserRole()
  return role === 'Mentor' ? <MentorView /> : <InternView />
}
