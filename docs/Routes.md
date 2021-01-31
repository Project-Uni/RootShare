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

- [ /auth/confirmation/:token ] Confirms user's email address

- [ /auth/unsubscribe/:token ] Unsubscribe from our emails

- [ /auth/confirmation-resend ] Resend confirmation email

- [ /auth/secure-unconfirmed ] Route with access to logged in Users with unconfirmed emails

- [ /auth/logout] Logs out cookie'd User

- [ /api/user/getCurrent ] Returns current cookie'd User

- [ /api/adminCount ] Retrieves information about our database for admins

- [ /api/messaging/sendMessage ] Send a Message to a Conversation

- [ /api/messaging/createThread ] Create a new Conversation

- [ /api/messaging/getLatestThreads ] Retrieve a User's latest Conversations in order

- [ /api/messaging/getLatestMessages ] Retrieve a User's latest Messages in order
