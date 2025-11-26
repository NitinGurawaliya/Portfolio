import { NextRequest, NextResponse } from 'next/server'
import { cache, CacheKeys, CacheTTL, getCachedData, setCachedData } from "@/lib/cache"

export const runtime = 'edge'
export const revalidate = 3600 // Cache for 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = CacheKeys.githubActivity(username)
    const cachedData = getCachedData(cacheKey)
    
    if (cachedData) {
      return NextResponse.json(cachedData)
    }


    // Fetch GitHub user data with token
    let userData = null
    try {
      const userResponse = await fetch(`https://api.github.com/users/${username}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'DevFolio-GitHub-Activity/1.0'
        }
      })

      // console.log('User API response status:', userResponse.status) // Disabled to reduce terminal noise

      if (userResponse.ok) {
        userData = await userResponse.json()
        // console.log('User data fetched:', userData.login) // Disabled to reduce terminal noise
      } else {
        // console.log('User API failed, using fallback data') // Disabled to reduce terminal noise
        userData = {
          login: username,
          name: username,
          avatar_url: `https://github.com/${username}.png`,
          public_repos: 0,
          followers: 0,
          following: 0,
          created_at: new Date().toISOString()
        }
      }
    } catch (error) {
      // console.log('User API error, using fallback data:', error) // Disabled to reduce terminal noise
      userData = {
        login: username,
        name: username,
        avatar_url: `https://github.com/${username}.png`,
        public_repos: 0,
        followers: 0,
        following: 0,
        created_at: new Date().toISOString()
      }
    }

    // Fetch real GitHub contribution data using GraphQL API
    let contributionData = []
    try {
      const graphqlQuery = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DevFolio-GitHub-Activity/1.0'
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { username }
        })
      })

      if (response.ok) {
        const data = await response.json()
        // console.log('GraphQL response:', data) // Disabled to reduce terminal noise
        
        if (data.data && data.data.user && data.data.user.contributionsCollection) {
          const calendar = data.data.user.contributionsCollection.contributionCalendar
          console.log('Total contributions:', calendar.totalContributions)
          
          contributionData = processGraphQLContributions(calendar.weeks)
        } else {
          console.log('No contribution data found, using mock data')
          contributionData = generateMockContributions()
        }
      } else {
        // console.log('GraphQL API failed, using mock data') // Disabled to reduce terminal noise
        contributionData = generateMockContributions()
      }
    } catch (error) {
      // console.log('GraphQL API error, using mock data:', error) // Disabled to reduce terminal noise
      contributionData = generateMockContributions()
    }

    // Fetch recent pull requests created by user (not merged, just created)
    let pullRequests = []
    try {
      const prsResponse = await fetch(`https://api.github.com/search/issues?q=author:${username}+type:pr&sort=created&order=desc&per_page=20`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'User-Agent': 'DevFolio-GitHub-Activity/1.0'
        }
      })

      if (prsResponse.ok) {
        const prsData = await prsResponse.json()
        
        if (prsData.items && prsData.items.length > 0) {
          // Fetch repo details for each PR to get logo
          const prsWithRepoInfo = await Promise.all(
            prsData.items.slice(0, 20).map(async (pr: any) => {
              const repoUrl = pr.repository_url
              const repoParts = repoUrl.split('/').slice(-2)
              const owner = repoParts[0]
              const repoName = repoParts[1]
              
              let repoLogo = ''
              try {
                const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
                  headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'User-Agent': 'DevFolio-GitHub-Activity/1.0'
                  }
                })
                
                if (repoResponse.ok) {
                  const repoData = await repoResponse.json()
                  // Try to get owner's avatar as repo logo
                  repoLogo = repoData.owner?.avatar_url || ''
                }
              } catch (error) {
                // If repo fetch fails, continue without logo
                console.log('Failed to fetch repo info for', repoName)
              }
              
              return {
                id: pr.id,
                number: pr.number,
                title: pr.title,
                body: pr.body || '',
                htmlUrl: pr.html_url,
                state: pr.state,
                mergedAt: pr.pull_request?.merged_at || null,
                createdAt: pr.created_at,
                repository: {
                  name: repoName,
                  fullName: `${owner}/${repoName}`,
                  owner: owner,
                  logo: repoLogo
                },
                user: {
                  login: pr.user?.login || username,
                  avatarUrl: pr.user?.avatar_url || ''
                }
              }
            })
          )
          
          pullRequests = prsWithRepoInfo
          console.log('Pull requests processed:', pullRequests.length)
        } else {
          console.log('No pull requests found')
          pullRequests = []
        }
      } else {
        console.log('Pull requests API failed, using empty array')
        pullRequests = []
      }
    } catch (error) {
      console.log('Pull requests API error, using empty array:', error)
      pullRequests = []
    }

    console.log('Returning data with contributions:', contributionData.length, 'and pull requests:', pullRequests.length)

    const responseData = {
      user: {
        login: userData.login,
        name: userData.name,
        avatarUrl: userData.avatar_url,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        createdAt: userData.created_at
      },
      contributions: contributionData,
      pullRequests
    }

    // Cache the response
    setCachedData(cacheKey, responseData, CacheTTL.GITHUB_ACTIVITY)
    console.log("🚀 GitHub Activity API: Data cached for", CacheTTL.GITHUB_ACTIVITY, "minutes")

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('GitHub Activity API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 })
  }
}

