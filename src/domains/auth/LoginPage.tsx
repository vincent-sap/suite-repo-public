import { useEffect, useRef, useState } from 'react'
import { Button, CheckBox, IllustratedMessage, Input, Label, MessageStrip, Option, Select, Text } from '@ui5/webcomponents-react'
import type { InputDomRef } from '@ui5/webcomponents-react'
import '@ui5/webcomponents-fiori/dist/illustrations/SignOut.js'
import SapSignavioBrand from '../../shared/components/SapSignavioBrand'
import loginBg from '../../LoginBackground.jpg'
import { useAuth } from '../../contexts/AuthContext'
import s from './LoginPage.module.css'

type LoginStep =
  | 'credentials'
  | 'signing-in'
  | 'forgot-password'
  | 'reset-sent'
  | 'sign-in-assistance'
  | 'locked-out'
  | 'signed-out'

const ASSISTANCE_OPTIONS = [
  'Forgot password',
  'Account locked out',
  'Username not recognized',
  'Other sign-in issue',
]

function LoadingDots() {
  return (
    <div className={s.dots}>
      <span className={s.dot} style={{ '--delay': '0ms' } as React.CSSProperties} />
      <span className={s.dot} style={{ '--delay': '150ms' } as React.CSSProperties} />
      <span className={s.dot} style={{ '--delay': '300ms' } as React.CSSProperties} />
    </div>
  )
}

function LoginFooter() {
  return (
    <footer className={s.pageFooter}>
      <a href="#" className={s.footerLink}>Privacy</a>
      <a href="#" className={s.footerLink}>Terms of use</a>
      <a href="#" className={s.footerLink}>Copyright</a>
      <a href="#" className={s.footerLink}>Cookie policy</a>
      <a href="#" className={s.footerLink}>Help</a>
    </footer>
  )
}

interface LoginPageProps {
  ssoWorkspaceName?: string
  onRegister?: () => void
}

