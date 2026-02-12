"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, MapPin, Building2, Globe } from "lucide-react";
import {
  SiGithub,
  SiX,
  SiLinkedin,
  SiInstagram,
  SiFacebook,
  SiYoutube,
  SiGmail,
  SiStackoverflow,
  SiReddit,
} from "react-icons/si";
import { SkillIcon } from "@/lib/skill-icons";
import { ProjectIcon } from "@/components/ui/project-icon";
import { getProjectSlugMap } from "@/lib/project-slug";
import { truncateWords } from "@/lib/text";
import { Code2, Users as UsersIcon } from "lucide-react";
import { CustomGitHubActivity } from "@/components/themes/acernity/CustomGitHubActivity";
import type { SocialIconComponent, ThemeConfig, ThemePortfolioData } from "@/components/themes/types";

interface LayoutAcernityProps {
  theme: ThemeConfig;
  portfolio: ThemePortfolioData;
}

const getSocialIcon = (platform: string) => {
  const icons: Record<string, SocialIconComponent> = {
    github: SiGithub,
    email: SiGmail,
    twitter: SiX,
    x: SiX,
    linkedin: SiLinkedin,
    instagram: SiInstagram,
    facebook: SiFacebook,
    youtube: SiYoutube,
    stackoverflow: SiStackoverflow,
    reddit: SiReddit,
  };
  return icons[platform.toLowerCase()] || Globe;
};

const getPatternStyle = (pattern: string | null) => {
  if (!pattern) return {};
  
  switch (pattern) {
    case 'dots':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      };
    case 'grid':
      return {
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      };
    case 'cross':
      return {
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)'
      };
    case 'waves':
      return {
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)'
      };
    case 'stars':
      return {
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.12) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      };
    case 'sprinkles':
      return {
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 0.6px, transparent 0.6px), radial-gradient(circle, rgba(0,0,0,0.08) 0.6px, transparent 0.6px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 12px 12px'
      };
    case 'diagonal':
      return {
        backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 14px, rgba(0,0,0,0.04) 14px, rgba(0,0,0,0.04) 15px)'
      };
    case 'mesh':
      return {
        backgroundImage: 'radial-gradient(60% 60% at 20% 20%, rgba(0,0,0,0.14) 0%, transparent 65%), radial-gradient(50% 50% at 80% 0%, rgba(0,0,0,0.1) 0%, transparent 60%), radial-gradient(70% 70% at 30% 80%, rgba(0,0,0,0.08) 0%, transparent 65%)',
        backgroundBlendMode: 'screen'
      };
    default:
      return {};
  }
};

