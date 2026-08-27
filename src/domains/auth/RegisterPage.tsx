import { useState } from 'react'
import { Button, CheckBox, Icon, Input, Label, Option, Select, Text } from '@ui5/webcomponents-react'
import SapSignavioBrand from './SapSignavioBrand'
import loginBg from '../../assets/LoginBackground.jpg'
import s from './RegisterPage.module.css'

interface RegisterPageProps {
  onBackToLogin: () => void
}

const SALUTATIONS = ['Mr.', 'Ms.', 'Dr.', 'Prof.']
const LANGUAGES = ['English', 'German', 'French', 'Spanish', 'Portuguese', 'Italian', 'Dutch', 'Japanese', 'Chinese']
const COUNTRIES = [
  'United States', 'Germany', 'United Kingdom', 'France', 'Spain', 'Italy',
  'Netherlands', 'Japan', 'China', 'India', 'Brazil', 'Australia', 'Canada',
]

interface PasswordRuleProps {
  met: boolean
  label: string
}

function PasswordRule({ met, label }: PasswordRuleProps) {
  return (
    <div className={s.passwordRule}>
      <Icon
        name={met ? 'sys-enter-2' : 'sys-minus'}
        className={met ? s.ruleIconMet : s.ruleIconUnmet}
      />
      <Text className={met ? s.ruleLabelMet : s.ruleLabelUnmet}>{label}</Text>
    </div>
  )
}

