# Logo Update Debug Steps

## How to Test

1. Go to dashboard and click on any project
2. Click "Edit" from the menu
3. Change the image (upload new image or paste URL)
4. Click "Save"
5. Check browser console for:
   - `✅ Logo override set in local state for ID: <id>`
   - `✅ Logo override sent to parent for ID: <id>`

6. Check if the image updates in the dashboard (should work now)

7. Click "Publish" button
8. Check server logs for:
   - `📸 Logo overrides received: { ... }`
   - `📊 Repository <name> (ID: <id>): { hasOverride: true/false, ... }`

9. Go to public portfolio page
10. Check if the image appears with the new logo

## Expected Behavior

- **Dashboard**: Image should update immediately after saving in Edit modal
- **After Publish**: Server should receive logoOverrides with the repository ID
- **Public Page**: Should show the new logo from database

## Common Issues

1. **Image not updating in dashboard**: 
   - Check if `logoOverrides` prop is being passed from parent
   - Check if `useEffect` is syncing parent state to local state

2. **Image not updating on public page**:
   - Check server logs to see if logoOverrides is being received
   - Check if the repository ID in logoOverrides matches the GitHub ID
   - Check if the logo field in database is being updated

3. **Empty logoOverrides**:
   - Make sure `onUpdateLogo` callback is being called
   - Check if `payload.logo` has a value in Edit modal

