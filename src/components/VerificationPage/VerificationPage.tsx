'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { VerifiedBadge } from '@/components/VerifiedBadge/VerifiedBadge'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { store } from '@/store/store'

type AccountType = 'studio' | 'developer' | 'publisher'

export function VerificationPage() {
  const { user } = useStore(store)

  const [request, setRequest] = useState<VerificationRequestView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<AccountType>('studio')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const fetchIdRef = useRef(0)

  const breadcrumbs = useMemo(
    () => [{ label: 'Verification', url: '/dashboard/verification' }],
    [],
  )

  const fetchRequest = useCallback(async () => {
    const fetchId = ++fetchIdRef.current
    setIsLoading(true)

    try {
      const result = await API.getVerificationRequest()
      if (fetchId !== fetchIdRef.current) return
      setRequest(result)
    } catch {
      if (fetchId !== fetchIdRef.current) return
    } finally {
      if (fetchId === fetchIdRef.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchRequest()
  }, [user, fetchRequest])

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await API.createVerificationRequest({
        accountType,
        message,
        contact,
      })
      await fetchRequest()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit request.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [accountType, contact, fetchRequest, message])

  const handleAccountTypeChange = useCallback((value: string) => {
    if (value) setAccountType(value as AccountType)
  }, [])

  if (!user) {
    return (
      <>
        <DashboardHeader breadcrumbs={breadcrumbs} />
        <Container>
          <div className={'flex flex-col items-center gap-4 py-16 text-center'}>
            <p className={'text-muted-foreground'}>
              {'You must be signed in to manage verification.'}
            </p>
          </div>
        </Container>
      </>
    )
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

  // Verified state
  if (request?.status === 'approved') {
    return (
      <>
        <DashboardHeader breadcrumbs={breadcrumbs} />
        <Container>
          <div className={'flex flex-col items-center gap-4 py-16 text-center'}>
            <VerifiedBadge
              accountType={request.accountType as AccountType}
              className={'text-4xl'}
            />
            <div className={'flex flex-col gap-1'}>
              <h2 className={'text-lg font-semibold'}>{'Verified'}</h2>
              <p className={'text-sm text-muted-foreground'}>
                {`Your account is verified as a ${request.accountType}. Games you create will be attributed to you.`}
              </p>
            </div>
          </div>
        </Container>
      </>
    )
  }

  // Pending state
  if (request?.status === 'pending') {
    return (
      <>
        <DashboardHeader breadcrumbs={breadcrumbs} />
        <Container>
          <div className={'flex flex-col items-center gap-4 py-16 text-center'}>
            <Badge variant={'outline'} className={'text-base px-4 py-1'}>
              <FontAwesomeIcon icon={faClock} className={'mr-2 size-4'} />
              {'Pending Review'}
            </Badge>
            <div className={'flex flex-col gap-1'}>
              <p className={'text-sm text-muted-foreground'}>
                {`Your verification request as a ${request.accountType} is being reviewed.`}
              </p>
              <p className={'text-xs text-muted-foreground'}>
                {`Submitted ${new Date(request.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`}
              </p>
            </div>
          </div>
        </Container>
      </>
    )
  }

  // Denied state (can re-request)
  const showDenied = request?.status === 'denied'

  // No request or denied: show form
  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <Container>
        <div className={'mx-auto flex max-w-lg flex-col gap-6'}>
          <div className={'flex flex-col gap-2'}>
            <h1 className={'text-2xl font-bold'}>{'Request Verification'}</h1>
            <p className={'text-sm text-muted-foreground'}>
              {'Verified accounts can create games in their own repository with immediate attribution. Tell us who you are and we\'ll review your request.'}
            </p>
          </div>

          {showDenied && request.reviewReason && (
            <div className={'rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3'}>
              <p className={'text-sm font-medium text-destructive'}>
                {'Your previous request was denied'}
              </p>
              <p className={'mt-1 text-sm text-destructive/80'}>
                {request.reviewReason}
              </p>
            </div>
          )}

          <div className={'flex flex-col gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <Label>{'Account Type'}</Label>
              <ToggleGroup
                type={'single'}
                value={accountType}
                onValueChange={handleAccountTypeChange}
                variant={'outline'}>
                <ToggleGroupItem value={'studio'}>{'Studio'}</ToggleGroupItem>
                <ToggleGroupItem value={'developer'}>{'Developer'}</ToggleGroupItem>
                <ToggleGroupItem value={'publisher'}>{'Publisher'}</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className={'flex flex-col gap-2'}>
              <Label htmlFor={'verification-message'}>{'About you'}</Label>
              <Textarea
                id={'verification-message'}
                maxLength={3000}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={'Who you are, links to your work, and why you\'re requesting verification.'}
                rows={5}
                value={message}
              />
            </div>

            <div className={'flex flex-col gap-2'}>
              <Label htmlFor={'verification-contact'}>{'Contact'}</Label>
              <Textarea
                id={'verification-contact'}
                maxLength={500}
                onChange={(e) => setContact(e.target.value)}
                placeholder={'Email, social handle, or other way to reach you.'}
                rows={2}
                value={contact}
              />
            </div>
          </div>

          {submitError && (
            <p className={'text-sm text-destructive'}>{submitError}</p>
          )}

          <Button
            disabled={isSubmitting || !message.trim() || !contact.trim()}
            onClick={handleSubmit}>
            {isSubmitting ? (
              <>
                <Spinner className={'size-4'} />
                {'Submitting...'}
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </Container>
    </>
  )
}
