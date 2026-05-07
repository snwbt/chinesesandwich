# Database Plan

## Guest
- name
- email
- inviteCode
- partyId
- rsvpStatus

## Party
- name
- inviteCode

## RSVPResponse
- guestId
- attending
- answers

## CustomQuestion
- label
- type
- required

## Page
- slug
- title
- content

## RegistryLink
- title
- url

## Table
- name
- capacity

## SeatAssignment
- tableId
- guestId