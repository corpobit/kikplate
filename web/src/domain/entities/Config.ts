export interface AppConfig {
  logo: string
  banner_title: string
  badge_request_url?: string
  social_media: Array<{ type: string; link: string }>
  prepared_queries: string[]
}
