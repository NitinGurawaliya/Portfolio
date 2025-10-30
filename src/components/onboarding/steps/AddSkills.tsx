import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddSkillsProps {
  skills: string[];
  onNext: (skills: string[]) => void;
  onBack: () => void;
}

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "JavaScript",
  "Vue.js",
  "Angular",
  "Tailwind CSS",
  "MongoDB",
  "PostgreSQL",
  "AWS",
];

export const AddSkills = ({ skills: initialSkills, onNext, onBack }: AddSkillsProps) => {
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [currentSkill, setCurrentSkill] = useState("");

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (!trimmedSkill) return;

    if (skills.includes(trimmedSkill)) {
      toast({
        title: "Skill already added",
        description: "This skill is already in your list",
        variant: "destructive",
      });
      return;
    }

    setSkills([...skills, trimmedSkill]);
    setCurrentSkill("");
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    addSkill(currentSkill);
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleNext = () => {
    if (skills.length === 0) {
      toast({
        title: "Add at least one skill",
        description: "Please add at least one skill to continue",
        variant: "destructive",
      });
      return;
    }
    onNext(skills);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="inline-block">
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Add your skills
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-accent to-orange-500 rounded-full mt-2" />
        </div>
        <p className="text-muted-foreground text-[15px]">
          What technologies and tools do you work with?
        </p>
      </div>

      <form onSubmit={handleAddSkill} className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="skill" className="text-sm font-medium">Add Skill</Label>
          <div className="flex gap-2">
            <Input
              id="skill"
              value={currentSkill}
              onChange={(e) => setCurrentSkill(e.target.value)}
              placeholder="e.g., React, Python, AWS"
              className="transition-all duration-300 focus:shadow-lg focus:shadow-accent/20 border-border/50 focus:border-accent"
            />
            <Button 
              type="submit" 
              variant="outline"
              className="hover:border-accent hover:text-accent transition-all duration-300"
            >
              Add
            </Button>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Your Skills ({skills.length})</Label>
            <div className="flex flex-wrap gap-2 p-4 border border-border rounded-lg min-h-[60px] bg-gradient-to-br from-secondary/50 to-secondary/30">
              {skills.map((skill, index) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm flex items-center gap-1.5 hover:bg-accent hover:text-accent-foreground transition-all duration-300 animate-slide-up shadow-sm"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:text-destructive transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm font-medium">Popular Skills</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.filter((skill) => !skills.includes(skill)).map((skill, index) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-accent hover:scale-105 transition-all duration-300 shadow-sm"
                onClick={() => addSkill(skill)}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </form>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack} 
          className="flex-1 hover:border-primary transition-all duration-300"
        >
          Back
        </Button>
        <Button 
          type="button" 
          variant="default" 
          onClick={handleNext} 
          className="flex-1 shadow-lg hover:shadow-xl hover:shadow-accent/30 transition-all duration-300 hover:scale-[1.02] font-medium"
        >
          Publish Portfolio
        </Button>
      </div>
    </div>
  );
};
