# Email System Implementation Guide

यह document TBE (The Boring Education) project में Email System की complete implementation को explain करता है।

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [API App में Email Service](#api-app-में-email-service)
3. [Platform App में Email Integration](#platform-app-में-email-integration)
4. [Email Types और Templates](#email-types-और-templates)
5. [Environment Configuration](#environment-configuration)
6. [Implementation Examples](#implementation-examples)
7. [अपने Project में Implement करें](#अपने-project-में-implement-करें)

---

## Architecture Overview

Email system तीन main layers में organized है:

```
┌─────────────────────────────────────────────────────────┐
│                     Platform App                         │
│  (Frontend + API Routes - Course/Sheet Enrollment)      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Calls Email Functions
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Email Services Layer                    │
│  (Email Client, Triggers, Templates)                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ API Call with Template
                       ▼
┌─────────────────────────────────────────────────────────┐
│              External Email Service (Breevo)             │
│            (Third-party email delivery)                  │
└─────────────────────────────────────────────────────────┘
```

### Key Components:

1. **Email Client** - External email service के साथ communication handle करता है
2. **Email Templates** - Beautiful HTML email templates
3. **Email Triggers** - Different events के लिए appropriate emails भेजता है
4. **Email Types** - Welcome, Course Enrollment, Sheet Enrollment, Course Completion, etc.

---

## API App में Email Service

API app (`apps/api/`) में email service की complete implementation है।

### File Structure:

```
apps/api/src/lib/services/
├── client.ts       # Email API client (Breevo integration)
├── email.ts        # High-level email functions
├── templates.ts    # HTML email templates
├── triggers.ts     # Email trigger service
└── index.ts        # Export all services
```

### 1. Email Client (`client.ts`)

यह external email service (Breevo) के साथ communicate करता है।

**Key Features:**
- Axios का उपयोग करके HTTP requests भेजता है
- API key authentication
- Request/Response logging
- Error handling with retry logic
- Timeout configuration (10 seconds)

**Code Structure:**
```typescript
class EmailClient {
  private apiUrl: string;
  private apiKey: string;

  async sendEmail(emailData: EmailRequest, requestId?: string): Promise<EmailResponse>
  async sendBulkEmails(emails: EmailRequest[]): Promise<EmailResponse[]>
}
```

**Environment Variables Required:**
- `EMAIL_SERVICE_URL` - Email service का URL
- `EMAIL_API_KEY` - API authentication key
- `FROM_EMAIL` - Default sender email

### 2. Email Templates (`templates.ts`)

Beautiful HTML templates with inline CSS styling.

**Available Templates:**
1. `welcomeEmailTemplate` - नए users के लिए welcome email
2. `courseEnrollmentTemplate` - Course enrollment confirmation
3. `projectEnrollmentTemplate` - Project enrollment confirmation
4. `interviewPrepEnrollmentTemplate` - Interview sheet enrollment
5. `courseCompletionTemplate` - Course completion certificate

**Template Structure:**
```typescript
const getBaseTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <!-- Responsive email styles -->
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 The Boring Education</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <!-- Social links & copyright -->
        </div>
      </div>
    </body>
  </html>
`;
```

**Template Features:**
- Mobile responsive design
- Gradient backgrounds
- Call-to-action buttons
- Social media links
- Professional signature
- Consistent branding

### 3. Email Trigger Service (`triggers.ts`)

Different email types को trigger करने के लिए service class।

**Key Methods:**

```typescript
class EmailTriggerService {
  // Individual email send करता है with specific template
  async sendTriggerEmail(
    trigger: EmailTriggerType,
    data: EmailTriggerData
  ): Promise<EmailResponse>

  // External API calls के लिए
  async sendExternalEmail(
    request: ExternalEmailRequest
  ): Promise<ExternalEmailResponse>
}
```

**Supported Email Types:**
- `WELCOME` - User signup
- `COURSE_ENROLLMENT` - Course में enroll होने पर
- `PROJECT_ENROLLMENT` - Project में enroll होने पर
- `INTERVIEW_PREP_ENROLLMENT` - Interview sheet में enroll होने पर
- `COURSE_COMPLETION` - Course complete होने पर

### 4. High-level Email Functions (`email.ts`)

Developer-friendly wrapper functions जो easily use हो सकें।

```typescript
// Welcome Email
export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
  id: string;
}) => { ... }

// Course Enrollment Email
export const sendCourseEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseDescription?: string;
}) => { ... }

// Interview Prep Enrollment Email
export const sendInterviewPrepEnrollmentEmail = async (data: {
  email: string;
  name: string;
  id: string;
  sheetName: string;
  sheetDescription?: string;
}) => { ... }
```

---

## Platform App में Email Integration

Platform app (`apps/platform/`) email services को use करता है।

### File Structure:

```
apps/platform/src/
├── services/email/
│   ├── client.ts      # Email API client
│   ├── templates.ts   # HTML templates
│   ├── triggers.ts    # Trigger service
│   └── index.ts       # Exports
├── utils/email.ts     # Helper functions
└── pages/api/v1/user/
    ├── shiksha/enroll.ts           # Course enrollment API
    └── interview-prep/enroll.ts    # Sheet enrollment API
```

### Course Enrollment Implementation

**File:** `apps/platform/src/pages/api/v1/user/shiksha/enroll.ts`

```typescript
const handleCourseEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, courseId } = req.body;

  // 1. Check if already enrolled
  const { data: alreadyExists } = await getEnrolledCourseFromDB({ 
    courseId, 
    userId 
  });

  if (alreadyExists) {
    return res.status(400).json({
      status: false,
      message: 'Already enrolled in course',
    });
  }

  // 2. Enroll user in course
  const { data, error } = await enrollInACourse({ userId, courseId });

  if (error) {
    return res.status(500).json({
      status: false,
      message: 'Failed while enrolling course',
    });
  }

  // 3. Send course enrollment email (non-blocking)
  try {
    const [userResult, courseResult] = await Promise.all([
      getUserByIdFromDB(userId),
      getACourseFromDBById(courseId),
    ]);

    if (userResult.data && courseResult.data) {
      // Email को background में भेजता है
      sendCourseEnrollmentEmail({
        email: userResult.data.email,
        name: userResult.data.name,
        id: userId,
        courseName: courseResult.data.name,
        courseDescription: courseResult.data.description,
      }).catch((error) => {
        console.error('Failed to send course enrollment email:', error);
      });
    }
  } catch (error) {
    console.error('Error fetching user/course data for email:', error);
  }

  // 4. Return success response immediately
  return res.status(200).json({
    status: true,
    data,
    message: 'Successfully enrolled in course',
  });
};
```

**Key Points:**
- ✅ Email sending non-blocking है (user को wait नहीं करना पड़ता)
- ✅ Error handling proper है
- ✅ User और course data parallel fetch होता है
- ✅ Email failure होने पर भी enrollment succeed होता है

### Sheet Enrollment Implementation

**File:** `apps/platform/src/pages/api/v1/user/interview-prep/enroll.ts`

```typescript
const handleSheetEnrollment = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userId, sheetId } = req.body;

  // 1. Check if already enrolled
  const { data: alreadyExists } = await getEnrolledSheetFromDB({ 
    sheetId, 
    userId 
  });

  if (alreadyExists) {
    return res.status(400).json({
      status: false,
      message: 'Already enrolled in sheet',
    });
  }

  // 2. Enroll user in sheet
  const { data, error } = await enrollInASheet({ userId, sheetId });

  if (error) {
    return res.status(500).json({
      status: false,
      message: 'Failed while enrolling in sheet',
    });
  }

  // 3. Send interview prep enrollment email (non-blocking)
  try {
    const [userResult, sheetResult] = await Promise.all([
      getUserByIdFromDB(userId),
      getInterviewSheetByIDFromDB(sheetId),
    ]);

    if (userResult.data && sheetResult.data) {
      sendInterviewPrepEnrollmentEmail({
        email: userResult.data.email,
        name: userResult.data.name,
        id: userId,
        sheetName: sheetResult.data.name,
        sheetDescription: sheetResult.data.description,
      }).catch((error) => {
        console.error('Failed to send interview prep enrollment email:', error);
      });
    }
  } catch (error) {
    console.error('Error fetching user/sheet data for email:', error);
  }

  // 4. Return success response
  return res.status(200).json({
    status: true,
    data,
    message: 'Successfully enrolled in sheet',
  });
};
```

---

## Email Types और Templates

### 1. Welcome Email (`WELCOME`)

**Trigger:** जब कोई नया user signup करता है

**Required Data:**
```typescript
{
  email: string;
  name: string;
  id: string;
}
```

**Email Content:**
- Welcome message
- Platform के features
- CTA: "Start Learning Now"

### 2. Course Enrollment Email (`COURSE_ENROLLMENT`)

**Trigger:** जब user किसी course में enroll करता है

**Required Data:**
```typescript
{
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseDescription?: string;
}
```

**Email Content:**
- Congratulations message
- Course details
- Learning tips
- CTA: "Continue Learning"

### 3. Interview Prep Enrollment Email (`INTERVIEW_PREP_ENROLLMENT`)

**Trigger:** जब user interview preparation sheet में enroll करता है

**Required Data:**
```typescript
{
  email: string;
  name: string;
  id: string;
  sheetName: string;
  sheetDescription?: string;
}
```

**Email Content:**
- Welcome to interview prep
- Sheet benefits
- Pro tips for preparation
- CTA: "Start Your Interview Prep"

### 4. Course Completion Email (`COURSE_COMPLETION`)

**Trigger:** जब user course complete करता है

**Required Data:**
```typescript
{
  email: string;
  name: string;
  id: string;
  courseName: string;
  courseUrl: string;
  completionDate: string;
  certificateUrl?: string;
}
```

**Email Content:**
- Congratulations message
- Achievement summary
- Certificate download link
- Next steps suggestions

---

## Environment Configuration

### Required Environment Variables:

#### API App (`.env`)

```bash
# Email Service Configuration
EMAIL_SERVICE_URL=https://api.breevo.com/v1
EMAIL_API_KEY=your-breevo-api-key-here
FROM_EMAIL=noreply@yourdomain.com

