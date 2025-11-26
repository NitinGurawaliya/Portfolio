"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Calendar, ExternalLink, GitMerge } from 'lucide-react';

interface Contribution {
  date: string;
  level: number;
  count: number;
}

interface PullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  htmlUrl: string;
  state: string;
  mergedAt: string | null;
  createdAt: string;
  repository: {
    name: string;
    fullName: string;
    owner: string;
    logo: string;
  };
  user: {
    login: string;
    avatarUrl: string;
  };
}

interface CustomGitHubActivityProps {
  username: string;
}

interface ContributionSquareProps {
  day: Contribution;
  getContributionColor: (level: number, count: number) => string;
  delay: number;
}

function PullRequestsList({ pullRequests }: { pullRequests: PullRequest[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayedPRs = showAll ? pullRequests : pullRequests.slice(0, 5);
  const hasMore = pullRequests.length > 5;

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-2">
      {displayedPRs.map((pr, index) => (
        <motion.a
          key={pr.id}
          href={pr.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 border border-dashed border-gray-400 bg-white p-3 transition-all duration-200 hover:bg-gray-50"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {/* Icon - Merge symbol */}
          <div className="flex-shrink-0">
            <GitMerge className="h-4 w-4 text-gray-700" />
          </div>

          {/* Circular Logo */}
          <div className="flex-shrink-0">
            {pr.repository.logo ? (
              <img
                src={pr.repository.logo}
                alt={pr.repository.name}
                className="w-6 h-6 rounded-full object-cover border border-gray-300"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                <span className="text-[8px] font-semibold text-gray-600">
                  {pr.repository.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* PR Title and Date */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate group-hover:text-green-600 transition-colors">
              {pr.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatRelativeDate(pr.createdAt)}
            </p>
          </div>
        </motion.a>
      ))}

      {hasMore && !showAll && (
        <motion.button
          onClick={() => setShowAll(true)}
          className="w-full border border-dashed border-gray-400 bg-white p-3 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Show more ({pullRequests.length - 5} more)
        </motion.button>
      )}
    </div>
  );
}

function ContributionSquare({ day, getContributionColor, delay }: ContributionSquareProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <motion.div
        className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-2 lg:h-2 rounded-sm cursor-pointer relative"
        style={{ backgroundColor: getContributionColor(day.level, day.count) }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: delay
        }}
        whileHover={{ scale: 1.2 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      />
      
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 py-2 rounded-lg shadow-lg border-2 border-black bg-white text-xs font-medium">
              <div className="font-semibold text-black">{formatDate(day.date)}</div>
              <div className="text-gray-600">
                {day.count === 0 ? 'No contributions' : `${day.count} contribution${day.count > 1 ? 's' : ''}`}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function CustomGitHubActivity({ username }: CustomGitHubActivityProps) {
  const [data, setData] = useState<{
    user: any;
    contributions: Contribution[];
    pullRequests: PullRequest[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/github-activity?username=${username}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch GitHub activity');
        }
        
        const activityData = await response.json();
        setData(activityData);
      } catch (err) {
        console.error('GitHub Activity Error:', err);
        setError('Failed to load GitHub activity');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchActivity();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const { contributions, pullRequests } = data;

  // Group contributions by weeks
  const weeks = [];
  for (let i = 0; i < contributions.length; i += 7) {
    weeks.push(contributions.slice(i, i + 7));
  }

  // White background with green dots
  const getContributionColor = (level: number, count: number = 0) => {
    if (count === 0) return '#ebedf0'; // No contributions - light gray
    
    // Calculate level based on actual count
    let actualLevel = 0;
    if (count >= 1 && count <= 3) actualLevel = 1;
    else if (count >= 4 && count <= 6) actualLevel = 2;
    else if (count >= 7 && count <= 9) actualLevel = 3;
    else if (count >= 10) actualLevel = 4;
    
    // Green gradient shades (same as GitHub)
    if (actualLevel === 0) return '#ebedf0'; // No contributions - light gray
    if (actualLevel === 1) return '#9be9a8'; // 1-3 contributions - light green
    if (actualLevel === 2) return '#40c463'; // 4-6 contributions - medium green
    if (actualLevel === 3) return '#30a14e'; // 7-9 contributions - darker green
    return '#216e39'; // 10+ contributions - darkest green
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <motion.section
      className="relative w-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="w-full">
        <motion.div
          className="mb-6 flex flex-col gap-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg font-semibold text-black">GitHub</h2>
          <p className="text-sm text-gray-600">
            Highlights from my open-source activity and recent pull requests.
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="border border-dashed border-gray-400 bg-white p-4 sm:p-5 w-full overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-black" />
                  <span className="text-sm font-semibold text-black">
                    {username} • {contributions.reduce((sum, day) => sum + day.count, 0)} contributions
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto scroll-smooth" style={{ scrollBehavior: "smooth" }}>
                <div className="flex gap-0.5 sm:gap-1 min-w-max">
                  <div className="mr-1 flex flex-col gap-0.5 sm:mr-2 sm:gap-1 flex-shrink-0">
                    <div className="h-2 sm:h-2.5"></div>
                    {["Mon", "", "Wed", "", "Fri", "", "Sun"].map((day, index) => (
                      <div
                        key={index}
                        className="flex h-2 items-center text-[10px] text-gray-600 sm:h-2.5 sm:text-xs whitespace-nowrap"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-0.5 sm:gap-1">
                        {week.map((day, dayIndex) => (
                          <ContributionSquare
                            key={`${weekIndex}-${dayIndex}`}
                            day={day}
                            getContributionColor={getContributionColor}
                            delay={(weekIndex * 7 + dayIndex) * 0.01}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-1 ml-6 sm:mt-2 sm:ml-8 flex gap-0.5 sm:gap-1 text-[10px] sm:text-xs min-w-max">
                  {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"].map(
                    (month, index) => (
                      <div
                        key={index}
                        className="w-2 text-center text-gray-600 sm:w-2.5 whitespace-nowrap"
                      >
                        {index % 2 === 0 ? month : ""}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end text-[10px] sm:mt-4 sm:text-xs lg:mt-2 lg:text-[10px]">
                <span className="mr-1 text-gray-600 sm:mr-2 lg:mr-1">Less</span>
                <div className="flex gap-0.5 sm:gap-1 lg:gap-0.5">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="h-2 w-2 rounded-sm sm:h-2.5 sm:w-2.5 lg:h-2 lg:w-2"
                      style={{ backgroundColor: getContributionColor(level, level === 0 ? 0 : level * 2) }}
                    />
                  ))}
                </div>
                <span className="ml-1 text-gray-600 sm:ml-2 lg:ml-1">More</span>
              </div>
            </div>
          </motion.div>

          {pullRequests && pullRequests.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="border border-dashed border-gray-400 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded bg-black p-1">
                      <GitMerge className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-black">
                      {pullRequests.length} recent pull requests
                    </span>
                  </div>
                </div>

                <PullRequestsList pullRequests={pullRequests} />
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}

