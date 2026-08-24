# Visual Inspection Checklist for Product Standards

Quick reference for visual checks when analyzing designs and websites.

## UX Consistency Visual Checks

### Colors (UXC-010)
- [ ] Using SAP color palette (blues, grays, semantic colors)
- [ ] No random/off-brand colors
- [ ] Consistent color application

### Typography (UXC-012)
- [ ] SAP 72 font family (or system fallback)
- [ ] Consistent font sizes and weights
- [ ] Proper hierarchy (headings, body, labels)

### Icons (UXC-013, UXC-019)
- [ ] SAP Icons or TNT Icons used
- [ ] Consistent icon style
- [ ] Icons match their semantic meaning
- [ ] Appropriate size (16px, 20px, 24px standard)

### Spacing (UXC-030)
- [ ] 8px grid system evident
- [ ] Consistent margins and padding
- [ ] Proper white space

### Buttons (UXC-014, UXC-022)
- [ ] Primary actions right-aligned
- [ ] Secondary actions left-aligned
- [ ] Standard button styles (Default, Emphasized, Ghost, Transparent)

## Accessibility Visual Checks

### Contrast (ACC-261)
- [ ] Text vs background: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] UI elements: 3:1 minimum
- [ ] Icons: 3:1 minimum

**How to check:**
- Use browser dev tools color picker
- Online contrast checkers (WebAIM, Coolors)

### Labels & Headings (ACC-253, ACC-254)
- [ ] All inputs have visible labels
- [ ] Required fields indicated
- [ ] Clear page title visible
- [ ] Logical heading hierarchy (H1 > H2 > H3)

### Color Information (ACC-256)
- [ ] Status indicators use more than just color (icons, labels, patterns)
- [ ] Error states have text + icon (not just red)
- [ ] Charts use patterns or labels in addition to color

### Focus Indicators (ACC-271)
- [ ] Visible focus styles for all interactive elements
- [ ] Focus ring has 3:1 contrast against adjacent colors
- [ ] Focus not hidden by CSS

### Touch Targets (ACC-287)
- [ ] Interactive elements minimum 24px diameter
- [ ] Adequate spacing between tap targets (8px minimum)
- [ ] No tiny click areas

### Link Text (ACC-257)
- [ ] Descriptive link text (not "click here", "read more")
- [ ] Link purpose clear from text alone

## Screenshots to Capture

### For Violations

Capture screenshots when you find:
1. **Contrast issues**: Text/background that looks low contrast
2. **Missing labels**: Unlabeled form fields
3. **Color-only information**: Status without icons/text
4. **Tiny targets**: Buttons or links smaller than 24px
5. **Inconsistent patterns**: Different button styles for same action
6. **Layout issues**: Clipped text, overflow problems

### Screenshot Naming

Save as: `{requirement-id}_{issue-type}_{timestamp}.png`

Example: `ACC-261_contrast_issue_20260315.png`

## Quick Checks by Context

### Has Forms/Inputs?
Check: ACC-253 (labels), ACC-274 (error prevention), ACC-275 (error messages)

### Has Navigation?
Check: UXC-016 (shell bar), UXC-026 (side nav), ACC-267 (consistency), ACC-268 (multiple ways)

### Has Images/Icons?
Check: UXC-013 (icon library), UXC-019 (semantics), ACC-255 (alt text)

### Has Tables/Data?
Check: ACC-263 (table markup), UXC-029 (metrics display)

### Has Color-Coded Info?
Check: ACC-256 (two-sensory), ACC-261 (contrast)

### Has Media/Animation?
Check: ACC-279 (media controls), ACC-280 (no flashing)
