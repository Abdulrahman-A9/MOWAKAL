# كيانات الواجهة

هذه قائمة بالكيانات التي تستخدمها الواجهة فقط، وهي أساس أولي لتصميم عقود API وقاعدة البيانات لاحقًا. لا تتضمن SQL أو تنفيذًا خلفيًا.

## User
- id
- name
- email
- role
- status
- registeredAt

## Client
- id
- name
- email
- phone
- city
- status
- requests
- cases

## Lawyer
- id
- name
- specialty
- city
- license
- experience
- rating
- reviews
- verified
- services

## LegalService
- id
- name
- category
- description
- type
- icon
- active
- createdAt

## ServiceRequest
- id
- clientId
- lawyerId
- serviceId
- title
- description
- status
- urgency
- city
- createdAt
- updatedAt
- documentIds
- appointmentId
- paymentId
- timeline

## Consultation
- id
- requestId
- clientId
- lawyerId
- subject
- date
- time
- method
- status

## Case
- id
- clientId
- lawyerId
- requestId
- title
- type
- status
- stage
- nextEvent
- updatedAt
- notes

## Appointment
- id
- requestId
- clientId
- lawyerId
- title
- date
- time
- method
- status

## Document
- id
- name
- ownerId
- requestId
- caseId
- type
- uploadedAt
- status
- category

## Payment
- id
- invoice
- clientId
- lawyerId
- requestId
- amount
- status
- date
- dueDate

## Review
- id
- client
- lawyer
- rating
- text
- date
- status

## LawyerVerification
- id
- lawyerId
- name
- license
- specialty
- city
- submittedAt
- status
- experience
- documents

## ActivityEvent
- id
- event
- actor
- target
- timestamp
- type