export default function RegisterPage({ onBackToLogin }: RegisterPageProps) {
  const [_salutation, setSalutation] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('English')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [_country, setCountry] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const rules = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@#$%*!&^()_\-+=[\]{}|;:'",.<>?/`~\\]/.test(password),
  }

  const allRulesMet = Object.values(rules).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && allRulesMet && passwordsMatch && termsAccepted

  return (
    <div className={s.page}>
      <div className={s.body}>
        <div className={s.formPanel}>
          <div className={s.formPanelInner}>
            <div className={s.branding}>
              <SapSignavioBrand height={32} />
            </div>

            <div className={s.formArea}>
              <h1 className={s.cardTitle}>Sign up for your 30-day free evaluation account.</h1>
              <p className={s.subtitle}>
                Already registered? Then please directly{' '}
                <a href="#" className={s.link} onClick={(e) => { e.preventDefault(); onBackToLogin() }}>
                  sign in
                </a>.
              </p>

              {/* Personal section */}
              <div className={`${s.section} ${s.sectionFirst}`}>
                <h2 className={s.sectionTitle}>Personal</h2>
                <div className={s.grid3}>
                  <div className={s.fieldGroup}>
                    <Label for="reg-salutation" showColon required>Salutation</Label>
                    <Select
                      id="reg-salutation"
                      required
                      className={s.fieldFull}
                      onChange={(e) => setSalutation((e.detail.selectedOption as HTMLElement).textContent?.trim() ?? '')}
                    >
                      <Option value=""></Option>
                      {SALUTATIONS.map(sal => <Option key={sal} value={sal}>{sal}</Option>)}
                    </Select>
                  </div>
                  <div className={s.fieldGroup}>
                    <Label for="reg-firstname" showColon required>First Name</Label>
                    <Input
                      id="reg-firstname"
                      required
                      value={firstName}
                      className={s.fieldFull}
                      onInput={(e) => setFirstName((e.target as unknown as HTMLInputElement).value)}
                    />
                  </div>
                  <div className={s.fieldGroup}>
                    <Label for="reg-lastname" showColon required>Last Name</Label>
                    <Input
                      id="reg-lastname"
                      required
                      value={lastName}
                      className={s.fieldFull}
                      onInput={(e) => setLastName((e.target as unknown as HTMLInputElement).value)}
                    />
                  </div>
                </div>
                <div className={s.fieldGroup}>
                  <Label for="reg-email" showColon required>Email</Label>
                  <Input
                    id="reg-email"
                    required
                    value={email}
                    className={s.fieldFull}
                    onInput={(e) => setEmail((e.target as unknown as HTMLInputElement).value)}
                  />
                </div>
                <div className={s.fieldGroup}>
                  <Label for="reg-language" showColon>Language</Label>
                  <Select
                    id="reg-language"
                    className={s.fieldFull}
                    onChange={(e) => setLanguage((e.detail.selectedOption as HTMLElement).textContent?.trim() ?? '')}
                  >
                    {LANGUAGES.map(l => <Option key={l} value={l} selected={l === language}>{l}</Option>)}
                  </Select>
                </div>
              </div>

              {/* Password section */}
              <hr className={s.sectionSeparator} />
              <div className={s.section}>
                <h2 className={s.sectionTitle}>Password</h2>
                <div className={s.grid2}>
                  <div className={s.fieldGroup}>
                    <Label for="reg-password" showColon required>Password</Label>
                    <Input
                      id="reg-password"
                      type="Password"
                      required
                      value={password}
                      className={s.fieldFull}
                      onInput={(e) => setPassword((e.target as unknown as HTMLInputElement).value)}
                    />
                  </div>
                  <div className={s.fieldGroup}>
                    <Label for="reg-confirm" showColon required>Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="Password"
                      required
                      value={confirmPassword}
                      valueState={confirmPassword.length > 0 && !passwordsMatch ? 'Negative' : 'None'}
                      className={s.fieldFull}
                      onInput={(e) => setConfirmPassword((e.target as unknown as HTMLInputElement).value)}
                    />
                  </div>
                </div>
                <div className={s.passwordRules}>
                  <Text className={s.rulesTitle}>Password Requirements:</Text>
                  <PasswordRule met={rules.length} label="8 characters" />
                  <PasswordRule met={rules.lowercase} label="a lowercase letter" />
                  <PasswordRule met={rules.uppercase} label="an uppercase letter" />
                  <PasswordRule met={rules.number} label="one number, no parts of your username" />
                  <PasswordRule met={rules.special} label="one special character (@, #, $, % * etc.)" />
                </div>
              </div>

              {/* Company section */}
              <hr className={s.sectionSeparator} />
              <div className={s.section}>
                <h2 className={s.sectionTitle}>Company</h2>
                <div className={s.fieldGroup}>
                  <Label for="reg-company" showColon required>Company</Label>
                  <Input
                    id="reg-company"
                    required
                    value={company}
                    className={s.fieldFull}
                    onInput={(e) => setCompany((e.target as unknown as HTMLInputElement).value)}
                  />
                </div>
                <div className={s.fieldGroup}>
                  <Label for="reg-phone" showColon required>Phone</Label>
                  <Input
                    id="reg-phone"
                    required
                    value={phone}
                    className={s.fieldFull}
                    onInput={(e) => setPhone((e.target as unknown as HTMLInputElement).value)}
                  />
                </div>
                <div className={s.fieldGroup}>
                  <Label for="reg-country" showColon required>Country/Region</Label>
                  <Select
                    id="reg-country"
                    required
                    className={s.fieldFull}
                    onChange={(e) => setCountry((e.detail.selectedOption as HTMLElement).textContent?.trim() ?? '')}
                  >
                    <Option value=""></Option>
                    {COUNTRIES.map(c => <Option key={c} value={c}>{c}</Option>)}
                  </Select>
                </div>
              </div>

              {/* Legal */}
              <div className={s.legal}>
                <Text className={s.legalText}>
                  SAP will use the data provided hereunder in accordance with the{' '}
                  <a href="#" className={s.link}>Privacy Statement</a>.
                </Text>
                <div className={s.termsRow}>
                  <CheckBox
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(v => !v)}
                    style={{ marginLeft: '-0.5rem', flexShrink: 0 }}
                    text=""
                  />
                  <Text className={s.termsText}>
                    I have read the <a href="#" className={s.link}>terms and conditions</a> and hereby confirm that it will govern my use of this SAP Signavio software.
                  </Text>
                </div>
              </div>

              <div className={s.formActions}>
                <Button design="Emphasized" disabled={!canSubmit}>
                  Start Your 30-Day Free Trial
                </Button>
              </div>
            </div>
          </div>
          <footer className={s.pageFooter}>
            <a href="#" className={s.footerLink}>Privacy</a>
            <a href="#" className={s.footerLink}>Terms of use</a>
            <a href="#" className={s.footerLink}>Copyright</a>
            <a href="#" className={s.footerLink}>Cookie policy</a>
            <a href="#" className={s.footerLink}>Help</a>
          </footer>
        </div>

        <div className={s.brandingPanel}>
          <div className={s.brandingImageWrapper}>
            <img src={loginBg} alt="" className={s.brandingImage} />
          </div>
        </div>
      </div>
    </div>
  )
}