# Platform URL (for email links)
PLATFORM_URL=https://www.theboringeducation.com
```

#### Platform App (`.env.local`)

```bash
# Email Service Configuration
EMAIL_SERVICE_URL=https://api.breevo.com/v1
EMAIL_API_KEY=your-breevo-api-key-here
FROM_EMAIL=noreply@yourdomain.com

# Platform URL
PLATFORM_URL=https://www.theboringeducation.com
```

### External Email Service (Breevo)

इस project में **Breevo** email service का use होता है।

**API Endpoint:**
```
POST https://api.breevo.com/v1/send-email
```

**Headers:**
```
Content-Type: application/json
X-Breevo-API-Key: your-api-key
```

**Request Body:**
```json
{
  "from_email": "noreply@yourdomain.com",
  "from_name": "TBE",
  "to_email": "user@example.com",
  "to_name": "User Name",
  "subject": "Welcome to TBE!",
  "html_content": "<html>...</html>"
}
```

**अन्य Email Services:**
आप चाहें तो Breevo की जगह दूसरी services भी use कर सकते हैं:
- SendGrid
- AWS SES
- Mailgun
- Postmark
- Resend

बस `client.ts` में API endpoint और authentication logic update करना होगा।

---

## Implementation Examples

### Example 1: Course Enrollment में Email भेजना

```typescript
import { sendCourseEnrollmentEmail } from '@/utils/email';

