# Marquei

Auth:

(POST) -  /auth/login
(POST) -  /auth/logout
(POST) -  /auth/sign-up
(POST) -  /auth/refresh
(GET) -   /auth/me
(PATCH) - /auth/me

Users:

(POST) -  /users
(GET) -   /users
(GET) -   /users/id/:id
(GET) -   /users/cpf/:cpf
(GET) -   /users/email/:email
(PATCH) - /users

Professionals:

// Schedule 

(POST) -  /professionals/:professionalId/schedule
(GET) -   /professionals/:professionalId/schedule
(PUT) -   /professionals/:professionalId/schedule

// Service

(POST) -  /professionals/:professionalId/services/
(GET) -   /professionals/:professionalId/services/
(DELETE) -   /professionals/:professionalId/services/:serviceId/

Appointments:
