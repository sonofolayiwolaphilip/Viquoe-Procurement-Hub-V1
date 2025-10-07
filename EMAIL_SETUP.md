# Email Verification Setup Guide

## Overview
This document outlines the successful configuration of email verification for user registration in the Viquoe platform using Resend email service and Supabase authentication.

## Problem Statement
Initial user registration was failing with the error:
```
Error sending confirmation email
Status: 500 - Server Error
```

This occurred because Supabase's email confirmation was enabled but no SMTP service was configured.

## Solution Implemented

### Architecture
```
User Registration → Supabase Auth → Resend SMTP → User Email
                         ↓
                    DNS Verification (via Vercel)
```

## Setup Steps Completed

### 1. Domain Configuration
- **Domain**: viquoe.com
- **Registrar**: Namecheap
- **DNS Manager**: Vercel (nameservers already pointed)
- **Email Service**: Resend

### 2. Resend Configuration

#### Account Setup
1. Created account at [resend.com](https://resend.com)
2. Added domain: `viquoe.com`
3. Received DNS verification records

#### DNS Records Added (via Vercel)
Added the following records in Vercel DNS management:

**SPF Record (TXT)**
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
TTL: 3600
```

**DKIM Record (CNAME)**
```
Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.resend.com
TTL: 3600
```

**DMARC Record (TXT)**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@resend.com
TTL: 3600
```

#### API Key Generation
1. Created API key in Resend dashboard
2. Named: "Supabase SMTP"
3. Permissions: Sending access
4. Stored securely for Supabase configuration

### 3. Supabase SMTP Configuration

#### Settings Applied
Located at: `Authentication → Emails → SMTP Settings`

```
Enable Custom SMTP: ✅ Enabled

Sender Details:
- Sender email: no-reply@viquoe.com
- Sender name: Viquoe

SMTP Provider Settings:
- Host: smtp.resend.com
- Port: 587
- Minimum interval: 1 second
- Username: resend
- Password: [Resend API Key]
```

### 4. Code Updates

#### Enhanced Error Handling
Updated the registration page to handle email-related errors:

```typescript
if (signUpError) {
  // Handle specific Supabase errors
  if (signUpError.message.includes("already registered")) {
    setError("This email is already registered. Please sign in instead.")
  } else if (signUpError.message.includes("Password")) {
    setError("Password does not meet requirements. Please try a stronger password.")
  } else if (signUpError.message.includes("email") || signUpError.message.includes("confirmation")) {
    setError("Email service not configured. Please contact support or disable email confirmation in your Supabase settings.")
  } else {
    setError(signUpError.message)
  }
  setIsLoading(false)
  return
}
```

## Email Templates

### Sender Address
- **Email**: `no-reply@viquoe.com`
- **Note**: This is a send-only address. No inbox required.

### Email Types Configured
1. **Confirmation Email**: Sent when new users register
2. **Password Reset**: Sent when users request password reset
3. **Email Change**: Sent when users change their email address
4. **Magic Link**: Sent for passwordless authentication (if enabled)

## Testing

### Successful Test Cases
- ✅ New user registration sends confirmation email
- ✅ Email arrives in user's inbox (not spam)
- ✅ Email confirmation link works correctly
- ✅ Users can log in after email verification

### Test Registration Flow
1. Navigate to `/register?type=buyer` or `/register?type=supplier`
2. Fill in all required fields
3. Submit registration form
4. Success message displayed
5. Confirmation email received
6. Click verification link in email
7. User can now log in

## Resend Free Tier Limits
- **Daily Limit**: 100 emails/day
- **Monthly Limit**: 3,000 emails/month
- **Rate Limit**: Configurable (set to 1 second minimum interval)

### Monitoring Usage
Check usage at: Resend Dashboard → Usage

## Email Deliverability

### Best Practices Implemented
✅ SPF record configured (prevents spoofing)  
✅ DKIM signature enabled (email authentication)  
✅ DMARC policy set (email validation)  
✅ Custom domain used (no-reply@viquoe.com)  
✅ Professional sender name ("Viquoe")

### Spam Prevention
- Using verified custom domain
- Proper DNS authentication records
- Low sending volume (within free tier)
- Clear unsubscribe mechanism (if applicable)

## Troubleshooting

### Common Issues and Solutions

#### Email Not Received
1. Check spam/junk folder
2. Verify domain is verified in Resend
3. Check Resend logs for delivery status
4. Verify email address is correct

#### DNS Verification Failed
1. Wait 15-30 minutes for DNS propagation
2. Verify records in Vercel match Resend exactly
3. Use DNS checker tool: [MXToolbox](https://mxtoolbox.com)
4. Check for typos in DNS values

#### SMTP Connection Error
1. Verify API key is correct (no extra spaces)
2. Ensure port 587 is used
3. Check username is "resend"
4. Verify SMTP is enabled in Supabase

#### Rate Limit Exceeded
1. Monitor daily/monthly usage in Resend
2. Consider upgrading Resend plan if needed
3. Implement email queuing for high volume

## Security Considerations

### API Key Security
- ✅ API key stored encrypted in Supabase
- ✅ Never exposed in client-side code
- ✅ Not committed to version control
- ✅ Access restricted to Supabase backend only

### Email Security
- ✅ HTTPS redirect URL for email links
- ✅ Token-based email verification
- ✅ Expiring verification links
- ✅ Rate limiting on email sends

## Maintenance

### Regular Checks
- [ ] Monitor email deliverability weekly
- [ ] Check Resend usage against limits
- [ ] Review Supabase email logs
- [ ] Test email flow monthly
- [ ] Update DNS records if needed

### When to Upgrade
Consider upgrading Resend plan when:
- Approaching 100 emails/day consistently
- Need higher sending limits
- Require dedicated IP address
- Need advanced analytics

## Environment Variables

### Required Configuration
Ensure these are set in your environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application
NEXT_PUBLIC_SITE_URL=https://viquoe.com
```

### Email Redirect URLs
Configured in Supabase signup:
```typescript
emailRedirectTo: `${window.location.origin}/login`
```

## Future Enhancements

### Potential Improvements
- [ ] Custom email templates with branding
- [ ] Email notifications for order updates
- [ ] Transactional emails for procurement process
- [ ] Email preferences management
- [ ] Multi-language email support
- [ ] Email analytics and tracking

### Email Types to Add
- Welcome email series
- Order confirmation emails
- Shipment tracking notifications
- Invoice delivery
- Newsletter (with opt-in)

## Support Resources

### Documentation
- [Resend Docs](https://resend.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Vercel DNS Docs](https://vercel.com/docs/concepts/projects/domains)

### Verification Tools
- [MXToolbox](https://mxtoolbox.com) - DNS record checker
- [Mail-tester](https://www.mail-tester.com) - Email spam score
- [DNS Checker](https://dnschecker.org) - Global DNS propagation

## Success Metrics

### Current Status
✅ Email verification successfully configured  
✅ Domain verified and authenticated  
✅ User registration working end-to-end  
✅ Emails delivering to inbox (not spam)  
✅ Zero email sending errors  

### KPIs to Monitor
- Email delivery rate: Target 98%+
- Email open rate: Target 60%+
- Link click rate: Target 40%+
- Bounce rate: Target <2%
- Spam complaints: Target <0.1%

## Team Notes

### Key Contacts
- **DNS Management**: Vercel Dashboard
- **Email Service**: Resend Dashboard
- **Authentication**: Supabase Dashboard

### Deployment Checklist
When deploying to production:
- [x] DNS records verified
- [x] SMTP credentials configured
- [x] Email templates tested
- [x] Redirect URLs updated for production domain
- [ ] Monitor first 100 emails closely
- [ ] Set up email failure alerts

---

## Changelog

### Version 1.0.0 - [Current Date]
- ✅ Initial email verification setup
- ✅ Resend integration completed
- ✅ DNS configuration verified
- ✅ SMTP settings configured in Supabase
- ✅ Enhanced error handling in registration form
- ✅ Successfully tested end-to-end flow

---

**Last Updated**: October 7, 2025  
**Status**: ✅ Active and Operational  
**Maintained By**: Development Team