// Inside your enrollment API handler
const enrollUserInCourse = async (userId: string, courseId: string) => {
  // 1. Perform enrollment
  await enrollInACourse({ userId, courseId });

  // 2. Fetch user and course details
  const [user, course] = await Promise.all([
    getUserByIdFromDB(userId),
    getACourseFromDBById(courseId),
  ]);

  // 3. Send email (non-blocking)
  if (user.data && course.data) {
    sendCourseEnrollmentEmail({
      email: user.data.email,
      name: user.data.name,
      id: userId,
      courseName: course.data.name,
      courseDescription: course.data.description,
    }).catch((error) => {
      console.error('Email sending failed:', error);
      // Log to monitoring service (Sentry, etc.)
    });
  }

  return { success: true };
};
```

### Example 2: Sheet Enrollment में Email भेजना

```typescript
import { sendInterviewPrepEnrollmentEmail } from '@/utils/email';

const enrollUserInSheet = async (userId: string, sheetId: string) => {
  // 1. Perform enrollment
  await enrollInASheet({ userId, sheetId });

  // 2. Fetch user and sheet details
  const [user, sheet] = await Promise.all([
    getUserByIdFromDB(userId),
    getInterviewSheetByIDFromDB(sheetId),
  ]);

  // 3. Send email (non-blocking)
  if (user.data && sheet.data) {
    sendInterviewPrepEnrollmentEmail({
      email: user.data.email,
      name: user.data.name,
      id: userId,
      sheetName: sheet.data.name,
      sheetDescription: sheet.data.description,
    }).catch((error) => {
      console.error('Email sending failed:', error);
    });
  }

  return { success: true };
};
```

### Example 3: Custom Email Template बनाना

```typescript
// In templates.ts
export const customEmailTemplate = (data: CustomEmailData): string => {
  const content = `
    <div class="greeting">Hello ${data.userName}! 👋</div>
    
    <div class="main-text">
      <p>Your custom message here...</p>
      
      <ul>
        <li>Point 1</li>
        <li>Point 2</li>
        <li>Point 3</li>
      </ul>
    </div>
    
    <div style="text-align: center;">
      <a href="${data.ctaUrl}" class="cta-button">
        ${data.ctaText}
      </a>
    </div>
  `;

  return getBaseTemplate(content);
};

