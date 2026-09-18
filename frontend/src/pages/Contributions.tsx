import ContributionWorkspace from './ContributionWorkspace'
import { useWorkspaceRole } from '../components/WorkspaceRoleContext'

export default function Contributions() {
  const { role } = useWorkspaceRole()
  return <ContributionWorkspace key={role} />
}
