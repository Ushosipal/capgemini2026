# PHPTRAVELS Test Plan

URL: https://phptravels.net/

## Scope

Test the following workflows:

- Signup
- Login
- Flight search and booking

Explicitly excluded:

- Stays
- Visa

The site is a responsive travel-booking interface with a header, hamburger navigation, hero section, service tabs, flight search form, app promotion, and footer. The environment displays a demo warning, uses simulated prices, and supports sandbox-only payments.

## Functional Requirements

### Signup

- Open Signup from the navigation or Login page.
- Submit First Name, Last Name, Email Address, Password, Confirm Password, arithmetic security check, and Terms and Privacy Policy consent.
- Display password strength feedback.
- Create an account with valid data.
- Reject duplicate or invalid account data.
- Navigate to Login after registration.

### Login

- Open Login from the navigation or Signup page.
- Submit Email Address and Password.
- Support password visibility control and Remember Me.
- Authenticate valid credentials.
- Display an appropriate error for invalid credentials.
- Provide Forgot Password and Signup links.

### Flight Booking

The Flights tab contains:

- One Way
- Round Trip
- Multi-City
- Cabin class selector, defaulting to Economy
- Departure city or airport
- Arrival city or airport
- Departure date
- Passenger selector
- Search Flights button

The booking flow should support entering flight criteria, searching, selecting an itinerary, entering passenger information, reviewing details, completing sandbox payment or booking confirmation, and displaying a confirmation or booking reference.

## Positive Scenarios

| ID | Scenario | Expected Result |
|---|---|---|
| SG-01 | Register with valid unique details and security answer `7` | Account is created successfully |
| SG-02 | Register with a six-character password | Registration is accepted when other rules pass |
| SG-03 | Toggle password visibility during Signup | Password visibility changes without altering the value |
| SG-04 | Open Terms of Service and Privacy Policy | Correct policy pages open |
| LG-01 | Login with valid registered credentials | User is authenticated |
| LG-02 | Enable Remember Me and log in | Session persistence follows the product design |
| LG-03 | Toggle password visibility during Login | Password visibility changes correctly |
| LG-04 | Open Forgot Password | Password recovery page is displayed |
| FL-01 | Search a valid One Way flight | Matching flight results are displayed |
| FL-02 | Search a valid Round Trip flight | Outbound and return options are displayed |
| FL-03 | Select valid airport or city autocomplete values | Locations are accepted |
| FL-04 | Change cabin class from Economy | Selected class is reflected in the search |
| FL-05 | Change passenger quantities | Passenger summary updates correctly |
| FL-06 | Select a flight and continue booking | Passenger details page is displayed |
| FL-07 | Complete booking with valid sandbox data | Confirmation and booking reference are displayed |
| FL-08 | Start booking while unauthenticated | Guest booking or Login redirect occurs consistently |

## Negative Scenarios

### Signup

- Submit with required fields empty.
- Use an invalid email address.
- Use an already registered email address.
- Use a password shorter than six characters.
- Enter mismatched passwords.
- Enter an incorrect arithmetic answer.
- Leave Terms and Privacy Policy unchecked.
- Enter unsupported characters or excessive input lengths.
- Submit multiple times rapidly.

### Login

- Submit empty email and password.
- Use an invalid email format.
- Use an incorrect password.
- Use an unregistered email address.
- Enter leading or trailing spaces.
- Attempt script or SQL-like input.
- Use a locked, disabled, or expired account if supported.
- Refresh or navigate backward during authentication.

### Flight Booking

- Search with missing departure or arrival location.
- Use the same departure and arrival location.
- Search without a date.
- Select a past departure date.
- Select a return date before departure.
- Search with zero or excessive passengers.
- Continue after a flight becomes unavailable.
- Submit incomplete passenger details.
- Use invalid passenger or document data.
- Submit invalid or incomplete sandbox payment details.
- Refresh during payment or confirmation.

## Boundary Scenarios

- Password lengths of 5, 6, and the maximum supported length.
- Minimum and maximum passenger count.
- One passenger versus maximum capacity.
- Departure date equal to today and one day in the future.
- Return date equal to departure date and one day before departure.
- Long city or airport search strings.
- City names containing spaces, hyphens, or accented characters.
- Maximum supported name and email lengths.
- Mobile viewport with hamburger navigation.
- Desktop viewport with aligned navigation and flight controls.
- Browser back, forward, reload, and duplicate submission behavior.

## Validation Scenarios

- Required-field messages are visible and associated with the correct controls.
- Password and confirmation validation is clear.
- Password input is masked by default.
- Security-check answer is validated correctly.
- Terms consent is required before account creation.
- Flight controls prevent invalid date combinations.
- Passenger summary matches selected quantities.
- Search values are retained after validation errors.
- Errors do not expose credentials or internal details.
- Success messages and booking references are visible.
- Prices and payment messaging identify the demo or sandbox environment.

## Integration Scenarios

- Signup-created credentials work in Login.
- Login state is preserved when entering Flight Booking.
- Results reflect route, dates, cabin class, and passenger selections.
- Selected flight details remain correct through passenger and review screens.
- Confirmation is associated with the correct user and itinerary.
- Failed payment does not create a confirmed booking.
- Session expiry is handled without corrupting booking data.
- Refreshing confirmation does not create duplicate bookings.

## Security Scenarios

- Passwords are masked by default.
- Credentials are transmitted over HTTPS.
- Login errors do not reveal whether an email exists.
- Signup and Login resist basic injection and script payloads.
- Session cookies use appropriate security attributes.
- Logged-out users cannot access authenticated booking pages.
- Users cannot access another user's booking by modifying an identifier.
- Duplicate booking submission is prevented.
- Real card data is never used in this sandbox environment.

## Missing Requirements

Clarify before final automation:

- Whether flight booking requires authentication.
- Required passenger fields and travel-document rules.
- Supported airports, airlines, routes, and currencies.
- Maximum passenger limits and age categories.
- Whether same-day and same-day-return flights are allowed.
- Expected behavior when no flights are available.
- Approved sandbox payment credentials.
- Booking cancellation, refund, and modification behavior.
- Session timeout and Remember Me duration.
- Exact error-message text and accessibility requirements.
- Whether Multi-City must be included in the first automation release.

## Risks

- Flight inventory and prices may change because data may come from simulated or external supplier sources.
- Demo data may be reset periodically.
- Login page inspection showed aborted JavaScript requests, so client-side behavior may be environment-dependent.
- The demo-warning modal blocks controls until dismissed.
- Automated tests may create persistent accounts or bookings without cleanup.
- Payment validation cannot represent production payment validation.
- Third-party APIs may produce intermittent failures or empty results.

## Automation Candidates

High priority:

- Signup required-field and validation tests.
- Successful Signup with a generated unique email.
- Login success and invalid-credential tests.
- Password visibility and Remember Me behavior.
- One Way and Round Trip flight searches.
- Date and passenger validation.
- Search-result route and date verification.
- Booking continuation and confirmation with approved sandbox data.
- Responsive desktop and mobile navigation checks.

## Smoke Suite

1. Open the home page and dismiss the demo warning.
2. Open Signup and create a test account.
3. Log in with the new account.
4. Select Flights.
5. Search a valid One Way itinerary.
6. Select a result and complete the available sandbox booking flow.
7. Verify confirmation details and booking reference.
8. Clean up test data where the environment permits.
