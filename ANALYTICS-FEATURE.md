# Analytics Feature Documentation

## Overview
The Analytics feature provides comprehensive tracking and visualization of portfolio views and user activity, similar to GitHub's contribution graph.

## Features

### 1. View Tracking
- Automatically tracks every portfolio view
- Records view metadata:
  - Timestamp
  - IP Address
  - User Agent
  - Referrer
- Updates analytics summary in real-time

### 2. Analytics Dashboard
A dedicated analytics section in the dashboard displaying:

#### Stats Cards
- **Total Views**: All-time portfolio views count
- **Last Viewed**: Most recent visit timestamp
- **Activity**: Number of active days in the last year

#### Activity Heatmap
- GitHub-style contribution graph
- Shows 371 days of activity (53 weeks × 7 days)
- Color intensity based on view count:
  - Gray: No views
  - Light Green: 1 view
  - Medium Green: 2 views
  - Dark Green: 3-4 views
  - Very Dark Green: 5-9 views
  - Deepest Green: 10+ views
- Hover tooltips show exact view count and date

## Database Schema

### PortfolioView Table
Tracks individual portfolio views:
```sql
CREATE TABLE "PortfolioView" (
  "id" SERIAL PRIMARY KEY,
  "portfolioId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "referrer" TEXT
);
```

### PortfolioAnalytics Table
Maintains aggregated analytics summary:
```sql
CREATE TABLE "PortfolioAnalytics" (
  "id" SERIAL PRIMARY KEY,
  "portfolioId" INTEGER NOT NULL UNIQUE,
  "totalViews" INTEGER NOT NULL DEFAULT 0,
  "lastViewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### POST `/api/analytics/track-view`
Records a portfolio view.

**Request Body:**
```json
{
  "portfolioId": 1,
  "userId": 1
}
```

**Response:**
```json
{
  "success": true
}
```

### GET `/api/analytics/stats?portfolioId=1`
Fetches analytics data for a portfolio.

**Response:**
```json
{
  "totalViews": 150,
  "lastViewedAt": "2025-01-20T10:30:00Z",
  "dailyData": [
    {
      "date": "2024-01-01",
      "count": 5
    },
    ...
  ]
}
```

## Component Structure

### AnalyticsSection Component
Located at: `src/components/dashboard/AnalyticsSection.tsx`

**Props:**
- `portfolioId: number` - The portfolio ID to display analytics for

**Features:**
- Fetches analytics data on mount
- Displays stats cards with animated entrance
- Renders heatmap with 371 days of data
- Smooth animations using Framer Motion
- Responsive design

## Integration Points

### 1. Public Portfolio Page
Location: `src/app/[username]/page.tsx`

Automatically tracks views when a portfolio is loaded:
```typescript
useEffect(() => {
  if (portfolio?.userId) {
    fetch('/api/analytics/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolioId: portfolio.id,
        userId: portfolio.userId
      })
    })
  }
}, [portfolio])
```

### 2. Dashboard Navigation
Location: `src/components/dashboard/DashboardLayout.tsx`

Added "Analytics" section to sidebar navigation with BarChart3 icon.

### 3. Dashboard Page
Location: `src/app/dashboard/page.tsx`

Renders AnalyticsSection component when analytics section is active.

## Styling

### Color Scheme
- Primary: Orange (#f97316) - consistent with dashboard theme
- Heatmap Colors: Green gradient scale
- Cards: White background with gray borders
- Hover effects: Orange border on cards

### Icons
- Eye icon: Total views
- Calendar icon: Last viewed
- Activity icon: Active days
- BarChart3 icon: Analytics section

## Production Deployment

### Build Script Integration
The analytics tables are automatically created during production build:

```json
{
  "build": "prisma generate && ... && (node scripts/add-analytics-tables.js || echo 'Analytics tables skipped') && ..."
}
```

### Migration Script
Location: `scripts/add-analytics-tables.js`

- Checks if tables exist before creating
- Creates PortfolioView table with indexes
- Creates PortfolioAnalytics table with indexes
- Gracefully handles existing tables

## Performance Considerations

### Indexes
Multiple indexes optimize query performance:
- `PortfolioView.portfolioId` - Fast filtering by portfolio
- `PortfolioView.userId` - Fast filtering by user
- `PortfolioView.viewedAt` - Fast date range queries
- `PortfolioAnalytics.portfolioId` - Fast lookup by portfolio

### Data Aggregation
- Daily data is generated on-demand from PortfolioView records
- No separate daily aggregation table needed
- Queries only fetch last 371 days for efficiency

## Future Enhancements

Potential improvements:
1. Visitor location tracking (using IP geolocation)
2. Page duration tracking
3. Referrer source analytics
4. Export analytics data as CSV
5. Email notifications for spikes in views
6. Comparison with previous periods
7. Device type breakdown (mobile/desktop/tablet)

## Testing

To test the analytics feature:

1. **Local Development:**
   ```bash
   npm run dev
   ```
   Visit `/dashboard` and click on "Analytics" section

2. **Test View Tracking:**
   - Open your portfolio URL in a new tab
   - Refresh the analytics page
   - Should see view count increment

3. **Verify Heatmap:**
   - Create multiple views over several days
   - Check heatmap shows activity with correct colors

## Troubleshooting

### Views Not Tracking
- Check browser console for errors
- Verify API endpoint is accessible
- Check database connection

### Heatmap Not Displaying
- Verify portfolioId is correct
- Check dailyData is being returned from API
- Inspect browser console for errors

### Production Build Issues
- Ensure migration script runs before app build
- Check database permissions
- Verify Prisma client is generated
