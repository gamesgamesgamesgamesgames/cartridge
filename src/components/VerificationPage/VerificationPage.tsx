'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from 'statery'
import {
  ArrowRight,
  Check,
  Clock,
  Gamepad2,
} from 'lucide-react'

import * as API from '@/helpers/API'
import { type VerificationRequestView } from '@/helpers/API'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Container } from '@/components/Container/Container'
import { Header } from '@/components/Header/Header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { VerifiedBadge } from '@/components/VerifiedBadge/VerifiedBadge'
import { store } from '@/store/store'
import {
  type AccountType,
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
} from '@/constants/ACCOUNT_TYPES'

const CONTACT_PATTERN = /^([^\s@]+@[^\s@]+\.[^\s@]{2,}|@?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?){1,})$/

export function VerificationPage() {
  const { user } = useStore(store)

  const [request, setRequest] = useState<VerificationRequestView | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<AccountType>('studio')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [contactTouched, setContactTouched] = useState(false)
  const [messageTouched, setMessageTouched] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitConfirmed, setSubmitConfirmed] = useState(false)
  const fetchIdRef = useRef(0)
  const announcerRef = useRef<HTMLDivElement>(null)

  const contactError =
    (contactTouched || submitAttempted) && contact.trim().length === 0
      ? 'Contact is required so we can follow up on your request.'
      : contactTouched && contact.trim().length > 0 && !CONTACT_PATTERN.test(contact.trim())
        ? 'Enter an email address or handle, e.g. you@example.com or @you.bsky.social'
        : null

  const messageError =
    (messageTouched || submitAttempted) && message.trim().length === 0
      ? 'Tell us about yourself so we can review your request.'
      : null

  const canSubmit = contact.trim().length > 0 && CONTACT_PATTERN.test(contact.trim()) && message.trim().length > 0

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

  useEffect(() => {
    if (request?.status === 'denied') {
      setAccountType(request.accountType)
      if (request.message) setMessage(request.message)
      if (request.contact) setContact(request.contact)
    }
  }, [request])

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      setSubmitAttempted(true)
      setContactTouched(true)
      setMessageTouched(true)
      return
    }

    if (!submitConfirmed) {
      setSubmitConfirmed(true)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await API.createVerificationRequest({
        accountType,
        message: message.trim(),
        contact: contact.trim(),
      })
      await fetchRequest()
      if (announcerRef.current) {
        announcerRef.current.textContent = 'Verification request submitted successfully.'
      }
    } catch (error) {
      const raw = error instanceof Error ? error.message : ''
      let friendlyMessage = 'Something went wrong while submitting your request. Please try again.'
      if (raw.includes('already exists') || raw.includes('409')) {
        friendlyMessage = 'You already have a pending verification request.'
      } else if (raw.includes('401') || raw.includes('403')) {
        friendlyMessage = 'Your session has expired. Please sign in again.'
      } else if (raw.includes('429')) {
        friendlyMessage = 'Too many requests. Please wait a moment and try again.'
      }
      setSubmitError(friendlyMessage)
      setSubmitConfirmed(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [accountType, canSubmit, contact, fetchRequest, message, submitConfirmed])

  // Not signed in
  if (!user) {
    return (
      <Container>
        <div className={'mx-auto flex max-w-xl flex-col gap-4'}>
          <Header level={3}>{'Get Verified'}</Header>
          <p className={'text-sm text-muted-foreground'}>
            {'Sign in with your ATProto identity to request verification.'}
          </p>
          <Button asChild className={'self-start'}>
            <Link href={'/login?returnTo=/verify'}>{'Sign In'}</Link>
          </Button>
        </div>
      </Container>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <Container>
        <div className={'flex items-center justify-center py-16'}>
          <Spinner className={'size-6'} />
        </div>
      </Container>
    )
  }

  // Approved
  if (request?.status === 'approved') {
    return (
      <Container>
        <div className={'mx-auto flex max-w-xl flex-col items-center gap-10 py-12'}>
          <div className={'flex flex-col items-center gap-5 text-center'}>
            <VerifiedBadge
              accountType={request.accountType}
              className={'text-6xl'}
            />
            <div className={'flex flex-col gap-2'}>
              <Header level={1}>{'Verified'}</Header>
              <p className={'text-lg text-muted-foreground'}>
                {`You're a verified ${ACCOUNT_TYPE_LABELS[request.accountType]} on Cartridge. Your games carry your name.`}
              </p>
            </div>
          </div>

          <div className={'w-full rounded-xl border border-primary/20 bg-primary/5 px-6 py-5'}>
            <p className={'font-semibold'}>{'What you can do now'}</p>
            <ul className={'mt-3 flex flex-col gap-2.5'}>
              {[
                'Claim ownership of games and organizations you manage.',
                'Access studio tools to manage your catalog and metadata.',
                'Your profile displays a verified badge visible to the community.',
              ].map((text) => (
                <li key={text} className={'flex items-start gap-2.5 text-sm text-muted-foreground'}>
                  <Check className={'mt-0.5 size-4 shrink-0 text-primary'} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className={'flex w-full flex-col gap-3 sm:flex-row sm:justify-center'}>
            <Button asChild size={'lg'}>
              <Link href={'/claim'}>
                <Gamepad2 className={'size-4'} />
                {'Claim a Game'}
              </Link>
            </Button>
            <Button asChild size={'lg'} variant={'outline'}>
              <Link href={'/studio'}>
                {'Go to Studio'}
                <ArrowRight className={'size-4'} />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  // Pending
  if (request?.status === 'pending') {
    return (
      <Container>
        <div className={'mx-auto flex max-w-xl flex-col gap-10 py-12'}>
          <div className={'flex flex-col items-center gap-5 text-center'}>
            <div className={'flex size-16 items-center justify-center rounded-full bg-primary/15'}>
              <Clock className={'size-8 text-primary'} />
            </div>
            <div className={'flex flex-col gap-2'}>
              <Header level={2}>{"We're on it"}</Header>
              <p className={'text-foreground/70'}>
                {`Your verification request as a ${ACCOUNT_TYPE_LABELS[request.accountType]} is being reviewed.`}
              </p>
            </div>
          </div>

          <div className={'flex flex-col gap-4'}>
            {[
              { done: true, text: 'Request submitted' },
              { done: false, text: 'Under review (1-2 business days)' },
              { done: false, text: 'Verified badge on your profile' },
            ].map((step, i) => (
              <div key={i} className={'flex items-center gap-3'}>
                <div className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  step.done
                    ? 'bg-primary text-primary-foreground'
                    : 'border-2 border-border text-muted-foreground',
                )}>
                  {step.done ? <Check className={'size-4'} /> : i + 1}
                </div>
                <span className={cn(
                  step.done ? 'font-semibold' : 'text-muted-foreground',
                )}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          <p className={'text-center text-sm text-muted-foreground'}>
            {`Submitted ${new Date(request.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>
        </div>
      </Container>
    )
  }

  // Denied or new: show form
  const showDenied = request?.status === 'denied'

  return (
    <Container>
      <div
        ref={announcerRef}
        aria-live={'polite'}
        className={'sr-only'}
        role={'status'}
      />

      <div className={'mx-auto flex max-w-xl flex-col gap-8'}>
        <div className={'flex flex-col gap-3'}>
          <Header level={1}>{'Get Verified'}</Header>
          <p className={'text-foreground/70'}>
            {'Verification lets you claim ownership of your games, access studio tools, and display a verified badge on your profile. Reviews take 1-2 business days.'}
          </p>
        </div>

        {showDenied && request.reviewReason && (
          <div className={'rounded-lg border border-destructive/50 bg-destructive/10 px-5 py-4'}>
            <p className={'text-sm font-medium text-destructive'}>
              {'Your previous request was denied'}
            </p>
            <p className={'mt-1 text-sm text-destructive/80'}>
              {request.reviewReason}
            </p>
          </div>
        )}

        {/* Account type */}
        <fieldset className={'flex flex-col gap-3'}>
          <legend className={'font-semibold'}>{'What kind of account is this?'}</legend>
          <div className={'grid gap-3 sm:grid-cols-2 lg:grid-cols-4'}>
            {ACCOUNT_TYPES.map((type) => {
              const isSelected = accountType === type.value
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-left transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary'
                      : 'border-border hover:border-primary/40 hover:bg-accent/50',
                  )}
                  onClick={() => {
                    setAccountType(type.value)
                    setSubmitConfirmed(false)
                  }}
                  type={'button'}>
                  <div className={'flex items-center gap-2'}>
                    <Icon className={cn(
                      'size-5',
                      isSelected ? 'text-primary' : 'text-muted-foreground',
                    )} />
                    <span className={cn(
                      'text-sm',
                      isSelected ? 'font-semibold' : 'font-medium',
                    )}>{type.label}</span>
                  </div>
                  <p className={'text-xs text-muted-foreground'}>
                    {type.description}
                  </p>
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* Form fields */}
        <div className={'flex flex-col gap-6'}>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor={'verification-message'}>
              {'About you'}
              <span className={'ml-1 text-destructive'}>{'*'}</span>
            </Label>
            <Textarea
              aria-describedby={'message-hint'}
              aria-invalid={messageError ? true : undefined}
              id={'verification-message'}
              maxLength={3000}
              onBlur={() => setMessageTouched(true)}
              onChange={(e) => {
                setMessage(e.target.value)
                setSubmitConfirmed(false)
              }}
              rows={5}
              value={message}
            />
            <div className={'flex items-center justify-between'} id={'message-hint'}>
              {messageError ? (
                <p className={'text-xs text-destructive'} role={'alert'}>
                  {messageError}
                </p>
              ) : (
                <p className={'text-xs text-muted-foreground'}>
                  {'Links to your work, store pages, or social profiles help us verify faster.'}
                </p>
              )}
              {message.length >= 2500 && (
                <span className={'shrink-0 text-xs text-muted-foreground'}>
                  {`${message.length}/3000`}
                </span>
              )}
            </div>
          </div>

          <div className={'flex flex-col gap-2'}>
            <Label htmlFor={'verification-contact'}>
              {'Contact'}
              <span className={'ml-1 text-destructive'}>{'*'}</span>
            </Label>
            <Input
              aria-describedby={'contact-hint'}
              aria-invalid={contactError ? true : undefined}
              className={'max-w-sm'}
              id={'verification-contact'}
              onBlur={() => setContactTouched(true)}
              onChange={(e) => {
                setContact(e.target.value)
                setSubmitConfirmed(false)
              }}
              placeholder={'you@example.com or @you.bsky.social'}
              value={contact}
            />
            {contactError ? (
              <p className={'text-xs text-destructive'} id={'contact-hint'} role={'alert'}>
                {contactError}
              </p>
            ) : (
              <p className={'text-xs text-muted-foreground'} id={'contact-hint'}>
                {"We'll use this to follow up on your request. Not displayed publicly."}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <div className={'rounded-lg border border-destructive/50 bg-destructive/10 px-5 py-4'}>
            <p className={'text-sm text-destructive'} role={'alert'}>{submitError}</p>
          </div>
        )}

        {submitAttempted && !canSubmit && (
          <p className={'text-sm text-destructive'} role={'alert'}>
            {'Complete the required fields to submit.'}
          </p>
        )}

        <div className={'border-t border-border pt-6'}>
          <div className={'flex flex-col items-start gap-1'}>
            <div className={'flex items-center gap-2'}>
              {submitConfirmed && !isSubmitting && (
                <Button
                  onClick={() => setSubmitConfirmed(false)}
                  variant={'ghost'}>
                  {'Cancel'}
                </Button>
              )}
              <Button
                disabled={isSubmitting}
                onClick={handleSubmit}>
                {isSubmitting ? (
                  <>
                    <Spinner className={'size-4'} />
                    {'Submitting...'}
                  </>
                ) : submitConfirmed
                  ? 'Confirm Submission'
                  : showDenied
                    ? 'Resubmit Request'
                    : 'Submit Request'}
              </Button>
            </div>
            {submitConfirmed && !isSubmitting && (
              <span className={'text-xs text-muted-foreground'}>
                {'This submits your request for manual review.'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
