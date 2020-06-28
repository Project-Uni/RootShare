FRONTEND ROUTES

- [ / ] Description about the Aug 14 event
- [ /profile/initialize ] Collects additional info about the Profile from hype register
- [ /profile/externalRegister ] Collect Student type and University from external register

- [ /event/:eventid ] Event video streaming page

- [ /admin/count ] Shows basic info about current registrations

BACKEND ROUTES

- [ /auth/login/linkedin ] Authenticates using LinkedIn Strategy

- [ /auth/callback/linkedin ] Callback for LinkedIn to send Auth information to

- [ /auth/login/local ] Authenticates using local strategy

- [ /auth/signup/local ] Register using local strategy

- [ /auth/signup/user-exists ] Check if User (email) exists in our system

- [ /auth/complete-registration/required ] Adds required information to User's account

- [ /auth/complete-registration/details ] Adds optional details to User's account

- [ /auth/curr-user/load ] Returns User information from current cookie'd User

- [ /confirmation/:token ] Confirms user's email address

- [ /unsubscribe/:token ] Unsubscribe from our emails

- [ /confirmation-resend ] Resend confirmation email

- [ /secure-unconfirmed ] Route with access to logged in Users with unconfirmed emails

- [ /secure-confirmed ] Route with access to logged in Users with confirmed emails

- [ /user/getCurrent ] Returns current cookie'd User

- [ /api/adminCount ] Retrieves information about our database for admins

- [ /x/x ] Information about x path

- [ /x/x ] Information about x path

- [ /x/x ] Information about x path

- [ /x/x ] Information about x path

- [ /x/x ] Information about x path
