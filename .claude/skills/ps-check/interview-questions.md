# Interview Questions for Product Standards Assessment

This guide helps you ask targeted questions based on what's visible in the design/website and what additional context is needed.

## Question Selection Logic

**Only ask questions for:**
1. Requirements that ARE potentially applicable based on visible elements
2. Context that CANNOT be determined from the design/website alone
3. User Assistance requirements (usually need interview)

**Do NOT ask about:**
- Requirements clearly not applicable (e.g., no video = skip video control questions)
- Things already visible and verifiable in the design
- Implementation details when checking a live website (can be inspected)

---

## Core Context Questions (Ask First)

### 1. Target Audience & Scope
**When to ask:** Always at the start

```
What is this design for?
- Full application/website
- Specific feature or component
- Design system component
- Prototype/concept
```

**Why:** Determines applicable standards (e.g., components skip navigation requirements)

### 2. Implementation Stage
**When to ask:** For Figma designs only

```
What stage is this design in?
- Early concept/wireframe
- High-fidelity design ready for development
- Already implemented (provide URL for deeper check)
```

**Why:** Sets expectations for what can be verified

---

## UX Consistency Questions

### Typography & Fonts
**When to ask:** Text is visible

```
Are you using SAP-approved typefaces?
- SAP 72 (primary)
- SAP 72 Mono (code/monospace)
- Other SAP-approved fonts
- Custom/non-SAP fonts
- Not sure
```

### Color Theming
**When to ask:** Always for UXC checks

```
How are colors defined in your implementation?
- Using SAP theming variables/tokens
- Hardcoded color values
- Mix of both
- Not yet implemented (design stage)
```

### SAP Fiori Components
**When to ask:** Standard UI elements are visible

```
Which component library are you using?
- @ui5/webcomponents-react
- UI5 Web Components
- SAP Fiori Elements
- Custom components
- Not sure/not implemented yet
```

---

## User Assistance Questions

### Documentation Planning (UA-010, UA-030)
**When to ask:** Always for UA checks (Corporate requirement)

```
Is user documentation planned/available for this feature?
- Yes, documentation exists
- Yes, documentation is planned
- No documentation planned
- Not applicable (internal tool/prototype)
```

```
What languages will documentation be provided in?
- English only
- English + German (in-house)
- Multiple languages via LX Lab
- Not yet determined
```

### Help Infrastructure (UA-040)
**When to ask:** For full applications

```
How will users access help?
- F1 key context-sensitive help
- Help button/menu
- SAP Help Portal links
- In-app tooltips/guidance
- Not yet implemented
```

### Terminology (UA-050)
**When to ask:** Content/labels are visible

```
Is there a product-specific terminology guide?
- Yes, following established terminology
- Using SAP standard terminology
- Custom terminology (not yet standardized)
- Not sure
```

### UI Text & Embedded Help (UA-060)
**When to ask:** Interactive elements present

```
Are tooltips/labels defined for all interactive elements?
- Yes, all defined
- Partially defined
- Will be added during implementation
```

---

## Accessibility Questions

### Accessibility Testing (ACC-252)
**When to ask:** Always for ACC checks (Corporate requirement)

```
Has accessibility testing been performed?
- Yes, ASD (Accessibility Status Document) exists
- Testing planned
- Not yet tested
```

### Color Information (ACC-256)
**When to ask:** Color is used to convey information (status, categories, etc.)

```
For color-coded information, are additional indicators provided?
- Yes (icons, labels, patterns)
- Partially
- Not yet implemented
- Not applicable (no color-only information)
```

### Alt Text for Images (ACC-255)
**When to ask:** Images/icons present in Figma

```
Have alt text descriptions been defined for meaningful images/icons?
- Yes, documented in design
- Will be added during implementation
- Not yet defined
```

### Form Validation (ACC-274, ACC-275)
**When to ask:** Forms/inputs are present

```
How are form errors handled?
- Inline validation with clear messages
- Error summary at top
- Not yet defined
```

```
Are there confirmation dialogs for destructive actions?
- Yes, for all critical actions
- For some actions
- Not yet implemented
```

### Keyboard Navigation (ACC-270, ACC-271, ACC-272)
**When to ask:** For Figma designs with interactive elements

```
Has keyboard navigation been considered?
- Yes, tab order defined
- Will be implemented per standard
- Not yet considered
```

### Responsive Design (ACC-281, ACC-282)
**When to ask:** Not obvious from single design view

```
Does the design support multiple screen sizes?
- Yes, responsive breakpoints defined
- Mobile-first design
- Desktop only
- Not yet considered
```

### Media & Animation (ACC-279, ACC-280)
**When to ask:** Video, audio, or animations present

```
For auto-playing content, are pause/stop controls provided?
- Yes, controls visible
- Will be added in implementation
- No auto-playing content
```

### Timing & Timeouts (ACC-278)
**When to ask:** Time-sensitive interactions visible

```
Are there session timeouts or time limits?
- Yes, with warnings and extension options
- Yes, but no extension mechanism yet
- No time limits
```

---

## Implementation-Specific Questions (Website URL Only)

### Semantic HTML (ACC-263, ACC-266)
**Ask if:** Checking a live website

```
Playwright will inspect the HTML structure automatically. No question needed.
```

### ARIA Attributes (ACC-264)
**Ask if:** Checking a live website

```
Playwright will check ARIA labels automatically. No question needed.
```

### Language Tags (ACC-265)
**Ask if:** Checking a live website

```
Playwright will verify lang attributes. No question needed.
```

---

## Question Formatting with AskUserQuestion

**Use AskUserQuestion for:**
- Binary choices (Yes/No)
- Multiple choice options
- Categorical selections

**Use open text follow-up only for:**
- Complex explanations needed
- Additional details required
- Specific URLs or file paths

**Example structure:**

```javascript
AskUserQuestion({
  questions: [{
    question: "Is user documentation planned for this feature?",
    header: "Documentation",
    multiSelect: false,
    options: [
      { label: "Yes, exists", description: "Documentation is already available" },
      { label: "Yes, planned", description: "Documentation will be created" },
      { label: "No", description: "No documentation planned" },
      { label: "N/A", description: "Not applicable for this feature" }
    ]
  }]
})
```

---

## Interview Flow

1. **Start with scope questions** (1-2 questions)
2. **Ask category-specific questions** based on selected standards (3-5 questions)
3. **Ask implementation questions** for Figma designs (2-3 questions)
4. **Skip** questions for clearly N/A requirements
5. **Total target:** 5-10 questions maximum

---

## Notes for N/A Determination

Mark requirements as N/A when:
- No relevant UI elements present (e.g., no forms = skip form validation)
- Component-level design (skip navigation, shell bar)
- Prototype stage (skip implementation requirements)
- Content type doesn't apply (e.g., no media = skip media controls)

Always document the N/A reasoning in the report.
