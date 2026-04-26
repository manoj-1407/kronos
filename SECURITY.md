# Security Policy

## Supported versions

Kronos is currently maintained on the `main` branch. Security fixes are shipped there first.

## Reporting a vulnerability

Please report security issues privately:

- Open a private security advisory on GitHub, or
- Email the maintainer if contact details are published on the repository profile.

Do not disclose vulnerabilities publicly until a fix is available.

## What to include in your report

- A clear description of the issue
- Reproduction steps or proof of concept
- Impact assessment
- Suggested remediation (optional)

## Response targets

- Initial acknowledgement: within 72 hours
- Triage and impact classification: within 7 days
- Fix timeline: depends on severity and complexity, communicated during triage

## Hardening expectations for contributors

- Avoid introducing insecure defaults.
- Validate external input strictly.
- Keep dependencies updated through normal package manager workflows.
- Use environment variables for secrets and sensitive runtime configuration.
