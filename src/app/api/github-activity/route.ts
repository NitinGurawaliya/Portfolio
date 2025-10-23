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

      console.log('User API response status:', userResponse.status)

      if (userResponse.ok) {
        userData = await userResponse.json()
        console.log('User data fetched:', userData.login)
      } else {
        console.log('User API failed, using fallback data')
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
      console.log('User API error, using fallback data:', error)
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
        console.log('GraphQL response:', data)
        
        if (data.data && data.data.user && data.data.user.contributionsCollection) {
          const calendar = data.data.user.contributionsCollection.contributionCalendar
          console.log('Total contributions:', calendar.totalContributions)
          
          contributionData = processGraphQLContributions(calendar.weeks)
        } else {
          console.log('No contribution data found, using mock data')
          contributionData = generateMockContributions()
        }
      } else {
        console.log('GraphQL API failed, using mock data')
        contributionData = generateMockContributions()
      }
    } catch (error) {
      console.log('GraphQL API error, using mock data:', error)
      contributionData = generateMockContributions()
    }

    // Fetch pinned repositories using GraphQL API
    let pinnedRepos = []
    try {
      const pinnedQuery = `
        query($username: String!) {
          user(login: $username) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  id
                  name
                  description
                  url
                  primaryLanguage {
                    name
                  }
                  stargazerCount
                  forkCount
                  updatedAt
                  repositoryTopics(first: 10) {
                    nodes {
                      topic {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `

      const pinnedResponse = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DevFolio-GitHub-Activity/1.0'
        },
        body: JSON.stringify({
          query: pinnedQuery,
          variables: { username }
        })
      })

      if (pinnedResponse.ok) {
        const pinnedData = await pinnedResponse.json()
        console.log('Pinned repos GraphQL response:', pinnedData)
        
        if (pinnedData.data && pinnedData.data.user && pinnedData.data.user.pinnedItems) {
          pinnedRepos = pinnedData.data.user.pinnedItems.nodes.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            description: repo.description,
            htmlUrl: repo.url,
            language: repo.primaryLanguage?.name || 'Unknown',
            stargazersCount: repo.stargazerCount,
            forksCount: repo.forkCount,
            updatedAt: repo.updatedAt,
            topics: repo.repositoryTopics?.nodes?.map((topic: any) => topic.topic.name) || []
          }))
          console.log('Pinned repos processed:', pinnedRepos.length)
        } else {
          console.log('No pinned repos found, trying regular repos')
          // Fallback to regular repos if no pinned repos
          const userReposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'User-Agent': 'DevFolio-GitHub-Activity/1.0'
            }
          })

          if (userReposResponse.ok) {
            const userReposData = await userReposResponse.json()
            pinnedRepos = userReposData
              .filter((repo: any) => !repo.fork && !repo.private && repo.owner.login === username)
              .slice(0, 6)
              .map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                description: repo.description,
                htmlUrl: repo.html_url,
                language: repo.language,
                stargazersCount: repo.stargazers_count,
                forksCount: repo.forks_count,
                updatedAt: repo.updated_at,
                topics: repo.topics || []
              }))
          }
        }
      } else {
        console.log('Pinned repos GraphQL failed, using empty array')
        pinnedRepos = []
      }
    } catch (error) {
      console.log('Pinned repos API error, using empty array:', error)
      pinnedRepos = []
    }

    console.log('Returning data with contributions:', contributionData.length, 'and repos:', pinnedRepos.length)

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
      pinnedRepos
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