function processGraphQLContributions(weeks: any[]): Array<{date: string, level: number, count: number}> {
  const result: Array<{date: string, level: number, count: number}> = []
  
  // Process each week's contribution days
  weeks.forEach(week => {
    if (week.contributionDays) {
      week.contributionDays.forEach((day: any) => {
        const count = day.contributionCount || 0
        let level = 0
        
        // Calculate level based on contribution count (GitHub's scale)
        if (count >= 1 && count <= 3) level = 1
        else if (count >= 4 && count <= 6) level = 2
        else if (count >= 7 && count <= 9) level = 3
        else if (count >= 10) level = 4
        
        result.push({
          date: day.date,
          level,
          count
        })
      })
    }
  })
  
  return result
}

function processCommitsToContributions(commits: any[]): Array<{date: string, level: number, count: number}> {
  const contributions: { [key: string]: number } = {}
  const today = new Date()
  
  // Process commits to count contributions per day
  commits.forEach(commit => {
    if (commit.commit && commit.commit.author && commit.commit.author.date) {
      const commitDate = new Date(commit.commit.author.date).toISOString().split('T')[0]
      contributions[commitDate] = (contributions[commitDate] || 0) + 1
    }
  })
  
  // Generate contribution data for the last 365 days
  const result: Array<{date: string, level: number, count: number}> = []
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    
    const count = contributions[dateString] || 0
    let level = 0
    
    // Calculate level based on contribution count (GitHub's scale)
    if (count >= 1 && count <= 3) level = 1
    else if (count >= 4 && count <= 6) level = 2
    else if (count >= 7 && count <= 9) level = 3
    else if (count >= 10) level = 4
    
    result.push({
      date: dateString,
      level,
      count
    })
  }
  
  return result
}

function processGitHubEvents(events: any[]) {
  const contributions: { [key: string]: number } = {}
  const today = new Date()
  
  // Process events to count contributions per day
  events.forEach(event => {
    if (event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'IssuesEvent' || event.type === 'PullRequestEvent') {
      const eventDate = new Date(event.created_at).toISOString().split('T')[0]
      contributions[eventDate] = (contributions[eventDate] || 0) + 1
    }
  })
  
  // Generate contribution data for the last 365 days
  const result = []
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0]
    
    const count = contributions[dateString] || 0
    let level = 0
    
    // Calculate level based on contribution count
    if (count >= 1 && count <= 3) level = 1
    else if (count >= 4 && count <= 6) level = 2
    else if (count >= 7 && count <= 9) level = 3
    else if (count >= 10) level = 4
    
    result.push({
      date: dateString,
      level,
      count
    })
  }
  
  return result
}

function generateMockContributions() {
  const contributions = []
  const today = new Date()
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const level = Math.floor(Math.random() * 5) // 0-4 levels
    const count = level > 0 ? Math.floor(Math.random() * 10) + 1 : 0
    
    contributions.push({
      date: date.toISOString().split('T')[0],
      level,
      count
    })
  }
  
  return contributions
}