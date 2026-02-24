# Lovable app hardening checklist (SwitchHands)

Use this checklist after exporting your Lovable project into this repository.

## 1) Reliability and error handling

- Add guarded loading, empty, and error states for every async view.
- Ensure API failures are user-readable with retry actions.
- Add request timeouts and cancellation for route transitions.
- Validate form inputs client-side and server-side.

## 2) Access and compatibility

- Validate keyboard-only navigation for all interactive controls.
- Ensure WCAG color contrast and visible focus indicators.
- Add semantic labels (`aria-label`, `<label>`, landmarks).
- Verify responsive behavior at mobile, tablet, desktop breakpoints.
- Test on Chrome, Safari, and Firefox.

## 3) Auth/session robustness

- Handle expired sessions without broken screens.
- Ensure protected routes redirect correctly.
- Prevent infinite refresh/token loops.

## 4) Performance baseline

- Defer non-critical scripts and media.
- Compress images and enable lazy loading.
- Avoid layout shifts by reserving media dimensions.

## 5) Production checks

- Enforce HTTPS and HSTS.
- Add CSP and strict MIME sniffing headers.
- Monitor 4xx/5xx rates and client-side JS errors.

## 6) Release gate

- Block release if any P0 issue affects login, onboarding, checkout, or critical workflows.
- Require smoke tests to pass in CI before deploy.