// Usage
const htmlContent = customEmailTemplate({
  userName: 'John Doe',
  ctaUrl: 'https://example.com',
  ctaText: 'Click Here',
});
```

---

## अपने Project में Implement करें

### Step 1: Files Copy करें

```bash
# Email service files
mkdir -p src/services/email
cp apps/api/src/lib/services/client.ts src/services/email/
cp apps/api/src/lib/services/templates.ts src/services/email/
cp apps/api/src/lib/services/triggers.ts src/services/email/
cp apps/api/src/lib/services/email.ts src/services/email/
```

### Step 2: Dependencies Install करें

```bash
npm install axios
# or
yarn add axios
# or
pnpm add axios
```

### Step 3: Environment Variables Set करें

```bash
# .env file
EMAIL_SERVICE_URL=https://api.breevo.com/v1
EMAIL_API_KEY=your-api-key
FROM_EMAIL=noreply@yourdomain.com
PLATFORM_URL=https://yourdomain.com
```

### Step 4: TypeScript Interfaces Define करें

```typescript
// src/interfaces/email.ts
export interface EmailRequest {
  from_email: string;
  from_name?: string;
  to_email: string;
  to_name?: string;
  subject: string;
  html_content: string;
}

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  requestId?: string;
}

export interface EmailTriggerData {
  userEmail: string;
  userName: string;
  userId: string;
  metadata?: Record<string, any>;
}

export type EmailTriggerType =
  | 'WELCOME'
  | 'COURSE_ENROLLMENT'
  | 'INTERVIEW_PREP_ENROLLMENT'
  | 'COURSE_COMPLETION';
```

### Step 5: Email Service को Use करें

```typescript
// Your API route or service
import { sendCourseEnrollmentEmail } from '@/services/email';

