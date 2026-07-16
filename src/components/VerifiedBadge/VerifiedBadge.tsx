import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  type AccountType,
  VERIFIED_ACCOUNT_TYPE_LABELS,
} from '@/constants/ACCOUNT_TYPES'

export function VerifiedBadge({
  accountType,
  className,
}: {
  accountType: AccountType
  className?: string
}) {
  const label = VERIFIED_ACCOUNT_TYPE_LABELS[accountType]

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