export default function LayoutAcernity({ theme, portfolio }: LayoutAcernityProps) {
  const [displayedBio, setDisplayedBio] = useState("");
  const [bioIndex, setBioIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    if (!portfolio.bio) {
      setIsTypingComplete(true);
      return;
    }

    if (bioIndex < portfolio.bio.length) {
      const timeout = setTimeout(() => {
        setDisplayedBio(portfolio.bio.slice(0, bioIndex + 1));
        setBioIndex(bioIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
    }
  }, [bioIndex, portfolio.bio]);

  const visibleRepos = (portfolio.repositories || []).filter((repo) => repo.isVisible);
  const hasProjects = visibleRepos.length > 0;
  const experiences = portfolio.experiences || [];
  const hasExperience = experiences.length > 0;
  const hasGithub = Boolean(portfolio.user?.githubUsername);
  const projectSlugMap = getProjectSlugMap(portfolio.repositories || []);
  const portfolioSlug = portfolio.customUsername || portfolio.user?.githubUsername || "";

  // Get background customization
  const getBackgroundStyle = () => {
    const baseStyle: CSSProperties = {};
    
    // Safely handle backgroundColor - check for null, undefined, or empty string
    const bgColor = portfolio.backgroundColor || null;
    
    // If backgroundColor is set (not null/undefined/empty), use it; otherwise use default white
    if (bgColor && typeof bgColor === 'string' && bgColor.trim() !== '') {
      baseStyle.backgroundColor = bgColor;
    } else {
      baseStyle.backgroundColor = '#ffffff'; // Default white
    }
    
    // Apply pattern if exists (safely handle null/undefined)
    const patternStyle = (portfolio.backgroundPattern && 
                          typeof portfolio.backgroundPattern === 'string' && 
                          portfolio.backgroundPattern.trim() !== '')
      ? getPatternStyle(portfolio.backgroundPattern)
      : {};
    
    return {
      ...baseStyle,
      ...patternStyle
    };
  };

  return (
    <div className="min-h-screen" style={getBackgroundStyle()}>
      <div className="w-full sm:w-full lg:w-3/5 lg:mx-auto mt-4">
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 border border-dashed border-gray-400">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="flex flex-row items-start gap-6 sm:gap-8">
              {/* Profile Image - Left Side */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 border-2 border-black">
                  <AvatarImage src={portfolio.profilePic || "/placeholder.svg"} alt={portfolio.displayName} />
                  <AvatarFallback className="bg-black text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
                    {portfolio.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Content - Right Side */}
              <div className="flex-1 space-y-4">
                {/* Name, Username and Download Button (for larger screens) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-1">
                      {portfolio.displayName}
                    </h1>
                    
                  </div>
                  {/* Download Button - Visible on all screens, in name row */}
                  {portfolio.cvUrl && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  <motion.button
                    onClick={() => {
                      window.open(portfolio.cvUrl!, '_blank')
                    }}
                    className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition-all duration-200 text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-medium text-gray-900">Download CV</span>
                    <div className="bg-gray-100 rounded-md p-1.5">
                      <Download className="h-4 w-4 text-gray-700" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
                </motion.div>

                {/* Bio */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="max-w-2xl"
                >
                  {portfolio.jobTitle && (
                    <p className="text-sm sm:text-base lg:text-base text-black font-medium mb-2">
                      {portfolio.jobTitle}
                    </p>
                  )}
                  <p className="text-sm sm:text-base lg:text-base text-black leading-relaxed">
                    {displayedBio.split(/(\s+)/).map((segment, index) => {
                      // Make certain keywords bold
                      const boldWords = ['developer', 'designer', 'engineer', 'creator', 'builder', 'coder', 'code', 'make', 'break', 'things', 'love', 'living'];
                      const cleanSegment = segment.trim().toLowerCase();
                      const shouldBold = boldWords.some(boldWord => cleanSegment.includes(boldWord));
                      
                      if (!segment.trim()) {
                        return <span key={index}>{segment}</span>;
                      }
                      
                      return (
                        <span key={index}>
                          {shouldBold ? (
                            <span className="font-bold">{segment}</span>
                          ) : (
                            segment
                          )}
                        </span>
                      );
                    })}
                    {!isTypingComplete && (
                      <motion.span
                        className="inline-block w-1 h-5 bg-black ml-1"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </p>
                </motion.div>

                {/* Action Buttons */}
                {portfolio.user?.websiteUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap gap-3 pt-2"
                  >
                    <Button
                      variant="outline"
                      onClick={() => window.open(portfolio.user.websiteUrl, "_blank")}
                      className="border border-black text-black hover:bg-black hover:text-white px-4 py-2 rounded-none flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Social Links - Full Width, Outside Hero */}
            {portfolio.socials && portfolio.socials.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-6 pt-6 border-t border-gray-300"
              >
                <p className="text-xs sm:text-xs lg:text-sm text-gray-600 mb-4">
                  Where to find me (digitally) if you wish to
                </p>
                
                {/* Social Links */}
                <div className="flex flex-wrap gap-1">
                  {portfolio.socials
                    .filter((social) => social.url)
                    .map((social) => {
                      const Icon = getSocialIcon(social.platform);
                      const platformName = social.platform.charAt(0).toUpperCase() + social.platform.slice(1);
                      return (
                        <motion.a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-2 border border-dashed border-gray-300 bg-white text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs sm:text-sm font-medium">
                            {platformName === 'X' ? 'Twitter' : platformName === 'Email' ? 'Email Me' : platformName}
                          </span>
                        </motion.a>
                      );
                    })}
                </div>
              </motion.div>
            )}
          </motion.section>

          {/* Skills Section */}
          {portfolio.skills && portfolio.skills.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 sm:mb-16 lg:mb-20"
            >
              <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-6 text-black">
                Skills
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-1.5">
                {portfolio.skills.map((skill, index: number) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-1 px-1.5 py-1 rounded-md border border-dashed border-gray-400 bg-white"
                  >
                    <SkillIcon skillName={skill.name} className="w-3 h-3 flex-shrink-0" />
                    <span className="text-[10px] sm:text-xs font-medium text-black truncate">{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Experience Section */}
          {hasExperience && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 sm:mb-16 lg:mb-20 relative pl-4 p-6"
            >
              
              <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-8 text-black">
                Work Experience
              </h2>
              <div className="space-y-8">
                {experiences.map((exp, index: number) => {
                  // Check if currently working - check duration field for "currently" or "present"
                  const durationLower = exp.duration?.toLowerCase() || '';
                  const isCurrentlyWorking = durationLower.includes('currently') || 
                                            durationLower.includes('present') ||
                                            durationLower.includes('now');
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        {exp.faviconUrl ? (
                          <div className="w-10 h-10 border border-gray-300 bg-white flex items-center justify-center">
                            <img src={exp.faviconUrl} alt={exp.companyName} className="w-8 h-8 object-contain" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 border border-gray-300 bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-lg font-semibold">
                              {exp.companyName?.charAt(0) || "•"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-base lg:text-base font-bold text-black">{exp.companyName}</h3>
                            {isCurrentlyWorking && (
                              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-xs sm:text-xs lg:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {exp.duration || (exp.role && `${exp.role}`)}
                          </div>
                        </div>
                        
                        {exp.role && !exp.duration?.includes(exp.role) && (
                          <p className="text-xs sm:text-xs lg:text-xs text-gray-600 mb-2 font-medium">
                            {exp.role}
                          </p>
                        )}
                        
                        {exp.description && (
                          <p className="text-xs sm:text-xs lg:text-sm text-gray-600 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Projects Section */}
          {hasProjects && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 sm:mb-16 lg:mb-20"
            >
              <h2 className="text-xl sm:text-2xl lg:text-2xl font-bold mb-4 text-center text-black">
                Featured Projects
              </h2>
              <p className="text-sm sm:text-base lg:text-base text-gray-600 text-center mb-8">A selection of my recent work</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {visibleRepos.map((repo, index: number) => {
                  const projectSlug = projectSlugMap[repo.id];
                  const projectHref = projectSlug && portfolioSlug ? `/${portfolioSlug}/${projectSlug}` : undefined;
                  // For acernity layout, prioritize deployedUrl over slug page
                  const projectUrl = repo.deployedUrl || repo.repository?.htmlUrl || projectHref;
                  const descriptionText = truncateWords(repo.customDescription || repo.repository.description, 20);

                  const cardContent = (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2 }}
                      className="relative h-full max-h-[400px] overflow-hidden p-4 sm:p-6 border border-dashed border-gray-300 bg-white flex flex-col"
                    >
                      {/* Top Right: Status + Users */}
                      {(repo.projectStatus || typeof repo.projectUsers === "number") && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 z-10">
                          {repo.projectStatus && (
                            <span className="inline-flex items-center text-[10px] font-semibold rounded-md px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                              {repo.projectStatus}
                            </span>
                          )}
                          {typeof repo.projectUsers === "number" && (
                            <span className="inline-flex items-center text-[10px] font-semibold rounded-full px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                              <UsersIcon className="h-2.5 w-2.5 mr-1 flex-shrink-0" />
                              {repo.projectUsers.toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Project Header */}
                      <div className={`flex items-start mb-3 ${(repo.projectStatus && typeof repo.projectUsers === "number") ? "pr-32" : (repo.projectStatus || typeof repo.projectUsers === "number") ? "pr-28" : ""}`}>
                        <ProjectIcon
                          favicon={repo.repository.favicon}
                          logo={repo.repository.logo}
                          title={repo.customName || repo.repository.name}
                          size="sm"
                        />
                      </div>

                      {/* Project Title */}
                      <h3 className="text-base sm:text-base lg:text-base font-bold text-black mb-2 line-clamp-2">
                        {repo.customName || repo.repository.name}
                      </h3>

                      {/* Description */}
                      {descriptionText && (
                        <p className="text-xs sm:text-xs lg:text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed flex-1">
                          {descriptionText}
                        </p>
                      )}

                      {/* Tech Stack */}
                      {repo.technologies && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Code2 className="w-4 h-4 text-black" />
                            <span className="text-xs font-medium text-black uppercase">Tech Stack</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {repo.technologies
                              .split(",")
                              .slice(0, 3)
                              .map((tech: string, idx: number) => {
                                const techName = tech.trim();
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1 px-1.5 py-1 rounded-md border border-dashed border-gray-400 bg-white"
                                  >
                                    <SkillIcon skillName={techName} className="w-3 h-3 flex-shrink-0" />
                                    <span className="text-[10px] sm:text-xs font-medium text-black truncate">{techName}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );

                  if (projectUrl) {
                    // If it's an external URL (deployedUrl or htmlUrl), use regular anchor tag
                    if (projectUrl.startsWith('http://') || projectUrl.startsWith('https://')) {
                      return (
                        <a key={repo.id} href={projectUrl} className="block h-full" target="_blank" rel="noopener noreferrer">
                          {cardContent}
                        </a>
                      );
                    }
                    // If it's an internal slug route, use Next.js Link
                    return (
                      <Link key={repo.id} href={projectUrl} className="block h-full" target="_blank" rel="noopener noreferrer">
                        {cardContent}
                      </Link>
                    );
                  }

                  return <div key={repo.id}>{cardContent}</div>;
                })}
              </div>
            </motion.section>
          )}

          {/* GitHub Activity */}
          {hasGithub && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12 sm:mb-16 lg:mb-20"
            >
              <CustomGitHubActivity username={portfolio.user.githubUsername!} />
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}

