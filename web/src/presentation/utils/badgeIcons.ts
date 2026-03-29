import {
  Award,
  Sparkles,
  Code,
  BookOpen,
  Rocket,
  FlaskConical,
  Container,
  Cloud,
  Layers,
  Zap,
  GraduationCap,
  ThumbsUp,
  ShieldCheck,
  Shield,
  type LucideIcon,
} from "lucide-react"

const badgeIconMap: Record<string, LucideIcon> = {
  "official":         Award,
  "clean":            Sparkles,
  "clean-code":       Code,
  "documented":       BookOpen,
  "production-ready": Rocket,
  "well-tested":      FlaskConical,
  "docker-ready":     Container,
  "cloud-native":     Cloud,
  "microservice":     Layers,
  "active":           Zap,
  "beginner-friendly": GraduationCap,
  "community-pick":   ThumbsUp,
  "security-friendly": ShieldCheck,
}

export function getBadgeIcon(slug: string): LucideIcon {
  return badgeIconMap[slug] ?? Shield
}
