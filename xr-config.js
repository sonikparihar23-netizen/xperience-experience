/* Public configuration only. CRM credentials belong in server environment variables. */
window.XR_CONFIG = {
  defaultTheme: 'light',
  leadEndpoint: '/api/enquiry',
  company: {
    name: 'Xperience Realty Real Estate L.L.C.', phone: '+971564080888', whatsapp: '971565467991', email: 'info@xrealty.ae', orn: null, licence: null,
    // Google rating as published on xrealty.ae (AggregateRating), checked 23 Nov 2026
    rating: { value: '4.9', reviews: 457 },
    // Verified total transacted for clients, e.g. 'AED 2BN'. Leave null until marketing confirms it.
    transacted: null
  },
  companySource: 'https://www.xrealty.ae/contact-us-dubai-real-estate-agency/'
};
