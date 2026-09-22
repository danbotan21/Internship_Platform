import { createPortal } from 'react-dom'
import Modal from '../ui/Modal'

// Keep fixed dialogs relative to the viewport, outside the scrolling layout.
export default function ContributionModal(props: Parameters<typeof Modal>[0]) {
  return createPortal(<Modal {...props} />, document.body)
}