export default function LoginPage({ ssoWorkspaceName = 'Pre Release Production 2026', onRegister }: LoginPageProps) {
  const auth = useAuth()

  const initialStep: LoginStep = auth.signedOut ? 'signed-out' : 'credentials'
  const [step, setStep] = useState<LoginStep>(initialStep)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [staySignedIn, setStaySignedIn] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetSentTo, setResetSentTo] = useState('')
  const [assistanceIssue, setAssistanceIssue] = useState(ASSISTANCE_OPTIONS[0])
  const [showSso, setShowSso] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emailInputRef = useRef<InputDomRef>(null)

  useEffect(() => {
    if (step === 'credentials') {
      setTimeout(() => emailInputRef.current?.focus(), 0)
    }
  }, [step])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.key === 's' || e.key === 'S') && step === 'credentials') {
        setShowSso(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [step])

  useEffect(() => {
    if (auth.signedOut) setStep('signed-out')
  }, [auth.signedOut])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  function handleSignIn() {
    setHasError(false)
    setStep('signing-in')
    timerRef.current = setTimeout(() => {
      if (password === 'wrong') {
        setStep('credentials')
        setHasError(true)
      } else {
        auth.login()
      }
    }, 900)
  }

  function handleForgotPasswordSubmit() {
    setResetSentTo(forgotEmail)
    setStep('reset-sent')
  }

  function handleAssistanceSubmit() {
    if (assistanceIssue === 'Forgot password') {
      setForgotEmail(email)
      setStep('forgot-password')
    } else {
      setStep('locked-out')
    }
  }

  const cardTitle = (() => {
    if (step === 'forgot-password') return 'Forgot Password'
    if (step === 'reset-sent') return 'Check your email'
    if (step === 'sign-in-assistance') return 'Need help signing in'
    if (step === 'locked-out') return 'Need help signing in'
    if (step === 'signed-out') return 'Signed Out'
    return 'Sign In'
  })()

  return (
    <div className={s.page}>
      <div className={s.body}>
        {/* Left: form panel */}
        <div className={s.formPanel}>
          <div className={s.formPanelInner}>
            <div className={s.branding}>
              <SapSignavioBrand height={32} />
            </div>

            {ssoWorkspaceName && showSso && step === 'credentials' && (
              <div className={s.ssoCard}>
                <div className={s.ssoCardContent}>
                  <h2 className={s.ssoTitle}>{ssoWorkspaceName}</h2>
                  <p className={s.ssoDescription}>
                    Sign In with Single Sign On (SSO) to {ssoWorkspaceName}
                  </p>
                  <Button design="Emphasized" className={s.ssoButton} onClick={() => { auth.login(); auth.selectWorkspace() }}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            <div key={step} className={s.formArea}>
              <div className={s.titleRow}>
                {step !== 'signed-out' && <h1 className={s.cardTitle}>{cardTitle}</h1>}
              </div>

              {hasError && step === 'credentials' && (
                <MessageStrip design="Negative" hideCloseButton>
                  Your password has expired. Set a new one using Forgot Password.
                </MessageStrip>
              )}

              <div className={s.formBody}>
                {step === 'credentials' && (
                  <>
                    <div className={s.fieldGroup}>
                      <Label for="login-email" showColon>Email</Label>
                      <Input
                        id="login-email"
                        ref={emailInputRef}
                        value={email}
                        placeholder="Your Email"
                        className={s.fieldFull}
                        onInput={(e) => setEmail((e.target as unknown as HTMLInputElement).value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && email.trim() && password.trim()) handleSignIn() }}
                      />
                    </div>
                    <div className={s.fieldGroup}>
                      <Label for="login-password" showColon>Password</Label>
                      <Input
                        id="login-password"
                        type="Password"
                        value={password}
                        placeholder="Password"
                        className={s.fieldFull}
                        onInput={(e) => setPassword((e.target as unknown as HTMLInputElement).value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && email.trim() && password.trim()) handleSignIn() }}
                      />
                    </div>
                    <CheckBox
                      text="Stay signed in"
                      checked={staySignedIn}
                      onChange={() => setStaySignedIn(v => !v)}
                      style={{ marginLeft: '-0.5rem' }}
                    />
                    <a href="#" className={s.link} onClick={(e) => { e.preventDefault(); setAssistanceIssue(ASSISTANCE_OPTIONS[0]); setStep('sign-in-assistance') }}>
                      Need help signing in?
                    </a>
                  </>
                )}

                {step === 'signing-in' && (
                  <div className={s.busyArea}>
                    <Text>Signing in ...</Text>
                    <LoadingDots />
                  </div>
                )}

                {step === 'forgot-password' && (
                  <>
                    <Text>
                      Enter your email below for receiving a link to reset your password. The email might take a few minutes to arrive.
                    </Text>
                    <div className={s.fieldGroup}>
                      <Label for="fp-email" showColon>Email</Label>
                      <Input
                        id="fp-email"
                        value={forgotEmail}
                        placeholder="Your Email"
                        className={s.fieldFull}
                        onInput={(e) => setForgotEmail((e.target as unknown as HTMLInputElement).value)}
                      />
                    </div>
                  </>
                )}

                {step === 'sign-in-assistance' && (
                  <div className={s.fieldGroup}>
                    <Label for="assistance-issue" showColon>What do you need help with?</Label>
                    <Select
                      id="assistance-issue"
                      className={s.fieldFull}
                      onChange={(e) => setAssistanceIssue((e.detail.selectedOption as HTMLElement).textContent?.trim() ?? '')}
                    >
                      {ASSISTANCE_OPTIONS.map(opt => (
                        <Option key={opt} selected={opt === assistanceIssue}>{opt}</Option>
                      ))}
                    </Select>
                  </div>
                )}

                {step === 'locked-out' && (
                  <Text>
                    Contact your <strong>IT administrator</strong> or <strong>support team</strong> if you don't remember your username.
                  </Text>
                )}

                {step === 'reset-sent' && (
                  <div className={s.resetSentBody}>
                    <Text>
                      Password reset instructions have been sent if the email matches our records:
                    </Text>
                    <p className={s.resetEmail}>{resetSentTo}</p>
                    <Text>
                      Check your inbox and follow the instructions to reset your password. If you don't see the email, please check your spam folder.
                    </Text>
                  </div>
                )}

                {step === 'signed-out' && (
                  <IllustratedMessage
                    name="SignOut"
                    design="Scene"
                    titleText=""
                    subtitleText=""
                    className="signed-out-illustration"
                    style={{ width: '100%' }}
                  />
                )}
              </div>

              {/* Action buttons */}
              <div className={s.formActions}>
                {step === 'credentials' && (
                  <>
                    <Button design={ssoWorkspaceName && showSso ? 'Default' : 'Emphasized'} disabled={!email.trim() || !password.trim()} onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <hr className={s.divider} />
                    <span className={s.registerPrompt}>
                      Don't have an account? <a href="#" className={s.link} onClick={(e) => { e.preventDefault(); onRegister?.() }}>Register</a>
                    </span>
                  </>
                )}
                {step === 'sign-in-assistance' && (
                  <>
                    <Button design="Transparent" onClick={() => setStep('credentials')}>
                      Back to Sign In
                    </Button>
                    <Button design="Emphasized" onClick={handleAssistanceSubmit}>
                      Submit
                    </Button>
                  </>
                )}
                {step === 'locked-out' && (
                  <Button design="Emphasized" onClick={() => setStep('credentials')}>
                    Back to Sign In
                  </Button>
                )}
                {step === 'forgot-password' && (
                  <>
                    <Button design="Transparent" onClick={() => setStep('credentials')}>
                      Back to Sign In
                    </Button>
                    <Button design="Emphasized" disabled={!forgotEmail.trim()} onClick={handleForgotPasswordSubmit}>
                      Submit
                    </Button>
                  </>
                )}
                {step === 'reset-sent' && (
                  <Button design="Emphasized" onClick={() => setStep('credentials')}>
                    Back to Sign In
                  </Button>
                )}
                {step === 'signed-out' && (
                  <Button design="Emphasized" onClick={() => setStep('credentials')}>
                    Sign Back In
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className={s.skipLogin}>
            <a
              href="#"
              className={s.skipLoginLink}
              onClick={(e) => { e.preventDefault(); auth.login(); auth.selectWorkspace() }}
            >
              Skip Sign In
            </a>
          </div>
          <LoginFooter />
        </div>

        {/* Right: branding image */}
        <div className={s.brandingPanel}>
          <div className={s.brandingImageWrapper}>
            <img src={loginBg} alt="" className={s.brandingImage} />
          </div>
        </div>
      </div>
    </div>
  )
}
