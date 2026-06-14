import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  studio: 'Verified Studio',
  developer: 'Verified Developer',
  publisher: 'Verified Publisher',
}

export function VerifiedBadge({
  accountType,
  className,
}: {
  accountType: 'studio' | 'developer' | 'publisher'
  className?: string
}) {
  const label = ACCOUNT_TYPE_LABELS[accountType] ?? 'Verified'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label={label}
          className={className}
          role={'img'}>
          <FontAwesomeIcon
            className={'text-primary'}
            icon={faCircleCheck}
          />
        </span>
      </TooltipTrigger>

      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