const handleEnrollment = async (userId: string, courseId: string) => {
  // Your enrollment logic
  await performEnrollment(userId, courseId);

  // Send email
  const user = await getUser(userId);
  const course = await getCourse(courseId);

  sendCourseEnrollmentEmail({
    email: user.email,
    name: user.name,
    id: userId,
    courseName: course.name,
    courseDescription: course.description,
  }).catch(console.error);

  return { success: true };
};
```

### Step 6: Email Logging Setup (Optional)

```typescript
// src/utils/emailLogger.ts
export const emailLogger = {
  generateRequestId: () => `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  logApiCall: (requestId: string, toEmail: string, metadata: any) => {
    console.log('[EMAIL-API-CALL]', {
      requestId,
      toEmail,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },
  
  logSuccess: (requestId: string, toEmail: string, duration: number, metadata: any) => {
    console.log('[EMAIL-SUCCESS]', {
      requestId,
      toEmail,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },
  
  logError: (requestId: string, toEmail: string, error: any, stage: string, metadata?: any) => {
    console.error('[EMAIL-ERROR]', {
      requestId,
      toEmail,
      stage,
      error: error.message || error,
      timestamp: new Date().toISOString(),
      ...metadata,
    });
  },
};
```

### Step 7: Testing

```typescript
// Test email sending
import { sendWelcomeEmail } from '@/services/email';

const testEmailSending = async () => {
  try {
    const result = await sendWelcomeEmail({
      email: 'test@example.com',
      name: 'Test User',
      id: 'test-123',
    });

    console.log('Email sent:', result);
  } catch (error) {
    console.error('Email failed:', error);
  }
};
```

---

## Best Practices

### 1. Non-Blocking Email Sending
Email sending को always non-blocking रखें ताकि user experience affected न हो:

```typescript
// ✅ Good - Non-blocking
sendEmail(data).catch(console.error);
return response; // Immediate response

// ❌ Bad - Blocking
await sendEmail(data); // User waits for email
return response;
```

### 2. Error Handling
Proper error handling करें और logs maintain करें:

```typescript
try {
  await sendEmail(data);
} catch (error) {
  // Log to monitoring service
  console.error('Email failed:', error);
  // Don't fail the main operation
}
```

### 3. Rate Limiting
बहुत सारे emails एक साथ न भेजें:

```typescript
// Bulk emails के लिए batching use करें
const BATCH_SIZE = 50;
for (let i = 0; i < emails.length; i += BATCH_SIZE) {
  const batch = emails.slice(i, i + BATCH_SIZE);
  await emailClient.sendBulkEmails(batch);
  await sleep(1000); // 1 second delay between batches
}
```

### 4. Template Testing
Email templates को different email clients में test करें:
- Gmail
- Outlook
- Apple Mail
- Mobile devices

### 5. Monitoring
Email delivery को monitor करें:
- Delivery rate
- Bounce rate
- Open rate (if tracking enabled)
- Error rate

---

## Troubleshooting

### Issue 1: Emails नहीं भेज रहे

**Solution:**
1. Environment variables check करें
2. API key valid है verify करें
3. Email service URL correct है check करें
4. Network connectivity test करें

### Issue 2: Emails spam में जा रहे

**Solution:**
1. SPF, DKIM, DMARC records setup करें
2. Professional email template use करें
3. "noreply" email address avoid करें
4. Email warmup करें

### Issue 3: Slow email delivery

**Solution:**
1. Non-blocking sending implement करें
2. Queue system use करें (Bull, BullMQ)
3. Batch processing implement करें

### Issue 4: Template rendering issues

**Solution:**
1. Inline CSS use करें
2. Tables for layout use करें (email compatibility)
3. External images को CDN पर host करें
4. Email testing tools use करें (Litmus, Email on Acid)

---

## Additional Resources

### Email Services Comparison

| Service | Free Tier | Pricing | Best For |
|---------|-----------|---------|----------|
| Breevo | ✅ | Custom | Startups |
| SendGrid | 100/day | $15/mo+ | Scale |
| AWS SES | 62k/mo | $0.10/1000 | AWS users |
| Mailgun | 5k/mo | $35/mo+ | Developers |
| Resend | 3k/mo | $20/mo+ | Modern apps |

### Testing Tools
- [Litmus](https://litmus.com/) - Email testing
- [Email on Acid](https://www.emailonacid.com/) - Email testing
- [Mailtrap](https://mailtrap.io/) - Email testing sandbox
- [Temp Mail](https://temp-mail.org/) - Temporary email for testing

### Email Templates
- [Really Good Emails](https://reallygoodemails.com/) - Inspiration
- [MJML](https://mjml.io/) - Responsive email framework
- [Foundation for Emails](https://get.foundation/emails.html) - Email framework

---

## Conclusion

यह email system production-ready है और easily scalable है। आप इसे अपने project में direct use कर सकते हैं या अपनी requirements के according modify कर सकते हैं।

**Key Takeaways:**
- ✅ Non-blocking email sending
- ✅ Beautiful responsive templates
- ✅ Proper error handling
- ✅ Easy to extend
- ✅ Production tested

---

**Created by:** The Boring Education Team  
**Last Updated:** 2025  
**License:** MIT

