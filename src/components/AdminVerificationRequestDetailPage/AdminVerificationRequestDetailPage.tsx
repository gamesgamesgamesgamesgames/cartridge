'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useStore } from 'statery'

import * as API from '@/helpers/API'
import { type VerificationRequestView } from '@/helpers/API'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/Container/Container'
import { DashboardHeader } from '@/components/DashboardHeader/DashboardHeader'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { isAdmin } from '@/helpers/admin'
import { store } from '@/store/store'

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  studio: 'Studio',
  developer: 'Developer',
  publisher: 'Publisher',
}

export function AdminVerificationRequestDetailPage() {
  const { user } = useStore(store)
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [request, setRequest] = useState<VerificationRequestView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [denyReason, setDenyReason] = useState('')
  const [showDenyForm, setShowDenyForm] = useState(false)

  const breadcrumbs = useMemo(
    () => [
      { label: 'Admin', url: '/dashboard/admin' },
      { label: 'Verification Requests', url: '/dashboard/admin/verification-requests' },
      { label: params.id, url: `/dashboard/admin/verification-requests/${params.id}` },
    ],
    [params.id],
  )

  const fetchRequest = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await API.getVerificationRequest({ id: params.id })
      setRequest(result)
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchRequest()
  }, [fetchRequest])

  const handleApprove = useCallback(async () => {
    setIsReviewing(true)
    setReviewError(null)

    try {
      await API.reviewVerificationRequest({
        requestId: params.id,
        status: 'approved',
      })
      await fetchRequest()
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : 'Failed to approve request.',
      )
    } finally {
      setIsReviewing(false)
    }
  }, [fetchRequest, params.id])

  const handleDeny = useCallback(async () => {
    setIsReviewing(true)
    setReviewError(null)

    try {
      await API.reviewVerificationRequest({
        requestId: params.id,
        status: 'denied',
        reason: denyReason.trim() || undefined,
      })
      await fetchRequest()
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : 'Failed to deny request.',
      )
    } finally {
      setIsReviewing(false)
      setShowDenyForm(false)
    }
  }, [denyReason, fetchRequest, params.id])

  // Auth guard — after all hooks
  if (user !== null && !isAdmin(user?.did)) {
    router.replace('/')
    return null
  }

  if (isLoading) {
    return (
      <>
        <DashboardHeader breadcrumbs={breadcrumbs} />
        <Container>
          <div className={'flex items-center justify-center py-16'}>
            <Spinner className={'size-6'} />
          </div>
        </Container>
      </>
    )
  }

  if (!request) {
    return (
      <>
        <DashboardHeader breadcrumbs={breadcrumbs} />
        <Container>
          <div className={'flex items-center justify-center py-16'}>
            <p className={'text-muted-foreground'}>{'Verification request not found.'}</p>
          </div>
        </Container>
      </>
    )
  }

  const isPending = request.status === 'pending'

  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />

      <Container>
        <div className={'mx-auto flex max-w-2xl flex-col gap-6'}>
          <div className={'flex items-center justify-between'}>
            <h1 className={'text-2xl font-bold'}>{'Verification Request'}</h1>
            <Badge
              variant={request.status === 'approved' ? 'default' : request.status === 'denied' ? 'destructive' : 'outline'}
              className={request.status === 'approved' ? 'bg-green-600 text-white border-transparent' : ''}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>

          <div className={'flex flex-col gap-4 rounded-lg border border-border p-4'}>
            <div className={'grid grid-cols-2 gap-4'}>
              <div className={'flex flex-col gap-1'}>
                <span className={'text-xs text-muted-foreground'}>{'Requester'}</span>
                <span className={'text-sm font-mono truncate'}>{request.requesterDid}</span>
              </div>

              <div className={'flex flex-col gap-1'}>
                <span className={'text-xs text-muted-foreground'}>{'Account Type'}</span>
                <span className={'text-sm'}>{ACCOUNT_TYPE_LABELS[request.accountType] ?? request.accountType}</span>
              </div>

              <div className={'flex flex-col gap-1'}>
                <span className={'text-xs text-muted-foreground'}>{'Submitted'}</span>
                <span className={'text-sm'}>
                  {new Date(request.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              {request.contact && (
                <div className={'flex flex-col gap-1'}>
                  <span className={'text-xs text-muted-foreground'}>{'Contact'}</span>
                  <span className={'text-sm'}>{request.contact}</span>
                </div>
              )}
            </div>

            <div className={'flex flex-col gap-1'}>
              <span className={'text-xs text-muted-foreground'}>{'Message'}</span>
              <p className={'text-sm whitespace-pre-wrap'}>{request.message}</p>
            </div>
          </div>

          {request.reviewedAt && (
            <div className={'flex flex-col gap-2 rounded-lg border border-border p-4'}>
              <span className={'text-xs text-muted-foreground'}>{'Review'}</span>
              <p className={'text-sm'}>
                {`${request.status === 'approved' ? 'Approved' : 'Denied'} on ${new Date(request.reviewedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}`}
              </p>
              {request.reviewReason && (
                <p className={'text-sm text-muted-foreground'}>{request.reviewReason}</p>
              )}
            </div>
          )}

          {reviewError && (
            <p className={'text-sm text-destructive'}>{reviewError}</p>
          )}

          {isPending && !showDenyForm && (
            <div className={'flex gap-3'}>
              <Button
                disabled={isReviewing}
                onClick={handleApprove}>
                {isReviewing ? (
                  <>
                    <Spinner className={'size-4'} />
                    {'Approving...'}
                  </>
                ) : (
                  'Approve'
                )}
              </Button>

              <Button
                disabled={isReviewing}
                onClick={() => setShowDenyForm(true)}
                variant={'destructive'}>
                {'Deny'}
              </Button>
            </div>
          )}

          {isPending && showDenyForm && (
            <div className={'flex flex-col gap-3 rounded-lg border border-destructive/50 p-4'}>
              <Label htmlFor={'deny-reason'}>{'Reason for denial'}</Label>
              <Textarea
                id={'deny-reason'}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder={'Explain why this request is being denied (shown to the requester).'}
                rows={3}
                value={denyReason}
              />
              <div className={'flex gap-3'}>
                <Button
                  disabled={isReviewing}
                  onClick={handleDeny}
                  variant={'destructive'}>
                  {isReviewing ? (
                    <>
                      <Spinner className={'size-4'} />
                      {'Denying...'}
                    </>
                  ) : (
                    'Confirm Deny'
                  )}
                </Button>
                <Button
                  disabled={isReviewing}
                  onClick={() => setShowDenyForm(false)}
                  variant={'outline'}>
                  {'Cancel'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}
