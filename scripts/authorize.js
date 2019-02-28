// Change this to the ID of the client that you registered with the SMART on FHIR authorization server.
var clientId = "16cbfe7c-6c56-4876-944f-534f9306bf8b";

// Must have FHIR library imported before this
FHIR.oauth2.authorize({
    'client_id': clientId,
    'scope':  'patient/*.read launch online_access openid profile'
})
