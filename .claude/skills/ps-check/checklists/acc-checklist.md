# Accessibility Checklist

Quick reference checklist for evaluating Accessibility in Figma designs.

## Visual Accessibility

### Color Contrast
- [ ] Normal text (< 18pt): 4.5:1 contrast ratio minimum (WCAG AA)
- [ ] Large text (≥ 18pt or 14pt bold): 3:1 contrast ratio minimum
- [ ] UI components: 3:1 contrast ratio minimum
- [ ] Focus indicators: 3:1 contrast ratio against background
- [ ] No color-only information (use icons, patterns, text)

### Text Readability
- [ ] Minimum text size: 12px (prefer 14px+)
- [ ] Line height: 1.5 minimum for body text
- [ ] Line length: 80 characters maximum
- [ ] Text is not justified
- [ ] Adequate spacing between paragraphs

### Visual Clarity
- [ ] Focus indicators clearly visible
- [ ] Active/selected states clearly distinguishable
- [ ] Disabled states clearly indicated
- [ ] Loading states visible
- [ ] No flashing content (seizure risk)

## Keyboard Accessibility

- [ ] Logical tab order through interactive elements
- [ ] Focus indicators on all interactive elements
- [ ] No keyboard traps
- [ ] Skip navigation available (if applicable)
- [ ] All actions available via keyboard
- [ ] Keyboard shortcuts documented

## Screen Reader Support

### Labels & Names
- [ ] All buttons have accessible names
- [ ] All form inputs have associated labels
- [ ] Icons have text alternatives/aria-labels
- [ ] Images have alt text descriptions
- [ ] Link text is descriptive (not "click here")

### Semantic Structure
- [ ] Proper heading hierarchy (H1, H2, H3...)
- [ ] Lists used for list content
- [ ] Tables used for tabular data
- [ ] Landmarks indicated (navigation, main, complementary)
- [ ] Form fields grouped logically

### ARIA Attributes
- [ ] ARIA labels on complex widgets
- [ ] ARIA live regions for dynamic content
- [ ] ARIA expanded states on accordions/dropdowns
- [ ] ARIA roles for custom components
- [ ] ARIA described-by for additional context

## Interactive Elements

### Touch Targets
- [ ] Minimum size: 44x44 pixels (iOS) or 48x48 pixels (Material)
- [ ] Adequate spacing between targets
- [ ] Touch targets don't overlap
- [ ] Larger targets for primary actions

### Forms
- [ ] Labels always visible (not placeholder-only)
- [ ] Error messages associated with fields
- [ ] Required fields clearly marked
- [ ] Field validation feedback accessible
- [ ] Autocomplete attributes specified

## Content Structure

- [ ] Headings describe content structure
- [ ] Content can be read in linear order
- [ ] Tables have proper headers
- [ ] Lists are semantically marked
- [ ] Language specified

## Interactive Patterns

- [ ] Modals have focus trap
- [ ] Modal can be closed with Escape key
- [ ] Tooltips accessible via keyboard
- [ ] Dropdowns keyboard navigable
- [ ] Carousels have accessible controls

## Motion & Animation

- [ ] Animations can be disabled (respect prefers-reduced-motion)
- [ ] Auto-playing content can be paused
- [ ] Timeouts can be extended
- [ ] No content flashing more than 3 times per second

## Mobile Accessibility

- [ ] Portrait and landscape orientations supported
- [ ] Pinch-to-zoom not disabled
- [ ] Orientation-specific instructions avoided
- [ ] Touch gestures have alternatives

---

## WCAG Compliance Levels

- **Level A**: Must satisfy (basic accessibility)
- **Level AA**: Should satisfy (industry standard)
- **Level AAA**: May satisfy (enhanced accessibility)

**SAP Target**: Typically WCAG 2.1 Level AA compliance

---

**Note**: This is a general checklist. Update with specific requirements from `./standards/accessibility.md` once populated.
