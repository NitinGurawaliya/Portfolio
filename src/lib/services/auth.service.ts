import { upsertUserFromGitHub } from "@/lib/services/user.service"

export async function resolvePrimaryEmail(accessToken: string, userData: any): Promise<string> {
  let userEmail = userData.email && userData.email.trim() ? userData.email.trim() : null
  if (!userEmail) {
    try {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github.v3+json" },
      })
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json()
        const primaryEmail = emails.find((e: any) => e.primary && e.verified)
        if (primaryEmail) {
          userEmail = primaryEmail.email
        }
      }
    } catch (err) {
      // swallow, will fallback
    }
  }
  if (!userEmail) userEmail = `github-${userData.id}@placeholder.com`
  return userEmail
}

export async function saveAuthenticatedUser(accessToken: string, userData: any) {
  const email = await resolvePrimaryEmail(accessToken, userData)
  const savedUser = await upsertUserFromGitHub(userData, email)
  const isNewUser = !Boolean(savedUser?.createdAt) // cannot know exactly; caller may decide separately
  return { savedUser, email, isNewUser }
}
