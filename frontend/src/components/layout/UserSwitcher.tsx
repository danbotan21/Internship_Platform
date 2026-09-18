import { Eye } from 'lucide-react'
import { useCurrentUser } from '../CurrentUserContext'

// Preview-only switch until authentication supplies the real user.
export default function UserSwitcher() {
  const { user, users, switchUser } = useCurrentUser()
  const mentors = users.filter((item) => item.role === 'mentor')
  const students = users.filter((item) => item.role === 'student')

  return (
    <label className='flex items-center gap-2 rounded-lg border border-[#d9e0dc] bg-white px-3 py-1.5 text-[12px] text-[#5d6b64]'>
      <Eye className='size-4 text-[#184b38]' aria-hidden='true' />
      <span className='hidden sm:inline'>Preview as</span>
      <select
        className='max-w-44 bg-transparent font-semibold text-[#14211b] outline-none'
        value={user.userId}
        onChange={(event) => switchUser(event.target.value)}
        aria-label='Preview the workspace as'
      >
        <optgroup label='Mentors'>
          {mentors.map((item) => (
            <option key={item.userId} value={item.userId}>
              {item.fullName}
            </option>
          ))}
        </optgroup>
        <optgroup label='Students'>
          {students.map((item) => (
            <option key={item.userId} value={item.userId}>
              {item.fullName}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  )
}
